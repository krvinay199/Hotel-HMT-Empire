/**
 * experience.js — Hotel HMT Empire
 * Controls the "The Empire Experience" video section player.
 * Supports tap-to-toggle play/pause and intersection observer scroll autoplay.
 */

export function initExperience() {
  const video = document.getElementById('experience-video');
  const btn   = document.getElementById('experience-play-btn');
  if (!video || !btn) return;

  // Toggle play/pause state
  const togglePlay = () => {
    if (video.paused) {
      video.play().then(() => {
        btn.classList.add('is-playing');
        btn.setAttribute('aria-label', 'Pause video tour');
      }).catch(() => {});
    } else {
      video.pause();
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play video tour');
    }
  };

  btn.addEventListener('click', togglePlay);
  // Also toggle on clicking the video frame wrapper itself for easy desktop/mobile tapping
  video.addEventListener('click', togglePlay);

  // ── Intersection Observer: Autoplay on scroll-in, pause on scroll-out ──
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Play automatically only if muted (standard browser requirement)
          video.muted = true;
          video.play().then(() => {
            btn.classList.add('is-playing');
          }).catch(() => {
            // If play fails (e.g. strict mobile power-saving), just show play button normally
            btn.classList.remove('is-playing');
          });
        } else {
          // Pause when user scrolls away to release CPU/GPU cycles
          video.pause();
          btn.classList.remove('is-playing');
        }
      });
    }, {
      threshold: 0.3 // Trigger when at least 30% of the video is visible
    });

    observer.observe(video);
  }
}
