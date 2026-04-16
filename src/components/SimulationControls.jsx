import { motion } from 'framer-motion'

export default function SimulationControls({ onSimulateTraffic, onSimulateDelay, isOptimized }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon orange">🎮</span>
          Real-Time Simulation
        </div>
      </div>

      <div className="card-body">
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          lineHeight: 1.5
        }}>
          Simulate real-world events to see how FlowSync AI dynamically adapts routes in real-time.
        </p>

        <div className="sim-buttons">
          <motion.button
            className="sim-btn traffic"
            onClick={onSimulateTraffic}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            id="simulate-traffic-btn"
            style={{ opacity: isOptimized ? 1 : 0.5 }}
          >
            🚦 Simulate Traffic
          </motion.button>

          <motion.button
            className="sim-btn delay"
            onClick={onSimulateDelay}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            id="simulate-delay-btn"
            style={{ opacity: isOptimized ? 1 : 0.5 }}
          >
            ⚠️ Simulate Delay
          </motion.button>
        </div>

        {!isOptimized && (
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Optimize a route first to enable simulations
          </p>
        )}

        {isOptimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '16px' }}>💡</span>
            Click either button to simulate events. Watch the AI Assistant panel for real-time responses.
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
