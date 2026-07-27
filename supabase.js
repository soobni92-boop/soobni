/* =============================================
   supabase.js — Supabase 연동 공통 스크립트
   ✅ 이 파일 상단 두 줄만 본인 값으로 교체!
   ============================================= */

const SUPABASE_URL  = 'https://nmjcqzfcejxkaczmfink.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tamNxemZjZWp4a2Fjem1maW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzA5NjgsImV4cCI6MjEwMDc0Njk2OH0.zfhDgn9wjm1ZFa509AyL2c-WYJyR4EEbXKJ9aFAUVpU';

// ── Supabase 클라이언트 초기화 ──
// CDN이 일시적으로 안 떠도 페이지가 죽지 않도록 방어
const { createClient } = (window.supabase || { createClient: null });
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

/* =============================================
   CRUD 헬퍼 함수
   ============================================= */

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

/* 이미지는 “링크” 방식이라 Storage(버킷) 업로드 함수는 쓰지 않습니다. */

/* ─ 토스트 유틸 ─ */
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

/* ─ iframe 자동 높이 ─ */
function initIframeResize() {
  const send = () =>
    window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*');
  send();
  new ResizeObserver(send).observe(document.body);
}

/* ─ 호환용 별칭 ─
   일정/노래/일기/업보 페이지는 enableIframeAutoHeight() 라는 이름으로 호출합니다.
   이 별칭이 없으면 그 페이지들에서 "함수 없음" 에러가 나고 iframe 높이가 자동조절되지 않습니다. */
function enableIframeAutoHeight() { initIframeResize(); }


/* 팔레트(🎨 테마 탭) 적용은 site.js의 NOIR.applyPalette 가 담당합니다. */
