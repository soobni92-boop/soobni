/* ═══════════════════════════════════════════════════════════════
   site.js — 숩니찡 NOIR SALON 공통 동작
   · admin(profile 테이블 id=1)에 저장한 값을 전 페이지에 실제로 그립니다 (§2-B.2)
   · 낮/밤 토글(localStorage 'theme') · 문의 모달 · iframe 자동높이 · FOUC 게이트
   ⚠ 로드 순서: supabase.js → site.js → fx.js
   ═══════════════════════════════════════════════════════════════ */
window.NOIR = (function () {

  /* ── 기본값: DB가 비어 있어도 사이트가 완성된 모습으로 보이게 ── */
  var DEFAULTS = {
    'soop-id'      : 'breezy25',
    'name-kr'      : '숩니찡',
    'name-en'      : 'SOOBNIJJING',
    'name-en1'     : 'SOOPNI',
    'name-en2'     : 'JJING',
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
    'theme-rose'   : '', 'theme-day-bg':''
  };

  var THEME_MAP = {
    'theme-ink'     : '--ink',
    'theme-paper'   : '--paper',
    'theme-brass'   : '--brass',
    'theme-brass-lt': '--brass-lt',
    'theme-rose'    : '--rose',
    'theme-day-bg'  : '--ink-2'
  };

  var P = {};   /* 로드된 프로필 데이터 */

  /* ─────────── 유틸 ─────────── */
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* DB 값은 배열·객체로 들어올 수 있음 → 항상 문자열로 (§DB 타입 방어) */
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

  /* 생일 D-Day (MMDD / MM-DD / YYYY-MM-DD 모두 허용) */
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
  /* 데뷔 후 며칠 */
  function daysSince(s){
    var d = new Date(String(s||'') + 'T00:00:00');
    if(isNaN(d)) return null;
    var t = new Date(); t.setHours(0,0,0,0);
    return Math.max(0, Math.round((t - d) / 86400000));
  }

  /* ─────────── 낮 / 밤 ─────────── */
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

  /* ─────────── 문의 모달 ─────────── */
  function openAsk(){ var m = document.getElementById('askmask'); if(m) m.classList.add('on'); }
  function closeAsk(){ var m = document.getElementById('askmask'); if(m) m.classList.remove('on'); }
  async function sendAsk(){
    var t = document.getElementById('askmsg');
    var v = (t && t.value || '').trim();
    if(!v){ toast('내용을 적어 주세요'); return; }
    try{
      await insertRow('inquiries', { message: v });   /* 컬럼명은 message */
      toast('전송했어요. 고마워요 ✦');
    }catch(e){ toast('전송에 실패했어요. 잠시 후 다시 시도해 주세요'); }
    if(t) t.value = '';
    closeAsk();
  }
  function toast(msg){
    var t = document.getElementById('toast');
    if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(function(){ t.classList.remove('show'); }, 2400);
  }

  /* ─────────── 팔레트 (admin 🎨 테마 탭) ─────────── */
  function applyPalette(){
    Object.keys(THEME_MAP).forEach(function(k){
      var v = (P && P[k]) ? String(P[k]).trim() : '';
      if(v) document.documentElement.style.setProperty(THEME_MAP[k], v);
    });
  }

  /* ─────────── data-hook 렌더 ─────────── */
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
    /* 마스코트 이미지 교체 (admin에서 URL 넣으면 우선) */
    var mv = val('mascot-img');
    if(mv){
      document.querySelectorAll('.js-mascot').forEach(function(el){
        if(el.tagName === 'IMG') el.src = mv; else el.style.backgroundImage = 'url("'+mv+'")';
      });
      document.documentElement.style.setProperty('--char', 'url("' + mv + '")');
    }
    /* D-Day */
    var n = dday(val('info-birth'));
    document.querySelectorAll('[data-dday]').forEach(function(el){
      el.textContent = (n === null) ? '' : (n === 0 ? 'BIRTHDAY TODAY ✦' : 'BIRTHDAY D-' + n);
    });
    var ds = daysSince(val('info-debut'));
    document.querySelectorAll('[data-since]').forEach(function(el){
      el.textContent = (ds === null) ? '' : ('DAY ' + ds);
    });
    /* 방송 요일 (0=월 … 6=일) */
    var on = val('days').split(',').map(function(s){ return s.trim(); }).filter(function(s){ return s !== ''; });
    document.querySelectorAll('[data-day]').forEach(function(el){
      var i = el.getAttribute('data-day');
      el.classList.toggle('on', on.indexOf(String(i)) >= 0);
    });
  }

  /* ─────────── 로드 ─────────── */
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

  /* 페이지마다 boot({page:'...'}) 한 줄만 호출 */
  async function boot(opt){
    opt = opt || {};
    restoreTheme();
    bindTheme();
    var mask = document.getElementById('askmask');
    if(mask) mask.addEventListener('click', function(e){ if(e.target === mask) closeAsk(); });
    setTimeout(ready, 1600);                       /* FOUC 폴백 — 영영 숨지 않게 */
    await loadProfile();
    applyPalette();
    try{ paint(); }catch(e){ console.error(e); }
    if(typeof opt.after === 'function'){ try{ await opt.after(P); }catch(e){ console.error(e); } }
    ready();
  }

  return {
    boot: boot, val: val, raw: raw, lines: lines, esc: esc, toast: toast,
    dday: dday, daysSince: daysSince, soopAvatar: soopAvatar, avatarUrl: avatarUrl,
    openAsk: openAsk, closeAsk: closeAsk, sendAsk: sendAsk,
    data: function(){ return P; }, DEFAULTS: DEFAULTS, THEME_MAP: THEME_MAP
  };
})();

/* 인라인 onclick 호환 */
function openAsk(){ NOIR.openAsk(); }
function closeAsk(){ NOIR.closeAsk(); }
function sendAsk(){ NOIR.sendAsk(); }
