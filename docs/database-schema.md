# TransitClear — Firestore Database Schema

> Firestore is a **NoSQL** database. Collections (like tables) are created **automatically** when the first document is written. You do NOT need to create them manually.

## Collections

### 1. `users` (Created on Driver Signup)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Driver's full name | "Tanaji Parab" |
| `email` | string | Email address | "tanaji@gmail.com" |
| `phone` | string | Mobile number | "+919822041920" |
| `vehicleType` | string | Type of vehicle | "heavy-truck" / "bus" / "delivery-vehicle" / "car" |
| `vehicleNumber` | string | Vehicle registration | "MH-12-Q-4421" |
| `language` | string | Preferred language | "en" / "hi" / "mr" |
| `role` | string | User role (enforced) | "driver" |
| `createdAt` | string | ISO timestamp | "2026-09-15T10:00:00.000Z" |

**Document ID** = Firebase Auth UID (auto-generated)

---

### 2. `problems` (Future — Road Problem Reports)

| Field | Type | Description |
|-------|------|-------------|
| `reportedBy` | string | Driver UID |
| `type` | string | Problem type (pothole, flood, etc.) |
| `location` | geopoint | GPS coordinates |
| `description` | string | Problem details |
| `severity` | string | low / medium / high / critical |
| `status` | string | reported / verified / resolved |
| `photos` | array | Image URLs |
| `createdAt` | timestamp | Server timestamp |

---

### 3. `alerts` (Future — Road Alerts for Drivers)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Alert headline |
| `message` | string | Alert details |
| `region` | string | Affected area |
| `severity` | string | info / warning / danger |
| `active` | boolean | Is alert currently active |
| `createdBy` | string | Admin UID |
| `createdAt` | timestamp | Server timestamp |

---

### 4. `journeys` (Future — Driver Journey Logs)

| Field | Type | Description |
|-------|------|-------------|
| `driverId` | string | Driver UID |
| `origin` | string | Starting location |
| `destination` | string | End location |
| `status` | string | planned / active / completed / affected |
| `startTime` | timestamp | Journey start |
| `endTime` | timestamp | Journey end |
| `alerts` | array | Alert IDs affecting this journey |

---

## Security Rules

See [`firestore.rules`](../firestore.rules) for current security rules.

Currently only the `users` collection has rules defined. Other collections will need rules added as they are implemented.
