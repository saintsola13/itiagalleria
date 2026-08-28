// ============================================================
//  ITIA Admin Panel
// ============================================================

(function () {
  'use strict';

  // Simple hash — not cryptographic, but keeps PW out of plain sight
  function hashStr(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }
  var PW_HASH = hashStr('ITIA4Life22'); // '8c10f9e8' or whatever it resolves to

  var SESSION_KEY = 'itia_admin_session';
  var CUSTOM_KEY  = 'itia_custom_nfts';  // added via admin
  var NAMES_KEY   = 'itia_nft_names';    // renamed items

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

  // ── Custom NFT persistence ────────────────────────────────

  function loadCustomNfts() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveCustomNfts(arr) {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr));
  }

  function loadNameOverrides() {
    try { return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveNameOverrides(obj) {
    localStorage.setItem(NAMES_KEY, JSON.stringify(obj));
  }

  // Called by nfts.js bootstrap to patch NFTS with saved data
  window.ITIA_applyAdminData = function () {
    var customs  = loadCustomNfts();
    var overrides = loadNameOverrides();

    // Append custom pieces
    customs.forEach(function (c) {
      if (!NFTS.find(function (n) { return String(n.id) === String(c.id); })) {
        NFTS.push(c);
      }
    });

    // Apply name overrides
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

    // Events
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
    var customs = loadCustomNfts();
    var customIds = customs.map(function (c) { return String(c.id); });

    NFTS.filter(function (n) {
      return !filter || n.name.toLowerCase().indexOf(filter) !== -1;
    }).forEach(function (n, i) {
      var isCustom = customIds.indexOf(String(n.id)) !== -1;
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
      nameInput.addEventListener('change', function () {
        handleRename(this.dataset.nftId, this.value.trim());
      });

      var saveBtn = document.createElement('button');
      saveBtn.textContent = '✓';
      saveBtn.title = 'Save name';
      saveBtn.style.cssText = btnStyle('rgba(255,255,255,0.15)');
      saveBtn.addEventListener('click', function () {
        handleRename(nameInput.dataset.nftId, nameInput.value.trim());
        saveBtn.textContent = '✓';
        saveBtn.style.color = '#7fff7f';
        setTimeout(function () { saveBtn.style.color = ''; saveBtn.textContent = '✓'; }, 1200);
      });

      var delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Delete';
      delBtn.style.cssText = btnStyle('rgba(180,60,60,0.25)');
      delBtn.addEventListener('click', function () {
        confirmDelete(n, isCustom);
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
    // Update live NFTS
    var n = NFTS.find(function (x) { return String(x.id) === String(id); });
    if (n) n.name = newName;
    // Also update custom if it's one
    var customs = loadCustomNfts();
    var ci = customs.findIndex(function (x) { return String(x.id) === String(id); });
    if (ci !== -1) { customs[ci].name = newName; saveCustomNfts(customs); }
  }

  // ── Delete ───────────────────────────────────────────────

  function confirmDelete(nft, isCustom) {
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
        (isCustom
          ? '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:1.25rem;">This was added via admin and will be permanently removed.</div>'
          : '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:1.25rem;">This is a built-in piece. It will be hidden from the gallery.</div>'
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
      doDelete(nft, isCustom);
    });
  }

  function doDelete(nft, isCustom) {
    if (isCustom) {
      // Remove from localStorage customs
      var customs = loadCustomNfts().filter(function (c) { return String(c.id) !== String(nft.id); });
      saveCustomNfts(customs);
    } else {
      // Track hidden built-ins
      var hidden = getHidden();
      if (hidden.indexOf(String(nft.id)) === -1) hidden.push(String(nft.id));
      saveHidden(hidden);
    }
    // Remove from live NFTS
    var idx = NFTS.findIndex(function (n) { return String(n.id) === String(nft.id); });
    if (idx !== -1) NFTS.splice(idx, 1);
    renderManageList(document.getElementById('adm-search').value.toLowerCase().trim());
  }

  var HIDDEN_KEY = 'itia_hidden_ids';
  function getHidden()    { try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); } catch (e) { return []; } }
  function saveHidden(h)  { localStorage.setItem(HIDDEN_KEY, JSON.stringify(h)); }

  // Called at startup to apply hidden list
  window.ITIA_applyHidden = function () {
    var hidden = getHidden();
    if (!hidden.length) return;
    for (var i = NFTS.length - 1; i >= 0; i--) {
      if (hidden.indexOf(String(NFTS[i].id)) !== -1) NFTS.splice(i, 1);
    }
  };

  // ── Add Photo ────────────────────────────────────────────

  function handleAdd() {
    var name    = (document.getElementById('adm-name').value || '').trim();
    var fileEl  = document.getElementById('adm-file');
    var urlVal  = (document.getElementById('adm-url').value  || '').trim();
    var msg     = document.getElementById('adm-add-msg');

    if (!name)              { showMsg(msg, 'Enter a name.', '#ff8888'); return; }
    if (!fileEl.files.length && !urlVal) { showMsg(msg, 'Provide a file or URL.', '#ff8888'); return; }

    if (fileEl.files.length) {
      var reader = new FileReader();
      reader.onload = function (e) { addNft(name, e.target.result, msg); };
      reader.readAsDataURL(fileEl.files[0]);
    } else {
      addNft(name, urlVal, msg);
    }
  }

  function addNft(name, imgSrc, msgEl) {
    var id = 'adm_' + Date.now();
    var nft = { id: id, name: name, img: imgSrc, bg: [128, 128, 128] };
    var customs = loadCustomNfts();
    customs.unshift(nft);
    saveCustomNfts(customs);

    // Also save name override so renames persist
    var overrides = loadNameOverrides();
    overrides[id] = name;
    saveNameOverrides(overrides);

    // Prepend into live NFTS immediately — new photos appear at top
    NFTS.unshift(nft);

    // Clear inputs
    document.getElementById('adm-name').value = '';
    document.getElementById('adm-file').value = '';
    document.getElementById('adm-url').value  = '';

    showMsg(msgEl, '"' + name + '" added. All gallery modes updated.', '#88ff88');
    renderManageList('');
  }

  function showMsg(el, text, color) {
    el.textContent = text;
    el.style.color = color || 'rgba(255,255,255,0.4)';
    setTimeout(function () { el.textContent = ''; }, 3500);
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

  function showLoginModal() {
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
  }

  // ── Inject admin trigger into splash ─────────────────────

  window.ITIA_initAdmin = function () {
    var footer = document.getElementById('splash-footer');
    if (!footer) return;

    var adminBtn = document.createElement('button');
    adminBtn.id = 'admin-trigger';
    adminBtn.textContent = 'ADMIN';
    adminBtn.title = '';
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
    // Triple-tap (mobile) or triple-click (desktop) on footer text to trigger
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
