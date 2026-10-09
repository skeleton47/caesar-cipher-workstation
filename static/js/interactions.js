/* ==========================================================================
   WARM BENTO BRUTALISM // INTERACTIVE MOUSE PHYSICS & SMOOTH TRANSITIONS
   Custom Magnetic Cursor Follower, Universal Hover Feedback, and Studio Transitions
   ========================================================================== */

(function () {
  'use strict';

  // ── 1. Interactive Hover Sound Feedback ──────────────────────────────────
  const interactiveSelector = `
    a, button, input, textarea, select, label,
    .nav-tab, .preset-chip, .action-btn, .apply-shift-btn,
    #cracker-cards-grid > div, .freq-bar-col, .tabula-cell,
    [role="button"], [data-interactive="true"]
  `;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      if (window.CyberSFX && typeof CyberSFX.hover === 'function') {
        CyberSFX.hover();
      }
    }
  });

  // ── 2. Warm Bento Studio Transition Curtain ──────────────────────────────
  let curtainEl = null;
  let curtainTitleEl = null;
  let curtainBarEl = null;

  function createTransitionCurtain() {
    curtainEl = document.createElement('div');
    curtainEl.id = 'bento-transition-curtain';
    curtainEl.className = 'bento-transition-curtain';

    curtainEl.innerHTML = `
      <div class="curtain-dialog">
        <div class="curtain-spinner"></div>
        <div class="curtain-title" id="curtain-studio-title">ENTERING STUDIO...</div>
        <div class="curtain-progress-track">
          <div class="curtain-progress-bar" id="curtain-progress-bar"></div>
        </div>
        <div class="curtain-subtext">[WARM BENTO CRYPTOGRAPHIC ENGINE]</div>
      </div>
    `;

    document.body.appendChild(curtainEl);
    curtainTitleEl = document.getElementById('curtain-studio-title');
    curtainBarEl = document.getElementById('curtain-progress-bar');
  }

  function getStudioNameFromUrl(href) {
    const clean = href.toLowerCase();
    if (clean.includes('vigenere')) return 'VIGENÈRE CIPHER STUDIO';
    if (clean.includes('frequency')) return 'FREQUENCY ANALYSIS STUDIO';
    if (clean.includes('about')) return 'ABOUT & SPECIFICATIONS';
    return 'CAESAR CIPHER STUDIO';
  }

  function triggerStudioTransition(targetUrl) {
    if (!curtainEl) return;

    const studioName = getStudioNameFromUrl(targetUrl);
    if (curtainTitleEl) curtainTitleEl.textContent = `LOADING ${studioName}...`;

    if (window.CyberSFX && typeof CyberSFX.transition === 'function') {
      CyberSFX.transition();
    }

    curtainEl.classList.remove('curtain-leaving');
    curtainEl.classList.add('curtain-active');

    // Smooth progress bar fill
    if (curtainBarEl) {
      curtainBarEl.style.width = '0%';
      requestAnimationFrame(() => {
        curtainBarEl.style.width = '100%';
      });
    }

    // Gentle page exit animation on main container
    const mainShell = document.querySelector('.max-w-5xl') || document.querySelector('main');
    if (mainShell) {
      mainShell.style.transition = 'transform 0.2s cubic-bezier(0.7,0,0.84,0), opacity 0.18s ease';
      mainShell.style.transform = 'translateY(-8px) scale(0.99)';
      mainShell.style.opacity = '0';
    }

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 220);
  }

  function setupNavigationTransitions() {
    // Intercept clicks on navbar links and studio tabs
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (link.getAttribute('target') === '_blank') return;

      // Check if it's an internal studio route
      const isInternalStudio =
        href === '/' ||
        href.includes('index.html') ||
        href.includes('caesar') ||
        href.includes('vigenere') ||
        href.includes('frequency') ||
        href.includes('about');

      if (isInternalStudio) {
        // Prevent default harsh reload
        e.preventDefault();
        triggerStudioTransition(href);
      }
    });
  }

  // ── 3. Staggered Bento Cards Entrance on Page Ready ──────────────────────
  function initPageEntrance() {
    const mainShell = document.querySelector('.max-w-5xl');
    if (mainShell) {
      mainShell.classList.add('bento-fade-in');
    }

    // Dismiss curtain if returning via back/forward cache
    if (curtainEl && curtainEl.classList.contains('curtain-active')) {
      curtainEl.classList.remove('curtain-active');
      curtainEl.classList.add('curtain-leaving');
      setTimeout(() => {
        curtainEl.classList.remove('curtain-leaving');
      }, 300);
    }
  }

  // ── 4. Card 3D Magnetic Micro-Tilt on Hover ──────────────────────────────
  function initCardTilts() {
    const tiltCards = document.querySelectorAll(
      '#cracker-cards-grid > div, .border-2.border-charcoal.rounded-2xl, .neo-border.rounded-2xl, .stat-card'
    );

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (-y / rect.height) * 4.5;
        const rotateY = (x / rect.width) * 4.5;

        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── 5. Initialize Everything on DOM Ready ────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    createTransitionCurtain();
    setupNavigationTransitions();
    initPageEntrance();
    initCardTilts();
  });

  // Handle pageshow event (e.g. browser back button cache)
  window.addEventListener('pageshow', (event) => {
    if (curtainEl) {
      curtainEl.classList.remove('curtain-active');
      curtainEl.classList.remove('curtain-leaving');
    }
    const mainShell = document.querySelector('.max-w-5xl');
    if (mainShell) {
      mainShell.style.transform = '';
      mainShell.style.opacity = '1';
    }
  });
})();
