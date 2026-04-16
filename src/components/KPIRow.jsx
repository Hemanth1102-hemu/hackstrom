import { motion } from 'framer-motion'

export default function KPIRow({ savings, afterStats, ecoMetrics }) {
  const kpis = [
    {
      value: `${savings.distanceSavedPct}%`,
      label: 'Distance Saved',
      color: 'var(--accent-green-light)',
    },
    {
      value: `₹${savings.costSaved.toLocaleString()}`,
      label: 'Cost Saved',
      color: 'var(--accent-blue-light)',
    },
    {
      value: `${Math.round(afterStats.truckUtilization)}%`,
      label: 'Truck Utilization',
      color: 'var(--accent-purple-light)',
    },
    {
      value: `${savings.co2Saved} kg`,
      label: 'CO₂ Reduced',
      color: 'var(--accent-green-light)',
    },
  ]

  return (
    <div className="kpi-row">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.label}
          className="kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <motion.div
            className="kpi-value"
            style={{ color: kpi.color }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
          >
            {kpi.value}
          </motion.div>
          <div className="kpi-label">{kpi.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
