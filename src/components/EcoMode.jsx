import { motion } from 'framer-motion'

export default function EcoMode({ enabled, onToggle }) {
  return (
    <div className="eco-toggle-wrapper">
      <label className="eco-toggle" id="eco-mode-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
        />
        <span className="eco-slider" />
      </label>
      <span className={`eco-label ${enabled ? 'active' : ''}`}>
        {enabled ? '🌱 Eco Mode' : 'Eco Mode'}
      </span>
    </div>
  )
}
