import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LOCATIONS } from '../routeEngine'

const locationOptions = Object.keys(LOCATIONS)

export default function DashboardPanel({
  source, setSource,
  deliveries, setDeliveries,
  pickups, setPickups,
  weight, setWeight,
  vehicleType, setVehicleType,
  priority, setPriority,
  onOptimize, isOptimizing, onReset
}) {
  const [deliveryInput, setDeliveryInput] = useState('')
  const [pickupInput, setPickupInput] = useState('')
  const [showDeliverySuggestions, setShowDeliverySuggestions] = useState(false)
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)

  const getFilteredOptions = (input, exclude) => {
    return locationOptions.filter(loc =>
      loc.toLowerCase().includes(input.toLowerCase()) &&
      !exclude.includes(loc) &&
      loc !== source
    )
  }

  const addDelivery = (loc) => {
    if (!deliveries.includes(loc) && loc !== source) {
      setDeliveries([...deliveries, loc])
    }
    setDeliveryInput('')
    setShowDeliverySuggestions(false)
  }

  const addPickup = (loc) => {
    if (!pickups.includes(loc) && loc !== source) {
      setPickups([...pickups, loc])
    }
    setPickupInput('')
    setShowPickupSuggestions(false)
  }

  const removeDelivery = (loc) => setDeliveries(deliveries.filter(d => d !== loc))
  const removePickup = (loc) => setPickups(pickups.filter(p => p !== loc))

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon blue">📦</span>
          Shipment Configuration
        </div>
      </div>

      <div className="card-body">
        {/* Source Location */}
        <div className="input-group">
          <label className="input-label">📍 Source Location</label>
          <select
            className="input-field"
            id="source-location"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            {locationOptions.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Delivery Destinations */}
        <div className="input-group">
          <label className="input-label">🚚 Delivery Destinations</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-field"
              id="delivery-input"
              type="text"
              placeholder="Type to add delivery location..."
              value={deliveryInput}
              onChange={e => {
                setDeliveryInput(e.target.value)
                setShowDeliverySuggestions(e.target.value.length > 0)
              }}
              onFocus={() => deliveryInput && setShowDeliverySuggestions(true)}
              onBlur={() => setTimeout(() => setShowDeliverySuggestions(false), 200)}
            />
            {showDeliverySuggestions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'rgba(17, 24, 39, 0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', marginTop: '4px', backdropFilter: 'blur(10px)',
                maxHeight: '160px', overflowY: 'auto'
              }}>
                {getFilteredOptions(deliveryInput, deliveries).map(loc => (
                  <div
                    key={loc}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem',
                      color: 'var(--text-secondary)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                      e.target.style.color = 'var(--accent-blue-light)'
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }}
                    onMouseDown={() => addDelivery(loc)}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="tag-container">
            {deliveries.map((d, i) => (
              <motion.span
                key={d}
                className="tag blue"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
              >
                🚚 {d}
                <span className="remove-tag" onClick={() => removeDelivery(d)}>✕</span>
              </motion.span>
            ))}
          </div>
        </div>

        {/* Return Pickup Locations */}
        <div className="input-group">
          <label className="input-label">🔄 Return Pickup Locations</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-field"
              id="pickup-input"
              type="text"
              placeholder="Type to add return pickup..."
              value={pickupInput}
              onChange={e => {
                setPickupInput(e.target.value)
                setShowPickupSuggestions(e.target.value.length > 0)
              }}
              onFocus={() => pickupInput && setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
            />
            {showPickupSuggestions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'rgba(17, 24, 39, 0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', marginTop: '4px', backdropFilter: 'blur(10px)',
                maxHeight: '160px', overflowY: 'auto'
              }}>
                {getFilteredOptions(pickupInput, pickups).map(loc => (
                  <div
                    key={loc}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem',
                      color: 'var(--text-secondary)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'rgba(249, 115, 22, 0.1)'
                      e.target.style.color = 'var(--accent-orange-light)'
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }}
                    onMouseDown={() => addPickup(loc)}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="tag-container">
            {pickups.map((p, i) => (
              <motion.span
                key={p}
                className="tag orange"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
              >
                🔄 {p}
                <span className="remove-tag" onClick={() => removePickup(p)}>✕</span>
              </motion.span>
            ))}
          </div>
        </div>

        {/* Priority Toggle */}
        <div className="input-group">
          <label className="input-label">⚡ Priority Mode</label>
          <div className="priority-group">
            {[
              { key: 'fast', emoji: '⚡', label: 'Fastest Delivery' },
              { key: 'balanced', emoji: '💵', label: 'Lowest Cost' },
              { key: 'eco', emoji: '🌱', label: 'Eco Mode (Fuel Efficient)' },
            ].map(p => (
              <motion.button
                key={p.key}
                className={`priority-btn ${priority === p.key ? `active ${p.key}` : ''}`}
                onClick={() => setPriority(p.key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id={`priority-${p.key}`}
              >
                <span className="priority-emoji">{p.emoji}</span>
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Package Weight & Vehicle Type */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label">⚖️ Package Weight (kg)</label>
            <input
              className="input-field"
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              min="1"
            />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label">🚛 Vehicle Type</label>
            <select
              className="input-field"
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
            >
              <option value="Small Truck">Small Truck</option>
              <option value="Medium Truck">Medium Truck</option>
              <option value="Large Truck">Large Truck</option>
            </select>
          </div>
        </div>

        {/* Optimize Button & Reset */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            className={`optimize-btn ${isOptimizing ? 'loading' : ''}`}
            onClick={onOptimize}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            id="optimize-route-btn"
            style={{ flex: 2 }}
          >
            {isOptimizing ? (
              <>
                <div className="spinner" />
                Optimizing...
              </>
            ) : (
              <>
                🧠 Optimize Route
              </>
            )}
          </motion.button>
          
          <motion.button
            className="optimize-btn"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
