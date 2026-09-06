// Keep mouse input independent of touch gestures and camera rendering.
export function createDesktopLook(canvas, {enabled, look, onState, onUnlock}) {
  const doc = canvas.ownerDocument;
  let locked = false, pending = false, disposed = false, previous = null;
  let unavailable = typeof canvas.requestPointerLock !== 'function';
  const report = () => { if (!disposed) onState({locked, unavailable}); };
  const release = () => {
    locked = false;
    previous = null;
    if (doc.pointerLockElement === canvas) doc.exitPointerLock();
    report();
  };
  const failed = () => { pending = false; unavailable = true; report(); };
  const request = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !enabled() || locked || pending || unavailable) return;
    pending = true;
    try {
      // Older browsers return void; newer ones can reject a Promise.
      const result = canvas.requestPointerLock();
      result?.catch(() => { if (!disposed) failed(); });
    } catch { failed(); }
  };
  const changed = () => {
    const wasLocked = locked;
    locked = doc.pointerLockElement === canvas;
    pending = false;
    previous = null;
    if (locked && !enabled()) { release(); return; }
    report();
    if (wasLocked && !locked && enabled()) onUnlock();
  };
  const move = (event) => {
    if (!enabled()) { previous = null; return; }
    if (doc.pointerLockElement === canvas) {
      look(event.movementX, event.movementY);
    } else if (event.target === canvas) {
      // Free mouse-look also works before capture or if capture is unavailable.
      if (previous) look(event.clientX - previous.x, event.clientY - previous.y);
      previous = {x: event.clientX, y: event.clientY};
    } else previous = null;
  };
  const leave = () => { previous = null; };
  canvas.addEventListener('pointerdown', request);
  canvas.addEventListener('mouseleave', leave);
  doc.addEventListener('mousemove', move);
  doc.addEventListener('pointerlockchange', changed);
  doc.addEventListener('pointerlockerror', failed);
  report();
  return {
    sync() { if (!enabled() && (locked || previous)) release(); },
    dispose() {
      disposed = true;
      canvas.removeEventListener('pointerdown', request);
      canvas.removeEventListener('mouseleave', leave);
      doc.removeEventListener('mousemove', move);
      doc.removeEventListener('pointerlockchange', changed);
      doc.removeEventListener('pointerlockerror', failed);
      release();
    },
  };
}
