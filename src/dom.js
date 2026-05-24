// DOM element references and helper selectors

export const elements = {
  container: document.getElementById('restaurants-container'),
  btnViewList: document.getElementById('btn-view-list'),
  btnViewGrid: document.getElementById('btn-view-grid'),
  btnMyPicks: document.getElementById('btn-my-picks'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  btnResetFiltersEmpty: document.getElementById('btn-reset-filters-empty'),
  searchInput: document.getElementById('search-input'),
  filterPanelsContainer: document.getElementById('filter-panels-container'),
  activeFiltersSummary: document.getElementById('active-filters-summary'),
  summaryTags: document.getElementById('summary-tags'),
  emptyState: document.getElementById('empty-state'),
  picksBadge: document.getElementById('picks-badge'),
  picksDrawer: document.getElementById('picks-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  btnCloseDrawer: document.getElementById('btn-close-drawer'),
  drawerPicksList: document.getElementById('drawer-picks-list'),
  statVisited: document.getElementById('stat-visited'),
  statWantToGo: document.getElementById('stat-want-to-go'),
  btnCopyPicks: document.getElementById('btn-copy-picks'),
  btnShareLink: document.getElementById('btn-share-link'),
  detailDialog: document.getElementById('detail-dialog'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  toast: document.getElementById('toast')
};

export function $(id) {
  return document.getElementById(id);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function icon(name, width = 10, height = 10) {
  return `<svg width="${width}" height="${height}"><use href="#icon-${name}"></use></svg>`;
}
