import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LOCATIONS } from '../routeEngine'

export default function RouteMap({ source, route, isOptimized, deliveries, pickups }) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (isOptimized) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isOptimized, route])

  // Build points for the map
  const mapWidth = 480
  const mapHeight = 300
  const padding = 50

  const allLocations = useMemo(() => {
    const locs = new Set([source, ...deliveries, ...pickups])
    return Array.from(locs).filter(l => LOCATIONS[l]).map(name => ({
      name,
      ...LOCATIONS[name],
      type: name === source ? 'source' : deliveries.includes(name) ? 'delivery' : 'pickup',
    }))
  }, [source, deliveries, pickups])

  // Normalize coordinates to fit map
  const normalizedLocations = useMemo(() => {
    if (allLocations.length === 0) return []

    const xs = allLocations.map(l => l.x)
    const ys = allLocations.map(l => l.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    return allLocations.map(loc => ({
      ...loc,
      nx: padding + ((loc.x - minX) / rangeX) * (mapWidth - padding * 2),
      ny: padding + ((loc.y - minY) / rangeY) * (mapHeight - padding * 2),
    }))
  }, [allLocations])

  // Build route path
  const routePath = useMemo(() => {
    if (!isOptimized || route.length === 0) return ''

    const sourceNorm = normalizedLocations.find(l => l.name === source)
    if (!sourceNorm) return ''

    const points = [sourceNorm]
    for (const stop of route) {
      const loc = normalizedLocations.find(l => l.name === stop.name)
      if (loc) points.push(loc)
    }
    points.push(sourceNorm) // return to source

    // Create smooth path
    if (points.length < 2) return ''

    let d = `M ${points[0].nx} ${points[0].ny}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx1 = prev.nx + (curr.nx - prev.nx) * 0.3
      const cpy1 = prev.ny
      const cpx2 = prev.nx + (curr.nx - prev.nx) * 0.7
      const cpy2 = curr.ny
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.nx} ${curr.ny}`
    }

    return d
  }, [isOptimized, route, normalizedLocations, source])

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon blue">🗺️</span>
          Route Map
        </div>
        {isOptimized && (
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--accent-blue-light)',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            Optimized ✓
          </span>
        )}
      </div>

      <div className="card-body" style={{ padding: '8px' }}>
        <div className="map-container">
          <svg
            className="map-svg"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="sourceGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="deliveryGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="pickupGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`vg-${i}`} className="map-grid-line"
                x1={i * (mapWidth / 11)} y1={0}
                x2={i * (mapWidth / 11)} y2={mapHeight}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`hg-${i}`} className="map-grid-line"
                x1={0} y1={i * (mapHeight / 7)}
                x2={mapWidth} y2={i * (mapHeight / 7)}
              />
            ))}

            {/* Route path */}
            <AnimatePresence>
              {isOptimized && routePath && (
                <motion.path
                  key={animationKey}
                  d={routePath}
                  className="map-route-line optimized"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>

            {/* Location points */}
            {normalizedLocations.map((loc, idx) => {
              const isSource = loc.type === 'source'
              const isDelivery = loc.type === 'delivery'
              const color = isSource ? '#10b981' : isDelivery ? '#3b82f6' : '#f97316'
              const glowId = isSource ? 'sourceGlow' : isDelivery ? 'deliveryGlow' : 'pickupGlow'
              const radius = isSource ? 9 : 7

              return (
                <g key={loc.name} className="map-point">
                  {/* Glow */}
                  <circle
                    cx={loc.nx}
                    cy={loc.ny}
                    r={radius * 3}
                    fill={`url(#${glowId})`}
                  />
                  {/* Outer ring */}
                  <motion.circle
                    cx={loc.nx}
                    cy={loc.ny}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    initial={{ r: 0 }}
                    animate={{ r: radius }}
                    transition={{ delay: idx * 0.1, type: 'spring' }}
                  />
                  {/* Inner dot */}
                  <motion.circle
                    cx={loc.nx}
                    cy={loc.ny}
                    r={radius * 0.5}
                    fill={color}
                    initial={{ r: 0 }}
                    animate={{ r: radius * 0.5 }}
                    transition={{ delay: idx * 0.1 + 0.05, type: 'spring' }}
                    filter="url(#glow)"
                  />
                  {/* Label */}
                  <text
                    className="map-label"
                    x={loc.nx}
                    y={loc.ny - radius - 6}
                    textAnchor="middle"
                    fill={color}
                  >
                    {loc.name.split(' ')[0]}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            display: 'flex',
            gap: '12px',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              Source
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              Delivery
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
              Pickup
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
