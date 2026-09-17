// TransitClear Admin — Centralized Firebase CRUD Module
// All admin operations for restrictions, road problems, journeys, users, notifications, audit trail

import {
  auth, db, collection, query, where, getDocs, getDoc, doc, setDoc,
  addDoc, updateDoc, deleteDoc, orderBy, limit, onSnapshot, Timestamp,
  serverTimestamp, writeBatch
} from './firebase-config.js';

// ============ RESTRICTIONS ============

export async function createRestriction(data) {
  const user = auth.currentUser;
  console.log('[TransitClear Firebase] createRestriction user:', user?.email, user?.uid);
  const docRef = await addDoc(collection(db, 'restrictions'), {
    ...data,
    status: data.status || 'active',
    createdAt: serverTimestamp(),
    createdBy: user?.uid || 'admin',
    creatorEmail: user?.email || ''
  });
  await logAudit('restriction_created', `Created restriction: ${data.title} at ${data.location}`);
  return docRef.id;
}

export async function updateRestriction(id, updates) {
  await updateDoc(doc(db, 'restrictions', id), {
    ...updates,
    updatedAt: serverTimestamp()
  });
  await logAudit('restriction_updated', `Updated restriction ${id}: ${JSON.stringify(updates)}`);
}

export async function deleteRestriction(id) {
  await deleteDoc(doc(db, 'restrictions', id));
  await logAudit('restriction_deleted', `Deleted restriction ${id}`);
}

export function onRestrictionsSnapshot(callback) {
  const q = query(collection(db, 'restrictions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const restrictions = [];
    snapshot.forEach((d) => restrictions.push({ id: d.id, ...d.data() }));
    // Auto-expire check
    const now = new Date();
    restrictions.forEach((r) => {
      if (r.status === 'active' || r.status === 'upcoming') {
        const endDT = parseRestrictionDateTime(r.endDate, r.endTime);
        const startDT = parseRestrictionDateTime(r.startDate, r.startTime);
        if (endDT && endDT < now && r.status !== 'expired') {
          updateDoc(doc(db, 'restrictions', r.id), { status: 'expired', updatedAt: serverTimestamp() });
          r.status = 'expired';
        } else if (startDT && startDT > now && r.status === 'active') {
          updateDoc(doc(db, 'restrictions', r.id), { status: 'upcoming', updatedAt: serverTimestamp() });
          r.status = 'upcoming';
        } else if (startDT && startDT <= now && endDT && endDT >= now && r.status === 'upcoming') {
          updateDoc(doc(db, 'restrictions', r.id), { status: 'active', updatedAt: serverTimestamp() });
          r.status = 'active';
        }
      }
    });
    callback(restrictions);
  });
}

export async function getRestrictions() {
  const q = query(collection(db, 'restrictions'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function parseRestrictionDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    // Handle both ISO date and readable formats
    let datePart = dateStr;
    if (dateStr.includes('T')) {
      datePart = dateStr.split('T')[0];
    }
    // timeStr can be "16:00" or "4:00 PM"
    let hours, minutes;
    if (timeStr.includes(':')) {
      const parts = timeStr.replace(/\s*(AM|PM)\s*/i, ' $1').trim().split(':');
      hours = parseInt(parts[0]);
      const minParts = parts[1].split(' ');
      minutes = parseInt(minParts[0]);
      if (minParts[1]) {
        const ampm = minParts[1].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
    } else {
      hours = 0; minutes = 0;
    }
    const d = new Date(datePart);
    d.setHours(hours, minutes, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

// ============ ROAD PROBLEMS ============

export async function createRoadProblem(data) {
  const reporterUid = data.userId || data.driverUid || auth.currentUser?.uid || 'anonymous';
  const docRef = await addDoc(collection(db, 'roadProblems'), {
    ...data,
    userId: reporterUid,
    driverUid: reporterUid,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function verifyProblem(id, broadcastToRoute = true) {
  const problemRef = doc(db, 'roadProblems', id);
  const problemSnap = await getDoc(problemRef);
  const problem = problemSnap.exists() ? problemSnap.data() : {};

  await updateDoc(problemRef, {
    status: 'verified',
    verifiedAt: serverTimestamp(),
    verifiedBy: auth.currentUser?.uid || 'admin'
  });

  let reporterUid = problem.userId || problem.driverUid;

  // Attempt user fallback lookup if reporterUid is missing or anonymous
  if (!reporterUid || reporterUid === 'anonymous') {
    if (problem.reporterVehicle || problem.reporterPhone) {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(d => {
          const u = d.data();
          if ((problem.reporterVehicle && u.vehicleNumber === problem.reporterVehicle) ||
              (problem.reporterPhone && (u.phone === problem.reporterPhone || u.mobile === problem.reporterPhone))) {
            reporterUid = d.id;
          }
        });
      } catch (e) {
        console.warn('User lookup fallback skipped:', e);
      }
    }
  }

  // 1. Direct notification to reporting driver
  const verifiedTargetUid = (reporterUid && reporterUid !== 'anonymous') ? reporterUid : (problem.userId || 'anonymous');
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'report_accepted',
      title: '✅ Report Verified & Accepted',
      message: `Your hazard report (${problem.problemType || 'Hazard'} at ${problem.location || 'highway location'}) was verified by Highway Control and broadcasted to keep all drivers on this corridor safe!`,
      userId: verifiedTargetUid,
      relatedProblemId: id,
      reporterVehicle: problem.reporterVehicle || '',
      broadcast: false,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("Direct verification notification skipped:", e);
  }

  // 2. Broadcast notification to users on that route
  if (broadcastToRoute) {
    try {
      await addDoc(collection(db, 'notifications'), {
        type: 'road_problem_alert',
        title: `⚠️ Verified: ${problem.problemType || 'Road Hazard'} on ${problem.location || 'Corridor'}`,
        message: problem.description || `A ${problem.problemType || 'hazard'} has been verified at ${problem.location || 'highway location'}. Please use alternate routes.`,
        broadcast: true,
        route: problem.location || '',
        relatedProblemId: id,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (e) {
      console.warn("Broadcast alert skipped:", e);
    }
  }

  try {
    await logAudit('problem_verified', `Verified road problem ${id} ${broadcastToRoute ? '& broadcasted alert' : ''}`);
  } catch (e) {
    console.warn("Audit log skipped:", e);
  }
}

export async function rejectProblem(id, reason = 'Report could not be verified by highway control center or was unverified.', issueWarning = false) {
  const problemRef = doc(db, 'roadProblems', id);
  const problemSnap = await getDoc(problemRef);
  const problem = problemSnap.exists() ? problemSnap.data() : {};

  await updateDoc(problemRef, {
    status: 'rejected',
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
    rejectedBy: auth.currentUser?.uid || 'admin'
  });

  let reporterUid = problem.userId || problem.driverUid;

  // Attempt user fallback lookup if reporterUid is missing or anonymous
  if (!reporterUid || reporterUid === 'anonymous') {
    if (problem.reporterVehicle || problem.reporterPhone) {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(d => {
          const u = d.data();
          if ((problem.reporterVehicle && u.vehicleNumber === problem.reporterVehicle) ||
              (problem.reporterPhone && (u.phone === problem.reporterPhone || u.mobile === problem.reporterPhone))) {
            reporterUid = d.id;
          }
        });
      } catch (e) {
        console.warn('User lookup fallback skipped:', e);
      }
    }
  }

  const targetUid = (reporterUid && reporterUid !== 'anonymous') ? reporterUid : (problem.userId || 'anonymous');

  // 1. Direct notification to reporting driver informing them action was taken
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'report_rejected',
      title: '❌ Hazard Report Rejected by Control Center',
      message: `Your reported hazard (${problem.problemType || 'Hazard'} at ${problem.location || 'Reported Location'}) was reviewed and rejected. Authority Reason: ${reason}`,
      userId: targetUid,
      relatedProblemId: id,
      rejectionReason: reason,
      reporterVehicle: problem.reporterVehicle || '',
      broadcast: false,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("Rejection notification skipped:", e);
  }

  // 2. If authority opted to issue official warning
  if (issueWarning) {
    try {
      if (targetUid && targetUid !== 'anonymous') {
        await warnUser(targetUid, `Official Warning: Discrepancies noted in submitted hazard report #${id.substring(0,8).toUpperCase()}. ${reason}`);
      } else {
        await addDoc(collection(db, 'notifications'), {
          type: 'admin_warning',
          title: '⚠️ Warning from Administrator',
          message: `Official Warning on Hazard Report #${id.substring(0,8).toUpperCase()}: ${reason}`,
          userId: 'anonymous',
          relatedProblemId: id,
          reporterVehicle: problem.reporterVehicle || '',
          broadcast: false,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn("Warning dispatch from rejection skipped:", e);
    }
  }

  try {
    await logAudit('problem_rejected', `Rejected road problem ${id}: ${reason}`);
  } catch (e) {
    console.warn("Audit log skipped:", e);
  }
}

export function onRoadProblemsSnapshot(callback) {
  const q = query(collection(db, 'roadProblems'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const problems = [];
    snapshot.forEach((d) => problems.push({ id: d.id, ...d.data() }));
    callback(problems);
  });
}

export async function getRoadProblems(statusFilter) {
  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(collection(db, 'roadProblems'), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'roadProblems'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ JOURNEYS ============

export async function createJourney(data) {
  const docRef = await addDoc(collection(db, 'journeys'), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
    userId: auth.currentUser?.uid || 'anonymous'
  });
  return docRef.id;
}

export function onJourneysSnapshot(callback) {
  const q = query(collection(db, 'journeys'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const journeys = [];
    snapshot.forEach((d) => journeys.push({ id: d.id, ...d.data() }));
    callback(journeys);
  });
}

export async function getJourneys() {
  const q = query(collection(db, 'journeys'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ USERS ============

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDriverUsers() {
  const q = query(collection(db, 'users'), where('role', '==', 'driver'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onUsersSnapshot(callback) {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const users = [];
    snapshot.forEach((d) => users.push({ id: d.id, ...d.data() }));
    callback(users);
  });
}

export async function blockUser(userId) {
  // Update status in users collection with setDoc merge
  await setDoc(doc(db, 'users', userId), {
    status: 'blocked',
    blockedAt: serverTimestamp(),
    blockedBy: auth.currentUser?.uid || 'admin'
  }, { merge: true });

  // Send direct notification to user
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'account_blocked',
      title: '🚫 Account Blocked',
      message: 'Your account has been blocked by the administrator. Contact support for details.',
      userId: userId,
      broadcast: false,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (e) {
    console.warn("Notification dispatch skipped:", e);
  }

  try {
    await logAudit('user_blocked', `Blocked user ${userId}`);
  } catch (e) {
    console.warn("Audit log skipped:", e);
  }
}

export async function unblockUser(userId) {
  await setDoc(doc(db, 'users', userId), {
    status: 'active',
    unblockedAt: serverTimestamp()
  }, { merge: true });

  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'account_reinstated',
      title: '✅ Account Reinstated',
      message: 'Your commercial driver access has been reinstated by the authority.',
      userId: userId,
      broadcast: false,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (e) {
    console.warn("Notification dispatch skipped:", e);
  }

  try {
    await logAudit('user_unblocked', `Unblocked user ${userId}`);
  } catch (e) {
    console.warn("Audit log skipped:", e);
  }
}

export async function warnUser(userId, message) {
  const notifRef = await addDoc(collection(db, 'notifications'), {
    type: 'admin_warning',
    title: '⚠️ Warning from Administrator',
    message: message,
    userId: userId,
    broadcast: false,
    createdAt: serverTimestamp(),
    read: false
  });

  try {
    await setDoc(doc(db, 'users', userId), {
      lastWarning: message,
      lastWarningAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("Record warning on user doc skipped:", e);
  }

  try {
    await logAudit('user_warned', `Warned user ${userId}: ${message}`);
  } catch (e) {
    console.warn("Audit log skipped:", e);
  }

  return notifRef.id;
}

export async function getUserReports(userId) {
  const q = query(collection(db, 'roadProblems'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ NOTIFICATIONS ============

export async function sendNotification(data) {
  return await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp(),
    read: false
  });
}

export function onUserNotifications(userId, callback) {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifs = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.userId === userId || data.broadcast === true) {
        notifs.push({ id: d.id, ...data });
      }
    });
    callback(notifs);
  });
}

// ============ AUDIT TRAIL ============

export async function logAudit(action, details) {
  try {
    await addDoc(collection(db, 'auditTrail'), {
      action,
      details,
      performedBy: auth.currentUser?.email || 'system',
      performedByUid: auth.currentUser?.uid || 'system',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn('Audit log failed:', e);
  }
}

export async function getAuditTrail(limitCount = 50) {
  const q = query(collection(db, 'auditTrail'), orderBy('timestamp', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ REPORTS / ANALYTICS ============

export async function getReportsData(monthFilter) {
  const restrictions = await getRestrictions();
  const problems = await getRoadProblems();
  const journeys = await getJourneys();

  let filteredRestrictions = restrictions;
  let filteredProblems = problems;
  let filteredJourneys = journeys;

  if (monthFilter === 'this-month') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredRestrictions = restrictions.filter(r => {
      const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      return d >= startOfMonth;
    });
    filteredProblems = problems.filter(p => {
      const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return d >= startOfMonth;
    });
    filteredJourneys = journeys.filter(j => {
      const d = j.createdAt?.toDate ? j.createdAt.toDate() : new Date(j.createdAt);
      return d >= startOfMonth;
    });
  }

  return {
    totalRestrictions: filteredRestrictions.length,
    activeRestrictions: filteredRestrictions.filter(r => r.status === 'active').length,
    verifiedProblems: filteredProblems.filter(p => p.status === 'verified').length,
    pendingProblems: filteredProblems.filter(p => p.status === 'pending').length,
    rejectedProblems: filteredProblems.filter(p => p.status === 'rejected').length,
    totalProblems: filteredProblems.length,
    totalJourneys: filteredJourneys.length,
    affectedJourneys: filteredJourneys.filter(j => j.hasRestriction).length,
    restrictions: filteredRestrictions,
    problems: filteredProblems,
    journeys: filteredJourneys
  };
}

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  data.forEach(row => {
    const values = headers.map(h => {
      let val = row[h];
      if (val && typeof val === 'object' && val.toDate) val = val.toDate().toISOString();
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'export.csv';
  a.click();
  URL.revokeObjectURL(url);
  logAudit('report_exported', `Exported ${filename} with ${data.length} rows`);
}

// ============ ADMIN PROFILE ============

export async function getAdminProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? { id: snap.id, ...snap.data(), email: user.email } : { email: user.email };
}

export async function updateAdminProfile(updates) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid), {
    ...updates,
    role: 'admin',
    email: user.email || '24104053@apsit.edu.in'
  }, { merge: true });
  await logAudit('profile_updated', 'Admin profile updated');
}

// ============ UTILITIES ============

export function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
