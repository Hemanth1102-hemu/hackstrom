// FlowSync AI – Route Optimization Engine (Simulated)

// Dummy location data with coordinates for visualization
export const LOCATIONS = {
  "Mumbai Hub": { x: 120, y: 180, lat: 19.076, lng: 72.877 },
  "Delhi Warehouse": { x: 200, y: 60, lat: 28.704, lng: 77.102 },
  "Bangalore Center": { x: 180, y: 280, lat: 12.971, lng: 77.594 },
  "Chennai Depot": { x: 250, y: 300, lat: 13.082, lng: 80.270 },
  "Hyderabad Office": { x: 220, y: 220, lat: 17.385, lng: 78.486 },
  "Pune Store": { x: 140, y: 200, lat: 18.520, lng: 73.856 },
  "Kolkata Port": { x: 350, y: 140, lat: 22.572, lng: 88.363 },
  "Ahmedabad Yard": { x: 100, y: 130, lat: 23.022, lng: 72.571 },
  "Jaipur Station": { x: 160, y: 90, lat: 26.912, lng: 75.787 },
  "Lucknow Hub": { x: 260, y: 80, lat: 26.846, lng: 80.946 },
};

// Calculate distance between two points
function getDistance(loc1, loc2) {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Nearest neighbor route optimization
export function optimizeRoute(source, deliveries, pickups, priority = "balanced") {
  const allStops = [
    ...deliveries.map(d => ({ name: d, type: "delivery" })),
    ...pickups.map(p => ({ name: p, type: "pickup" })),
  ];

  if (allStops.length === 0) return { route: [], totalDistance: 0, cost: 0 };

  // Simple nearest-neighbor algorithm
  const route = [];
  const remaining = [...allStops];
  let current = LOCATIONS[source] || { x: 120, y: 180 };

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const loc = LOCATIONS[remaining[i].name];
      if (!loc) continue;
      const dist = getDistance(current, loc);

      // Adjust distance based on priority
      let adjustedDist = dist;
      if (priority === "fast") {
        // Prefer deliveries first
        if (remaining[i].type === "delivery") adjustedDist *= 0.8;
      } else if (priority === "eco") {
        // Prefer grouping nearby stops
        adjustedDist *= 0.9;
      }

      if (adjustedDist < nearestDist) {
        nearestDist = adjustedDist;
        nearestIdx = i;
      }
    }

    route.push(remaining[nearestIdx]);
    current = LOCATIONS[remaining[nearestIdx].name] || current;
    remaining.splice(nearestIdx, 1);
  }

  // Calculate total distance
  let totalDistance = 0;
  let prev = LOCATIONS[source] || { x: 120, y: 180 };
  for (const stop of route) {
    const loc = LOCATIONS[stop.name];
    if (loc) {
      totalDistance += getDistance(prev, loc);
      prev = loc;
    }
  }
  // Return to source
  totalDistance += getDistance(prev, LOCATIONS[source] || { x: 120, y: 180 });

  // Scale to realistic distances (km)
  const distanceKm = Math.round(totalDistance * 3.2);

  // Calculate costs
  const fuelCostPerKm = priority === "eco" ? 3.8 : priority === "fast" ? 5.2 : 4.5;
  const cost = Math.round(distanceKm * fuelCostPerKm);

  return {
    route,
    totalDistance: distanceKm,
    cost,
    estimatedTime: Math.round(distanceKm / 55), // hours at 55 km/h avg
  };
}

// Generate "before" stats (delivery only, no return optimization)
export function calculateBeforeStats(source, deliveries) {
  const result = optimizeRoute(source, deliveries, [], "balanced");
  // Add empty return distance
  const returnDistance = Math.round(result.totalDistance * 0.7);
  return {
    totalDistance: result.totalDistance + returnDistance,
    cost: Math.round((result.totalDistance + returnDistance) * 4.5),
    truckUtilization: 45 + Math.random() * 10,
    emptyRunKm: returnDistance,
    estimatedTime: Math.round((result.totalDistance + returnDistance) / 55),
  };
}

// Generate "after" stats (combined delivery + return)
export function calculateAfterStats(source, deliveries, pickups, priority = "balanced") {
  const result = optimizeRoute(source, deliveries, pickups, priority);
  return {
    totalDistance: result.totalDistance,
    cost: result.cost,
    truckUtilization: 82 + Math.random() * 12,
    emptyRunKm: Math.round(result.totalDistance * 0.05),
    estimatedTime: result.estimatedTime,
    route: result.route,
  };
}

// Calculate savings
export function calculateSavings(before, after) {
  return {
    distanceSaved: before.totalDistance - after.totalDistance,
    distanceSavedPct: Math.round(((before.totalDistance - after.totalDistance) / before.totalDistance) * 100),
    costSaved: before.cost - after.cost,
    costSavedPct: Math.round(((before.cost - after.cost) / before.cost) * 100),
    utilizationImproved: Math.round(after.truckUtilization - before.truckUtilization),
    co2Saved: Math.round((before.totalDistance - after.totalDistance) * 0.21), // kg CO2 per km
    emptyRunReduced: before.emptyRunKm - after.emptyRunKm,
  };
}

// Eco mode calculations
export function calculateEcoMetrics(distance, isEcoMode) {
  const baseEmissions = distance * 0.264; // kg CO2 per km for truck
  const ecoReduction = isEcoMode ? 0.18 : 0;
  return {
    totalCO2: Math.round(baseEmissions * (1 - ecoReduction)),
    co2Saved: Math.round(baseEmissions * ecoReduction),
    co2ReductionPct: Math.round(ecoReduction * 100),
    fuelSaved: isEcoMode ? Math.round(distance * 0.04) : 0, // liters
    treesEquivalent: Math.round((baseEmissions * ecoReduction) / 21.7), // 1 tree absorbs ~21.7 kg CO2/year
  };
}

// Simulate traffic impact
export function simulateTraffic(route) {
  const impactedStopIdx = Math.floor(Math.random() * route.length);
  const delayMinutes = 15 + Math.floor(Math.random() * 30);
  return {
    impactedStop: route[impactedStopIdx]?.name || "Unknown",
    delayMinutes,
    newEstimatedTime: delayMinutes,
    alternateRouteAvailable: Math.random() > 0.3,
  };
}

// Simulate delay impact
export function simulateDelay(route) {
  const impactedStopIdx = Math.floor(Math.random() * route.length);
  const delayMinutes = 20 + Math.floor(Math.random() * 45);
  return {
    impactedStop: route[impactedStopIdx]?.name || "Unknown",
    delayMinutes,
    reason: ["Vehicle breakdown", "Loading delay", "Weather conditions", "Road closure"][Math.floor(Math.random() * 4)],
    rerouteRequired: Math.random() > 0.4,
  };
}
