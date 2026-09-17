// Protected Route Guard & Auth Handler for TransitClear
import { onAuthChange, logoutUser, getUserProfile, updateUserProfileData } from "./firebase-config.js";

let currentActiveUser = null;
let currentActiveProfile = null;

/**
 * Protect dashboard routes based on authentication and role
 * and dynamically populate driver data
 */
export function protectRoute(requiredRole = 'any') {
  onAuthChange(async (user) => {
    const path = window.location.pathname;
    const isDriverAuthPage = path.includes('/Authentication/');
    const isAdminAuthPage = path.includes('admin-login.html') || path.includes('/Admin/login.html') || path.endsWith('/admin/login');
    const isUserDashboard = path.includes('/User/');
    const isAdminDashboard = path.includes('/Admin/') && !isAdminAuthPage;

    if (!user) {
      currentActiveUser = null;
      currentActiveProfile = null;
      if (isAdminDashboard) {
        // Unauthenticated access to Admin console -> redirect to Admin Login
        window.location.href = 'admin-login.html';
      } else if (isUserDashboard) {
        // Unauthenticated access to Driver pages -> redirect to Driver Login
        window.location.href = '../Authentication/login.html';
      }
    } else {
      currentActiveUser = user;
      try {
        let profile = await getUserProfile(user.uid);

        // Auto-provision initial Admin document for the designated prototype admin account
        if ((!profile || profile.role !== 'admin') && user.email === '24104053@apsit.edu.in') {
          profile = {
            name: "TransitClear Admin",
            email: "24104053@apsit.edu.in",
            role: "admin",
            language: "en",
            createdAt: new Date().toISOString()
          };
          try {
            await updateUserProfileData(user.uid, profile);
          } catch (err) {
            console.warn("Admin profile auto-provision error:", err);
          }
        }

        currentActiveProfile = profile || {};
        const role = profile?.role || 'driver';

        if (isAdminDashboard) {
          if (role !== 'admin') {
            // Driver cannot access admin console -> redirect to driver dashboard
            window.location.href = '../User/home.html';
            return;
          }
        } else if (isUserDashboard) {
          if (profile?.status === 'blocked' || profile?.status === 'suspended') {
            alert('Your account has been deactivated / suspended by the Highway Authority. Access is restricted.');
            await logoutUser();
            window.location.href = '../Authentication/login.html';
            return;
          }
          // Hydrate all user pages with real dynamic data
          syncDynamicUserData(user, currentActiveProfile);
        }
      } catch (e) {
        console.warn("Profile load/verification failed:", e);
      }
    }
  });
}

/**
 * Synchronize dynamic user profile across user interface
 */
export function syncDynamicUserData(user, profile) {
  if (!user) return;
  const name = profile?.name || user?.displayName || 'Driver';
  const email = profile?.email || user?.email || '';
  const phone = profile?.phone || user?.phoneNumber || '+91 98765 43210';
  const vehicleNumber = profile?.vehicleNumber || 'MH-04-AB-1234';
  const vehicleType = profile?.vehicleType || 'Heavy Truck';
  const avatarKey = 'transitclear_avatar_' + user.uid;
  const savedAvatar = profile?.photoURL || localStorage.getItem(avatarKey);

  // Cache locally for 0ms instant hydration on next page load
  try {
    localStorage.setItem('tc_cached_driver_profile', JSON.stringify({
      uid: user.uid,
      name, email, phone, vehicleNumber, vehicleType, photoURL: savedAvatar
    }));
  } catch (e) {}

  applyProfileToDOM({ name, email, phone, vehicleNumber, vehicleType, photoURL: savedAvatar, uid: user.uid });
}

export function applyProfileToDOM(data) {
  if (!data) return;
  const name = data.name || 'Driver';
  const vehicleNumber = data.vehicleNumber || 'MH-04-AB-1234';
  const vehicleType = data.vehicleType || 'Heavy Truck';
  const phone = data.phone || '+91 98765 43210';
  const savedAvatar = data.photoURL;

  // Compute initials (e.g. "Rajesh Kumar" -> "RK")
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase() 
    : (name.length >= 2 ? name.slice(0, 2).toUpperCase() : 'DR');

  // 1. Header driver pill (small box)
  document.querySelectorAll('.driver-avatar').forEach(el => {
    if (savedAvatar) {
      el.innerHTML = `<img src="${savedAvatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    } else {
      el.textContent = initials;
    }
  });

  document.querySelectorAll('.driver-name').forEach(el => {
    el.textContent = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  });

  document.querySelectorAll('.driver-plate').forEach(el => {
    el.textContent = vehicleNumber;
  });

  // 2. Home Screen elements
  const greetingEl = document.querySelector('.screen-title');
  if (greetingEl && (greetingEl.textContent.includes('Good') || greetingEl.textContent.includes('Rajesh'))) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    greetingEl.textContent = `Good ${timeOfDay}, ${parts[0]} 👋`;
  }

  const identityChip = document.querySelector('.vehicle-identity-chip span:last-child');
  if (identityChip) {
    identityChip.textContent = `${vehicleType} • ${vehicleNumber}`;
  }

  // 3. Profile Screen elements
  const heroName = document.getElementById('profile-hero-name') || document.querySelector('.content-card h2');
  if (heroName) heroName.textContent = name;

  const heroDetails = document.getElementById('profile-hero-details');
  if (heroDetails) {
    heroDetails.innerHTML = `<span>📞 ${phone}</span><span>•</span><span>🚛 ${vehicleType} • ${vehicleNumber}</span>`;
  }

  // Driver status badge / RK Box in Profile Hero
  const heroAvatar = document.getElementById('profile-hero-avatar');
  if (heroAvatar) {
    heroAvatar.style.cursor = 'pointer';
    heroAvatar.title = 'Click to change profile picture';
    if (savedAvatar) {
      heroAvatar.innerHTML = `<img src="${savedAvatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    } else {
      heroAvatar.textContent = initials;
    }

    if (!heroAvatar.dataset.avatarListener) {
      heroAvatar.dataset.avatarListener = 'true';
      let fileInput = document.getElementById('avatar-upload-input');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatar-upload-input';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            const base64 = evt.target.result;
            localStorage.setItem(avatarKey, base64);
            try {
              await updateUserProfileData(user.uid, { photoURL: base64 });
            } catch (err) {
              console.warn("Failed to persist avatar:", err);
            }
            syncDynamicUserData(user, { ...profile, photoURL: base64 });
          };
          reader.readAsDataURL(file);
        });
      }

      heroAvatar.addEventListener('click', () => {
        fileInput.click();
      });
    }
  }

  // Personal Details Card elements
  const personalName = document.getElementById('driver-full-name');
  if (personalName) personalName.textContent = name;
  const personalPhone = document.getElementById('driver-phone-num');
  if (personalPhone) personalPhone.textContent = phone;

  // My Vehicle Card elements
  const vehicleTypeEl = document.getElementById('driver-vehicle-type');
  if (vehicleTypeEl) vehicleTypeEl.textContent = vehicleType;
  const vehicleNumEl = document.getElementById('driver-vehicle-num');
  if (vehicleNumEl) vehicleNumEl.textContent = vehicleNumber;
}

// Window logout function
window.handleAppLogout = async function() {
  await logoutUser();
};

// Update Personal Details handler
window.openEditPersonalModal = async function() {
  if (!currentActiveUser) {
    alert("Please log in first to update details.");
    return;
  }
  const currentName = currentActiveProfile?.name || '';
  const currentPhone = currentActiveProfile?.phone || '';

  const newName = prompt("Update Full Name:", currentName);
  if (newName === null) return;
  const newPhone = prompt("Update Mobile Number:", currentPhone);
  if (newPhone === null) return;

  if (!newName.trim()) {
    alert("Name cannot be empty.");
    return;
  }

  try {
    await updateUserProfileData(currentActiveUser.uid, {
      name: newName.trim(),
      phone: newPhone.trim()
    });
    currentActiveProfile.name = newName.trim();
    currentActiveProfile.phone = newPhone.trim();
    syncDynamicUserData(currentActiveUser, currentActiveProfile);
    alert("Personal details updated successfully!");
  } catch (err) {
    alert("Failed to update details: " + err.message);
  }
};

// Update Vehicle Details handler
window.openEditVehicleModal = async function() {
  if (!currentActiveUser) {
    alert("Please log in first to update vehicle.");
    return;
  }
  const currentType = currentActiveProfile?.vehicleType || 'Heavy Truck';
  const currentNum = currentActiveProfile?.vehicleNumber || '';

  const newType = prompt("Update Vehicle Type (e.g. Heavy Truck / Multi-Axle HGV):", currentType);
  if (newType === null) return;
  const newNum = prompt("Update Vehicle Registration Number:", currentNum);
  if (newNum === null) return;

  if (!newNum.trim()) {
    alert("Vehicle number cannot be empty.");
    return;
  }

  try {
    await updateUserProfileData(currentActiveUser.uid, {
      vehicleType: newType.trim(),
      vehicleNumber: newNum.trim().toUpperCase()
    });
    currentActiveProfile.vehicleType = newType.trim();
    currentActiveProfile.vehicleNumber = newNum.trim().toUpperCase();
    syncDynamicUserData(currentActiveUser, currentActiveProfile);
    alert("Vehicle details updated successfully!");
  } catch (err) {
    alert("Failed to update vehicle: " + err.message);
  }
};

// 0ms Instant synchronous cache hydration to eliminate perceived UI lag
try {
  const cached = JSON.parse(localStorage.getItem('tc_cached_driver_profile') || 'null');
  if (cached) applyProfileToDOM(cached);
} catch (e) {}

// Auto-run route protection and sync on load
protectRoute();
