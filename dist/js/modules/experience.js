export function initExperience() {
const video = document.getElementById('experience-video');
const btn   = document.getElementById('experience-play-btn');
if (!video || !btn) return;
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
video.addEventListener('click', togglePlay);
if ('IntersectionObserver' in window) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
video.muted = true;
video.play().then(() => {
btn.classList.add('is-playing');
}).catch(() => {
btn.classList.remove('is-playing');
});
} else {
video.pause();
btn.classList.remove('is-playing');
}
});
}, {
threshold: 0.3
});
observer.observe(video);
}
}