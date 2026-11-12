// ============================================================
//  I T I A FAMILY — member grid + admin editor
//  Fully separate from the gallery:
//   - data:   GET /api/family/list  (KV key "family_index")
//   - photos: R2 prefix "family/"   (served via /api/img/family/...)
//   - never reads or writes NFTS, so FAMILY photos never appear in
//     Enter Gallery / Live Gallery / Dream Walk, and gallery uploads
//     never appear here.
//  Does not touch #bg-audio / #audio-btn or any global listeners.
// ============================================================
(function () {
  'use strict';

  var API = 'https://itiagalleria.xyz/api';
  var PLACEHOLDER_SLOTS = 8;     // blank frames shown until members are added
  var MAX_EDGE = 1600;           // client-side downscale for phone photos
  var members = [];
  var loaded = false;
  var adminEl = null, adminToken = '';

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  function call(name) { try { if (typeof window[name] === 'function') window[name](); } catch (e) {} }

  // ── Data ──────────────────────────────────────────────────
  function load() {
    return fetch(API + '/family/list', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (l) { members = Array.isArray(l) ? l : []; loaded = true; })
      .catch(function () { members = []; loaded = true; });
  }

  // ── Public view ───────────────────────────────────────────
  function renderGrid() {
    var g = document.getElementById('fam-grid');
    if (!g) return;
    g.innerHTML = '';
    var list = members.length ? members : new Array(PLACEHOLDER_SLOTS).fill(null);
    list.forEach(function (m) {
      var card = el('div'); card.className = 'fam-card';
      var frame = el('div'); frame.className = 'fam-photo' + (m && m.img ? '' : ' empty');
      if (m && m.img) {
        var img = el('img'); img.src = m.img; img.alt = m.name || ''; img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        frame.appendChild(img);
        frame.style.cursor = 'zoom-in';
        frame.addEventListener('click', (function (mm) { return function () { openFamPhoto(mm); }; })(m));
      }
      var nm = el('div'); nm.className = 'fam-name';
      nm.textContent = (m && m.name) ? m.name : '\u00a0';
      card.appendChild(frame); card.appendChild(nm);
      g.appendChild(card);
    });
  }

  // ── Photo viewer (tap a photo → big view + Download 4K) ───
  // Own overlay; never touches the gallery lightbox or NFTS.
  var famLB = null;
  function famFull(m) { var f = window.ITIA_FAMILY_FULL || {}; return (m && f[String(m.id)]) || ''; }
  function famFileName(m) { return String((m && m.name) || 'ITIA-Family').replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '-') + '-4k.jpg'; }
  function closeFamPhoto() { if (famLB) famLB.style.display = 'none'; }
  function openFamPhoto(m) {
    if (!m || !m.img) return;
    call('hapticTap');
    if (!famLB) {
      famLB = el('div', 'display:none;position:fixed;inset:0;z-index:1000;background:#000;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px 16px 76px;box-sizing:border-box;');
      famLB.id = 'fam-lb';
      var x = el('button', 'position:absolute;top:14px;right:14px;background:transparent;border:1px solid rgba(255,255,255,0.35);color:rgba(255,255,255,0.85);font-family:Georgia,serif;font-size:11px;letter-spacing:0.15rem;padding:7px 16px;cursor:pointer;text-transform:uppercase;', 'Close');
      x.addEventListener('click', function (e) { e.stopPropagation(); closeFamPhoto(); });
      var im = el('img', 'max-width:94vw;max-height:72vh;object-fit:contain;display:block;');
      im.id = 'fam-lb-img'; im.referrerPolicy = 'no-referrer';
      var nm = el('div', 'font-family:Georgia,serif;letter-spacing:0.2rem;color:#fff;font-size:14px;text-transform:uppercase;');
      nm.id = 'fam-lb-name';
      var dl = el('a', 'font-family:Georgia,serif;font-size:11px;letter-spacing:0.15rem;text-transform:uppercase;color:#fff;border:1px solid rgba(255,255,255,0.45);padding:8px 18px;text-decoration:none;', 'Download');
      dl.id = 'fam-lb-dl'; dl.setAttribute('download', '');
      dl.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var href = dl.getAttribute('href'), name = dl.getAttribute('download') || 'ITIA-Family-4k.jpg';
        fetch(href).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) {
          var u = URL.createObjectURL(b), a = document.createElement('a');
          a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
        }).catch(function () { window.open(href, '_blank'); });
      });
      famLB.appendChild(x); famLB.appendChild(im); famLB.appendChild(nm); famLB.appendChild(dl);
      famLB.addEventListener('click', function (e) { if (e.target === famLB) closeFamPhoto(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFamPhoto(); });
      document.body.appendChild(famLB);
    }
    var full = famFull(m), img = document.getElementById('fam-lb-img'), dlEl = document.getElementById('fam-lb-dl');
    img.src = m.img; img.alt = m.name || '';
    document.getElementById('fam-lb-name').textContent = m.name || '';
    dlEl.setAttribute('href', full || m.img);
    dlEl.setAttribute('download', famFileName(m));
    dlEl.textContent = full ? 'Download 4K' : 'Download';
    if (full) { var pre = new Image(); pre.onload = function () { if (famLB.style.display !== 'none' && dlEl.getAttribute('href') === full) img.src = full; }; pre.src = full; }
    famLB.style.display = 'flex';
  }

  window.ITIA_openFamily = function () {
    call('hapticTap'); call('soundOpen');
    document.getElementById('splash').style.display = 'none';
    document.getElementById('family').style.display = 'block';
    window.scrollTo(0, 0);
    renderGrid();
    load().then(renderGrid);
  };
  window.ITIA_closeFamily = function () {
    call('hapticClose'); call('soundClose');
    closeFamPhoto();
    document.getElementById('family').style.display = 'none';
    document.getElementById('splash').style.display = 'flex';
  };

  // ── Photo prep (iPhone camera-roll friendly) ─────────────
  function inMemory(file) {
    // Copy the picked file into memory so the upload body is self-contained.
    if (!file || typeof file.arrayBuffer !== 'function') return Promise.resolve(file);
    return file.arrayBuffer().then(function (buf) {
      return new File([buf], file.name || 'photo.jpg', { type: file.type || 'image/jpeg' });
    }).catch(function () { return file; });
  }
  function prepPhoto(file) {
    return prepPhotoRaw(file).then(inMemory);
  }
  function prepPhotoRaw(file) {
    // Downscale large phone photos to a JPEG; fall back to the original file.
    return new Promise(function (resolve) {
      if (!file || !/^image\//.test(file.type || 'image/') || /gif$/.test(file.type)) return resolve(file);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          var s = Math.min(1, MAX_EDGE / Math.max(w, h));
          if (s === 1 && file.size < 2.5e6) { URL.revokeObjectURL(url); return resolve(file); }
          var c = document.createElement('canvas');
          c.width = Math.round(w * s); c.height = Math.round(h * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (b) {
            URL.revokeObjectURL(url);
            resolve(b ? new File([b], 'photo.jpg', { type: 'image/jpeg' }) : file);
          }, 'image/jpeg', 0.86);
        } catch (e) { URL.revokeObjectURL(url); resolve(file); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  // ── Admin API ─────────────────────────────────────────────
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'X-Admin-Token': adminToken }, opts.headers || {});
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return { error: 'HTTP ' + r.status }; }).then(function (j) {
        if (!r.ok || j.error) throw new Error(j.error || ('HTTP ' + r.status));
        return j;
      });
    });
  }
  function setList(j) { if (j && Array.isArray(j.list)) { members = j.list; loaded = true; } renderAdmin(); renderGrid(); }

  // ── Admin UI ──────────────────────────────────────────────
  var BTN = 'background:transparent;border:0.5px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.75);font-family:Georgia,serif;font-size:13px;min-height:40px;min-width:40px;padding:6px 10px;border-radius:4px;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;';
  var BIG = 'display:block;width:100%;text-align:center;background:transparent;border:0.5px solid rgba(255,255,255,0.3);color:#fff;font-family:Georgia,serif;font-size:11px;letter-spacing:0.2rem;padding:13px 10px;border-radius:4px;cursor:pointer;text-transform:uppercase;position:relative;overflow:hidden;';
  var HIDDEN_FILE = 'position:absolute;left:0;top:0;width:1px;height:1px;opacity:0;';

  function msg(text, color) {
    var m = document.getElementById('fam-adm-msg');
    if (!m) return;
    m.textContent = text; m.style.color = color || 'rgba(255,255,255,0.45)';
    if (color === '#88ff88') setTimeout(function () { if (m.textContent === text) m.textContent = ''; }, 3500);
  }
  function busy(on) { if (adminEl) adminEl.style.opacity = on ? '0.6' : '1'; if (adminEl) adminEl.style.pointerEvents = on ? 'none' : ''; }

  function filePicker(labelText, css, onFile) {
    var lab = el('label', css, null);
    lab.appendChild(document.createTextNode(labelText));
    var inp = el('input', HIDDEN_FILE);
    inp.type = 'file'; inp.accept = 'image/*';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (f) onFile(f);
    });
    lab.appendChild(inp);
    return lab;
  }

  function addWithPhoto(file) {
    busy(true); msg('Uploading photo…');
    prepPhoto(file).then(function (f) {
      var fd = new FormData(); fd.append('name', ''); fd.append('file', f);
      return api('/family/add', { method: 'POST', body: fd });
    }).then(function (j) { busy(false); setList(j); msg('Member added. Add a name below.', '#88ff88'); })
      .catch(function (e) { busy(false); msg('Upload failed: ' + e.message, '#ff8888'); });
  }
  function addEmpty() {
    busy(true); msg('Adding…');
    var fd = new FormData(); fd.append('name', '');
    api('/family/add', { method: 'POST', body: fd })
      .then(function (j) { busy(false); setList(j); msg('Empty slot added.', '#88ff88'); })
      .catch(function (e) { busy(false); msg('Failed: ' + e.message, '#ff8888'); });
  }
  function changePhoto(m, file) {
    busy(true); msg('Uploading photo…');
    prepPhoto(file).then(function (f) {
      var fd = new FormData(); fd.append('id', m.id); fd.append('file', f);
      return api('/family/update', { method: 'POST', body: fd });
    }).then(function (j) { busy(false); setList(j); msg('Photo saved.', '#88ff88'); })
      .catch(function (e) { busy(false); msg('Upload failed: ' + e.message, '#ff8888'); });
  }
  function saveName(m, name, btn) {
    var fd = new FormData(); fd.append('id', m.id); fd.append('name', name);
    btn.textContent = '…';
    api('/family/update', { method: 'POST', body: fd })
      .then(function (j) { members = j.list || members; renderGrid(); btn.textContent = '✓'; btn.style.color = '#7fff7f'; setTimeout(function () { btn.style.color = ''; }, 1200); })
      .catch(function (e) { btn.textContent = '✓'; msg('Save failed: ' + e.message, '#ff8888'); });
  }
  function move(i, d) {
    var j = i + d;
    if (j < 0 || j >= members.length) return;
    var ids = members.map(function (m) { return m.id; });
    var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    busy(true);
    api('/family/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids }) })
      .then(function (r) { busy(false); setList(r); })
      .catch(function (e) { busy(false); msg('Reorder failed: ' + e.message, '#ff8888'); });
  }
  function remove(m) {
    if (!window.confirm('Remove this family member' + (m.name ? ' "' + m.name + '"' : '') + '? Their photo will be deleted.')) return;
    busy(true);
    api('/family/delete?id=' + encodeURIComponent(m.id), { method: 'DELETE' })
      .then(function () { busy(false); members = members.filter(function (x) { return x.id !== m.id; }); renderAdmin(); renderGrid(); msg('Removed.', '#88ff88'); })
      .catch(function (e) { busy(false); msg('Remove failed: ' + e.message, '#ff8888'); });
  }

  function renderAdmin() {
    if (!adminEl) return;
    var list = adminEl.querySelector('#fam-adm-list');
    list.innerHTML = '';
    if (!loaded) { list.appendChild(el('div', 'font-size:11px;color:rgba(255,255,255,0.3);padding:0.75rem 0;', 'Loading…')); return; }
    if (!members.length) {
      list.appendChild(el('div', 'font-size:11px;color:rgba(255,255,255,0.3);padding:0.75rem 0;letter-spacing:0.08rem;line-height:1.6;',
        'No members yet. The public page shows ' + PLACEHOLDER_SLOTS + ' blank frames until you add someone.'));
      return;
    }
    members.forEach(function (m, i) {
      var row = el('div', 'display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);flex-wrap:wrap;');
      row.className = 'fam-adm-row';
      var thumb = filePicker('', 'position:relative;width:56px;height:56px;flex-shrink:0;border-radius:4px;overflow:hidden;cursor:pointer;background:#1a1a1a;border:0.5px dashed rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:0.08rem;text-align:center;', function (f) { changePhoto(m, f); });
      thumb.title = 'Tap to choose photo';
      if (m.img) {
        var ti = el('img', 'width:100%;height:100%;object-fit:cover;display:block;'); ti.src = m.img; thumb.insertBefore(ti, thumb.firstChild);
      } else { thumb.insertBefore(document.createTextNode('+ PHOTO'), thumb.firstChild); }

      var name = el('input', 'flex:1;min-width:120px;background:transparent;border:0.5px solid rgba(255,255,255,0.15);color:#fff;font-family:Georgia,serif;font-size:16px;padding:8px 10px;border-radius:4px;outline:none;');
      name.value = m.name || ''; name.placeholder = 'Name (optional)'; name.maxLength = 80;
      name.setAttribute('enterkeyhint', 'done'); name.autocomplete = 'off';
      var save = el('button', BTN, '✓'); save.title = 'Save name';
      save.addEventListener('click', function () { saveName(m, name.value.trim(), save); });
      name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); name.blur(); saveName(m, name.value.trim(), save); } });

      var ctr = el('div', 'display:flex;gap:6px;margin-left:auto;');
      var up = el('button', BTN, '↑'); up.title = 'Move up'; up.disabled = i === 0; if (i === 0) up.style.opacity = '0.3';
      var dn = el('button', BTN, '↓'); dn.title = 'Move down'; dn.disabled = i === members.length - 1; if (dn.disabled) dn.style.opacity = '0.3';
      var del = el('button', BTN + 'background:rgba(180,60,60,0.25);', '✕'); del.title = 'Remove';
      up.addEventListener('click', function () { move(i, -1); });
      dn.addEventListener('click', function () { move(i, 1); });
      del.addEventListener('click', function () { remove(m); });
      ctr.appendChild(up); ctr.appendChild(dn); ctr.appendChild(del);

      row.appendChild(thumb); row.appendChild(name); row.appendChild(save); row.appendChild(ctr);
      list.appendChild(row);
    });
  }

  // Called by admin.js after the admin panel is built (same login/token as the gallery admin)
  window.ITIA_Family = {
    mountAdmin: function (container, token) {
      adminEl = container; adminToken = token;
      container.innerHTML = '';
      container.appendChild(el('div', 'font-size:11px;letter-spacing:0.2rem;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:0.35rem;', 'I T I A Family'));
      container.appendChild(el('div', 'font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.08rem;margin-bottom:0.9rem;line-height:1.5;', 'Separate from the gallery. Photos here only show in the I T I A FAMILY box. Tap a photo square to change it.'));
      var row = el('div', 'display:flex;gap:8px;margin-bottom:8px;');
      var a = filePicker('+ Add Member Photo', BIG + 'flex:2;', addWithPhoto); a.id = 'fam-add-photo';
      var b = el('button', BIG + 'flex:1;', '+ Empty Slot'); b.id = 'fam-add-empty';
      b.addEventListener('click', addEmpty);
      row.appendChild(a); row.appendChild(b);
      container.appendChild(row);
      container.appendChild(el('div', 'font-size:11px;min-height:16px;letter-spacing:0.08rem;margin-bottom:4px;', null)).id = 'fam-adm-msg';
      container.appendChild(el('div', '', null)).id = 'fam-adm-list';
    },
    refreshAdmin: function () { renderAdmin(); load().then(renderAdmin); }
  };
})();
