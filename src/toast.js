import { elements } from './dom.js';

export function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  
  // Force a redraw
  void elements.toast.offsetWidth;
  
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 300);
  }, 3500);
}
