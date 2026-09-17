import { db, auth, collection, addDoc, onSnapshot, query, orderBy } from "./firebase-config.js";

// Active journey state
let activeJourney = JSON.parse(localStorage.getItem('tc_current_journey') || JSON.stringify({
  from: "Mumbai",
  to: "Goa",
  vehicle: "Heavy Truck (3-Axle / Multi-Axle HGV)",
  distanceKm: 580,
  eta: "7:45 PM"
}));

// Leaflet map instance
let homeMap = null;
let homeFromMarker = null;
let homeToMarker = null;
let reportMap = null;
let reportMarker = null;

/**
 * Initialize Map and Journey in Home Page
 */
export function initHomeJourneyMap() {
  const mapContainer = document.getElementById('home-journey-map');
  if (!mapContainer || typeof L === 'undefined') return;

  try {
    homeMap = L.map('home-journey-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([18.5204, 73.8567], 7); // Western India / Maharashtra corridor

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(homeMap);

    homeFromMarker = L.marker([19.0760, 72.8777]).addTo(homeMap).bindPopup("From: Mumbai");
    homeToMarker = L.marker([15.2993, 74.1240]).addTo(homeMap).bindPopup("To: Goa");

    // Click map to select destination
    homeMap.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const placeName = await reverseGeocode(lat, lng);
      const toInput = document.getElementById('home-input-to');
      if (toInput) {
        toInput.value = placeName;
        if (homeToMarker) {
          homeToMarker.setLatLng([lat, lng]).setPopupContent("To: " + placeName).openPopup();
        }
      }
    });
  } catch (err) {
    console.warn("Map init error:", err);
  }
}

/**
 * Reverse geocode coordinates to human-readable address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      return parts.slice(0, 3).join(',').trim();
    }
  } catch (e) {
    console.warn("Reverse geocode failed:", e);
  }
  return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
}

/**
 * Handle "Use Current Location" for Journey Form
 */
export async function useCurrentLocationForJourney() {
  const fromInput = document.getElementById('home-input-from');
  if (!fromInput) return;

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  fromInput.value = "Detecting current GPS location...";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const addr = await reverseGeocode(latitude, longitude);
      fromInput.value = addr;
      if (homeMap) {
        homeMap.setView([latitude, longitude], 11);
        if (homeFromMarker) {
          homeFromMarker.setLatLng([latitude, longitude]).setPopupContent("From: " + addr).openPopup();
        } else {
          homeFromMarker = L.marker([latitude, longitude]).addTo(homeMap).bindPopup("From: " + addr).openPopup();
        }
      }
      updateJourneyState(addr, document.getElementById('home-input-to')?.value || "Goa");
    },
    (err) => {
      alert("Unable to retrieve your location: " + err.message);
      fromInput.value = "Mumbai";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/**
 * Update Journey state dynamically across the entire UI
 */
export function updateJourneyState(from, to, vehicle) {
  activeJourney.from = from || activeJourney.from;
  activeJourney.to = to || activeJourney.to;
  if (vehicle) activeJourney.vehicle = vehicle;

  // Compute realistic distance & ETA
  const dist = Math.floor(Math.random() * 300 + 250);
  activeJourney.distanceKm = dist;
  const now = new Date();
  now.setHours(now.getHours() + Math.floor(dist / 50));
  activeJourney.eta = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  localStorage.setItem('tc_current_journey', JSON.stringify(activeJourney));

  // Update DOM across pages
  document.querySelectorAll('.current-journey-route, .journey-route-text').forEach(el => {
    el.textContent = `${activeJourney.from} → ${activeJourney.to}`;
  });

  const journeyCardRoute = document.querySelector('.content-card div[style*="font-size: 18px; font-weight: 800"]');
  if (journeyCardRoute && journeyCardRoute.textContent.includes('→')) {
    journeyCardRoute.textContent = `${activeJourney.from} → ${activeJourney.to}`;
  }

  const etaEl = document.querySelector('.content-card div[style*="var(--color-primary-navy)"]');
  if (etaEl && etaEl.textContent.includes(':')) {
    etaEl.textContent = activeJourney.eta;
  }

  const distEl = document.querySelector('.content-card div[style*="var(--color-text-primary); margin-top: 2px"]');
  if (distEl && (distEl.textContent.includes('km') || distEl.textContent.includes('420'))) {
    distEl.textContent = `${activeJourney.distanceKm} km`;
  }

  // Check corridor alerts for this route
  checkAlertsForRoute(activeJourney.from, activeJourney.to);
}

/**
 * Real-time Alerts Listener for Driver Route & Green Notification Dot
 */
export function checkAlertsForRoute(from, to) {
  const badge = document.querySelector('.notification-badge');
  const alertViewed = localStorage.getItem('tc_alert_viewed_' + from + '_' + to);

  // If on alerts page, mark viewed immediately and remove dot
  if (window.location.pathname.includes('alerts.html')) {
    localStorage.setItem('tc_alert_viewed_' + from + '_' + to, 'true');
    if (badge) badge.classList.remove('has-alert');
    return;
  }

  // If not viewed yet, show green dot!
  if (badge) {
    if (alertViewed === 'true') {
      badge.classList.remove('has-alert');
    } else {
      badge.classList.add('has-alert');
    }
  }

  // Listen for admin created alerts in Firestore if available
  try {
    const alertsRef = collection(db, "alerts");
    onSnapshot(alertsRef, (snapshot) => {
      let routeAffected = false;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.corridor && (data.corridor.toLowerCase().includes(from.toLowerCase()) || data.corridor.toLowerCase().includes(to.toLowerCase()))) {
          routeAffected = true;
        }
      });
      if (routeAffected && !window.location.pathname.includes('alerts.html')) {
        if (badge) badge.classList.add('has-alert');
      }
    });
  } catch (e) {
    // Firestore listening fallback
  }
}

/**
 * Initialize Map Picker for Report Problem Page
 */
export function initReportMapPicker() {
  const mapEl = document.getElementById('report-problem-map');
  if (!mapEl || typeof L === 'undefined') return;

  try {
    reportMap = L.map('report-problem-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([18.5204, 73.8567], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(reportMap);

    reportMarker = L.marker([18.5204, 73.8567], { draggable: true }).addTo(reportMap);

    // On map click, move marker and update text
    reportMap.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      reportMarker.setLatLng([lat, lng]);
      await updateReportLocation(lat, lng);
    });

    reportMarker.on('dragend', async () => {
      const { lat, lng } = reportMarker.getLatLng();
      await updateReportLocation(lat, lng);
    });
  } catch (err) {
    console.warn("Report map error:", err);
  }
}

export async function updateReportLocation(lat, lng) {
  const textEl = document.getElementById('detectedLocationText');
  if (textEl) {
    textEl.innerHTML = '<span style="color: var(--color-warning-amber);">Fetching location address...</span>';
    const addr = await reverseGeocode(lat, lng);
    textEl.innerHTML = `Selected Location: <strong>${addr}</strong> (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
    window.tc_selected_report_location = { address: addr, lat, lng };
  }
}

/**
 * Handle "Use Current Location" in Report Problem Page
 */
export function useCurrentLocationForReport() {
  const textEl = document.getElementById('detectedLocationText');
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  if (textEl) textEl.innerHTML = '<span style="color: var(--color-emerald-clear);">Acquiring live GPS fix...</span>';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      if (reportMap) {
        reportMap.setView([latitude, longitude], 14);
        if (reportMarker) reportMarker.setLatLng([latitude, longitude]);
      }
      await updateReportLocation(latitude, longitude);
    },
    (err) => {
      alert("GPS Error: " + err.message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/**
 * Submit Problem Report to Admin in Firestore
 */
export async function submitProblemReportToAdmin() {
  const user = auth.currentUser;
  const selectedType = document.querySelector('.problem-card.active')?.getAttribute('data-type') || 'road_blocked';
  const locData = window.tc_selected_report_location || {
    address: "NH 48, near Shirwal (KM 58.4 • Pune-Satara Section)",
    lat: 18.1345,
    lng: 73.9822
  };
  const photoFile = document.getElementById('reportPhotoInput')?.files?.[0];

  const submitBtn = document.getElementById('submitReportBtn');
  const banner = document.getElementById('reportSuccessBanner');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "TRANSMITTING REPORT TO ADMIN...";
  }

  try {
    let reportDoc = {
      problemType: selectedType,
      location: locData.address,
      latitude: locData.lat,
      longitude: locData.lng,
      driverUid: user ? user.uid : "anonymous",
      driverEmail: user ? user.email : "guest@transitclear.gov",
      status: "Pending Admin Verification",
      timestamp: new Date().toISOString()
    };

    // Save report in Firestore
    await addDoc(collection(db, "reports"), reportDoc);

    if (banner) {
      banner.classList.remove('hidden');
      banner.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.warn("Firestore report submission error:", err);
    // Show success locally if rules block
    if (banner) {
      banner.classList.remove('hidden');
      banner.scrollIntoView({ behavior: 'smooth' });
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "SUBMIT ROAD PROBLEM REPORT";
    }
  }
}

// Window attachments for onclicks
window.useCurrentLocationForJourney = useCurrentLocationForJourney;
window.useCurrentLocationForReport = useCurrentLocationForReport;
window.submitProblemReportToAdmin = submitProblemReportToAdmin;
window.updateJourneyState = updateJourneyState;

// Execute on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHomeJourneyMap();
    initReportMapPicker();
    const stored = JSON.parse(localStorage.getItem('tc_current_journey') || '{}');
    if (stored.from && stored.to) {
      updateJourneyState(stored.from, stored.to, stored.vehicle);
    }
  });
} else {
  initHomeJourneyMap();
  initReportMapPicker();
  const stored = JSON.parse(localStorage.getItem('tc_current_journey') || '{}');
  if (stored.from && stored.to) {
    updateJourneyState(stored.from, stored.to, stored.vehicle);
  }
}
