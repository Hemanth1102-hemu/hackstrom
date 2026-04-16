import { motion, AnimatePresence } from 'framer-motion'

export default function RouteVisualization({ source, route, isOptimized }) {
  if (!isOptimized || route.length === 0) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-icon purple">🗺️</span>
            Route Sequence
          </div>
        </div>
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">🛤️</div>
            <p className="empty-state-text">
              Configure your shipment and click "Optimize Route" to see the optimized sequence
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  const allStops = [
    { name: source, type: 'source' },
    ...route,
    { name: source, type: 'source' },
  ]

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon purple">🗺️</span>
          Optimized Route Sequence
        </div>
        <span style={{
          fontSize: '0.7rem',
          color: 'var(--accent-green-light)',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          {route.length} stops
        </span>
      </div>

      <div className="card-body">
        <div className="route-timeline">
          <AnimatePresence>
            {allStops.map((stop, index) => (
              <motion.div
                key={`${stop.name}-${index}`}
                className="route-stop"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              >
                <div className="route-stop-marker">
                  <motion.div
                    className={`route-dot ${stop.type}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.1, type: 'spring', stiffness: 200 }}
                  />
                  {index < allStops.length - 1 && <div className="route-line" />}
                </div>

                <div className="route-stop-info">
                  <h4>{stop.name}</h4>
                  <p>
                    {index === 0 ? 'Start Point' :
                     index === allStops.length - 1 ? 'Return to Base' :
                     `Stop ${index} of ${route.length}`}
                  </p>
                </div>

                <span className={`route-stop-badge ${stop.type}`}>
                  {stop.type === 'source' ? (index === 0 ? 'START' : 'END') :
                   stop.type === 'delivery' ? '📦 DELIVERY' : '🔄 PICKUP'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Truck Utilization */}
        <div className="utilization-bar-container" style={{ marginTop: '24px' }}>
          <div className="utilization-label-row">
            <span className="utilization-label">Truck Utilization</span>
            <span className="utilization-value">
              {route.filter(r => r.type === 'delivery').length} deliveries +{' '}
              {route.filter(r => r.type === 'pickup').length} pickups
            </span>
          </div>
          <div className="utilization-bar">
            <motion.div
              className="utilization-fill"
              initial={{ width: 0 }}
              animate={{ width: '87%' }}
              transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
