import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AIAssistant({ messages }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 120px)', position: 'sticky', top: '96px' }}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon blue">🤖</span>
          AI Assistant
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.65rem',
          color: 'var(--accent-green-light)',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-green)',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          Active
        </div>
      </div>

      <div className="ai-messages" style={{ flex: 1 }}>
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            className={`ai-message ${msg.type}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.type === 'ai' && (
              <div className="ai-message-sender">
                <span>🤖</span> FlowSync AI
              </div>
            )}
            {msg.text}
            <div className="ai-message-time">{formatTime(msg.time)}</div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          flex: 1,
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          AI is actively monitoring your routes...
        </div>
      </div>
    </motion.div>
  )
}
