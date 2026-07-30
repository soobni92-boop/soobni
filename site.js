/* Shared runtime: paints admin-saved values on every page.
   Load order: supabase.js -> site.js -> fx.js */
window.NOIR = (function () {

  /* Fallback values used when the row is empty */
  var DEFAULTS = {
    'soop-id'      : 'breezy25',
    'name-kr'      : '숩니찡',
    'name-en'      : 'SOOBNIJJING',
    'name-en1'     : 'SOOB',
    'name-en2'     : 'NI',
    'mast-left'    : 'NOIR SALON',
    'mast-issue'   : 'ISSUE 04',
    'edition'      : 'THE NIGHT EDITION',
    'cover-quote'  : '늦은 밤의 수다와\n조금 긴 게임 이야기.',
    'meta1-k'      : 'TYPE',  'meta1-v': 'CREATOR',
    'meta2-k'      : 'MOOD',  'meta2-v': 'SWEET / NOIR',
    'meta3-k'      : 'LIVE',  'meta3-v': 'SOOP',
    'cover-img'    : '',
    'mascot-img'   : '',
    'avatar'       : '',
    'next-label'   : 'NEXT TRANSMISSION',
    'next-value'   : '',
    'wk-0'         : 'TALK 20:00',
    'wk-1'         : 'GAME 21:00',
    'wk-2'         : 'DAY OFF',
    'wk-3'         : 'LIVE 20:00',
    'wk-4'         : 'TALK 22:00',
    'wk-5'         : 'LONG 19:00',
    'wk-6'         : 'REST',
    'days'         : '0,1,3,4,5',
    'link-soop'    : 'https://www.sooplive.com/station/breezy25',
    'link-youtube' : 'https://www.youtube.com/@soobni_zzing',
    'link-x'       : '',
    'link-etc'     : '',
    'link-etc-label': 'LINK',
    'footer-line'  : '비즈니스 문의 — 상단 ✉ SEND 버튼을 이용해 주세요',
    'info-name'    : '숩니찡',
    'info-fandom'  : '찡구',
    'info-birth'   : '09-28',
    'info-debut'   : '2026-02-28',
    'info-mbti'    : '-',
    'info-agency'  : '개인세',
    'info-gender'  : '여',
    'info-content' : '배그 / 마크 / 소통',
    'info-schedule': '랜덤 (오방공 확인)',
    'catchphrase'  : '아무래도~',
    'bio-short'    : '보다 보면 숩며든다.',
    'about'        : '밝게 떠들다가도 문득 시크해지는 심야 살롱의 주인장.\n배그 하다가 마크 짓고, 결국은 수다로 끝나는 밤.\n보다 보면 숩며들 테니까 — 아무래도, 오늘도 들러 주세요.',
    'like1'        : '간장게장',
    'like2'        : '배그',
    'like3'        : '늦은 밤 소통',
    'like4'        : '찡구들',
    'dislike1'     : '공포게임',
    'dislike2'     : '매운 거',
    'dislike3'     : '',
    'tmi-food'     : '간장게장',
    'tmi-game'     : '배그',
    'tmi-song'     : '안 함 (그래도 흥은 있음)',
    'tmi-item'     : '볼에 하트',
    'tags'         : '하트, 달/밤하늘, 악마날개, 시크, 몽환, 연륜',
    'stats'        : '입담:92\n텐션:88\n에임:74\n집중력:66\n야행성:99',
    'milestones'   : '완료|2026.02.28 첫 방송 개국\n진행중|찡구 1,000명 모으기\n예정|첫 팬아트 전시 · 굿즈\n예정|생일 기념 특별 방송',
    'quotes'       : '아무래도~\n보다 보면 숩며든다.\n오늘도 늦게까지 있을 거지?',
    'theme-ink'    : '', 'theme-paper':'', 'theme-brass':'', 'theme-brass-lt':'',
    'theme-rose'   : '', 'theme-day-bg':'',
    'type-display' : '1', 'type-title':'1', 'type-body':'1', 'type-label':'1'
  };

  var THEME_MAP = {
    'theme-ink'     : '--ink',
    'theme-paper'   : '--paper',
    'theme-brass'   : '--brass',
    'theme-brass-lt': '--brass-lt',
    'theme-rose'    : '--rose',
    'theme-day-bg'  : '--ink-2',
    'type-display'  : '--fs-display',
    'type-title'    : '--fs-title',
    'type-body'     : '--fs-body',
    'type-label'    : '--fs-label'
  };

  var P = {};   /* Loaded profile row */

  /* Utils */
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* DB values may arrive as array/object; always return a string */
  function val(key){
    var v = (P && P[key] !== undefined && P[key] !== null && P[key] !== '') ? P[key] : DEFAULTS[key];
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return v.filter(Boolean).join('\n');
    if (typeof v === 'object') { try { return Object.values(v).filter(Boolean).join('\n'); } catch(e){ return ''; } }
    return String(v);
  }
  function raw(key){ return (P && P[key] != null && P[key] !== '') ? P[key] : (DEFAULTS[key] || ''); }
  function lines(key){ return val(key).split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean); }

  function soopAvatar(id){
    if(!id) return '';
    id = String(id).trim().toLowerCase();
    if(id.length < 2) return '';
    return 'https://profile.img.sooplive.co.kr/LOGO/' + id.slice(0,2) + '/' + id + '/' + id + '.jpg';
  }
  function avatarUrl(){ return val('avatar') || soopAvatar(val('soop-id')); }

  /* Birthday countdown. Accepts MMDD, MM-DD, YYYY-MM-DD */
  function dday(s){
    var m = String(s||'').match(/(\d{1,2})\D?(\d{1,2})\s*$/);
    if(!m) return null;
    var mm = +m[1], dd = +m[2];
    if(!mm || !dd) return null;
    var t = new Date(); t.setHours(0,0,0,0);
    var y = t.getFullYear();
    var next = new Date(y, mm-1, dd);
    if(next < t) next = new Date(y+1, mm-1, dd);
    return Math.round((next - t) / 86400000);
  }
  /* Days since debut */
  function daysSince(s){
    var d = new Date(String(s||'') + 'T00:00:00');
    if(isNaN(d)) return null;
    var t = new Date(); t.setHours(0,0,0,0);
    return Math.max(0, Math.round((t - d) / 86400000));
  }

  /* Day / night */
  function restoreTheme(){
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('day');
  }
  function bindTheme(){
    document.querySelectorAll('.dk').forEach(function(box){
      box.addEventListener('click', function(){
        document.body.classList.toggle('day');
        localStorage.setItem('theme', document.body.classList.contains('day') ? 'light' : 'dark');
      });
    });
  }

  /* Inside a tall SOOP iframe, position:fixed centers in the whole iframe box,
     not in the part the reader is looking at. Anchor masks to the last click instead. */
  var EMBED = false;
  try { EMBED = window.self !== window.top; } catch(e){ EMBED = true; }
  var lastY = 0;
  var MASK_SEL = '.askmask,.ov,.lightbox';

  function docHeight(){
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight);
  }
  function placeMask(el){
    if(!EMBED || !el) return;
    var inner = el.querySelector('.askmodal,.modal,.inner');
    var dh = docHeight();
    el.style.height = dh + 'px';
    var ih = inner ? inner.offsetHeight : 280;
    var y = Math.round(Math.max(16, Math.min(lastY - ih / 2, dh - ih - 16)));
    if(inner) inner.style.marginTop = y + 'px';
    var x = el.querySelector('.lightbox-close');
    if(x) x.style.top = Math.max(8, y - 34) + 'px';
  }
  function watchMasks(){
    if(!EMBED) return;
    document.addEventListener('click', function(e){ if(e.pageY) lastY = e.pageY; }, true);
    if(!window.MutationObserver) return;
    new MutationObserver(function(muts){
      for(var i = 0; i < muts.length; i++){
        var t = muts[i].target;
        if(t.matches && t.matches(MASK_SEL) &&
           (t.classList.contains('on') || t.classList.contains('show') || t.classList.contains('open')))
          placeMask(t);
      }
    }).observe(document.documentElement, { attributes:true, attributeFilter:['class'], subtree:true });
  }

  /* Inquiry modal */
  function openAsk(){ var m = document.getElementById('askmask'); if(m) m.classList.add('on'); }
  function closeAsk(){ var m = document.getElementById('askmask'); if(m) m.classList.remove('on'); }
  async function sendAsk(){
    var t = document.getElementById('askmsg');
    var v = (t && t.value || '').trim();
    if(!v){ toast('내용을 적어 주세요'); return; }
    try{
      await insertRow('inquiries', { message: v });   /* Column is 'message' */
      toast('전송했어요. 고마워요 ✦');
    }catch(e){ toast('전송에 실패했어요. 잠시 후 다시 시도해 주세요'); }
    if(t) t.value = '';
    closeAsk();
  }
  /* Every mask closes on ESC. New modals only need one of these class names. */
  function bindEsc(){
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.askmask.on').forEach(function(el){ el.classList.remove('on'); });
      document.querySelectorAll('.ov.show').forEach(function(el){ el.classList.remove('show'); });
      document.querySelectorAll('.lightbox.open').forEach(function(el){ el.classList.remove('open'); });
    });
  }

  function toast(msg){
    var t = document.getElementById('toast');
    if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    if(EMBED){ t.style.position='absolute'; t.style.bottom='auto';
               t.style.top = Math.round(Math.max(16, lastY + 40)) + 'px'; }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(function(){ t.classList.remove('show'); }, 2400);
  }

  /* Palette from the admin theme tab */
  function applyPalette(){
    Object.keys(THEME_MAP).forEach(function(k){
      var v = (P && P[k]) ? String(P[k]).trim() : '';
      if(v) document.documentElement.style.setProperty(THEME_MAP[k], v);
    });
  }

  /* Fixed copy: [data-t] text, [data-tph] placeholder. Keys are shared across pages. */
  var _txtObs = null;
  function applyTexts(root){
    if(!root) return;
    var list = [];
    if(root.nodeType === 1 && root.hasAttribute){
      if(root.hasAttribute('data-t')) list.push(root);
      if(root.hasAttribute('data-tph')) list.push(root);
    }
    if(root.querySelectorAll){
      root.querySelectorAll('[data-t],[data-tph]').forEach(function(el){ list.push(el); });
    }
    list.forEach(function(el){
      if(el.hasAttribute('data-t')){
        var v = val('txt-' + el.getAttribute('data-t'));
        if(v && el.textContent !== v) el.textContent = v;
      }
      if(el.hasAttribute('data-tph')){
        var pv = val('txt-' + el.getAttribute('data-tph'));
        if(pv && el.placeholder !== pv) el.placeholder = pv;
      }
    });
  }
  /* Modals and tabs render later; without the observer coverage stops around 70%. */
  function watchTexts(){
    if(!window.MutationObserver || _txtObs) return;
    _txtObs = new MutationObserver(function(muts){
      for(var m = 0; m < muts.length; m++)
        for(var n = 0; n < muts[m].addedNodes.length; n++)
          if(muts[m].addedNodes[n].nodeType === 1) applyTexts(muts[m].addedNodes[n]);
    });
    _txtObs.observe(document.body, { childList:true, subtree:true });
  }

  /* Paint data-hook / data-link / data-img */
  function paint(){
    document.querySelectorAll('[data-hook]').forEach(function(el){
      var v = val(el.getAttribute('data-hook'));
      if(v === '') return;
      if(el.hasAttribute('data-multiline')) el.innerHTML = esc(v).replace(/\n/g,'<br>');
      else el.textContent = v;
    });
    document.querySelectorAll('[data-link]').forEach(function(el){
      var v = val(el.getAttribute('data-link'));
      if(v){ el.href = v; el.style.display=''; }
      else el.style.display = 'none';
    });
    document.querySelectorAll('[data-img]').forEach(function(el){
      var key = el.getAttribute('data-img');
      var v = (key === 'avatar') ? avatarUrl() : val(key);
      if(!v) return;
      if(el.tagName === 'IMG') el.src = v;
      else el.style.backgroundImage = 'url("' + v + '")';
    });
    /* Mascot override */
    var mv = val('mascot-img');
    if(mv){
      document.querySelectorAll('.js-mascot').forEach(function(el){
        if(el.tagName === 'IMG') el.src = mv; else el.style.backgroundImage = 'url("'+mv+'")';
      });
      document.documentElement.style.setProperty('--char', 'url("' + mv + '")');
    }
    /* Countdowns */
    var n = dday(val('info-birth'));
    document.querySelectorAll('[data-dday]').forEach(function(el){
      el.textContent = (n === null) ? '' : (n === 0 ? 'BIRTHDAY TODAY ✦' : 'BIRTHDAY D-' + n);
    });
    var ds = daysSince(val('info-debut'));
    document.querySelectorAll('[data-since]').forEach(function(el){
      el.textContent = (ds === null) ? '' : ('DAY ' + ds);
    });
    /* Stream days: 0=Mon ... 6=Sun */
    var on = val('days').split(',').map(function(s){ return s.trim(); }).filter(function(s){ return s !== ''; });
    document.querySelectorAll('[data-day]').forEach(function(el){
      var i = el.getAttribute('data-day');
      el.classList.toggle('on', on.indexOf(String(i)) >= 0);
    });
  }

  /* Load */
  async function loadProfile(){
    try{
      var r = await db.from('profile').select('data').eq('id',1).single();
      P = (r && r.data && r.data.data) || {};
    }catch(e){ P = {}; }
    return P;
  }

  function ready(){
    document.body.classList.add('ready');
    if (typeof initIframeResize === 'function') { try{ initIframeResize(); }catch(e){} }
  }

  /* Each page calls boot() once */
  async function boot(opt){
    opt = opt || {};
    restoreTheme();
    bindTheme();
    var mask = document.getElementById('askmask');
    if(mask) mask.addEventListener('click', function(e){ if(e.target === mask) closeAsk(); });
    bindEsc();
    if(EMBED) document.body.classList.add('embed');
    watchMasks();
    setTimeout(ready, 1600);   /* Show the page even if the fetch never resolves */
    await loadProfile();
    applyPalette();
    try{ paint(); applyTexts(document); watchTexts(); }catch(e){ console.error(e); }
    if(typeof opt.after === 'function'){ try{ await opt.after(P); }catch(e){ console.error(e); } }
    ready();
  }

  return {
    boot: boot, val: val, raw: raw, lines: lines, esc: esc, toast: toast,
    applyTexts: applyTexts,
    dday: dday, daysSince: daysSince, soopAvatar: soopAvatar, avatarUrl: avatarUrl,
    openAsk: openAsk, closeAsk: closeAsk, sendAsk: sendAsk,
    data: function(){ return P; }, DEFAULTS: DEFAULTS, THEME_MAP: THEME_MAP
  };
})();


function openAsk(){ NOIR.openAsk(); }
function closeAsk(){ NOIR.closeAsk(); }
function sendAsk(){ NOIR.sendAsk(); }
