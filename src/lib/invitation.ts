const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const storage = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const details = $('details');
// Keep navigation out of the cover; direct and returning visits reveal it at details.
const header = document.querySelector<HTMLElement>('.site-header')!;
const cover = $('invitation');
function updateNavigation() {
  const show = cover.getBoundingClientRect().bottom <= window.innerHeight * .5;
  header.classList.toggle('is-visible', show);
  header.inert = !show;
}
updateNavigation();
window.addEventListener('scroll', updateNavigation, { passive: true });
window.addEventListener('resize', updateNavigation);

if (storage.get('wedding-opened') && !location.hash) {
  requestAnimationFrame(() => details.scrollIntoView({ behavior: 'instant' }));
}
const musicButton = $<HTMLButtonElement>('music-toggle');
const audio = $<HTMLAudioElement>('wedding-audio');
let context: AudioContext | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let playing = false;
let noteIndex = 0;
const melody = [261.63,329.63,392,523.25,440,392,329.63,293.66];
function playNote() {
  if (!context || context.state !== 'running') return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = melody[noteIndex++ % melody.length];
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(.055, context.currentTime + .08);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + 1.9);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.start(); oscillator.stop(context.currentTime + 2);
}
async function setMusic(next: boolean) {
  try {
    if (audio.getAttribute('src')) {
      if (next) await audio.play(); else audio.pause();
    } else {
      if (next) {
        context ??= new AudioContext(); await context.resume();
        if (!timer) { playNote(); timer = setInterval(playNote, 950); }
      } else { if (timer) clearInterval(timer); timer = undefined; await context?.suspend(); }
    }
    playing = next;
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.querySelector('span')!.textContent = playing ? 'Music on' : 'Music off';
  } catch { musicButton.querySelector('span')!.textContent = 'Try music again'; }
}
musicButton.addEventListener('click', () => void setMusic(!playing));
$('open-invitation').addEventListener('click', () => {
  storage.set('wedding-opened', 'true');
  document.body.classList.add('opening');
  void setMusic(true);
  setTimeout(() => { details.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' }); document.body.classList.remove('opening'); }, reduced ? 0 : 650);
});
$('replay').addEventListener('click', () => { document.body.classList.add('opening'); setTimeout(() => document.body.classList.remove('opening'), 1200); });
// Add motion only after the observer exists: content stays visible if scripting fails.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.body.classList.add('motion-ready');
}
const viewer = $<HTMLDialogElement>('photo-viewer');
const images = Array.from(document.querySelectorAll<HTMLImageElement>('.gallery-photo img'));
let current = 0;
let trigger: HTMLButtonElement | undefined;
function showPhoto(index: number) {
  current = (index + images.length) % images.length;
  const image = $<HTMLImageElement>('viewer-image');
  image.src = images[current].src; image.alt = images[current].alt;
  $('photo-count').textContent = `${current + 1} / ${images.length}`;
}
document.querySelectorAll<HTMLButtonElement>('[data-photo]').forEach(button => button.addEventListener('click', () => {
  trigger = button; showPhoto(Number(button.dataset.photo)); viewer.showModal(); document.body.style.overflow = 'hidden';
}));
$('close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => { document.body.style.overflow = ''; trigger?.focus(); });
viewer.addEventListener('click', e => { if (e.target === viewer) { const r = viewer.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) viewer.close(); } });
$('previous-photo').addEventListener('click', () => showPhoto(current - 1));
$('next-photo').addEventListener('click', () => showPhoto(current + 1));
viewer.addEventListener('keydown', e => { if (e.key === 'ArrowRight') showPhoto(current + 1); if (e.key === 'ArrowLeft') showPhoto(current - 1); });
let touchStart = 0;
viewer.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].screenX; }, { passive: true });
viewer.addEventListener('touchend', e => { const delta = e.changedTouches[0].screenX - touchStart; if (Math.abs(delta) > 55) showPhoto(current + (delta < 0 ? 1 : -1)); }, { passive: true });
type Wish = { name: string; message: string };
let wishes: Wish[] = [];
try { const saved: unknown = JSON.parse(storage.get('wedding-wishes') || '[]'); if (Array.isArray(saved)) wishes = saved.filter((w): w is Wish => typeof w?.name === 'string' && typeof w?.message === 'string').slice(0, 50); } catch { /* Ignore invalid local data. */ }
function renderWishes() {
  $('wish-wall').replaceChildren(...wishes.map(wish => {
    const article = document.createElement('article'); article.className = 'wish-note';
    const message = document.createElement('p'); message.textContent = wish.message;
    const name = document.createElement('small'); name.textContent = `With love, ${wish.name}`;
    article.append(message, name); return article;
  }));
}
renderWishes();
$<HTMLFormElement>('wish-form').addEventListener('submit', e => {
  e.preventDefault(); const name = $<HTMLInputElement>('guest-name').value.trim(); const message = $<HTMLTextAreaElement>('guest-message').value.trim();
  if (!name || message.length < 3) { $('wish-status').textContent = 'Please add your name and a wish of at least 3 characters.'; return; }
  wishes = [{ name, message }, ...wishes].slice(0, 50);
  const saved = storage.set('wedding-wishes', JSON.stringify(wishes)); renderWishes();
  $('wish-status').textContent = saved ? 'Thank you for the love! Your preview wish is saved on this device. ♡' : 'Thank you! Your wish is shown below, but this browser could not save it.';
  $<HTMLFormElement>('wish-form').reset();
});

// ISO timestamps include Yangon’s offset so every guest sees the same countdown.
const countdown = document.querySelector<HTMLElement>('.countdown')!;
const ceremonyStart = Date.parse(countdown.dataset.start!);
const ceremonyEnd = Date.parse(countdown.dataset.end!);
function updateCountdown(now = Date.now()) {
  const remaining = Math.max(0, Math.floor((ceremonyStart - now) / 1000));
  const values = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
  for (const [unit, value] of Object.entries(values)) countdown.querySelector(`[data-count="${unit}"]`)!.textContent = String(value).padStart(2, '0');
  $('countdown-title').textContent = now < ceremonyStart ? 'COUNTING DOWN TO OUR FOREVER' : now < ceremonyEnd ? 'TODAY, OUR FOREVER BEGINS' : 'OUR FOREVER HAS BEGUN';
}
updateCountdown();
setInterval(() => updateCountdown(), 1000);
