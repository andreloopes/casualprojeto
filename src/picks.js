// Picks logic, URL parameters parser, and card checkbox binding handlers

import { state, savePicksToStorage } from './state.js';
import { elements } from './dom.js';
import { showToast } from './toast.js';
import { renderPicksDrawerList } from './drawer.js';

export function updateBadge() {
  const count = Object.keys(state.myPicks).length;
  elements.picksBadge.textContent = count;
  elements.picksBadge.style.display = count > 0 ? 'flex' : 'none';
}

export function handleCheckChange(rank, type, isChecked) {
  const currentSelection = state.myPicks[rank];

  if (isChecked) {
    state.myPicks[rank] = type;
    
    // De-select the other choice since you can't have both "Já Fui" and "Quero Ir" active
    const cardEl = document.getElementById(`resto-item-${rank}`) || document.getElementById(`grid-card-${rank}`);
    if (cardEl) {
      if (type === 'visited') {
        const wantInput = cardEl.querySelector('.cb-want');
        if (wantInput) {
          wantInput.checked = false;
          wantInput.closest('.checkbox-control').classList.remove('checked-want');
        }
      } else {
        const visitedInput = cardEl.querySelector('.cb-visited');
        if (visitedInput) {
          visitedInput.checked = false;
          visitedInput.closest('.checkbox-control').classList.remove('checked-visited');
        }
      }
    }
  } else {
    // If it was checked and now unticked, delete the pick
    if (currentSelection === type) {
      delete state.myPicks[rank];
    }
  }

  // Update card stylesheet active class
  const cardEl = document.getElementById(`resto-item-${rank}`) || document.getElementById(`grid-card-${rank}`);
  if (cardEl) {
    const visitedControl = cardEl.querySelector('.cb-visited')?.closest('.checkbox-control');
    const wantControl = cardEl.querySelector('.cb-want')?.closest('.checkbox-control');
    
    if (visitedControl) visitedControl.classList.toggle('checked-visited', state.myPicks[rank] === 'visited');
    if (wantControl) wantControl.classList.toggle('checked-want', state.myPicks[rank] === 'wantToGo');
  }

  savePicksToStorage();
  
  // Re-render picks list if drawer is open
  if (elements.picksDrawer.classList.contains('open')) {
    renderPicksDrawerList();
  }
}

export function bindCardCheckboxes() {
  document.querySelectorAll('.checkbox-control').forEach(control => {
    control.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    const cbVisited = control.querySelector('.cb-visited');
    const cbWant = control.querySelector('.cb-want');
    const rank = parseInt(control.getAttribute('data-rank'));

    if (cbVisited) {
      cbVisited.addEventListener('change', () => {
        handleCheckChange(rank, 'visited', cbVisited.checked);
      });
    }

    if (cbWant) {
      cbWant.addEventListener('change', () => {
        handleCheckChange(rank, 'wantToGo', cbWant.checked);
      });
    }
  });
}

export function parseUrlPicks() {
  const params = new URLSearchParams(window.location.search);
  const picksParam = params.get('picks');
  if (picksParam) {
    try {
      const items = picksParam.split(',');
      items.forEach(item => {
        const [rankStr, type] = item.split(':');
        const rank = parseInt(rankStr);
        if (rank && (type === 'visited' || type === 'wantToGo')) {
          state.myPicks[rank] = type;
        }
      });
      savePicksToStorage();
      showToast('Lista compartilhada importada com sucesso!');
      
      // Clean up URL query param
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('Error parsing URL picks:', e);
    }
  }
}

export function generateShareUrl() {
  const entries = Object.entries(state.myPicks);
  if (entries.length === 0) {
    return window.location.origin + window.location.pathname;
  }
  const serialized = entries.map(([rank, type]) => `${rank}:${type}`).join(',');
  return `${window.location.origin}${window.location.pathname}?picks=${serialized}`;
}
