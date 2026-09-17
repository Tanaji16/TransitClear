// TransitClear Driver Console — Mock & Static Data Reference
// Attaches to window.TC_DATA so it works with both direct file:// access and served environments.

const TC_DATA = {
  driver: {
    name: "Rajesh Kumar",
    shortName: "Rajesh K.",
    initials: "RK",
    phone: "+91 98765 43210",
    role: "Commercial Heavy Driver",
    status: "Active & Verified",
    fleet: "VRL Logistics Fleet • Mumbai Division"
  },
  vehicle: {
    category: "Heavy Truck",
    type: "Heavy Truck (6-Axle Rigid Trailer)",
    plateNumber: "MH-04-AB-1234",
    fastagStatus: "Active & Linked"
  },
  currentJourney: {
    origin: "Mumbai",
    originTerminal: "JNPT Terminal, Mumbai",
    destination: "Goa",
    destinationTerminal: "Margao Logistics Hub",
    highway: "National Highway 48 / 66",
    departureTime: "11:00 AM",
    eta: "7:45 PM",
    remainingDistanceKm: 420,
    totalDistanceKm: 580,
    hasRestriction: true,
    restrictionTitle: "Heavy Commercial Vehicle Restriction",
    restrictionChainage: "KM 78"
  },
  activeRestriction: {
    title: "Heavy trucks are restricted ahead",
    description: "A timed restriction is in effect along your planned travel corridor. Immediate action recommended to avoid roadblock delays.",
    highwayDetail: "National Highway Ghat Section",
    location: "National Highway Ghat Section",
    chainage: "Chainage KM 78 - KM 84",
    hours: "4:00 PM – 10:00 PM",
    durationText: "6 Hour Total Closure Window",
    driverEta: "5:20 PM",
    etaStatus: "Arriving right in restriction",
    warningSlab: "Your truck will reach during the restriction.",
    optionsCountText: "2 suitable options available"
  },
  guidanceOptions: [
    {
      id: 1,
      isRecommended: true,
      title: "Stop safely & wait at approved holding yard",
      description: "Park at Shree Ganesh Logistics Park (KM 54), located 8 km prior to restriction start.",
      amenities: ["Clean Drinking Water", "24hr Canteen", "Secure Truck Parking"],
      actionLabel: "Navigate to Holding Yard →",
      actionType: "navigate_yard",
      capacity: "48 truck spaces left"
    },
    {
      id: 2,
      isRecommended: false,
      title: "Leave earlier to cross before restriction",
      description: "You must pass the corridor restriction checkpoint before entry closure. Requires increasing safe cruise speed without exceeding NHAI 60 km/h truck limits.",
      amenities: [],
      actionLabel: "Check Speed Timeline",
      actionType: "speed_timeline"
    },
    {
      id: 3,
      isRecommended: false,
      title: "Use alternate bypass corridor (Wai – Surur)",
      description: "Divert via Bhor-Wai bypass road. Route is open for commercial traffic with +22 km extra distance and approximately 45 minutes additional travel time.",
      amenities: [],
      actionLabel: "Switch to Bypass Route",
      actionType: "switch_bypass"
    }
  ],
  admin: {
    authority: "Maharashtra Traffic Control Department",
    jurisdiction: "Western Arterial Corridors (Mumbai–Pune–Satara)",
    operator: {
      name: "Admin",
      role: "Chief Controller",
      desk: "Live Desk 04",
      serviceId: "MH-TC-98442-A",
      email: "admin@example.gov.in"
    },
    kpi: {
      activeRestrictions: 12,
      startingSoon: 4,
      affectedJourneys: 37,
      reportsToVerify: 8
    },
    activeRestrictions: [
      {
        id: "REST-001",
        title: "Heavy Vehicle Restriction",
        icon: "no_crash",
        location: "National Highway Ghat Section",
        subLocation: "NH-48 Ghat Section",
        affectedVehicles: "Heavy Trucks",
        timeWindow: "4:00 PM – 10:00 PM",
        status: "Active"
      },
      {
        id: "REST-002",
        title: "Road Closure",
        icon: "block",
        location: "Pune Road",
        subLocation: "KM 42 Bypass Junction",
        affectedVehicles: "All Vehicles",
        timeWindow: "2:00 PM – 6:00 PM",
        status: "Active"
      },
      {
        id: "REST-003",
        title: "Bus Restriction",
        icon: "directions_bus",
        location: "Mumbai",
        subLocation: "Eastern Freeway Southbound",
        affectedVehicles: "Buses (Intercity / Sleeper)",
        timeWindow: "5:00 PM – 9:00 PM",
        status: "Active"
      },
      {
        id: "REST-004",
        title: "Hazardous Cargo Restriction",
        icon: "dangerous",
        location: "Thane-Belapur Road",
        subLocation: "MIDC Industrial Belt",
        affectedVehicles: "Hazardous Cargo Tankers",
        timeWindow: "3:30 PM – 8:30 PM",
        status: "Active"
      }
    ],
    roadProblems: [
      {
        id: "RP-101",
        type: "Road Blocked",
        icon: "report",
        location: "Pune–Satara Road",
        reportedTime: "12 min ago",
        severity: "critical"
      },
      {
        id: "RP-102",
        type: "Waterlogging",
        icon: "water",
        location: "Mumbai–Goa Highway",
        reportedTime: "25 min ago",
        severity: "warning"
      },
      {
        id: "RP-103",
        type: "Accident",
        icon: "car_crash",
        location: "NH 48",
        reportedTime: "32 min ago",
        severity: "critical"
      }
    ],
    affectedJourneys: [
      {
        id: "JRN-8801",
        route: "Mumbai → Goa",
        vehicleType: "Heavy Truck",
        warning: "Restriction ahead",
        eta: "5:20 PM"
      },
      {
        id: "JRN-8802",
        route: "Pune → Kolhapur",
        vehicleType: "Heavy Truck",
        warning: "Restriction ahead",
        eta: "6:10 PM"
      },
      {
        id: "JRN-8803",
        route: "Thane → JNPT Port",
        vehicleType: "Heavy Truck",
        warning: "Restriction ahead",
        eta: "5:45 PM"
      }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.TC_DATA = TC_DATA;
}

