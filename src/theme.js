import { elements } from './dom.js';

export function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    updateThemeToggleIcons(true);
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    updateThemeToggleIcons(false);
  }
}

export function toggleTheme() {
  const isLight = document.body.classList.contains('light-theme');
  if (isLight) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    updateThemeToggleIcons(false);
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    updateThemeToggleIcons(true);
  }
}

function updateThemeToggleIcons(isLight) {
  if (!elements.btnThemeToggle) return;
  const sunIcon = elements.btnThemeToggle.querySelector('.sun-icon');
  const moonIcon = elements.btnThemeToggle.querySelector('.moon-icon');
  if (isLight) {
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
}
