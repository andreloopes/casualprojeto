// Restaurant cards rendering templates (List and Grid views)

import { state } from './state.js';
import { elements, icon } from './dom.js';
import { bindCardCheckboxes } from './picks.js';

export function renderCurrentView() {
  const container = elements.container;
  const count = state.filteredRestaurants.length;

  if (count === 0) {
    container.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');

  if (state.viewMode === 'list') {
    container.className = 'view-list';
    container.innerHTML = state.filteredRestaurants.map(r => renderListItemHTML(r)).join('');
  } else {
    container.className = 'view-grid';
    container.innerHTML = state.filteredRestaurants.map(r => renderGridItemHTML(r)).join('');
  }

  bindCardCheckboxes();
}

export function renderListItemHTML(r) {
  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';

  const votesHTML = r.votes ? `<span class="item-votes-badge">${r.votes} votos</span>` : '';
  const priceSymbol = r.price || '$$$';

  return `
    <article class="list-item" id="resto-item-${r.rank}" style="view-transition-name: resto-card-${r.rank}-${r.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      
      <!-- Left Column: Restaurant Info -->
      <div class="item-info">
        <div class="item-rank-row">
          <span class="item-rank">${r.rank}º</span>
          ${votesHTML}
        </div>
        <h2 class="item-name">${r.name}</h2>
        
        <!-- Attributes -->
        <div class="item-attributes">
          <div class="attr-item">
            <strong>${r.cuisine}</strong>
          </div>
          <div class="attr-dot"></div>
          <div class="attr-item">${priceSymbol}</div>
          <div class="attr-dot"></div>
          <div class="attr-item">${r.neighborhood || r.city}</div>
        </div>

        <p class="item-description">
          ${r.description.length > 350 ? `
            <span class="desc-short">${r.description.substring(0, 350)}...</span>
            <span class="desc-full hidden">${r.description}</span>
            <button class="read-more-btn" onclick="toggleReadMore(${r.rank}, this)">Leia mais</button>
          ` : `
            <span>${r.description}</span>
          `}
        </p>

        <!-- Custom Checkboxes -->
        <div class="item-check-panel">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Já fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Quero ir</span>
          </label>
        </div>

        <!-- Service & Address -->
        <div class="item-details">
          <div class="details-row">
            <strong>Endereço:</strong>
            <span>${r.service}</span>
          </div>
          ${r.website ? `
          <div class="details-row">
            <strong>Site:</strong>
            <a href="https://${r.website}" target="_blank" rel="noopener noreferrer">${r.website}</a>
          </div>` : ''}
        </div>
      </div>

      <!-- Right Column: Media -->
      <div class="item-media">
        <img loading="lazy" src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
      </div>

    </article>
  `;
}

export function renderGridItemHTML(r) {
  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';
  const priceSymbol = r.price || '$$$';

  return `
    <div class="grid-card" id="grid-card-${r.rank}" onclick="openDetailModal(${r.rank})" style="view-transition-name: resto-card-${r.rank}-${r.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      <div class="grid-card-media">
        <span class="grid-rank-badge">${r.rank}º</span>
        <img loading="lazy" src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
      </div>
      <div class="grid-card-content">
        <h3 class="grid-card-name">${r.name}</h3>
        <div class="grid-card-meta">
          <span>${r.cuisine}</span>
          <span>•</span>
          <span>${priceSymbol}</span>
          <span>•</span>
          <span>${r.neighborhood || r.city}</span>
        </div>
        <p class="grid-card-desc">${r.description}</p>
        
        <!-- Checklist toggles inside card -->
        <div class="grid-card-checks" onclick="event.stopPropagation()">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Quero</span>
          </label>
        </div>
      </div>
    </div>
  `;
}
