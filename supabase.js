/* Supabase client. Replace the two lines below when moving to a new project. */

const SUPABASE_URL  = 'https://nmjcqzfcejxkaczmfink.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tamNxemZjZWp4a2Fjem1maW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzA5NjgsImV4cCI6MjEwMDc0Njk2OH0.zfhDgn9wjm1ZFa509AyL2c-WYJyR4EEbXKJ9aFAUVpU';

// ── Supabase 클라이언트 초기화 ──
// Keep the page alive if the CDN fails to load
const { createClient } = (window.supabase || { createClient: null });
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

/* CRUD helpers */

/** 전체 조회 (최신순)
 *  예) const rows = await fetchAll('schedule');
 */
async function fetchAll(table, options = {}) {
  let query = db.from(table).select('*');
  if (options.order)  query = query.order(options.order, { ascending: options.asc ?? false });
  if (options.limit)  query = query.limit(options.limit);
  if (options.filter) query = query.eq(options.filter.col, options.filter.val);
  const { data, error } = await query;
  if (error) { console.error(`fetchAll(${table}) 오류:`, error); return []; }
  return data;
}

/** 단건 삽입
 *  예) await insertRow('song', { title: '봄날', artist: 'BTS' });
 */
async function insertRow(table, row) {
  const { error } = await db.from(table).insert(row);
  if (error) { console.error(`insertRow(${table}) 오류:`, error); return false; }
  return true;
}

/** 단건 삭제
 *  예) await deleteRow('work', 3);
 */
async function deleteRow(table, id) {
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) { console.error(`deleteRow(${table}) 오류:`, error); return false; }
  return true;
}

/** 단건 수정
 *  예) await updateRow('schedule', 2, { title: '변경된 제목' });
 */
async function updateRow(table, id, updates) {
  const { error } = await db.from(table).update(updates).eq('id', id);
  if (error) { console.error(`updateRow(${table}) 오류:`, error); return false; }
  return true;
}

/* Images are plain URLs; no Storage upload helper here. */

/* Toast */
function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* Auto height for the SOOP iframe */
/* Report content height to the embedding post so one fixed height attribute
   does not have to fit both desktop and mobile. Several message shapes are sent
   because the host decides which one it listens for. */
function initIframeResize() {
  if (window.self === window.top) return;
  var last = 0;
  function send() {
    var h = Math.ceil(Math.max(
      document.body.scrollHeight, document.body.offsetHeight,
      document.documentElement.offsetHeight));
    if (!h || Math.abs(h - last) < 2) return;
    last = h;
    var p = window.parent;
    try { p.postMessage(h, '*'); } catch (e) {}
    try { p.postMessage({ type: 'resize', height: h }, '*'); } catch (e) {}
    try { p.postMessage({ height: h }, '*'); } catch (e) {}
    try { p.postMessage({ context: 'iframe.resize', height: h }, '*'); } catch (e) {}
    try { p.postMessage('setHeight:' + h, '*'); } catch (e) {}
  }
  send();
  window.addEventListener('load', send);
  window.addEventListener('resize', send);
  document.addEventListener('click', function () { setTimeout(send, 120); });
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.body);
  [200, 600, 1200, 2500].forEach(function (t) { setTimeout(send, t); });
}

/* ─ 호환용 별칭 ─
   일정/노래/일기/업보 페이지는 enableIframeAutoHeight() 라는 이름으로 호출합니다.
   이 별칭이 없으면 그 페이지들에서 "함수 없음" 에러가 나고 iframe 높이가 자동조절되지 않습니다. */
function enableIframeAutoHeight() { initIframeResize(); }


/* Palette is applied by NOIR.applyPalette in site.js. */
