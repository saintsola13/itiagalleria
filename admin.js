// ============================================================
//  ITIA Admin Panel
// ============================================================

(function () {
  'use strict';

  var API = 'https://itiagalleria.xyz/api';

  // Simple hash — not cryptographic, but keeps PW out of plain sight
  function hashStr(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }
  var PW_HASH = hashStr('ITIA4Life22');

  var SESSION_KEY = 'itia_admin_session';
  var NAMES_KEY   = 'itia_nft_names';
  var HIDDEN_KEY  = 'itia_hidden_ids';

  // ── Auth ──────────────────────────────────────────────────

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === PW_HASH;
  }

  function login(pw) {
    if (hashStr(pw) === PW_HASH) {
      sessionStorage.setItem(SESSION_KEY, PW_HASH);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    hideAdminPanel();
  }

  // ── Name overrides (local — only for built-in pieces) ────

  function loadNameOverrides() {
    try { return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveNameOverrides(obj) {
    localStorage.setItem(NAMES_KEY, JSON.stringify(obj));
  }

  // ── Hidden built-ins (local) ──────────────────────────────

  function getHidden()   { try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); } catch (e) { return []; } }
  function saveHidden(h) { localStorage.setItem(HIDDEN_KEY, JSON.stringify(h)); }

  // Called at startup to apply hidden list to built-in NFTS
  window.ITIA_applyHidden = function () {
    var hidden = getHidden();
    if (!hidden.length) return;
    for (var i = NFTS.length - 1; i >= 0; i--) {
      if (hidden.indexOf(String(NFTS[i].id)) !== -1) NFTS.splice(i, 1);
    }
  };

  // ── Server-side custom NFTs ───────────────────────────────

  // Fetches gallery additions from R2/Worker and prepends to NFTS
  // Returns a promise so callers can wait before rendering
  window.ITIA_loadServerPieces = function () {
    return fetch(API + '/list')
      .then(function (r) { return r.json(); })
      .then(function (pieces) {
        var overrides = loadNameOverrides();
        // Server returns newest-first; unshift in reverse so order is preserved
        for (var i = pieces.length - 1; i >= 0; i--) {
          var p = pieces[i];
          if (!NFTS.find(function (n) { return String(n.id) === String(p.id); })) {
            if (overrides[String(p.id)]) p.name = overrides[String(p.id)];
            NFTS.unshift(p);
          }
        }
      })
      .catch(function () { /* silently fail — show built-ins only */ });
  };

  // Called by app.js on boot — applies name overrides to built-ins only
  window.ITIA_applyAdminData = function () {
    var overrides = loadNameOverrides();
    NFTS.forEach(function (n) {
      if (overrides[String(n.id)] !== undefined) {
        n.name = overrides[String(n.id)];
      }
    });
  };

  // ── Admin Panel UI ────────────────────────────────────────

  function buildAdminPanel() {
    if (document.getElementById('admin-panel')) return;

    var overlay = document.createElement('div');
    overlay.id = 'admin-overlay';
    overlay.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.92)',
      'z-index:9000',
      'align-items:flex-start',
      'justify-content:center',
      'padding:1.5rem 1rem 4rem',
      'overflow-y:auto'
    ].join(';');

    var panel = document.createElement('div');
    panel.id = 'admin-panel';
    panel.style.cssText = [
      'background:#0d0d0d',
      'border:0.5px solid rgba(255,255,255,0.15)',
      'border-radius:10px',
      'width:100%',
      'max-width:520px',
      'padding:1.75rem 1.5rem',
      'font-family:Georgia,serif',
      'color:#fff',
      'margin-top:2rem'
    ].join(';');

    panel.innerHTML = [
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;border-bottom:0.5px solid rgba(255,255,255,0.1);padding-bottom:1rem;">',
        '<span style="font-size:0.85rem;letter-spacing:0.3rem;text-transform:uppercase;color:rgba(255,255,255,0.6)">Admin</span>',
        '<button id="admin-logout" style="background:transparent;border:0.5px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.4);font-family:Georgia,serif;font-size:10px;letter-spacing:0.15rem;padding:5px 12px;cursor:pointer;border-radius:3px;text-transform:uppercase;">Log Out</button>',
      '</div>',

      // ── Add Photo ──
      '<div style="margin-bottom:2rem;">',
        '<div style="font-size:11px;letter-spacing:0.2rem;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:0.75rem;">Add Photo</div>',
        '<input id="adm-name" placeholder="Art name" style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.18);color:#fff;',
          'font-family:Georgia,serif;font-size:13px;padding:9px 12px;border-radius:4px;margin-bottom:10px;outline:none;" />',
        '<div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.1rem;margin-bottom:6px;">Upload file OR paste URL</div>',
        '<input id="adm-file" type="file" accept="image/*" style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.18);color:rgba(255,255,255,0.6);',
          'font-family:Georgia,serif;font-size:12px;padding:7px 10px;border-radius:4px;margin-bottom:8px;outline:none;" />',
        '<input id="adm-url" placeholder="Or image URL (https://...)" style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.18);color:#fff;',
          'font-family:Georgia,serif;font-size:12px;padding:9px 12px;border-radius:4px;margin-bottom:10px;outline:none;" />',
        '<button id="adm-add-btn" style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.3);color:#fff;',
          'font-family:Georgia,serif;font-size:11px;letter-spacing:0.2rem;padding:10px;border-radius:4px;',
          'cursor:pointer;text-transform:uppercase;transition:background 0.2s;">Add to Gallery</button>',
        '<div id="adm-add-msg" style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:8px;min-height:16px;letter-spacing:0.1rem;"></div>',
      '</div>',

      // ── Manage ──
      '<div>',
        '<div style="font-size:11px;letter-spacing:0.2rem;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:0.75rem;">Manage Gallery</div>',
        '<input id="adm-search" placeholder="Filter by name..." style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.18);color:#fff;',
          'font-family:Georgia,serif;font-size:12px;padding:8px 12px;border-radius:4px;margin-bottom:10px;outline:none;" />',
        '<div id="adm-list" style="max-height:400px;overflow-y:auto;"></div>',
      '</div>',
    ].join('');

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    document.getElementById('admin-logout').addEventListener('click', logout);
    document.getElementById('adm-add-btn').addEventListener('click', handleAdd);
    document.getElementById('adm-search').addEventListener('input', function () {
      renderManageList(this.value.toLowerCase().trim());
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideAdminPanel();
    });
  }

  // ── Manage list ──────────────────────────────────────────

  function renderManageList(filter) {
    var list = document.getElementById('adm-list');
    if (!list) return;
    list.innerHTML = '';

    // Server pieces have a ts field
    var serverIds = NFTS.filter(function (n) { return n.ts; }).map(function (n) { return String(n.id); });

    NFTS.filter(function (n) {
      return !filter || n.name.toLowerCase().indexOf(filter) !== -1;
    }).forEach(function (n) {
      var isServerPiece = serverIds.indexOf(String(n.id)) !== -1;
      var row = document.createElement('div');
      row.style.cssText = [
        'display:flex',
        'align-items:center',
        'gap:10px',
        'padding:8px 0',
        'border-bottom:0.5px solid rgba(255,255,255,0.06)'
      ].join(';');

      var thumb = document.createElement('img');
      thumb.src = n.img;
      thumb.style.cssText = 'width:40px;height:40px;object-fit:cover;border-radius:3px;flex-shrink:0;background:#1a1a1a;';

      var nameInput = document.createElement('input');
      nameInput.value = n.name;
      nameInput.dataset.nftId = String(n.id);
      nameInput.style.cssText = [
        'flex:1',
        'background:transparent',
        'border:0.5px solid rgba(255,255,255,0.1)',
        'color:#fff',
        'font-family:Georgia,serif',
        'font-size:12px',
        'padding:5px 8px',
        'border-radius:3px',
        'outline:none'
      ].join(';');

      var saveBtn = document.createElement('button');
      saveBtn.textContent = '✓';
      saveBtn.title = 'Save name';
      saveBtn.style.cssText = btnStyle('rgba(255,255,255,0.15)');
      saveBtn.addEventListener('click', function () {
        handleRename(nameInput.dataset.nftId, nameInput.value.trim());
        saveBtn.style.color = '#7fff7f';
        setTimeout(function () { saveBtn.style.color = ''; }, 1200);
      });

      var delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Delete';
      delBtn.style.cssText = btnStyle('rgba(180,60,60,0.25)');
      delBtn.addEventListener('click', function () {
        confirmDelete(n, isServerPiece);
      });

      row.appendChild(thumb);
      row.appendChild(nameInput);
      row.appendChild(saveBtn);
      row.appendChild(delBtn);
      list.appendChild(row);
    });

    if (list.children.length === 0) {
      list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.3);padding:1rem 0;letter-spacing:0.1rem;">No results.</div>';
    }
  }

  function btnStyle(bg) {
    return [
      'background:' + bg,
      'border:0.5px solid rgba(255,255,255,0.15)',
      'color:rgba(255,255,255,0.6)',
      'font-size:12px',
      'padding:5px 9px',
      'border-radius:3px',
      'cursor:pointer',
      'flex-shrink:0',
      'font-family:Georgia,serif',
      'transition:background 0.2s'
    ].join(';');
  }

  // ── Rename ───────────────────────────────────────────────

  function handleRename(id, newName) {
    if (!newName) return;
    var overrides = loadNameOverrides();
    overrides[String(id)] = newName;
    saveNameOverrides(overrides);
    var n = NFTS.find(function (x) { return String(x.id) === String(id); });
    if (n) n.name = newName;
  }

  // ── Delete ───────────────────────────────────────────────

  function confirmDelete(nft, isServerPiece) {
    var modal = document.createElement('div');
    modal.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.88)',
      'z-index:9999',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:1rem'
    ].join(';');

    modal.innerHTML = [
      '<div style="background:#111;border:0.5px solid rgba(255,100,100,0.3);border-radius:10px;padding:2rem 1.5rem;max-width:340px;width:100%;text-align:center;font-family:Georgia,serif;">',
        '<div style="font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:0.5rem;letter-spacing:0.05rem;">Delete this piece?</div>',
        '<div style="font-size:11px;color:rgba(255,100,100,0.7);margin-bottom:1.5rem;letter-spacing:0.08rem;">"' + nft.name + '"</div>',
        (isServerPiece
          ? '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:1.25rem;">This will be permanently removed for everyone.</div>'
          : '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:1.25rem;">This is a built-in piece. It will be hidden from your view.</div>'
        ),
        '<div style="display:flex;gap:10px;">',
          '<button id="conf-cancel" style="flex:1;padding:10px;background:transparent;border:0.5px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.5);font-family:Georgia,serif;font-size:11px;letter-spacing:0.15rem;border-radius:4px;cursor:pointer;text-transform:uppercase;">Cancel</button>',
          '<button id="conf-delete" style="flex:1;padding:10px;background:rgba(180,40,40,0.35);border:0.5px solid rgba(200,60,60,0.4);color:#ffaaaa;font-family:Georgia,serif;font-size:11px;letter-spacing:0.15rem;border-radius:4px;cursor:pointer;text-transform:uppercase;">Delete</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    document.getElementById('conf-cancel').addEventListener('click', function () {
      document.body.removeChild(modal);
    });
    document.getElementById('conf-delete').addEventListener('click', function () {
      document.body.removeChild(modal);
      doDelete(nft, isServerPiece);
    });
  }

  function doDelete(nft, isServerPiece) {
    if (isServerPiece) {
      // Delete from server
      fetch(API + '/delete?id=' + encodeURIComponent(nft.id), {
        method: 'DELETE',
        headers: { 'X-Admin-Token': 'ITIA4Life22' }
      }).catch(function () {});
    } else {
      // Hide locally
      var hidden = getHidden();
      if (hidden.indexOf(String(nft.id)) === -1) hidden.push(String(nft.id));
      saveHidden(hidden);
    }
    var idx = NFTS.findIndex(function (n) { return String(n.id) === String(nft.id); });
    if (idx !== -1) NFTS.splice(idx, 1);
    renderManageList(document.getElementById('adm-search').value.toLowerCase().trim());
  }

  // ── Add Photo ────────────────────────────────────────────

  function handleAdd() {
    var name   = (document.getElementById('adm-name').value || '').trim();
    var fileEl = document.getElementById('adm-file');
    var urlVal = (document.getElementById('adm-url').value  || '').trim();
    var msg    = document.getElementById('adm-add-msg');

    if (!name)                                  { showMsg(msg, 'Enter a name.', '#ff8888'); return; }
    if (!fileEl.files.length && !urlVal)        { showMsg(msg, 'Provide a file or URL.', '#ff8888'); return; }

    if (fileEl.files.length) {
      showMsg(msg, 'Uploading...', 'rgba(255,255,255,0.4)');
      var formData = new FormData();
      formData.append('name', name);
      formData.append('file', fileEl.files[0]);
      fetch(API + '/upload', {
        method: 'POST',
        headers: { 'X-Admin-Token': 'ITIA4Life22' },
        body: formData
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          onAdded(res.piece, msg);
        } else {
          showMsg(msg, 'Upload failed: ' + (res.error || 'unknown error'), '#ff8888');
        }
      })
      .catch(function (e) {
        showMsg(msg, 'Upload failed. Check connection.', '#ff8888');
      });
    } else {
      // URL-based — send to server too so everyone sees it
      showMsg(msg, 'Saving...', 'rgba(255,255,255,0.4)');
      fetch(API + '/upload-url', {
        method: 'POST',
        headers: { 'X-Admin-Token': 'ITIA4Life22', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, url: urlVal })
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          onAdded(res.piece, msg);
        } else {
          showMsg(msg, 'Save failed: ' + (res.error || 'unknown error'), '#ff8888');
        }
      })
      .catch(function () {
        showMsg(msg, 'Save failed. Check connection.', '#ff8888');
      });
    }
  }

  function onAdded(piece, msgEl) {
    // Prepend into live NFTS immediately
    if (!NFTS.find(function (n) { return String(n.id) === String(piece.id); })) {
      NFTS.unshift(piece);
    }
    document.getElementById('adm-name').value = '';
    document.getElementById('adm-file').value = '';
    document.getElementById('adm-url').value  = '';
    showMsg(msgEl, '"' + piece.name + '" saved. Everyone will see it.', '#88ff88');
    renderManageList('');
  }

  function showMsg(el, text, color) {
    el.textContent = text;
    el.style.color = color || 'rgba(255,255,255,0.4)';
    setTimeout(function () { if (el.textContent === text) el.textContent = ''; }, 4000);
  }

  // ── Show / Hide panel ────────────────────────────────────

  function showAdminPanel() {
    buildAdminPanel();
    var ov = document.getElementById('admin-overlay');
    ov.style.display = 'flex';
    renderManageList('');
  }

  function hideAdminPanel() {
    var ov = document.getElementById('admin-overlay');
    if (ov) ov.style.display = 'none';
  }

  // ── Login modal ──────────────────────────────────────────

  window.showLoginModal = function showLoginModal() {
    if (isLoggedIn()) { showAdminPanel(); return; }

    var modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.9)',
      'z-index:9999',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:1rem'
    ].join(';');

    modal.innerHTML = [
      '<div style="background:#0d0d0d;border:0.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:2rem 1.5rem;max-width:300px;width:100%;font-family:Georgia,serif;">',
        '<div style="font-size:10px;letter-spacing:0.3rem;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-bottom:1.25rem;text-align:center;">Admin Access</div>',
        '<input id="adm-pw-input" type="password" placeholder="Password" style="',
          'width:100%;background:transparent;border:0.5px solid rgba(255,255,255,0.18);',
          'color:#fff;font-family:Georgia,serif;font-size:14px;padding:10px 12px;border-radius:4px;outline:none;margin-bottom:10px;" />',
        '<div id="adm-pw-err" style="font-size:10px;color:#ff6666;min-height:14px;margin-bottom:10px;letter-spacing:0.1rem;text-align:center;"></div>',
        '<div style="display:flex;gap:8px;">',
          '<button id="adm-pw-cancel" style="flex:1;padding:10px;background:transparent;border:0.5px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.4);font-family:Georgia,serif;font-size:10px;letter-spacing:0.15rem;border-radius:4px;cursor:pointer;text-transform:uppercase;">Cancel</button>',
          '<button id="adm-pw-submit" style="flex:1;padding:10px;background:transparent;border:0.5px solid rgba(255,255,255,0.3);color:#fff;font-family:Georgia,serif;font-size:10px;letter-spacing:0.15rem;border-radius:4px;cursor:pointer;text-transform:uppercase;">Enter</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    var pwInput = document.getElementById('adm-pw-input');
    pwInput.focus();

    function tryLogin() {
      var pw = pwInput.value;
      if (login(pw)) {
        document.body.removeChild(modal);
        showAdminPanel();
      } else {
        document.getElementById('adm-pw-err').textContent = 'Wrong password.';
        pwInput.value = '';
        pwInput.focus();
      }
    }

    document.getElementById('adm-pw-submit').addEventListener('click', tryLogin);
    document.getElementById('adm-pw-cancel').addEventListener('click', function () {
      document.body.removeChild(modal);
    });
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryLogin();
    });
  };

  // ── Inject admin trigger into splash ─────────────────────

  window.ITIA_initAdmin = function () {
    var footer = document.getElementById('splash-footer');
    if (!footer) return;

    var adminBtn = document.createElement('button');
    adminBtn.id = 'admin-trigger';
    adminBtn.textContent = 'ADMIN';
    adminBtn.style.cssText = [
      'position:absolute',
      'bottom:1.5rem',
      'left:1.5rem',
      'background:rgba(255,255,255,0.08)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'border:1px solid rgba(255,255,255,0.18)',
      'color:rgba(255,255,255,0.6)',
      'font-family:Georgia,serif',
      'font-size:10px',
      'letter-spacing:0.2rem',
      'cursor:pointer',
      'padding:7px 18px',
      'border-radius:3px',
      'text-transform:uppercase',
      'transition:all 0.2s'
    ].join(';');
    adminBtn.addEventListener('mouseenter', function () {
      this.style.background = 'rgba(255,255,255,0.15)';
      this.style.color = '#fff';
      this.style.borderColor = 'rgba(255,255,255,0.4)';
    });
    adminBtn.addEventListener('mouseleave', function () {
      this.style.background = 'rgba(255,255,255,0.08)';
      this.style.color = 'rgba(255,255,255,0.6)';
      this.style.borderColor = 'rgba(255,255,255,0.18)';
    });
    adminBtn.addEventListener('click', showLoginModal);

    var tapCount = 0, tapTimer = null;
    var resetMs = ('ontouchstart' in window) ? 600 : 1000;
    footer.addEventListener('click', function () {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapCount = 0; }, resetMs);
      if (tapCount >= 3) { tapCount = 0; showLoginModal(); }
    });

    var splash = document.getElementById('splash');
    if (splash) splash.appendChild(adminBtn);
  };

})();
