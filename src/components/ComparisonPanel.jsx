import { motion } from 'framer-motion'

export default function ComparisonPanel({ beforeStats, afterStats, savings }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon cyan">📊</span>
          Before vs After Optimization
        </div>
      </div>

      <div className="card-body">
        <div className="comparison-grid">
          {/* BEFORE Card */}
          <motion.div
            className="comparison-card before"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="comparison-card-label">
              <span>⛔</span> BEFORE — Deliveries Only
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Total Distance</div>
              <div className="comparison-stat-value">{beforeStats.totalDistance} km</div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Total Cost</div>
              <div className="comparison-stat-value">₹{beforeStats.cost.toLocaleString()}</div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Truck Utilization</div>
              <div className="comparison-stat-value">{Math.round(beforeStats.truckUtilization)}%</div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Empty Return Run</div>
              <div className="comparison-stat-value" style={{ color: 'var(--accent-red-light)' }}>
                {beforeStats.emptyRunKm} km 🚛💨
              </div>
            </div>
          </motion.div>

          {/* AFTER Card */}
          <motion.div
            className="comparison-card after"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="comparison-card-label">
              <span>✅</span> AFTER — Combined Route
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Total Distance</div>
              <div className="comparison-stat-value">{afterStats.totalDistance} km</div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Total Cost</div>
              <div className="comparison-stat-value">₹{afterStats.cost.toLocaleString()}</div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Truck Utilization</div>
              <div className="comparison-stat-value" style={{ color: 'var(--accent-green-light)' }}>
                {Math.round(afterStats.truckUtilization)}%
              </div>
            </div>
            <div className="comparison-stat">
              <div className="comparison-stat-label">Empty Return Run</div>
              <div className="comparison-stat-value" style={{ color: 'var(--accent-green-light)' }}>
                {afterStats.emptyRunKm} km ✅
              </div>
            </div>
          </motion.div>
        </div>

        {/* Savings Summary */}
        <motion.div
          className="savings-cards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="saving-card">
            <div className="saving-card-icon">📏</div>
            <div className="saving-card-value green">{savings.distanceSaved} km</div>
            <div className="saving-card-label">Distance Saved ({savings.distanceSavedPct}%)</div>
          </div>
          <div className="saving-card">
            <div className="saving-card-icon">💰</div>
            <div className="saving-card-value blue">₹{savings.costSaved.toLocaleString()}</div>
            <div className="saving-card-label">Cost Saved ({savings.costSavedPct}%)</div>
          </div>
          <div className="saving-card">
            <div className="saving-card-icon">🌿</div>
            <div className="saving-card-value green">{savings.co2Saved} kg</div>
            <div className="saving-card-label">CO₂ Reduced</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
