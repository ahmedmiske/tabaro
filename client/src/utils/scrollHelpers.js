// src/utils/scrollHelpers.js
export function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // صعود ناعم، يمكنك تغييرها إلى 'auto'
    });
  }
}

