// Firebase Configuration & Service Initializer for TransitClear
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration for TransitClear
// Reads from env.js (loaded via <script> tag before this module)
// To set up: copy env.example.js → env.js and add your Firebase credentials
const firebaseConfig = window.__FIREBASE_CONFIG__;

if (!firebaseConfig || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error("⚠️ Firebase config missing! Copy env.example.js → env.js and add your credentials.");
}

// Initialize Firebase app & services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Enforce local session persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Persistence error:", err);
});

/**
 * Log in using email or phone lookup
 */
export async function loginUser(loginId, password) {
  let emailToUse = loginId.trim();

  // If input is not an email format, check if it's a mobile number
  if (!emailToUse.includes("@")) {
    try {
      const cleanPhone = emailToUse.replace(/[^0-9]/g, '');
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "in", [loginId, cleanPhone, `+91${cleanPhone}`]));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        emailToUse = querySnap.docs[0].data().email;
      } else {
        throw new Error("No account found with this mobile number. Please sign in using your registered email address.");
      }
    } catch (err) {
      if (err.message.includes("No account found")) {
        throw err;
      }
      // In case unauthenticated read is restricted by security rules
      throw new Error("Mobile-number login requires your registered email. Please enter your registered email address to sign in.");
    }
  }

  const credential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const profileSnap = await getDoc(doc(db, "users", credential.user.uid));
  const profile = profileSnap.exists() ? profileSnap.data() : null;
  return { user: credential.user, profile };
}

/**
 * Public Signup for Drivers
 * Strictly enforces role: "driver"
 */
export async function signupDriver({ name, email, phone, password, vehicleType, vehicleNumber, language }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  const profileData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    vehicleType: vehicleType || "delivery-vehicle",
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    language: language || "en",
    role: "driver", // Enforced role
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", user.uid), profileData);
  return { user, profile: profileData };
}

/**
 * Sign in / Sign up with Google
 */
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;
  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    return { user, isNewUser: false, profile: userSnap.data() };
  } else {
    return { user, isNewUser: true, profile: null };
  }
}

/**
 * Complete profile for new Google Sign-In Driver
 */
export async function completeGoogleDriverProfile(uid, { phone, vehicleType, vehicleNumber, language }) {
  const user = auth.currentUser;
  const profileData = {
    name: user?.displayName || "Driver",
    email: user?.email || "",
    phone: phone.trim(),
    vehicleType: vehicleType || "delivery-vehicle",
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    language: language || "en",
    role: "driver",
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", uid), profileData);
  return profileData;
}

/**
 * Send password reset email
 */
export async function resetPasswordEmail(email) {
  return await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Log out current session
 */
export async function logoutUser(customRedirect) {
  const isAdminPage = window.location.pathname.includes('/Admin/');
  await signOut(auth);
  sessionStorage.clear();
  if (customRedirect) {
    window.location.href = customRedirect;
  } else if (isAdminPage) {
    window.location.href = "admin-login.html";
  } else {
    window.location.href = "../Authentication/login.html";
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetch profile data for a specific user ID
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Update profile data for a specific user ID
 */
export async function updateUserProfileData(uid, updates) {
  await setDoc(doc(db, "users", uid), updates, { merge: true });
}

export { auth, db, googleProvider, collection, query, where, getDocs, getDoc, doc, setDoc, addDoc, updateDoc, deleteDoc, orderBy, limit, onSnapshot, Timestamp, serverTimestamp, writeBatch, onAuthStateChanged, updatePassword, sendPasswordResetEmail };
