// Filter options checkboxes generation and filtration logic

import { state } from './state.js';
import { elements, icon } from './dom.js';
import { renderCurrentView } from './render.js';

export function generateFilterCheckboxes() {
  const cityContainer = document.getElementById('options-city');
  const cuisineContainer = document.getElementById('options-cuisine');

  // Generate City Checkboxes
  cityContainer.innerHTML = state.uniqueCities.map(city => `
    <label class="option-item">
      <input type="checkbox" value="${city}" data-filter="city" ${state.activeFilters.city.includes(city) ? 'checked' : ''}>
      <span class="option-label">${city}</span>
    </label>
  `).join('');

  // Generate Cuisine Checkboxes
  cuisineContainer.innerHTML = state.uniqueCuisines.map(cuisine => `
    <label class="option-item">
      <input type="checkbox" value="${cuisine}" data-filter="cuisine">
      <span class="option-label">${cuisine}</span>
    </label>
  `).join('');
}

export function applyFiltersAndRender(useTransition = true) {
  state.filteredRestaurants = state.restaurants.filter(r => {
    // 1. Search term match (matches name, description, or cuisine)
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      const matchSearch = r.name.toLowerCase().includes(term) || 
                          r.description.toLowerCase().includes(term) || 
                          r.cuisine.toLowerCase().includes(term) ||
                          (r.neighborhood && r.neighborhood.toLowerCase().includes(term));
      if (!matchSearch) return false;
    }

    // 2. City Filter
    if (state.activeFilters.city.length > 0) {
      if (!state.activeFilters.city.includes(r.city)) return false;
    }

    // 3. Cuisine Filter
    if (state.activeFilters.cuisine.length > 0) {
      if (!state.activeFilters.cuisine.includes(r.cuisine)) return false;
    }

    // 4. Price Filter
    if (state.activeFilters.price.length > 0) {
      if (!state.activeFilters.price.includes(r.price)) return false;
    }

    // 5. My Picks Filter (exclusive bookmark view)
    if (state.showMyPicksOnly) {
      if (!state.myPicks[r.rank]) return false;
    }

    // 6. Status Filter inside Panel
    if (state.activeFilters.status.length > 0) {
      const selection = state.myPicks[r.rank];
      const matchesStatus = state.activeFilters.status.some(status => {
        if (status === 'visited') return selection === 'visited';
        if (status === 'wantToGo') return selection === 'wantToGo';
        if (status === 'unvisited') return !selection;
        return false;
      });
      if (!matchesStatus) return false;
    }

    return true;
  });

  updateActiveFiltersSummary();

  // Execute DOM render wrapped in View Transition if supported
  if (useTransition && document.startViewTransition) {
    document.startViewTransition(() => renderCurrentView());
  } else {
    renderCurrentView();
  }
}

export function updateActiveFiltersSummary() {
  const hasSearch = state.searchTerm !== '';
  const hasCity = state.activeFilters.city.length > 0;
  const hasCuisine = state.activeFilters.cuisine.length > 0;
  const hasPrice = state.activeFilters.price.length > 0;
  const hasStatus = state.activeFilters.status.length > 0;
  const showSummary = hasSearch || hasCity || hasCuisine || hasPrice || hasStatus || state.showMyPicksOnly;

  if (showSummary) {
    elements.activeFiltersSummary.classList.remove('hidden');
    elements.btnClearFilters.classList.remove('hidden');
    
    let tagsHTML = '';
    
    if (state.showMyPicksOnly) {
      tagsHTML += createFilterTag('Minhas Escolhas', 'myPicks');
    }
    if (state.searchTerm) {
      tagsHTML += createFilterTag(`Busca: "${state.searchTerm}"`, 'search');
    }
    state.activeFilters.city.forEach(c => {
      tagsHTML += createFilterTag(c, `city-${c}`);
    });
    state.activeFilters.cuisine.forEach(c => {
      tagsHTML += createFilterTag(c, `cuisine-${c}`);
    });
    state.activeFilters.price.forEach(p => {
      tagsHTML += createFilterTag(`Faixa ${p}`, `price-${p}`);
    });
    state.activeFilters.status.forEach(s => {
      const label = s === 'visited' ? 'Já Fui' : s === 'wantToGo' ? 'Quero Ir' : 'Não Visitados';
      tagsHTML += createFilterTag(label, `status-${s}`);
    });

    elements.summaryTags.innerHTML = tagsHTML;
  } else {
    elements.activeFiltersSummary.classList.add('hidden');
    elements.btnClearFilters.classList.add('hidden');
    elements.summaryTags.innerHTML = '';
  }
}

export function createFilterTag(label, id) {
  return `
    <span class="filter-tag">
      <span>${label}</span>
      <button onclick="removeFilterTag('${id}')" aria-label="Remover filtro ${label}">
        ${icon('close', 10, 10)}
      </button>
    </span>
  `;
}

// Global tag removal hook for inline onclick handlers
window.removeFilterTag = function(id) {
  if (id === 'myPicks') {
    state.showMyPicksOnly = false;
    elements.btnMyPicks.classList.remove('active');
  } else if (id === 'search') {
    state.searchTerm = '';
    elements.searchInput.value = '';
  } else if (id.startsWith('city-')) {
    const val = id.replace('city-', '');
    state.activeFilters.city = state.activeFilters.city.filter(x => x !== val);
    const cb = document.querySelector(`#options-city input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('cuisine-')) {
    const val = id.replace('cuisine-', '');
    state.activeFilters.cuisine = state.activeFilters.cuisine.filter(x => x !== val);
    const cb = document.querySelector(`#options-cuisine input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('price-')) {
    const val = id.replace('price-', '');
    state.activeFilters.price = state.activeFilters.price.filter(x => x !== val);
    const cb = document.querySelector(`#options-price input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('status-')) {
    const val = id.replace('status-', '');
    state.activeFilters.status = state.activeFilters.status.filter(x => x !== val);
    const cb = document.querySelector(`#options-status input[value="${val}"]`);
    if (cb) cb.checked = false;
  }
  applyFiltersAndRender();
};

export function clearAllFilters() {
  state.searchTerm = '';
  elements.searchInput.value = '';
  state.showMyPicksOnly = false;
  elements.btnMyPicks.classList.remove('active');
  
  state.activeFilters = {
    city: [],
    cuisine: [],
    price: [],
    status: []
  };

  // Uncheck all boxes
  document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => cb.checked = false);

  applyFiltersAndRender();
}
