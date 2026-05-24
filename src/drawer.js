// Picks Drawer list manager, clipboard copy and share link actions

import { state } from './state.js';
import { elements } from './dom.js';
import { showToast } from './toast.js';
import { generateShareUrl } from './picks.js';

export function toggleDrawer() {
  const isOpen = elements.picksDrawer.classList.contains('open');
  if (isOpen) {
    elements.picksDrawer.classList.remove('open');
    elements.picksDrawer.setAttribute('aria-hidden', 'true');
  } else {
    renderPicksDrawerList();
    elements.picksDrawer.classList.add('open');
    elements.picksDrawer.setAttribute('aria-hidden', 'false');
  }
}

export function renderPicksDrawerList() {
  const picksList = elements.drawerPicksList;
  const entries = Object.entries(state.myPicks);
  
  let visitedCount = 0;
  let wantCount = 0;

  if (entries.length === 0) {
    picksList.innerHTML = `<p style="text-align: center; color: var(--text-tertiary); font-size: 13px; margin: 24px 0;">Nenhuma escolha marcada ainda. Navegue e adicione favoritos!</p>`;
    elements.statVisited.textContent = '0';
    elements.statWantToGo.textContent = '0';
    return;
  }

  const compiled = entries.map(([rankStr, type]) => {
    const rank = parseInt(rankStr);
    const r = state.restaurants.find(x => x.rank === rank);
    if (type === 'visited') visitedCount++;
    if (type === 'wantToGo') wantCount++;
    return { rank, type, name: r ? r.name : 'Restaurante Desconhecido' };
  });

  compiled.sort((a, b) => a.rank - b.rank);

  elements.statVisited.textContent = visitedCount;
  elements.statWantToGo.textContent = wantCount;

  picksList.innerHTML = compiled.map(item => `
    <div class="drawer-pick-item">
      <div class="pick-meta">
        <span class="pick-rank">${item.rank}º</span>
        <span class="pick-name">${item.name}</span>
      </div>
      <span class="pick-badge-type ${item.type === 'visited' ? 'pick-badge-visited' : 'pick-badge-want'}">
        ${item.type === 'visited' ? 'Fui' : 'Quero ir'}
      </span>
    </div>
  `).join('');
}

export function copyPicksToClipboard() {
  const entries = Object.entries(state.myPicks);
  if (entries.length === 0) {
    showToast('Adicione alguns restaurantes à sua lista antes de exportar.');
    return;
  }

  const visitedList = [];
  const wantList = [];

  entries.forEach(([rankStr, type]) => {
    const rank = parseInt(rankStr);
    const r = state.restaurants.find(x => x.rank === rank);
    const name = r ? r.name : `Restaurante ${rank}`;
    const city = r ? `(${r.city})` : '';
    if (type === 'visited') {
      visitedList.push(`- ${rank}º ${name} ${city}`);
    } else {
      wantList.push(`- ${rank}º ${name} ${city}`);
    }
  });

  let text = `📋 MEU GUIA DE RESTAURANTES PERSONALIZADO (100 Melhores do Brasil)\n\n`;
  if (visitedList.length > 0) {
    text += `✅ JÁ FUI E RECOMENDO:\n${visitedList.join('\n')}\n\n`;
  }
  if (wantList.length > 0) {
    text += `📌 QUERO VISITAR EM BREVE:\n${wantList.join('\n')}\n\n`;
  }
  text += `Acesse e monte o seu em: ${window.location.origin + window.location.pathname}`;

  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Copiado para a área de transferência! Envie pelo WhatsApp.');
    })
    .catch(() => {
      showToast('Falha ao copiar lista.');
    });
}

export function copyShareLink() {
  const url = generateShareUrl();
  navigator.clipboard.writeText(url)
    .then(() => {
      showToast('Link de compartilhamento copiado! Quem abrir verá as suas escolhas.');
    })
    .catch(() => {
      showToast('Falha ao copiar link.');
    });
}
