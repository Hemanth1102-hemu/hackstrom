import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardPanel from './components/DashboardPanel'
import RouteVisualization from './components/RouteVisualization'
import ComparisonPanel from './components/ComparisonPanel'
import SimulationControls from './components/SimulationControls'
import AIAssistant from './components/AIAssistant'
import EcoMode from './components/EcoMode'
import RouteMap from './components/RouteMap'
import KPIRow from './components/KPIRow'
import {
  LOCATIONS,
  optimizeRoute,
  calculateBeforeStats,
  calculateAfterStats,
  calculateSavings,
  calculateEcoMetrics,
  simulateTraffic,
  simulateDelay,
} from './routeEngine'

function App() {
  // Core state
  const [source, setSource] = useState("Mumbai Hub")
  const [deliveries, setDeliveries] = useState(["Delhi Warehouse", "Bangalore Center", "Chennai Depot"])
  const [pickups, setPickups] = useState(["Hyderabad Office", "Pune Store"])
  const [weight, setWeight] = useState(100)
  const [vehicleType, setVehicleType] = useState("Medium Truck")
  const [priority, setPriority] = useState("balanced")
  const [isOptimized, setIsOptimized] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [ecoMode, setEcoMode] = useState(false)

  // Data state
  const [optimizedRoute, setOptimizedRoute] = useState([])
  const [beforeStats, setBeforeStats] = useState(null)
  const [afterStats, setAfterStats] = useState(null)
  const [savings, setSavings] = useState(null)
  const [ecoMetrics, setEcoMetrics] = useState(null)

  // AI messages
  const [aiMessages, setAiMessages] = useState([
    { id: 1, type: 'system', text: 'FlowSync AI initialized. Ready to optimize your logistics.', time: new Date() },
    { id: 2, type: 'ai', text: 'Welcome! Add your delivery and return locations, then hit "Optimize Route" to see the magic. 🚛', time: new Date() },
  ])

  // Alerts
  const [alerts, setAlerts] = useState([])

  const addAIMessage = useCallback((type, text) => {
    setAiMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      text,
      time: new Date(),
    }])
  }, [])

  const addAlert = useCallback((type, text) => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, type, text }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 5000)
  }, [])

  // Optimize route handler
  const handleOptimize = useCallback(async () => {
    if (deliveries.length === 0) {
      addAlert('warning', '⚠️ Please add at least one delivery destination')
      return
    }

    setIsOptimizing(true)
    addAIMessage('system', '🔄 Analyzing routes and calculating optimal path...')

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const before = calculateBeforeStats(source, deliveries)
    const after = calculateAfterStats(source, deliveries, pickups, priority)
    const savingsData = calculateSavings(before, after)
    const eco = calculateEcoMetrics(after.totalDistance, ecoMode)

    setBeforeStats(before)
    setAfterStats(after)
    setSavings(savingsData)
    setEcoMetrics(eco)
    setOptimizedRoute(after.route)
    setIsOptimized(true)
    setIsOptimizing(false)

    addAIMessage('ai', `✅ Optimized route selected! Combined ${deliveries.length} deliveries + ${pickups.length} return pickups into a single efficient route.`)
    addAIMessage('ai', `📊 Saving ${savingsData.distanceSaved} km (${savingsData.distanceSavedPct}%) and ₹${savingsData.costSaved} in costs. Truck utilization improved by ${savingsData.utilizationImproved}%.`)

    if (pickups.length > 0) {
      addAIMessage('ai', `🔄 Return pickups added to avoid empty truck runs. ${savingsData.emptyRunReduced} km of empty travel eliminated.`)
    }

    if (ecoMode) {
      addAIMessage('ai', `🌱 Eco Mode active: ${eco.co2Saved} kg CO₂ saved. Fuel-efficient routing applied.`)
    }

    addAlert('success', `✅ Route optimized! ${savingsData.distanceSavedPct}% distance saved.`)
  }, [source, deliveries, pickups, priority, ecoMode, addAIMessage, addAlert])

  // Simulation handlers
  const handleSimulateTraffic = useCallback(async () => {
    if (!isOptimized) {
      addAlert('warning', '⚠️ Optimize route first before simulating')
      return
    }

    addAIMessage('alert', '🚦 Traffic congestion detected! Recalculating route...')
    addAlert('warning', '🚦 Traffic detected on current route. Rerouting...')

    await new Promise(resolve => setTimeout(resolve, 1500))

    const traffic = simulateTraffic(optimizedRoute)
    addAIMessage('ai', `🚦 Traffic detected near ${traffic.impactedStop}. ${traffic.delayMinutes} min delay expected.`)

    if (traffic.alternateRouteAvailable) {
      addAIMessage('ai', `↪️ Alternate route found! Rerouting to save ${Math.round(traffic.delayMinutes * 0.6)} min. Route updated.`)

      // Re-optimize with slight changes
      const newAfter = calculateAfterStats(source, deliveries, pickups, priority)
      setAfterStats(prev => ({
        ...prev,
        totalDistance: prev.totalDistance + Math.round(Math.random() * 15),
        estimatedTime: prev.estimatedTime + Math.round(traffic.delayMinutes / 60),
      }))

      addAlert('success', '✅ Route recalculated. Alternate path found.')
    } else {
      addAIMessage('ai', `⏳ No alternate route available. Estimated delay: ${traffic.delayMinutes} min.`)
    }
  }, [isOptimized, optimizedRoute, source, deliveries, pickups, priority, addAIMessage, addAlert])

  const handleSimulateDelay = useCallback(async () => {
    if (!isOptimized) {
      addAlert('warning', '⚠️ Optimize route first before simulating')
      return
    }

    addAIMessage('alert', '⚠️ Delay event reported! Analyzing impact...')
    addAlert('danger', '⚠️ Unexpected delay detected. Recalculating...')

    await new Promise(resolve => setTimeout(resolve, 1800))

    const delay = simulateDelay(optimizedRoute)
    addAIMessage('ai', `⚠️ ${delay.reason} near ${delay.impactedStop}. ${delay.delayMinutes} min delay.`)

    if (delay.rerouteRequired) {
      addAIMessage('ai', `🔀 Rerouting required. Adjusting delivery sequence to minimize impact...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      addAIMessage('ai', `✅ Route recalculated. ${Math.round(delay.delayMinutes * 0.4)} min saved through dynamic rerouting.`)

      setAfterStats(prev => ({
        ...prev,
        estimatedTime: prev.estimatedTime + Math.round(delay.delayMinutes / 120),
      }))

      addAlert('success', '✅ Dynamic rerouting complete.')
    } else {
      addAIMessage('ai', `📍 Minor delay. Continuing current route. ETA adjusted.`)
    }
  }, [isOptimized, optimizedRoute, addAIMessage, addAlert])

  // Eco mode toggle
  const handleEcoToggle = useCallback((enabled) => {
    setEcoMode(enabled)
    if (enabled) {
      addAIMessage('ai', '🌱 Eco Mode enabled! Optimizing for fuel efficiency and lower emissions.')
      if (isOptimized && afterStats) {
        const eco = calculateEcoMetrics(afterStats.totalDistance, true)
        setEcoMetrics(eco)
      }
    } else {
      addAIMessage('ai', '⚡ Eco Mode disabled. Standard routing applied.')
      if (isOptimized && afterStats) {
        const eco = calculateEcoMetrics(afterStats.totalDistance, false)
        setEcoMetrics(eco)
      }
    }
  }, [isOptimized, afterStats, addAIMessage])

  return (
    <div className="app-container">
      {/* Background Effects */}
      <div className="app-bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isOptimizing && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner-large" />
            <motion.p
              className="loading-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              AI is optimizing your route...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-content">
        {/* Header */}
        <header className="header">
          <div className="header-logo">
            <motion.div
              className="logo-icon"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              🚛
            </motion.div>
            <div className="logo-text">
              <h1>FlowSync AI</h1>
              <p>Intelligent Shipment Orchestration</p>
            </div>
          </div>

          <div className="header-status">
            <EcoMode
              enabled={ecoMode}
              onToggle={handleEcoToggle}
            />
            <div className="status-badge">
              <span className="status-dot" />
              System Online
            </div>
          </div>
        </header>

        {/* Alerts */}
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              className={`alert-banner ${alert.type}`}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              style={{ margin: '0 24px' }}
            >
              {alert.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* KPI Row */}
        <AnimatePresence>
          {isOptimized && savings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ padding: '16px 24px 0' }}
            >
              <KPIRow savings={savings} afterStats={afterStats} ecoMetrics={ecoMetrics} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Left Column: Dashboard Input */}
          <div className="left-column">
            <DashboardPanel
              source={source}
              setSource={setSource}
              deliveries={deliveries}
              setDeliveries={setDeliveries}
              pickups={pickups}
              setPickups={setPickups}
              weight={weight}
              setWeight={setWeight}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              priority={priority}
              setPriority={setPriority}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              onReset={() => {
                setSource("Mumbai Hub")
                setDeliveries([])
                setPickups([])
                setWeight(100)
                setVehicleType("Medium Truck")
                setPriority("balanced")
                setIsOptimized(false)
                setBeforeStats(null)
                setAfterStats(null)
                setSavings(null)
                setOptimizedRoute([])
              }}
            />

            <SimulationControls
              onSimulateTraffic={handleSimulateTraffic}
              onSimulateDelay={handleSimulateDelay}
              isOptimized={isOptimized}
            />
          </div>

          {/* Center Column: Route Viz + Comparison */}
          <div className="center-column">
            <RouteMap
              source={source}
              route={optimizedRoute}
              isOptimized={isOptimized}
              deliveries={deliveries}
              pickups={pickups}
            />

            <RouteVisualization
              source={source}
              route={optimizedRoute}
              isOptimized={isOptimized}
            />

            {isOptimized && beforeStats && afterStats && savings && (
              <ComparisonPanel
                beforeStats={beforeStats}
                afterStats={afterStats}
                savings={savings}
              />
            )}

            {isOptimized && ecoMode && ecoMetrics && (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <span className="card-title-icon green">🌱</span>
                    Eco Impact Report
                  </div>
                </div>
                <div className="card-body">
                  <div className="eco-stats">
                    <div className="eco-stat">
                      <div className="eco-stat-value">{ecoMetrics.co2Saved} kg</div>
                      <div className="eco-stat-label">CO₂ Saved</div>
                    </div>
                    <div className="eco-stat">
                      <div className="eco-stat-value">{ecoMetrics.co2ReductionPct}%</div>
                      <div className="eco-stat-label">Emission Reduction</div>
                    </div>
                    <div className="eco-stat">
                      <div className="eco-stat-value">{ecoMetrics.fuelSaved} L</div>
                      <div className="eco-stat-label">Fuel Saved</div>
                    </div>
                    <div className="eco-stat">
                      <div className="eco-stat-value">{ecoMetrics.treesEquivalent} 🌳</div>
                      <div className="eco-stat-label">Trees Equivalent</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: AI Assistant */}
          <div className="right-column">
            <AIAssistant messages={aiMessages} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
