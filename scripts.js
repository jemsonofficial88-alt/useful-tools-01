/* ═══════════════════════════════════════════════════════════
   SHARED SCRIPTS — Toolbox
   ═══════════════════════════════════════════════════════════

   ── AdSense setup ─────────────────────────────────────────
   Replace these 4 values with your real IDs from AdSense:
   https://adsense.google.com → Ads → By ad unit

   publisherId  →  found in your AdSense account (ca-pub-XXXXXXXXXXXXXXXX)
   SLOT_DOWNLOAD  = ad shown after user clicks Download (best spot)
   SLOT_TOOL_OPEN = ad shown 2s after opening any tool page
   SLOT_HOME      = ad shown below the tool cards on the homepage
   ═══════════════════════════════════════════════════════════ */

const ADSENSE = {
  publisherId:   'ca-pub-YOUR_ADSENSE_ID',  // ← replace with your publisher ID
  SLOT_DOWNLOAD: 'YOUR_SLOT_DOWNLOAD',      // ← replace with your slot ID
  SLOT_TOOL_OPEN:'YOUR_SLOT_TOOL_OPEN',     // ← replace with your slot ID
  SLOT_HOME:     'YOUR_SLOT_HOME',          // ← replace with your slot ID
};

// ── Pro System ─────────────────────────────────────────────
window.Toolbox = {

  isPro() { return localStorage.getItem('toolbox_pro') === 'true'; },

  activatePro(key) {
    localStorage.setItem('toolbox_pro', 'true');
    localStorage.setItem('toolbox_pro_key', key || 'manual');
    document.body.classList.add('is-pro');
    this._unlockProSections();
    this.updateNavProBtn();
    window.showToast('✓ Pro activated — ads removed!', '#a78bfa');
  },

  deactivatePro() {
    localStorage.removeItem('toolbox_pro');
    localStorage.removeItem('toolbox_pro_key');
    document.body.classList.remove('is-pro');
    this.updateNavProBtn();
  },

  updateNavProBtn() {
    const btn = document.querySelector('.nav-pro-btn');
    if (!btn) return;
    if (this.isPro()) {
      btn.classList.add('is-pro');
      btn.innerHTML = `<span>👑</span> Pro`;
    } else {
      btn.classList.remove('is-pro');
      btn.innerHTML = `<span class="crown">✦</span> Get Pro`;
    }
  },

  _unlockProSections() {
    document.querySelectorAll('.pro-lock-overlay').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.pro-section-wrap > *:not(.pro-lock-overlay)').forEach(el => {
      el.style.filter = '';
      el.style.pointerEvents = '';
      el.style.userSelect = '';
    });
  },

  // ── Build a real Google AdSense unit ──────────────────────
  _buildAd(slotId) {
    const wrap = document.createElement('div');
    wrap.className = 'ad-slot';

    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Advertisement';
    wrap.appendChild(label);

    const shell = document.createElement('div');
    shell.className = 'ad-unit';

    // Real AdSense <ins> tag
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADSENSE.publisherId);
    ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    shell.appendChild(ins);
    wrap.appendChild(shell);

    // Push to AdSense
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}

    return wrap;
  },

  // ── Ad fires when user hits Download ──────────────────────
  // Each tool calls: window.Toolbox.showResultAd()
  // Shows once per session, at the bottom of the tool card.
  showResultAd() {
    if (this.isPro()) return;
    if (document.getElementById('_result-ad')) return;

    const card = document.querySelector('.card');
    if (!card) return;

    const wrap = document.createElement('div');
    wrap.id = '_result-ad';
    wrap.style.cssText = 'padding:16px 24px; border-top:1px solid var(--border);';
    wrap.appendChild(this._buildAd(ADSENSE.SLOT_DOWNLOAD));
    card.appendChild(wrap);
  },

  // ── Ad fires 2s after a tool page opens ───────────────────
  // Injected once below the page header.
  _toolAdShown: false,
  showToolOpenAd() {
    if (this.isPro()) return;
    if (this._toolAdShown) return;
    if (!window.location.pathname.includes('/tools/')) return;
    this._toolAdShown = true;

    setTimeout(() => {
      const header = document.querySelector('.page-header');
      if (!header) return;
      const outer = document.createElement('div');
      outer.style.cssText = 'max-width:860px; margin:10px auto 0; padding:0 24px; width:100%;';
      outer.appendChild(this._buildAd(ADSENSE.SLOT_TOOL_OPEN));
      header.after(outer);
    }, 2000);
  },

  // ── Homepage ad below the tool cards ──────────────────────
  // Called from index.html after 2.2s.
  injectHomeAd() {
    if (this.isPro()) return;
    const slot = document.getElementById('home-tools-ad');
    if (!slot) return;
    setTimeout(() => {
      const outer = document.createElement('div');
      outer.style.cssText = 'max-width:920px; margin:0 auto; padding:0 32px 28px; width:100%;';
      outer.appendChild(this._buildAd(ADSENSE.SLOT_HOME));
      slot.appendChild(outer);
    }, 2200);
  },
};

// ── Toast ──────────────────────────────────────────────────
window.showToast = function(msg = '✓ Done', color = '#47ffb3') {
  let t = document.getElementById('_site-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_site-toast';
    Object.assign(t.style, {
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%) translateY(16px)',
      padding: '10px 20px', borderRadius: '6px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px', fontWeight: '500',
      letterSpacing: '0.1em', pointerEvents: 'none',
      opacity: '0', transition: 'opacity 0.22s, transform 0.22s',
      zIndex: '9999', whiteSpace: 'nowrap',
      boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = color;
  t.style.color = '#0c0c0c';
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(16px)';
  }, 2800);
};

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Load AdSense script ──────────────────────────────────
  // Uncomment these lines once you have your publisher ID filled in above.
  // if (!document.querySelector('script[src*="adsbygoogle"]')) {
  //   const s = document.createElement('script');
  //   s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.publisherId}`;
  //   s.async = true;
  //   s.crossOrigin = 'anonymous';
  //   document.head.appendChild(s);
  // }

  if (window.Toolbox.isPro()) document.body.classList.add('is-pro');
  window.Toolbox.updateNavProBtn();

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.endsWith(href)) a.classList.add('active');
  });

  // Lock pro sections for free users
  if (!window.Toolbox.isPro()) {
    document.querySelectorAll('.pro-section-wrap').forEach(wrap => {
      wrap.querySelectorAll(':scope > *:not(.pro-lock-overlay)').forEach(el => {
        el.style.filter = 'blur(2px)';
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
      });
    });
  }

  // Show tool-open ad (tool pages only)
  window.Toolbox.showToolOpenAd();
});