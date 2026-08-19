const CONTRACT = '0x0bec5e0483db9b09946c0b37d243d8d8393a6d12';

const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
function playTone(freq, type, duration, vol) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol || 0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}
function soundHover()  { playTone(880, 'sine', 0.18, 0.03); }
function soundOpen()   { playTone(440, 'sine', 0.12, 0.04); setTimeout(() => playTone(660, 'sine', 0.18, 0.035), 80); }
function soundClose()  { playTone(550, 'sine', 0.1, 0.03); setTimeout(() => playTone(380, 'sine', 0.15, 0.025), 70); }
function soundNav()    { playTone(700, 'sine', 0.08, 0.025); }
function soundPause()  { playTone(200, 'sine', 0.2, 0.04); }
function soundResume() { playTone(320, 'sine', 0.15, 0.035); }
function haptic(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }
function hapticTap()    { haptic(8); }
function hapticOpen()   { haptic([6, 30, 10]); }
function hapticClose()  { haptic(6); }
function hapticPause()  { haptic([10, 20, 10]); }

let current = 0, lbContext = 'gallery';
function openLB(i, context) {
  current = i; lbContext = context || 'gallery';
  const n = NFTS[i];
  document.getElementById('lb-img').src = n.img;
  document.getElementById('lb-img').alt = n.name;
  document.getElementById('lb-name').textContent = n.name;
  document.getElementById('lb-sub').textContent = 'IThinkItsArt \u00b7 Ethereum';
  document.getElementById('lb-counter').textContent = (i + 1) + ' of ' + NFTS.length;
  document.getElementById('lb-nav').classList.toggle('hidden', lbContext === 'dreamwalk');
  document.getElementById('overlay').classList.add('on');
  soundOpen(); hapticOpen();
}
function closeLB() {
  document.getElementById('overlay').classList.remove('on');
  soundClose(); hapticClose();
  if (lbContext === 'dreamwalk' && dwPaused) {
    dwPaused = false;
    const pausedFor = performance.now() - dwPauseStart;
    dwPauseOffset += pausedFor;
    dwLanes.forEach(p => { p.startTime += pausedFor; });
    dwLastL += pausedFor; dwLastR += pausedFor; dwCloudStart += pausedFor;
    dwCloudRAF = requestAnimationFrame(dwAnimateClouds);
    dwBgRAF    = requestAnimationFrame(dwAnimateTint);
    dwRAF      = requestAnimationFrame(dwTick);
  }
}
function maybeClose(e) { if (e.target === document.getElementById('overlay')) closeLB(); }
function nav(d) { soundNav(); hapticTap(); openLB((current + d + NFTS.length) % NFTS.length, lbContext); }
document.addEventListener('keydown', e => {
  if (!document.getElementById('overlay').classList.contains('on')) return;
  if (e.key === 'ArrowRight' && lbContext === 'gallery') nav(1);
  if (e.key === 'ArrowLeft'  && lbContext === 'gallery') nav(-1);
  if (e.key === 'Escape') closeLB();
});

let liveIndex = 0, liveTimer = null, activeSlot = 'a';
function startLive() {
  hapticTap(); soundOpen();
  liveIndex = 0; activeSlot = 'a';
  document.getElementById('splash').style.display = 'none';
  document.getElementById('live').style.display = 'block';
  const imgA = document.getElementById('live-img-a'), imgB = document.getElementById('live-img-b');
  imgA.style.opacity = '1'; imgB.style.opacity = '0';
  imgA.src = NFTS[0].img;
  document.getElementById('live-title').textContent = NFTS[0].name;
  imgB.src = NFTS[1 % NFTS.length].img;
  liveTimer = setInterval(advanceLive, 3500);
}
function advanceLive() {
  liveIndex = (liveIndex + 1) % NFTS.length;
  const imgA = document.getElementById('live-img-a'), imgB = document.getElementById('live-img-b');
  const titleEl = document.getElementById('live-title');
  if (activeSlot === 'a') { imgB.src = NFTS[liveIndex].img; imgB.style.opacity='1'; imgA.style.opacity='0'; activeSlot='b'; }
  else { imgA.src = NFTS[liveIndex].img; imgA.style.opacity='1'; imgB.style.opacity='0'; activeSlot='a'; }
  titleEl.style.opacity = '0';
  setTimeout(() => { titleEl.textContent = NFTS[liveIndex].name; titleEl.style.opacity = '1'; }, 800);
  new Image().src = NFTS[(liveIndex + 1) % NFTS.length].img;
}
function stopLive() {
  hapticClose(); soundClose();
  clearInterval(liveTimer); liveTimer = null;
  document.getElementById('live').style.display = 'none';
  document.getElementById('splash').style.display = 'flex';
}

let dwRAF = null, dwBgRAF = null, dwCloudRAF = null, dwLanes = [];
let dwPoolL = [], dwPoolR = [], dwIdxL = 0, dwIdxR = 0;
let dwLastL = 0, dwLastR = 0;
let dwCur = {r:255,g:255,b:255}, dwTgt = {r:255,g:255,b:255};
let dwPaused = false, dwPauseOffset = 0, dwPauseStart = 0, dwCloudStart = 0;
let dwHintTimer = null;
const dwTint = document.getElementById('dw-tint');
const dwClouds = document.getElementById('dw-clouds');
function dwApplySky() {
  const img = document.getElementById('dw-cloud-img');
  if (window.ITIA_CLOUDS) img.src = window.ITIA_CLOUDS;
}
dwApplySky();

const dwHint = document.getElementById('dw-pause-hint');
function dwShowHint(text) {
  dwHint.textContent = text; dwHint.style.opacity = '1';
  clearTimeout(dwHintTimer);
  dwHintTimer = setTimeout(() => { dwHint.style.opacity = '0'; }, 1400);
}
function dwHandleClick(e) {
  if (e.target.id === 'dw-exit') return;
  if (e.target.tagName === 'IMG' && e.target.closest('.dw-piece')) {
    const nftId = e.target.dataset.nftId;
    const idx = NFTS.findIndex(n => String(n.id) === nftId);
    if (idx !== -1) {
      if (!dwPaused) { dwPaused = true; dwPauseStart = performance.now(); cancelAnimationFrame(dwRAF); cancelAnimationFrame(dwBgRAF); cancelAnimationFrame(dwCloudRAF); dwRAF = null; dwBgRAF = null; dwCloudRAF = null; }
      openLB(idx, 'dreamwalk');
    }
    return;
  }
  dwTogglePause();
}
function dwTogglePause() {
  dwPaused = !dwPaused;
  if (dwPaused) {
    dwPauseStart = performance.now();
    cancelAnimationFrame(dwRAF); cancelAnimationFrame(dwBgRAF); cancelAnimationFrame(dwCloudRAF);
    dwRAF = null; dwBgRAF = null; dwCloudRAF = null;
    soundPause(); hapticPause();
    dwShowHint('paused');
  } else {
    const pausedFor = performance.now() - dwPauseStart;
    dwPauseOffset += pausedFor;
    dwLanes.forEach(p => { p.startTime += pausedFor; });
    dwLastL += pausedFor; dwLastR += pausedFor; dwCloudStart += pausedFor;
    dwCloudRAF = requestAnimationFrame(dwAnimateClouds);
    dwBgRAF    = requestAnimationFrame(dwAnimateTint);
    dwRAF      = requestAnimationFrame(dwTick);
    soundResume(); hapticTap();
    dwShowHint('');
  }
}
function dwAnimateClouds(now) {
  const t = (now - dwCloudStart) / 1000;
  const dx = Math.sin(t / 28) * 6, dy = Math.cos(t / 22) * 4;
  const breathe = 1.0 + Math.sin(t / 18) * 0.025;
  dwClouds.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + breathe + ')';
  dwCloudRAF = requestAnimationFrame(dwAnimateClouds);
}
function dwAnimateTint(now) {
  const spd = 0.005;
  dwCur.r += (dwTgt.r - dwCur.r) * spd;
  dwCur.g += (dwTgt.g - dwCur.g) * spd;
  dwCur.b += (dwTgt.b - dwCur.b) * spd;
  dwTint.style.background = 'rgba(' + Math.round(dwCur.r) + ',' + Math.round(dwCur.g) + ',' + Math.round(dwCur.b) + ',0.08)';
  dwBgRAF = requestAnimationFrame(dwAnimateTint);
}
function startDreamWalk() {
  hapticOpen(); soundOpen();
  document.getElementById('splash').style.display = 'none';
  document.getElementById('dreamwalk').style.display = 'block';
  dwPoolL = NFTS.slice().sort(() => Math.random() - 0.5);
  dwPoolR = NFTS.slice().sort(() => Math.random() - 0.5);
  dwIdxL = 0; dwIdxR = 0; dwLanes = [];
  dwPaused = false; dwPauseOffset = 0;
  dwCur = {r:255,g:255,b:255}; dwTgt = {r:255,g:255,b:255};
  dwTint.style.background = 'rgba(255,255,255,0.05)';
  const now = performance.now();
  dwCloudStart = now; dwLastL = now - 3400; dwLastR = now - 1700;
  dwCloudRAF = requestAnimationFrame(dwAnimateClouds);
  dwBgRAF    = requestAnimationFrame(dwAnimateTint);
  dwRAF      = requestAnimationFrame(dwTick);
}
function dwBaseSize() {
  const w = window.innerWidth;
  if (w >= 1200) return 320; if (w >= 900) return 270; if (w >= 600) return 220; return 180;
}
function dwSpawn(side, now) {
  const container = document.getElementById(side === 'L' ? 'dw-left' : 'dw-right');
  const pool = side === 'L' ? dwPoolL : dwPoolR;
  const nft = pool[(side === 'L' ? dwIdxL++ : dwIdxR++) % pool.length];
  const el = document.createElement('div'); el.className = 'dw-piece';
  const base = dwBaseSize();
  const img = document.createElement('img');
  img.src = nft.img; img.dataset.nftId = String(nft.id);
  img.style.cssText = 'width:'+base+'px;height:'+base+'px;object-fit:cover;border-radius:4px;box-shadow:0 20px 70px rgba(0,0,0,0.28);cursor:pointer;';
  const label = document.createElement('div'); label.className = 'dw-label'; label.textContent = nft.name;
  el.appendChild(img); el.appendChild(label);
  el.style.cssText = 'position:absolute;left:50%;display:flex;flex-direction:column;align-items:center;gap:10px;will-change:transform,opacity;opacity:0;';
  container.appendChild(el);
  const duration = 13000 + Math.random() * 3000;
  dwLanes.push({ el: el, startTime: now, duration: duration, base: base, bg: nft.bg });
}
function dwEase(t) { const b = Math.sin(t * Math.PI); return b * b; }
function dwTick(now) {
  const INTERVAL = 4200;
  if (now - dwLastL >= INTERVAL) { dwSpawn('L', now); dwLastL = now; }
  if (now - dwLastR >= INTERVAL) { dwSpawn('R', now); dwLastR = now; }
  const h = window.innerHeight; let maxBell = 0;
  dwLanes = dwLanes.filter(function(p) {
    const t = (now - p.startTime) / p.duration;
    if (t >= 1) { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); return false; }
    const bell = dwEase(t);
    const scale = 0.12 + bell * 0.88;
    const opacity = Math.min(bell * 1.4, 0.92);
    const y = h * 1.15 - t * h * 2.3 + bell * h * 0.08;
    const size = p.base * scale;
    p.el.style.transform = 'translateX('+(-(size/2))+'px) translateY('+y+'px) scale('+scale+')';
    p.el.style.opacity = opacity;
    if (bell > maxBell) { maxBell = bell; dwTgt = { r: Math.round(p.bg[0]*0.75+255*0.25), g: Math.round(p.bg[1]*0.75+255*0.25), b: Math.round(p.bg[2]*0.75+255*0.25) }; }
    return true;
  });
  dwRAF = requestAnimationFrame(dwTick);
}
function stopDreamWalk() {
  hapticClose(); soundClose();
  if (dwRAF) cancelAnimationFrame(dwRAF); dwRAF = null;
  if (dwBgRAF) cancelAnimationFrame(dwBgRAF); dwBgRAF = null;
  if (dwCloudRAF) cancelAnimationFrame(dwCloudRAF); dwCloudRAF = null;
  clearTimeout(dwHintTimer);
  document.querySelectorAll('.dw-piece').forEach(function(el){ el.remove(); });
  dwLanes = []; dwPaused = false;
  dwTint.style.background = 'rgba(255,255,255,0)';
  dwClouds.style.transform = 'translate(0,0) scale(1)';
  document.getElementById('dreamwalk').style.display = 'none';
  document.getElementById('splash').style.display = 'flex';
}
function enterGallery() {
  hapticTap(); soundOpen();
  document.getElementById('splash').style.display='none';
  document.getElementById('gallery').style.display='block';
  buildGrid();
}
function goBack() {
  hapticClose(); soundClose();
  document.getElementById('gallery').style.display='none';
  document.getElementById('splash').style.display='flex';
}
function buildGrid() {
  const g = document.getElementById('grid'); g.innerHTML = '';
  NFTS.forEach(function(n,i) {
    const d = document.createElement('div'); d.className='card';
    d.addEventListener('mouseenter', function(){ soundHover(); });
    d.addEventListener('touchstart', function(){ soundHover(); hapticTap(); }, { passive: true });
    d.onclick = function(){ openLB(i, 'gallery'); };
    d.innerHTML='<img src="'+n.img+'" alt="'+n.name+'" loading="lazy"/><div class="info"><div class="cname">'+n.name+'</div></div>';
    g.appendChild(d);
  });
}
document.querySelectorAll('.splash-btn').forEach(function(btn) {
  btn.addEventListener('mouseenter', function(){ soundHover(); });
  btn.addEventListener('touchstart', function(){ soundHover(); hapticTap(); }, { passive: true });
});
function setView(v) {
  document.getElementById('grid').className=v==='list'?'list':'';
  document.querySelectorAll('.view-btn').forEach(function(b,i){ b.classList.toggle('on',(v==='grid'&&i===0)||(v==='list'&&i===1)); });
}
