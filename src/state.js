// Application State and LocalStorage helpers

export const STORAGE_KEY = 'exame_casual_restaurantes_brasil_picks';

export const state = {
  restaurants: [],
  filteredRestaurants: [],
  viewMode: 'list', // 'list' or 'grid'
  showMyPicksOnly: false,
  searchTerm: '',
  activeFilters: {
    city: [],
    cuisine: [],
    price: [],
    status: []
  },
  myPicks: {}, // { [rank]: 'visited' | 'wantToGo' }
  uniqueCities: [],
  uniqueCuisines: []
};

// LocalStorage helpers
export function loadPicksFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      state.myPicks = JSON.parse(stored);
    } catch (e) {
      state.myPicks = {};
    }
  }
}

export function savePicksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.myPicks));
}
