import { state, loadPicksFromStorage } from './state.js';
import { elements } from './dom.js';
import { initTheme, toggleTheme } from './theme.js';
import { parseUrlPicks, updateBadge } from './picks.js';
import { generateFilterCheckboxes, applyFiltersAndRender, clearAllFilters } from './filters.js';
import { toggleDrawer, copyPicksToClipboard, copyShareLink } from './drawer.js';
import { showToast } from './toast.js';
import './dialog.js'; // Registers dialog window functions

async function init() {
  try {
    // 0. Initialize theme
    initTheme();

    // 1. Fetch data
    const response = await fetch('restaurants.json');
    if (!response.ok) throw new Error('Falha ao carregar dados dos restaurantes.');
    state.restaurants = await response.json();
    
    // Sort restaurants by rank ascending
    state.restaurants.sort((a, b) => a.rank - b.rank);

    // 2. Extract unique filter options
    extractUniqueValues();

    // 3. Load bookmarks/selections
    loadPicksFromStorage();

    // 4. Parse URL parameters for shared lists
    parseUrlPicks();

    // 5. Initialize UI elements (generate options checkboxes)
    generateFilterCheckboxes();

    // 6. Bind Event Listeners
    bindEventListeners();

    // 7. Update UI status elements
    updateBadge();

    // 8. Execute initial filter and render
    applyFiltersAndRender(false); // No transition on initial page mount

  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Erro ao carregar o guia. Por favor, recarregue a página.');
  }
}

function extractUniqueValues() {
  const cities = new Set();
  const cuisines = new Set();

  state.restaurants.forEach(r => {
    if (r.city) cities.add(r.city);
    if (r.cuisine) cuisines.add(r.cuisine);
  });

  state.uniqueCities = Array.from(cities).sort();
  state.uniqueCuisines = Array.from(cuisines).sort();
}

function bindEventListeners() {
  // View Toggle list/grid
  elements.btnViewList.addEventListener('click', () => {
    if (state.viewMode === 'list') return;
    state.viewMode = 'list';
    elements.btnViewList.classList.add('active');
    elements.btnViewGrid.classList.remove('active');
    applyFiltersAndRender();
  });

  elements.btnViewGrid.addEventListener('click', () => {
    if (state.viewMode === 'grid') return;
    state.viewMode = 'grid';
    elements.btnViewGrid.classList.add('active');
    elements.btnViewList.classList.remove('active');
    applyFiltersAndRender();
  });

  // Bookmark "My Picks" Filter
  elements.btnMyPicks.addEventListener('click', () => {
    state.showMyPicksOnly = !state.showMyPicksOnly;
    elements.btnMyPicks.classList.toggle('active', state.showMyPicksOnly);
    applyFiltersAndRender();
  });

  // Theme Toggle Button
  if (elements.btnThemeToggle) {
    elements.btnThemeToggle.addEventListener('click', toggleTheme);
  }

  // Search input typing (debounced slightly or responsive)
  elements.searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    applyFiltersAndRender();
  });

  // Header Dropdowns Open/Close
  document.querySelectorAll('.filter-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const filterType = trigger.getAttribute('data-filter');
      const panel = document.getElementById(`panel-${filterType}`);

      // Check if panel is already active
      const isActive = panel.classList.contains('active');

      // Close all panels
      document.querySelectorAll('.filter-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown-trigger').forEach(t => t.classList.remove('active'));

      if (!isActive) {
        elements.filterPanelsContainer.classList.remove('container-hidden');
        panel.classList.add('active');
        trigger.classList.add('active');
      } else {
        elements.filterPanelsContainer.classList.add('container-hidden');
      }
    });
  });

  // Close filter panel if click outside
  document.addEventListener('click', (e) => {
    if (!elements.filterPanelsContainer.contains(e.target) && !e.target.classList.contains('filter-dropdown-trigger')) {
      elements.filterPanelsContainer.classList.add('container-hidden');
      document.querySelectorAll('.filter-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown-trigger').forEach(t => t.classList.remove('active'));
    }
  });

  // Panel checkmark selections
  elements.filterPanelsContainer.addEventListener('change', (e) => {
    const target = e.target;
    if (target.type === 'checkbox') {
      const filterType = target.getAttribute('data-filter') || target.closest('.filter-panel').getAttribute('data-filter');
      const val = target.value;

      if (target.checked) {
        if (!state.activeFilters[filterType].includes(val)) {
          state.activeFilters[filterType].push(val);
        }
      } else {
        state.activeFilters[filterType] = state.activeFilters[filterType].filter(x => x !== val);
      }

      applyFiltersAndRender();
    }
  });

  // Panel "Select All / Reset" triggers
  document.querySelectorAll('.select-all-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-target');
      state.activeFilters[type] = [];
      document.querySelectorAll(`#panel-${type} input[type="checkbox"]`).forEach(cb => cb.checked = false);
      applyFiltersAndRender();
    });
  });

  // Reset filter buttons
  elements.btnClearFilters.addEventListener('click', clearAllFilters);
  elements.btnResetFiltersEmpty.addEventListener('click', clearAllFilters);

  // Drawer Toggles
  elements.btnMyPicks.addEventListener('dblclick', toggleDrawer); // double click opens list details
  elements.btnMyPicks.addEventListener('click', (e) => {
    // If they click on badge or text when already active, open list
    if (state.showMyPicksOnly) {
      toggleDrawer();
    }
  });
  elements.btnCloseDrawer.addEventListener('click', toggleDrawer);
  elements.drawerBackdrop.addEventListener('click', toggleDrawer);
  elements.btnCopyPicks.addEventListener('click', copyPicksToClipboard);
  elements.btnShareLink.addEventListener('click', copyShareLink);

  // Keyboard support: Escape closes Dialog and Drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.picksDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    }
  });
}

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', init);
