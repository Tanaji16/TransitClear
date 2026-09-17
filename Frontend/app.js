// TransitClear Driver Console — Client Application & Multi-page Handler
// Fully compatible with both direct file:// access and static/HTTP server hosting

(function () {
  'use strict';

  // Check if we are running in SPA mode (multiple .page-view containers) or individual page mode
  const pageViews = document.querySelectorAll('.page-view');
  const isMultiPage = pageViews.length <= 1;

  // SPA Route Definitions
  const routes = {
    'home': 'view-home',
    'my-journey': 'view-my-journey',
    'alerts': 'view-alerts',
    'report-problem': 'view-report-problem',
    'profile': 'view-profile'
  };

  // Router: Switch between views in SPA mode
  function navigateToRoute(routeKey) {
    if (isMultiPage) return;

    const normalized = routes[routeKey] ? routeKey : 'home';
    const targetId = routes[normalized];

    // 1. Toggle View Visibility
    pageViews.forEach(function (view) {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // 2. Update Sidebar Active Classes
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const linkRoute = link.getAttribute('data-route') || link.getAttribute('href')?.replace('#', '');
      if (linkRoute === normalized) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Keep URL Hash Synced
    if (window.location.hash.replace('#', '') !== normalized) {
      window.location.hash = normalized;
    }
  }

  // Handle Hash Changes in SPA mode
  function handleHashChange() {
    if (isMultiPage) return;
    const rawHash = (window.location.hash || '').replace('#', '').trim();
    navigateToRoute(rawHash);
  }

  if (!isMultiPage) {
    window.addEventListener('hashchange', handleHashChange);
  }

  // Setup UI Interactions once DOM is ready
  function initApp() {
    if (!isMultiPage) {
      // 1. Initial SPA Route
      handleHashChange();

      // 2. SPA direct click listeners on hash links
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          const targetRoute = anchor.getAttribute('href').replace('#', '').trim();
          if (routes[targetRoute]) {
            e.preventDefault();
            navigateToRoute(targetRoute);
          }
        });
      });
    } else {
      // Ensure single page view is always visible
      pageViews.forEach(function (view) {
        view.classList.add('active');
      });

      // Synchronize active navigation link based on current page file
      const currentFileName = (window.location.pathname || '').split('/').pop() || 'home.html';
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(function (link) {
        const href = link.getAttribute('href') || '';
        if (href === currentFileName || href.endsWith('/' + currentFileName)) {
          link.classList.add('active');
        }
      });
    }

    // 3. Header Profile Chip -> Navigate to Profile
    const profileChip = document.getElementById('headerProfileChip');
    if (profileChip) {
      profileChip.addEventListener('click', function () {
        if (isMultiPage) {
          window.location.href = 'profile.html';
        } else {
          navigateToRoute('profile');
        }
      });
    }

    // 4. Home: State Switcher (Active Alert vs Route Clear)
    const btnAlert = document.getElementById('btn-state-alert');
    const btnClear = document.getElementById('btn-state-clear');
    const cardAlert = document.getElementById('home-card-alert-state');
    const cardClear = document.getElementById('home-card-clear-state');

    if (btnAlert && btnClear && cardAlert && cardClear) {
      btnAlert.addEventListener('click', function () {
        btnAlert.classList.add('active');
        btnClear.classList.remove('active');
        cardAlert.style.display = 'flex';
        cardClear.style.display = 'none';
      });

      btnClear.addEventListener('click', function () {
        btnClear.classList.add('active');
        btnAlert.classList.remove('active');
        cardAlert.style.display = 'none';
        cardClear.style.display = 'flex';
      });
    }

    // 5. Home: Check My Journey Form Simulation
    const checkForm = document.getElementById('checkJourneyForm');
    if (checkForm) {
      checkForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fromVal = document.getElementById('home-input-from') ? document.getElementById('home-input-from').value : 'Mumbai';
        const toVal = document.getElementById('home-input-to') ? document.getElementById('home-input-to').value : 'Goa';
        const vehicleVal = document.getElementById('home-select-vehicle') ? document.getElementById('home-select-vehicle').value : 'Heavy Commercial Vehicle';
        
        // Dynamic clearance check
        const activeCard = document.getElementById('home-card-alert-state');
        const hasActiveRestriction = activeCard && activeCard.style.display !== 'none';
        const locationName = activeCard ? (activeCard.querySelector('.metric-tile .metric-value')?.textContent || 'Corridor Restriction') : 'Corridor Restriction';
        
        if (hasActiveRestriction) {
          alert(`Corridor Clearance Check:\n` +
                `• Route: ${fromVal} → ${toVal}\n` +
                `• Vehicle: ${vehicleVal}\n` +
                `• Status: Advisory active at ${locationName}. Recommended action highlighted below.`);
          activeCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert(`Corridor Clearance Check:\n` +
                `• Route: ${fromVal} → ${toVal}\n` +
                `• Vehicle: ${vehicleVal}\n` +
                `• Status: ✓ Route Clear! All NHAI passes & corridors are running with normal transit.`);
        }
      });
    }

    // 6. Driver Guidance Modal ("What Should I Do?")
    const guidanceModal = document.getElementById('driverGuidanceModal');
    const closeGuidanceModalBtn = document.getElementById('closeGuidanceModalBtn');
    const dismissGuidanceModalBtn = document.getElementById('dismissGuidanceModalBtn');

    function openGuidanceModal() {
      if (guidanceModal) guidanceModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeGuidanceModal() {
      if (guidanceModal) guidanceModal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.trigger-guidance-modal').forEach(function (btn) {
      btn.addEventListener('click', openGuidanceModal);
    });

    if (closeGuidanceModalBtn) closeGuidanceModalBtn.addEventListener('click', closeGuidanceModal);
    if (dismissGuidanceModalBtn) dismissGuidanceModalBtn.addEventListener('click', closeGuidanceModal);

    if (guidanceModal) {
      guidanceModal.addEventListener('click', function (e) {
        if (e.target === guidanceModal) closeGuidanceModal();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && guidanceModal && !guidanceModal.classList.contains('hidden')) {
        closeGuidanceModal();
      }
    });

    window.handleSelectModalOption = function (optionName) {
      alert('Selected: ' + optionName + '\nUpdating route guidance on console.');
      closeGuidanceModal();
    };

    // 7. My Journey: Share Status
    const shareBtn = document.getElementById('shareTransporterBtn');
    const shareToast = document.getElementById('shareStatusToast');
    if (shareBtn && shareToast) {
      shareBtn.addEventListener('click', function () {
        shareToast.style.display = 'inline-block';
        shareBtn.style.opacity = '0.7';
        setTimeout(function () {
          shareToast.style.display = 'none';
          shareBtn.style.opacity = '1';
        }, 4000);
      });
    }

    // 8. Report Problem: Category Selection
    const problemCards = document.querySelectorAll('.problem-card');
    problemCards.forEach(function (card) {
      card.addEventListener('click', function () {
        problemCards.forEach(function (c) {
          c.classList.remove('active');
          const b = c.querySelector('.problem-check-badge');
          if (b) b.remove();
        });

        card.classList.add('active');
        const badge = document.createElement('span');
        badge.className = 'problem-check-badge';
        badge.textContent = '✓';
        card.appendChild(badge);
      });
    });

    // 9. Report Problem: Location Re-detect
    const redetectBtn = document.getElementById('redetectLocationBtn');
    const locText = document.getElementById('detectedLocationText');
    if (redetectBtn && locText) {
      redetectBtn.addEventListener('click', function () {
        locText.innerHTML = '<span style="color: var(--color-warning-amber);">Re-calibrating GPS satellite lock...</span>';
        setTimeout(function () {
          locText.innerHTML = 'Location detected automatically: <strong>NH 48, near Shirwal (KM 58.4 • Pune-Satara Section)</strong>';
        }, 600);
      });
    }

    // 10. Report Problem: Photo Label
    const photoInput = document.getElementById('reportPhotoInput');
    const photoLabel = document.getElementById('photoStatusLabel');
    if (photoInput && photoLabel) {
      photoInput.addEventListener('change', function () {
        if (photoInput.files && photoInput.files[0]) {
          photoLabel.textContent = 'Attached: ' + photoInput.files[0].name;
          photoLabel.style.color = 'var(--color-emerald-clear)';
          photoLabel.style.fontWeight = '700';
        }
      });
    }

    // 11. Report Problem: Submission
    const submitBtn = document.getElementById('submitReportBtn');
    const successBanner = document.getElementById('reportSuccessBanner');
    const dismissBanner = document.getElementById('dismissBannerBtn');

    if (submitBtn && successBanner) {
      submitBtn.addEventListener('click', function () {
        successBanner.classList.remove('hidden');
        successBanner.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (dismissBanner && successBanner) {
      dismissBanner.addEventListener('click', function () {
        successBanner.classList.add('hidden');
      });
    }

    // 12. Language Switcher Buttons
    document.querySelectorAll('.lang-switcher').forEach(function (switcher) {
      const btns = switcher.querySelectorAll('.lang-btn');
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (btn) { btn.classList.remove('active'); });
          b.classList.add('active');
        });
      });
    });

    // 13. Preferences Switches
    document.querySelectorAll('.switch-input').forEach(function (switchInput) {
      switchInput.addEventListener('change', function () {
        const text = switchInput.parentElement.querySelector('.switch-status-text');
        if (text) {
          text.textContent = switchInput.checked ? 'ON' : 'OFF';
          text.style.color = switchInput.checked ? 'var(--color-emerald-clear)' : 'var(--color-text-muted)';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
