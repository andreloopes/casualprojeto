import { state } from './state.js';
import { elements, icon } from './dom.js';
import { handleCheckChange } from './picks.js';

window.openDetailModal = function(rank) {
  const r = state.restaurants.find(x => x.rank === rank);
  if (!r) return;

  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';
  const priceSymbol = r.price || '$$$';

  const votesHTML = r.votes ? `<span class="item-votes-badge">${r.votes} votos</span>` : '';

  elements.detailDialog.innerHTML = `
    <div class="dialog-content">
      <div class="dialog-header">
        <img src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
        <button class="dialog-close-btn" onclick="closeDetailModal()" aria-label="Fechar modal">
          ${icon('close', 20, 20)}
        </button>
      </div>
      <div class="dialog-body">
        <div class="dialog-rank-name">
          <span class="dialog-rank">${r.rank}º</span>
          <h2 class="dialog-name" id="detail-heading" tabindex="-1">${r.name}</h2>
          ${votesHTML}
        </div>
        
        <div class="dialog-meta">
          <span><strong>${r.cuisine}</strong></span>
          <span>•</span>
          <span>${priceSymbol}</span>
          <span>•</span>
          <span>${r.neighborhood || r.city}</span>
        </div>

        <p class="dialog-desc">${r.description}</p>

        <!-- Dynamic controls inside Modal -->
        <div class="item-check-panel" style="margin-bottom: 24px;">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited-modal" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Já fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want-modal" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              ${icon('check', 10, 10)}
            </span>
            <span>Quero ir</span>
          </label>
        </div>

        <div class="dialog-info-box">
          <div>
            <span class="info-title">Endereço & Funcionamento</span>
            <div>${r.service}</div>
          </div>
          ${r.website ? `
          <div style="margin-top: 10px;">
            <span class="info-title">Site Oficial</span>
            <div><a href="https://${r.website}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none;">${r.website}</a></div>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;

  elements.detailDialog.showModal();
  
  // Accessibility Focus Routing
  const heading = document.getElementById('detail-heading');
  if (heading) heading.focus();

  // Bind checkbox events inside the modal
  bindModalCheckboxes(r.rank);
};

window.closeDetailModal = function() {
  elements.detailDialog.close();
};

window.toggleReadMore = function(rank, btn) {
  const parent = btn.closest('.item-description');
  const shortEl = parent.querySelector('.desc-short');
  const fullEl = parent.querySelector('.desc-full');
  const isCollapsed = fullEl.classList.contains('hidden');
  
  if (isCollapsed) {
    shortEl.classList.add('hidden');
    fullEl.classList.remove('hidden');
    btn.textContent = 'Leia menos';
  } else {
    shortEl.classList.remove('hidden');
    fullEl.classList.add('hidden');
    btn.textContent = 'Leia mais';
  }
};

function bindModalCheckboxes(rank) {
  const dialog = elements.detailDialog;
  const cbVisited = dialog.querySelector('.cb-visited-modal');
  const cbWant = dialog.querySelector('.cb-want-modal');

  if (cbVisited) {
    cbVisited.addEventListener('change', () => {
      handleCheckChange(rank, 'visited', cbVisited.checked);
      cbVisited.closest('.checkbox-control').classList.toggle('checked-visited', cbVisited.checked);
      const cbWantModal = dialog.querySelector('.cb-want-modal');
      if (cbVisited.checked && cbWantModal && cbWantModal.checked) {
        cbWantModal.checked = false;
        cbWantModal.closest('.checkbox-control').classList.remove('checked-want');
      }
    });
  }

  if (cbWant) {
    cbWant.addEventListener('change', () => {
      handleCheckChange(rank, 'wantToGo', cbWant.checked);
      cbWant.closest('.checkbox-control').classList.toggle('checked-want', cbWant.checked);
      const cbVisitedModal = dialog.querySelector('.cb-visited-modal');
      if (cbWant.checked && cbVisitedModal && cbVisitedModal.checked) {
        cbVisitedModal.checked = false;
        cbVisitedModal.closest('.checkbox-control').classList.remove('checked-visited');
      }
    });
  }
}
