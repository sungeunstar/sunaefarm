/* SUNAE FARM — app.js */

// ── 구매 리스트 검색 + 필터 ──────────────────────────
const searchInput   = document.getElementById('searchInput');
const shopTable     = document.getElementById('shopTable');
const filterBtns    = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

function filterShop() {
  if (!shopTable) return;
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const rows = shopTable.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const cat  = row.dataset.cat || '';
    const text = row.textContent.toLowerCase();
    const matchFilter = currentFilter === 'all' || cat === currentFilter;
    const matchSearch = !q || text.includes(q);
    row.style.display = matchFilter && matchSearch ? '' : 'none';
  });
}

if (searchInput) {
  searchInput.addEventListener('input', filterShop);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    filterShop();
  });
});

// ── 작업 진행 체크리스트 ──────────────────────────────
const progressSearch = document.getElementById('progressSearch');
const progressBar    = document.getElementById('progressBar');
const progressPct    = document.getElementById('progressPct');
const progressFilter = document.querySelectorAll('.filter-btn[data-filter]');

function updateProgress() {
  const all     = document.querySelectorAll('.task-item input[type=checkbox]');
  const checked = document.querySelectorAll('.task-item input[type=checkbox]:checked');
  if (!all.length) return;

  const pct = Math.round((checked.length / all.length) * 100);
  if (progressBar) progressBar.style.width = pct + '%';
  if (progressPct) progressPct.textContent = pct + '%';
}

function updatePhaseCounts() {
  document.querySelectorAll('.phase').forEach(phase => {
    const total   = phase.querySelectorAll('.task-item').length;
    const done    = phase.querySelectorAll('.task-item input:checked').length;
    const counter = phase.querySelector('.phase-count');
    if (counter) counter.textContent = `${done} / ${total}`;
  });
}

function filterProgress() {
  if (!progressSearch) return;
  const q = progressSearch.value.trim().toLowerCase();
  const activeBtn = document.querySelector('.filter-btn.active');
  const statusFilter = activeBtn ? activeBtn.dataset.filter : 'all';

  document.querySelectorAll('.task-item').forEach(item => {
    const text    = item.textContent.toLowerCase();
    const tag     = (item.dataset.tag || '').toLowerCase();
    const checked = item.querySelector('input')?.checked;

    const matchSearch = !q || text.includes(q) || tag.includes(q);
    const matchStatus =
      statusFilter === 'all'  ? true :
      statusFilter === 'done' ? checked :
      !checked;

    item.classList.toggle('hidden', !(matchSearch && matchStatus));
  });
}

if (progressSearch) {
  progressSearch.addEventListener('input', filterProgress);
}

// 진행 필터 버튼 (progress page)
document.querySelectorAll('.progress-controls .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.progress-controls .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterProgress();
  });
});

// 체크박스 변경 시 저장 + 업데이트
document.querySelectorAll('.task-item input[type=checkbox]').forEach((cb, i) => {
  const saved = localStorage.getItem('task_' + i);
  if (saved === 'true')  cb.checked = true;
  if (saved === 'false') cb.checked = false;

  cb.addEventListener('change', () => {
    localStorage.setItem('task_' + i, cb.checked);
    updateProgress();
    updatePhaseCounts();
  });
});

// 초기 실행
updateProgress();
updatePhaseCounts();

// ── 사이드바 active 링크 (manual.html) ──────────────
const sections     = document.querySelectorAll('.content section[id]');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

if (sections.length && sidebarLinks.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sidebarLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.sidebar-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-60px 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}
