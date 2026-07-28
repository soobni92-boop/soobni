/* Shared page effects. No network use. Include on every page except the overlay. */

/* Per-site shapes */
var FX_FLOAT = ['♥','✦','☾','✧','♥','✦'];   // 떠다니는 입자 — 하트 + 달 + 밤별 (숩니찡 모티프)
var FX_CLICK = '♥';                           // 클릭/프사톡 모양. 글자·이모지 또는 이미지(data:… / https://… .svg·.png)도 가능
var FX_COUNT = 12;                            // 떠다니는 입자 개수 (많을수록 무거움)
var FX_TILT  = true;                          // 카드 마우스오버 살짝 기울기 (끄려면 false)

/* Loading cover + page transition */
var FX_LOADER      = true;   // 페이지 넘어갈 때 로딩화면 + 레이아웃 커지는 등장 (끄려면 false)
var FX_LOADER_IMG  = '';     // 로딩화면 가운데 이미지 URL. 비우면 자동: 마스코트(--char) → SOOP 프사 → 글자
var FX_LOADER_TEXT = '';     // 이미지 없을 때/이름표에 띄울 글자. 비우면 상단 로고 글자 자동
var FX_TRANS_MS    = 800;    // 커지는 등장 길이(ms). 더 느리게 = 숫자 ↑ / 더 빠르게 = 숫자 ↓
/* Examples: star  FX_FLOAT=['★','✦','☆']  FX_CLICK='★'
              rabbit FX_FLOAT=['🐰','✦','♡'] FX_CLICK='🐰'
              note   FX_FLOAT=['♪','♫','✦']  FX_CLICK='♪'
   FX_CLICK also accepts a data URI or image URL. */
/* --- */

(function () {
  var mqReduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqFine   = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  var css = `
    body::before{ display:none !important; }            /* Skip the dense static pattern */
    #fx{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
    .fx-p{ position:absolute; top:-26px; color:var(--main); opacity:0; will-change:transform,opacity; animation:fxFall linear infinite; }
    @keyframes fxFall{
      0%{ transform:translateY(-26px) translateX(0) rotate(0); opacity:0; }
      12%{ opacity:.5; } 88%{ opacity:.4; }
      100%{ transform:translateY(103vh) translateX(var(--drift,20px)) rotate(210deg); opacity:0; }
    }
    .container, .wrap{ perspective:1300px; }
    .card{ transition:transform .25s ease, box-shadow .25s ease; will-change:transform; }
    .fx-tilting{ box-shadow:var(--shadow-hover, 0 16px 36px rgba(31,60,90,.16)); }
    .fx-heart{ position:fixed; z-index:500; pointer-events:none; color:var(--main); transform:translate(-50%,-50%); animation:fxHeart .95s ease-out forwards; }
    @keyframes fxHeart{
      0%{ opacity:0; transform:translate(-50%,-50%) scale(.4); }
      18%{ opacity:.85; }
      100%{ opacity:0; transform:translate(calc(-50% + var(--hx,0px)), calc(-50% - 62px)) scale(1.05); }
    }
    @media (prefers-reduced-motion: reduce){ #fx{ display:none; } .card{ transition:none; } .fx-heart{ display:none; } }

    /* Loading cover + page transition */
    #fxload{ position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; background:var(--bg); transition:opacity .34s ease; }
    #fxload.fx-hide{ opacity:0; pointer-events:none; }
    #fxload.fx-hide .fxload-av, #fxload.fx-hide .fxload-dots i{ animation-play-state:paused; }
    #fxload .fxload-av{ width:96px; height:96px; border-radius:50%; background:var(--main-light); background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; font-size:calc(46px * var(--fs-display,1)); font-weight:800; color:var(--main-dark); box-shadow:0 10px 28px rgba(0,0,0,.14); animation:fxBob 1.1s ease-in-out infinite; }
    #fxload .fxload-av.mascot{ width:150px; height:150px; border-radius:0; background-color:transparent; background-size:contain; background-repeat:no-repeat; box-shadow:none; filter:drop-shadow(0 12px 22px rgba(0,0,0,.16)); }
    @keyframes fxBob{ 0%,100%{ transform:translateY(0) scale(1); } 50%{ transform:translateY(-12px) scale(1.04); } }
    #fxload .fxload-name{ font-weight:800; font-size:calc(18px * var(--fs-title,1)); color:var(--main-dark); letter-spacing:.02em; }
    #fxload .fxload-dots{ display:flex; gap:7px; }
    #fxload .fxload-dots i{ width:9px; height:9px; border-radius:50%; background:var(--main); display:block; animation:fxDot 1s ease-in-out infinite; }
    #fxload .fxload-dots i:nth-child(2){ animation-delay:.15s; }
    #fxload .fxload-dots i:nth-child(3){ animation-delay:.3s; }
    @keyframes fxDot{ 0%,100%{ opacity:.3; transform:translateY(0); } 40%{ opacity:1; transform:translateY(-7px); } }
    .fx-enter{ animation:fxPop var(--fx-trans,.8s) cubic-bezier(.2,.72,.3,1) both; transform-origin:50% 0; }
    @keyframes fxPop{ from{ opacity:0; transform:scale(.93); } to{ opacity:1; transform:scale(1); } }
    @media (prefers-reduced-motion: reduce){ #fxload .fxload-av, #fxload .fxload-dots i{ animation:none !important; } .fx-enter{ animation:none !important; } }
  `;
  var st = document.createElement('style'); st.id = 'fx-style'; st.textContent = css; document.head.appendChild(st);

  /* Loading cover + page transition.
   Loader image priority: FX_LOADER_IMG -> --char mascot -> favicon -> text.
   Colors come from --main and --bg, so custom pages must define them. */
  var loaderOn = FX_LOADER && !mqReduce;
  var fxLoadEl = null, shownAt = 0;
  document.documentElement.style.setProperty('--fx-trans', (FX_TRANS_MS || 800) + 'ms');

  function buildLoader() {
    if (!loaderOn || fxLoadEl || !document.body) return;
    var el = document.createElement('div'); el.id = 'fxload'; el.setAttribute('aria-hidden', 'true');
    var av = document.createElement('div'); av.className = 'fxload-av';
    var ch = (getComputedStyle(document.body).getPropertyValue('--char') || '').trim();
    var img = FX_LOADER_IMG;
    if (!img) {
      var ico = document.querySelector('link[rel~="icon"]');
      if (ico && ico.href && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(ico.href)) img = ico.href;
    }
    var logoTxt = ((document.querySelector('.nav-logo') || {}).textContent || document.title || '').trim();
    if (FX_LOADER_IMG)            av.style.backgroundImage = 'url("' + FX_LOADER_IMG + '")';
    else if (ch && ch !== 'none') { av.style.backgroundImage = ch; av.classList.add('mascot'); }  /* --char renders the cut-out mascot with no circular frame */
    else if (img)                av.style.backgroundImage = 'url("' + img + '")';
    else                         av.textContent = (FX_LOADER_TEXT || logoTxt || '✿').charAt(0) || '✿';
    var nm = document.createElement('div'); nm.className = 'fxload-name';
    nm.textContent = (FX_LOADER_TEXT || logoTxt || '');
    var dt = document.createElement('div'); dt.className = 'fxload-dots'; dt.innerHTML = '<i></i><i></i><i></i>';
    el.appendChild(av); if (nm.textContent) el.appendChild(nm); el.appendChild(dt);
    document.body.appendChild(el); fxLoadEl = el; shownAt = Date.now();
  }

  function revealPage() {
    if (!loaderOn) return;
    var wait = Math.max(0, 450 - (Date.now() - shownAt));   /* Minimum visible time so it does not flash */
    setTimeout(function () {
      var w = document.querySelector('.wrap, .container, main');
      if (w) { w.classList.remove('fx-enter'); void w.offsetWidth; w.classList.add('fx-enter'); }
      if (fxLoadEl) fxLoadEl.classList.add('fx-hide');
    }, wait);
  }

  if (loaderOn) {
    if (document.body) buildLoader(); else document.addEventListener('DOMContentLoaded', buildLoader);
    if (document.readyState === 'complete') revealPage(); else window.addEventListener('load', revealPage);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]'); if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      var url; try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;                          /* Internal links only */
      if (url.pathname === location.pathname && (url.hash || url.href === location.href)) return;
      e.preventDefault();
      if (!fxLoadEl) buildLoader();
      if (fxLoadEl) { fxLoadEl.classList.remove('fx-hide'); shownAt = Date.now(); }
      setTimeout(function () { location.href = a.href; }, 360);
    }, true);
  }


  function build() {
    /* Floating particles */
    if (!mqReduce) {
      var fx = document.getElementById('fx');
      if (!fx) { fx = document.createElement('div'); fx.id = 'fx'; fx.setAttribute('aria-hidden','true'); document.body.appendChild(fx); }
      if (!fx.childElementCount) {
        for (var i = 0; i < FX_COUNT; i++) {
          var p = document.createElement('span'); p.className = 'fx-p';
          p.textContent = FX_FLOAT[(Math.random() * FX_FLOAT.length) | 0];
          var dur = 13 + Math.random() * 11;
          p.style.left = (Math.random() * 100).toFixed(2) + 'vw';
          p.style.fontSize = (9 + Math.random() * 7).toFixed(1) + 'px';
          p.style.animationDuration = dur.toFixed(1) + 's';
          p.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
          p.style.setProperty('--drift', (Math.random() * 60 - 30).toFixed(0) + 'px');
          fx.appendChild(p);
        }
      }
    }
    /* Card tilt, pointer devices only */
    if (FX_TILT && mqFine && !mqReduce && !window.__fxTiltOn) {
      window.__fxTiltOn = true;
      var TILT_SEL = '.card, .item-card, .viewer-card, .notice-item, .up-item, .vod-ph';
      var TILT_DEG = 2.5;                                   /* Sensitivity */
      var _tiltEl = null;
      document.addEventListener('mousemove', function (e) {
        var card = e.target.closest ? e.target.closest(TILT_SEL) : null;
        if (_tiltEl && _tiltEl !== card) { _tiltEl.style.transform = ''; _tiltEl.classList.remove('fx-tilting'); _tiltEl = null; }
        if (!card) return;
        var r = card.getBoundingClientRect();
        var rx = (0.5 - (e.clientY - r.top) / r.height) * TILT_DEG;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * TILT_DEG;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        card.classList.add('fx-tilting');
        _tiltEl = card;
      }, { passive: true });
      document.addEventListener('mouseleave', function () {
        if (_tiltEl) { _tiltEl.style.transform = ''; _tiltEl.classList.remove('fx-tilting'); _tiltEl = null; }
      });
    }
    /* Avatar pop */
    var av = document.querySelector('.avatar-wrap, #avatarWrap, .avatar');
    if (av && !av.dataset.fxPop) {
      av.dataset.fxPop = '1'; av.style.cursor = 'pointer';
      av.addEventListener('click', function (e) { window.fxHearts(e.clientX, e.clientY, 10); });
    }
  }

  /* Burst shapes. Shared entry point. */
  window.fxHearts = function (x, y, n) {
    if (mqReduce) return;
    for (var i = 0; i < n; i++) {
      var h = document.createElement('span'); h.className = 'fx-heart';
      var _sz = (14 + Math.random() * 10);
      if (/^data:|^https?:\/\//i.test(FX_CLICK)) {           // 이미지(SVG/PNG/gif 등)면 배경이미지로
        h.style.width = _sz.toFixed(0) + 'px'; h.style.height = _sz.toFixed(0) + 'px';
        h.style.backgroundImage = 'url("' + FX_CLICK + '")';
        h.style.backgroundSize = 'contain'; h.style.backgroundRepeat = 'no-repeat'; h.style.backgroundPosition = 'center';
      } else { h.textContent = FX_CLICK; h.style.fontSize = _sz.toFixed(0) + 'px'; }  // 글자/이모지면 텍스트로
      h.style.left = x + 'px'; h.style.top = y + 'px';
      h.style.setProperty('--hx', (Math.random() * 64 - 32).toFixed(0) + 'px');
      h.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
      document.body.appendChild(h);
      (function (el) { setTimeout(function () { el.remove(); }, 1200); })(h);
    }
  };

  /* fxDday('03-15') returns days until the next birthday, 0 on the day itself. */
  window.fxDday = function (mmdd) {
    try {
      var t = String(mmdd).split(/[-./]/); var m = parseInt(t[0],10), d = parseInt(t[1],10);
      if (!m || !d) return null;
      var now = new Date(); now.setHours(0,0,0,0);
      var y = now.getFullYear(); var next = new Date(y, m-1, d);
      if (next < now) next = new Date(y+1, m-1, d);
      return Math.round((next - now) / 86400000);
    } catch (e) { return null; }
  };

  /* Click burst. Skipped over inputs, buttons, links and the avatar. */
  document.addEventListener('click', function (e) {
    if (e.target.closest('input, textarea, button, a, .iq-modal, .iq-ov, .avatar-wrap, #avatarWrap, .avatar')) return;
    window.fxHearts(e.clientX, e.clientY, 4);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
