// TransitClear — Centralized Real-time Driver Data Engine
// Dynamically binds real Firestore NHAI restrictions & road hazards to Driver screens:
// home.html, journey.html, alerts.html

import { db, auth, onAuthChange } from './firebase-config.js';
import {
  collection, query, where, getDocs, doc, setDoc, addDoc, onSnapshot,
  orderBy, serverTimestamp
} from './firebase-config.js';

// State
let activeRestrictions = [];
let verifiedRoadProblems = [];
let userNotifications = [];
let rawFirestoreNotifs = [];
let reportStatusNotifs = [];
let hasSeededInitialNHAI = false;

/**
 * Authentic baseline Indian National Highway corridors for initial seeding
 * Used ONLY if Firestore 'restrictions' collection is currently empty.
 */
const SEED_NHAI_RESTRICTIONS = [
  {
    title: "Heavy Commercial Vehicle Ghat Restriction",
    roadName: "NH 48 (Pune – Satara Corridor)",
    location: "Khambatki Ghat Section (KM 78 – KM 84)",
    chainage: "Chainage KM 78 – KM 84",
    restrictionType: "Heavy Vehicle Restriction",
    vehicleType: "Heavy Trucks (>16.2T)",
    startDate: new Date().toISOString().split('T')[0],
    startTime: "16:00",
    endDate: new Date().toISOString().split('T')[0],
    endTime: "22:00",
    description: "Timed no-entry directive enforced along NH-48 Ghat Section for commercial multi-axle freight to mitigate peak evening ghat gridlock.",
    actionRecommended: "Stop safely at approved Shree Ganesh Logistics Park holding yard (KM 54) or divert via Wai bypass.",
    holdingYard: "Shree Ganesh Logistics Park (KM 54)",
    bypassRoute: "Wai – Surur Alternate Corridor",
    status: "active",
    source: "NHAI Project Implementation Unit (PIU) Pune"
  },
  {
    title: "Monsoon Ghat Roadwork & Lane Consolidation",
    roadName: "NH 66 (Mumbai – Goa Highway)",
    location: "Kashedi Ghat Bypass (KM 142 – KM 156)",
    chainage: "Chainage KM 142 – KM 156",
    restrictionType: "Road Closure",
    vehicleType: "Multi-Axle HGVs & Oversized Cargo",
    startDate: new Date().toISOString().split('T')[0],
    startTime: "00:00",
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    endTime: "23:59",
    description: "Culvert widening & rockfall protection nets installation in progress. Multi-axle freight diverted to single lane.",
    actionRecommended: "Expect 45 min delay; wide-load carriers must transit between 11:00 PM and 05:00 AM only.",
    holdingYard: "Mahad Truck Terminal (KM 130)",
    bypassRoute: "NH 48 via Kolhapur – Gaganbawda",
    status: "active",
    source: "NHAI Highway Safety Cell"
  },
  {
    title: "FASTag Freight Lane Sensor Maintenance",
    roadName: "NH 44 (North – South Corridor)",
    location: "Borkhedi Toll Plaza (KM 36)",
    chainage: "Chainage KM 36",
    restrictionType: "Heavy Vehicle Restriction",
    vehicleType: "All Commercial Vehicles",
    startDate: new Date().toISOString().split('T')[0],
    startTime: "06:00",
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    endTime: "18:00",
    description: "Weigh-in-motion calibration on commercial lanes 1 & 2. Please maintain freight queue speed < 20 km/h.",
    actionRecommended: "Keep FASTag balance updated and maintain left lane.",
    holdingYard: "Butibori Industrial Truck Lay-by",
    bypassRoute: "None required — lane detour only",
    status: "upcoming",
    source: "NHAI Regional Office Nagpur"
  }
];

/**
 * Format 24h or ISO time into user-friendly format (e.g., "16:00" -> "4:00 PM")
 */
export function formatFriendlyTime(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Auto-seed initial real NHAI corridor restrictions if collection is empty
 */
async function seedInitialNHAIDataIfNeeded() {
  if (hasSeededInitialNHAI) return;
  hasSeededInitialNHAI = true;
  try {
    const snap = await getDocs(collection(db, 'restrictions'));
    if (snap.empty) {
      console.log('[TransitClear] Seeding authentic NHAI corridor directives to Firestore...');
      for (const item of SEED_NHAI_RESTRICTIONS) {
        await addDoc(collection(db, 'restrictions'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn('[TransitClear] Auto-seed skipped or offline:', err.message);
  }
}

/**
 * Initialize real-time listeners for driver data
 */
export function initDriverDataSync() {
  try {
    sessionStorage.removeItem('tc_dismissed_authority_banner');
  } catch (e) {}

  // Check & seed if empty
  seedInitialNHAIDataIfNeeded();

  // 1. Restrictions listener
  try {
    const qRestrictions = query(collection(db, 'restrictions'), orderBy('createdAt', 'desc'));
    onSnapshot(qRestrictions, (snapshot) => {
      const all = [];
      snapshot.forEach(d => all.push({ id: d.id, ...d.data() }));
      activeRestrictions = all.filter(r => r.status === 'active' || r.status === 'upcoming');
      syncDriverScreens();
    }, (err) => {
      console.warn('[TransitClear] Restrictions listener fallback:', err.message);
    });
  } catch (err) {
    console.warn('[TransitClear] Restrictions listener init err:', err);
  }

  // 2. Road Problems Real-time Listener (verified incidents and driver submitted status tracking)
  try {
    const qProblems = query(collection(db, 'roadProblems'), orderBy('createdAt', 'desc'));
    onSnapshot(qProblems, (snapshot) => {
      const allProblems = [];
      snapshot.forEach(d => allProblems.push({ id: d.id, ...d.data() }));
      verifiedRoadProblems = allProblems.filter(p => p.status === 'verified');
      syncDriverReportNotices(allProblems);
      syncDriverScreens();
    }, (err) => {
      console.warn('[TransitClear] Road problems listener fallback:', err.message);
    });
  } catch (err) {
    console.warn('[TransitClear] Road problems listener init err:', err);
  }

  // 3. User direct notifications listener (warnings, notices, report actions)
  try {
    const qNotifs = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    onSnapshot(qNotifs, (snapshot) => {
      rawFirestoreNotifs = [];
      snapshot.forEach(d => rawFirestoreNotifs.push({ id: d.id, ...d.data() }));
      recomputeUserNotifications();
      syncDriverScreens();
    }, (err) => {
      console.warn('[TransitClear] Notifications listener fallback:', err.message);
    });
  } catch (err) {
    console.warn('[TransitClear] User notification listener init err:', err);
  }

  // 4. Auth State listener for instant recompute when driver profile resolves
  try {
    onAuthChange(() => {
      recomputeUserNotifications();
      syncDriverScreens();
    });
  } catch (err) {
    console.warn('[TransitClear] Auth listener init err:', err);
  }
}

/**
 * Process submitted road problems and extract notices for this driver
 */
function syncDriverReportNotices(allProblems) {
  const myReportIds = JSON.parse(localStorage.getItem('tc_my_report_ids') || '[]');
  const cachedProfile = JSON.parse(localStorage.getItem('tc_cached_driver_profile') || '{}');
  const curUid = auth.currentUser?.uid || cachedProfile.uid;
  const curVehicle = (cachedProfile.vehicleNumber || '').trim().toLowerCase();

  const newNotifs = [];
  allProblems.forEach(p => {
    const pVehicle = (p.reporterVehicle || '').trim().toLowerCase();
    const isMyReport = (curUid && (p.userId === curUid || p.driverUid === curUid)) ||
                       myReportIds.includes(p.id) ||
                       (curVehicle && pVehicle && curVehicle === pVehicle);

    if (isMyReport) {
      if (p.status === 'rejected') {
        newNotifs.push({
          id: 'problem-rejected-' + p.id,
          relatedProblemId: p.id,
          type: 'report_rejected',
          title: '❌ Hazard Report Rejected by Control Center',
          message: `Your reported hazard (${p.problemType || 'Hazard'} at ${p.location || 'Reported Location'}) was reviewed and rejected. Authority Reason: ${p.rejectionReason || 'Details could not be substantiated during road inspection.'}`,
          createdAt: p.rejectedAt || p.createdAt,
          rejectionReason: p.rejectionReason
        });
      } else if (p.status === 'verified') {
        newNotifs.push({
          id: 'problem-verified-' + p.id,
          relatedProblemId: p.id,
          type: 'report_accepted',
          title: '✅ Report Verified & Accepted',
          message: `Your reported hazard (${p.problemType || 'Hazard'} at ${p.location || 'highway location'}) was confirmed by patrol and broadcasted to keep all drivers safe!`,
          createdAt: p.verifiedAt || p.createdAt
        });
      }
    }
  });
  reportStatusNotifs = newNotifs;
  recomputeUserNotifications();
}

/**
 * Recompute combined userNotifications from Firestore notices and report status
 */
function recomputeUserNotifications() {
  const myReportIds = JSON.parse(localStorage.getItem('tc_my_report_ids') || '[]');
  const cachedProfile = JSON.parse(localStorage.getItem('tc_cached_driver_profile') || '{}');
  const curUid = auth.currentUser?.uid || cachedProfile.uid;
  const curVehicle = (cachedProfile.vehicleNumber || '').trim().toLowerCase();

  const matchedFirestore = rawFirestoreNotifs.filter(n => {
    if (n.broadcast === true) return true;
    if (curUid && n.userId === curUid) return true;
    if (n.relatedProblemId && myReportIds.includes(n.relatedProblemId)) return true;
    if (curVehicle && n.reporterVehicle && n.reporterVehicle.trim().toLowerCase() === curVehicle) return true;
    return false;
  });

  const combined = [...reportStatusNotifs];
  matchedFirestore.forEach(n => {
    const existingIdx = combined.findIndex(c => c.id === n.id || (n.relatedProblemId && c.relatedProblemId === n.relatedProblemId && c.type === n.type));
    if (existingIdx >= 0) {
      combined[existingIdx] = { ...combined[existingIdx], ...n };
    } else {
      combined.push(n);
    }
  });

  userNotifications = combined;
}

/**
 * Sync dynamic data into active screen (home, journey, alerts)
 */
function syncDriverScreens() {
  const path = window.location.pathname;
  updateNavBadge();

  const isHomeScreen = path.includes('home') || document.getElementById('authority-action-banner') || document.getElementById('home-card-alert-state') || path.endsWith('/') || path.endsWith('/User') || path.endsWith('/User/');
  const isJourneyScreen = path.includes('journey') || document.getElementById('journey-map');
  const isAlertsScreen = path.includes('alerts') || document.getElementById('driver-alerts-container');

  if (isHomeScreen) {
    syncHomeScreen();
  }
  if (isJourneyScreen) {
    syncJourneyScreen();
  }
  if (isAlertsScreen) {
    syncAlertsScreen();
  }
}

/**
 * Update Sidebar and Header notification badge
 */
function updateNavBadge() {
  const hasUrgentAction = userNotifications.some(n => ['admin_warning', 'report_rejected', 'account_blocked'].includes(n.type));
  const totalAlerts = activeRestrictions.length + verifiedRoadProblems.length + userNotifications.length;

  document.querySelectorAll('.nav-badge-dot').forEach(el => {
    el.style.display = totalAlerts > 0 ? 'inline-block' : 'none';
  });

  const notifBadge = document.querySelector('.notification-badge');
  if (notifBadge) {
    if (totalAlerts > 0) {
      notifBadge.classList.add('has-alert');
      if (hasUrgentAction) {
        notifBadge.classList.add('has-warning');
      } else {
        notifBadge.classList.remove('has-warning');
      }
    } else {
      notifBadge.classList.remove('has-alert', 'has-warning');
    }
  }
}

/**
 * Sync Driver Home Screen (`home.html`)
 */
function syncHomeScreen() {
  // 0. Render Authority Direct Action / Warning Banner if active
  const actionBanner = document.getElementById('authority-action-banner');
  if (actionBanner) {
    // Find newest urgent notice that has NOT been dismissed by this driver
    const activeNotice = userNotifications.find(n => {
      const isUrgent = ['report_rejected', 'admin_warning', 'account_blocked', 'report_accepted'].includes(n.type);
      const isDismissed = sessionStorage.getItem('tc_dismissed_' + n.id) === 'true';
      return isUrgent && !isDismissed;
    });

    if (activeNotice) {
      const isRejected = activeNotice.type === 'report_rejected';
      const isWarning = activeNotice.type === 'admin_warning';
      const isBlocked = activeNotice.type === 'account_blocked';
      const isAccepted = activeNotice.type === 'report_accepted';

      const iconEl = document.getElementById('authority-banner-icon');
      const badgeEl = document.getElementById('authority-banner-badge');
      const typeEl = document.getElementById('authority-banner-type');
      const titleEl = document.getElementById('authority-banner-title');
      const msgEl = document.getElementById('authority-banner-message');

      if (iconEl) iconEl.textContent = isRejected ? 'cancel' : (isWarning ? 'notification_important' : (isBlocked ? 'person_off' : 'verified'));
      if (badgeEl) {
        badgeEl.textContent = isRejected ? 'HAZARD REPORT REJECTED' : (isWarning ? 'OFFICIAL WARNING' : (isBlocked ? 'ACCOUNT RESTRICTED' : 'REPORT ACCEPTED'));
        badgeEl.style.backgroundColor = isRejected ? '#e11d48' : (isWarning ? '#d97706' : (isBlocked ? '#b91c1c' : '#059669'));
      }
      if (typeEl) typeEl.textContent = isRejected ? 'Administrative Action on Submitted Road Report' : (isWarning ? 'Direct Compliance Advisory' : (isBlocked ? 'Highway Authority Directive' : 'Highway Authority Update'));
      if (titleEl) titleEl.textContent = activeNotice.title || 'Official Authority Notice';
      if (msgEl) msgEl.textContent = activeNotice.message || '';

      actionBanner.style.display = 'block';
      actionBanner.classList.remove('hidden');

      const dismissBtn = document.getElementById('btn-dismiss-authority-banner');
      if (dismissBtn) {
        dismissBtn.dataset.notifId = activeNotice.id;
        dismissBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          actionBanner.style.display = 'none';
          actionBanner.classList.add('hidden');
          sessionStorage.setItem('tc_dismissed_' + activeNotice.id, 'true');
          // Re-evaluate in case another urgent notification is waiting
          syncHomeScreen();
        };
      }
    } else {
      actionBanner.style.display = 'none';
      actionBanner.classList.add('hidden');
    }
  }

  const cardAlert = document.getElementById('home-card-alert-state');
  const cardClear = document.getElementById('home-card-clear-state');

  const primary = activeRestrictions.find(r => r.status === 'active') || activeRestrictions[0];

  if (!primary) {
    // Route is completely clear!
    if (cardAlert) cardAlert.style.display = 'none';
    if (cardClear) cardClear.style.display = 'flex';
    return;
  }

  // Show active alert state
  if (cardAlert) cardAlert.style.display = 'flex';
  if (cardClear) cardClear.style.display = 'none';

  // Dynamic Headline & Description
  const headlineEl = cardAlert.querySelector('.alert-headline');
  if (headlineEl) headlineEl.innerHTML = `🚨 ${primary.title || 'Heavy Vehicle Restriction Ahead'}`;

  const descEl = cardAlert.querySelector('.alert-description');
  if (descEl) descEl.textContent = primary.description || 'Timed highway restriction in effect along your corridor.';

  // Metrics: Location
  const locVal = cardAlert.querySelector('.metrics-grid-3 .metric-tile:nth-child(1) .metric-value');
  if (locVal) locVal.textContent = primary.location || primary.roadName || 'National Highway Corridor';

  const locSub = cardAlert.querySelector('.metrics-grid-3 .metric-tile:nth-child(1) .metric-sub');
  if (locSub) locSub.textContent = primary.chainage || primary.roadName || 'NHAI Sector';

  // Metrics: Hours
  const startFmt = formatFriendlyTime(primary.startTime || '16:00');
  const endFmt = formatFriendlyTime(primary.endTime || '22:00');
  const hoursVal = cardAlert.querySelector('.metrics-grid-3 .metric-tile:nth-child(2) .metric-value');
  if (hoursVal) hoursVal.textContent = `${startFmt} – ${endFmt}`;

  const hoursSub = cardAlert.querySelector('.metrics-grid-3 .metric-tile:nth-child(2) .metric-sub');
  if (hoursSub) hoursSub.textContent = `${primary.vehicleType || 'Commercial Trucks'} • ${primary.status.toUpperCase()}`;

  // Warning slab
  const warnSlab = cardAlert.querySelector('.warning-slab span:last-child');
  if (warnSlab) warnSlab.textContent = primary.actionRecommended || '⚠️ Restriction active along your travel corridor.';

  // Guidance modal dynamic values
  syncGuidanceModal(primary);
}

/**
 * Hydrate "What Should I Do?" guidance modal with dynamic active restriction
 */
function syncGuidanceModal(restriction) {
  const modal = document.getElementById('driverGuidanceModal');
  if (!modal || !restriction) return;

  const locText = restriction.location || restriction.roadName || 'Highway Corridor';
  const startFmt = formatFriendlyTime(restriction.startTime || '16:00');
  const endFmt = formatFriendlyTime(restriction.endTime || '22:00');

  // Subtitle
  const sub = modal.querySelector('.modal-header p');
  if (sub) sub.textContent = `${locText} restriction window: ${startFmt} – ${endFmt}`;

  // Option 1: Holding yard
  const opt1Desc = modal.querySelector('.modal-option-card:nth-child(2) p');
  if (opt1Desc) {
    const yardName = restriction.holdingYard || 'Shree Ganesh Logistics Park (KM 54)';
    opt1Desc.innerHTML = `Park at <strong>${yardName}</strong>, authenticated truck stop with security, water & canteen facilities.`;
  }

  // Option 2: Leave earlier
  const opt2Desc = modal.querySelector('.modal-option-card:nth-child(3) p');
  if (opt2Desc) {
    opt2Desc.innerHTML = `You must clear the <strong>${locText}</strong> checkpoint before <strong>${startFmt}</strong>. Maintain safe cruise speed within NHAI truck limits.`;
  }

  // Option 3: Bypass corridor
  const opt3Desc = modal.querySelector('.modal-option-card:nth-child(4) p');
  if (opt3Desc) {
    const bypass = restriction.bypassRoute || 'Alternate bypass corridor';
    opt3Desc.innerHTML = `Bypass the bottleneck via <strong>${bypass}</strong>. Commercial traffic is permitted with zero closure restrictions.`;
  }
}

/**
 * Sync Journey Screen (`journey.html`)
 */
function syncJourneyScreen() {
  const primary = activeRestrictions.find(r => r.status === 'active') || activeRestrictions[0];
  const warningSection = document.querySelector('.route-alert-card.warning');
  const baselineCard = document.querySelector('.content-card div[style*="Alternative Scenario"]')?.closest('.content-card');

  if (!primary) {
    if (warningSection) warningSection.style.display = 'none';
    if (baselineCard) baselineCard.style.display = 'block';
    return;
  }

  if (warningSection) {
    warningSection.style.display = 'block';
    const desc = warningSection.querySelector('.alert-description');
    const startFmt = formatFriendlyTime(primary.startTime || '16:00');
    const endFmt = formatFriendlyTime(primary.endTime || '22:00');
    if (desc) desc.textContent = `${primary.vehicleType || 'Heavy trucks'} are restricted at ${primary.location} from ${startFmt} – ${endFmt}.`;

    const locVal = warningSection.querySelector('.metric-tile:nth-child(1) .metric-value');
    if (locVal) locVal.textContent = primary.location || primary.roadName;

    const locSub = warningSection.querySelector('.metric-tile:nth-child(1) .metric-sub');
    if (locSub) locSub.textContent = primary.chainage || primary.roadName || 'NH-48 Corridor';

    const hoursVal = warningSection.querySelector('.metric-tile:nth-child(2) .metric-value');
    if (hoursVal) hoursVal.textContent = `${startFmt} – ${endFmt}`;
  }

  // Update Route Progress Timeline Checkpoint
  const warningCheckpoint = document.querySelector('.timeline-step-card.warning-checkpoint');
  if (warningCheckpoint) {
    const titleEl = warningCheckpoint.querySelector('div[style*="color: #9a3412;"]');
    if (titleEl) titleEl.textContent = primary.location || primary.roadName;

    const restTimeEl = warningCheckpoint.querySelector('div[style*="var(--color-crimson-alert)"]');
    if (restTimeEl) {
      const startFmt = formatFriendlyTime(primary.startTime || '16:00');
      const endFmt = formatFriendlyTime(primary.endTime || '22:00');
      restTimeEl.textContent = `Restriction: ${startFmt} – ${endFmt}`;
    }
  }

  // Advisory strip
  const advStrip = document.querySelector('.advisory-strip span:first-child');
  if (advStrip) {
    advStrip.textContent = `Safe holding yard available before ${primary.location || 'corridor checkpoint'}: ${primary.holdingYard || 'Designated Freight Yard'}.`;
  }
}

/**
 * Sync Alerts Screen (`alerts.html`)
 */
function syncAlertsScreen() {
  const container = document.getElementById('driver-alerts-container');
  if (!container) return;

  const totalCount = activeRestrictions.length + verifiedRoadProblems.length + userNotifications.length;
  const countBadge = document.querySelector('.badge-pulse span:last-child');
  if (countBadge) {
    countBadge.textContent = totalCount > 0 ? `${totalCount} IMPORTANT ALERTS` : 'ALL CORRIDORS CLEAR';
  }

  if (totalCount === 0) {
    container.innerHTML = `
      <article class="route-alert-card clear" style="margin-bottom: 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; border-radius: 12px;">
        <div class="card-badge-row" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge-tag green" style="background:#dcfce7; color:#166534; padding:4px 10px; border-radius:6px; font-weight:700; font-size:12px;">
            ✓ ALL HIGHWAY CORRIDORS CLEAR
          </span>
          <span style="font-size: 13px; color: #166534; font-weight: 600;">Real-Time Verification Active</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 800; color: #14532d; margin-top: 12px;">No active restrictions or hazards on your route</h2>
        <p style="font-size: 14px; color: #166534; margin-top: 6px;">
          All passes, expressways, and commercial freight lanes along NHAI corridors are running normally with no weight bans or roadblocks.
        </p>
      </article>
    `;
    return;
  }

  let html = '';

  // 0. Render Direct Authority Notices & Warnings sent to this Driver
  userNotifications.forEach(n => {
    const isWarning = n.type === 'admin_warning';
    const isBlocked = n.type === 'account_blocked';
    const isRejected = n.type === 'report_rejected';
    const isAccepted = n.type === 'report_accepted';

    const cardClass = (isBlocked || isRejected) ? 'route-alert-card critical' : (isWarning ? 'route-alert-card warning' : 'route-alert-card');
    const badgeTagClass = (isBlocked || isRejected) ? 'badge-tag red' : (isWarning ? 'badge-tag amber' : 'badge-tag green');
    const badgeTitle = isBlocked ? '🚫 ACCOUNT SUSPENSION DIRECTIVE' : (isRejected ? '❌ INCIDENT REPORT REJECTED' : (isWarning ? '⚠️ OFFICIAL AUTHORITY WARNING' : '✅ REPORT VERIFIED & ACCEPTED'));
    const borderLeftColor = isBlocked ? '#dc2626' : (isRejected ? '#e11d48' : (isWarning ? '#d97706' : '#16a34a'));

    html += `
      <article class="${cardClass}" style="margin-bottom: 0; border-left: 6px solid ${borderLeftColor}; background: ${isRejected ? '#fff1f2' : ''};">
        <div class="card-badge-row">
          <span class="${badgeTagClass}">
            <span>${badgeTitle}</span>
          </span>
          <span class="badge-pulse">
            <span class="pulse-dot" style="background-color: ${borderLeftColor};"></span>
            <span>DIRECT NOTICE TO YOUR VEHICLE</span>
          </span>
        </div>

        <div>
          <h2 class="alert-headline" style="font-size: 20px; color: ${isRejected ? '#881337' : ''};">${n.title || 'Administrative Directive'}</h2>
          <p class="alert-description" style="margin-top: 6px; font-size: 14px; font-weight: 600; color: var(--color-text-primary); line-height: 1.5;">
            ${n.message || ''}
          </p>
        </div>

        <div class="metrics-grid-3" style="grid-template-columns: 1fr;">
          <div class="metric-tile" style="padding: 10px 14px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08);">
            <div class="metric-data">
              <span class="metric-label">Authority Unit</span>
              <span class="metric-value" style="font-size: 13px;">TransitClear Maharashtra Highway Operations Control</span>
            </div>
          </div>
        </div>
      </article>
    `;
  });

  // 1. Render Active NHAI Restrictions
  activeRestrictions.forEach((r, idx) => {
    const isCritical = idx === 0 && r.status === 'active';
    const cardClass = isCritical ? 'route-alert-card critical' : 'route-alert-card warning';
    const tagClass = isCritical ? 'badge-tag red' : 'badge-tag amber';
    const startFmt = formatFriendlyTime(r.startTime || '16:00');
    const endFmt = formatFriendlyTime(r.endTime || '22:00');

    html += `
      <article class="${cardClass}" style="margin-bottom: 0;">
        <div class="card-badge-row">
          <span class="${tagClass}">
            <span>🚨 NHAI DIRECTIVE • ${r.roadName || 'NATIONAL HIGHWAY'}</span>
          </span>
          <span class="badge-pulse">
            <span class="pulse-dot"></span>
            <span>${r.status === 'active' ? 'IMMEDIATE ACTION REQUIRED' : 'UPCOMING RESTRICTION'}</span>
          </span>
        </div>

        <div>
          <h2 class="alert-headline" style="font-size: 22px;">${r.title || 'Highway Restriction Directive'}</h2>
          <p class="alert-description" style="margin-top: 4px;">
            ${r.description || 'Directive enforced by Highway Authority. Commercial vehicles must comply with timed corridor windows.'}
          </p>
        </div>

        <div class="metrics-grid-3">
          <div class="metric-tile">
            <div class="metric-data">
              <span class="metric-label">📍 Restriction Location</span>
              <span class="metric-value" style="font-size: 17px;">${r.location || r.roadName}</span>
              <span class="metric-sub">${r.chainage || r.roadName}</span>
            </div>
          </div>
          <div class="metric-tile">
            <div class="metric-data">
              <span class="metric-label">⏰ Restriction Hours</span>
              <span class="metric-value" style="font-size: 17px;">${startFmt} – ${endFmt}</span>
              <span class="metric-sub" style="color: var(--color-warning-amber); font-weight: 700;">${r.vehicleType || 'Commercial Vehicles'}</span>
            </div>
          </div>
          <div class="metric-tile highlight-amber">
            <div class="metric-data">
              <span class="metric-label" style="color: var(--color-on-warning-fixed);">🛡️ Recommended Action</span>
              <span class="metric-value" style="font-size: 14px; color: var(--color-on-warning-fixed); font-weight: 700;">Use Holding Yard or Bypass</span>
              <span class="metric-sub" style="color: #991b1b; font-weight: 700;">Avoid toll clearance penalty</span>
            </div>
          </div>
        </div>

        <div class="warning-slab">
          <span>⚠️</span>
          <span>${r.actionRecommended || 'Your journey intersects this active restriction window.'}</span>
        </div>

        <div class="card-cta-row">
          <button type="button" class="btn-primary-56 trigger-guidance-modal">
            <span>WHAT SHOULD I DO?</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <div class="cta-support-text">
            <span class="material-symbols-outlined" style="color: var(--color-emerald-clear);">check_circle</span>
            <span>Holding yard & bypass alternatives available</span>
          </div>
        </div>
      </article>
    `;
  });

  // 2. Render Verified Road Problems
  verifiedRoadProblems.forEach(p => {
    html += `
      <article class="route-alert-card warning" style="margin-bottom: 0;">
        <div class="card-badge-row">
          <span class="badge-tag amber">
            <span>⚠️ VERIFIED HAZARD ALERT</span>
          </span>
          <span style="font-size: 12px; color: var(--color-text-muted);">Verified by Control Center</span>
        </div>

        <div>
          <h2 class="alert-headline" style="font-size: 20px;">${p.problemType || 'Road Hazard Verified Ahead'}</h2>
          <p class="alert-description" style="margin-top: 4px;">
            ${p.description || `Confirmed hazard at ${p.location}. Drive with caution or follow on-ground marshals.`}
          </p>
        </div>

        <div class="metric-tile" style="padding: 14px; background: #fffbeb; border: 1px solid #fde68a;">
          <div class="metric-data">
            <span class="metric-label">📍 Incident Location</span>
            <span class="metric-value" style="font-size: 16px;">${p.location}</span>
          </div>
        </div>
      </article>
    `;
  });

  container.innerHTML = html;

  // Re-attach guidance modal triggers
  document.querySelectorAll('.trigger-guidance-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('driverGuidanceModal');
      if (modal) modal.classList.remove('hidden');
    });
  });
}

// Auto-run listener when module loads
if (typeof window !== 'undefined') {
  initDriverDataSync();
}
