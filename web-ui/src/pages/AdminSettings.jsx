import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import './AdminSettings.css'

function AdminSettings({ onLogout }) {
    const [settings, setSettings] = useState({
        maidName: 'Seraphina Lumière',
        timezone: 'Asia/Kolkata',
        storageChannelId: '',
        aiMode: false,
        aiProvider: 'gemini',
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [dbStats, setDbStats] = useState(null)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const [subUserId, setSubUserId] = useState('')
    const [subDuration, setSubDuration] = useState('1')

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (data.success) {
                setSettings(data.settings)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
            setMessage({ type: 'error', text: 'Failed to load settings' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (key, value) => {
        setSettings({ ...settings, [key]: value })
        setHasChanges(true)
        setMessage(null)
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/admin/settings/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings }),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: 'As you command, Master~ Settings have been updated! ✨',
                })
                setHasChanges(false)
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to save settings',
                })
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Oh dear... An error occurred, Master',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const fetchDbStats = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/database/database-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()
            if (data.success) {
                setDbStats(data.stats)
            }
        } catch (error) {
            console.error('Failed to fetch database stats:', error)
        }
    }

    const handleClearDatabase = async () => {
        setIsClearing(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/database/clear-database`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmation: 'CLEAR_ALL_DATA' })
            })

            const data = await response.json()

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: 'Database cleared successfully! Subscriptions preserved ✨',
                })
                setShowClearConfirm(false)
                fetchDbStats() // Refresh stats
            } else {
                throw new Error(data.error || 'Clear failed')
            }
        } catch (error) {
            console.error('Clear database error:', error)
            setMessage({
                type: 'error',
                text: 'Failed to clear database: ' + error.message,
            })
        } finally {
            setIsClearing(false)
        }
    }

    const handleGrantPro = async () => {
        if (!subUserId) {
            setMessage({ type: 'error', text: 'Please enter a Discord user ID' })
            return
        }

        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/subscriptions/grant-pro`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: subUserId,
                    months: subDuration === 'lifetime' ? 9999 : parseInt(subDuration)
                })
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: `Pro granted to ${subUserId}!` })
                setSubUserId('')
            } else {
                throw new Error(data.error || 'Grant failed')
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to grant Pro: ' + error.message })
        }
    }

    const handleRevokePro = async () => {
        if (!subUserId) {
            setMessage({ type: 'error', text: 'Please enter a Discord user ID' })
            return
        }

        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/subscriptions/revoke-pro`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: subUserId })
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: `Pro revoked from ${subUserId}!` })
                setSubUserId('')
            } else {
                throw new Error(data.error || 'Revoke failed')
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to revoke Pro: ' + error.message })
        }
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="maid-quote">Seraphina is preparing your settings~</p>
            </div>
        )
    }

    return (
        <div className="admin-container fade-in">
            <div className="admin-header glass">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="header-title">
                            <span className="icon">🎀</span>
                            Seraphina's Chamber
                        </h1>
                        <p className="header-subtitle">Configure your learning companion</p>
                    </div>
                    <div className="header-right">
                        <a href="/pricing" className="upgrade-button">
                            💎 Upgrade to Pro
                        </a>
                        <button onClick={onLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div className="settings-grid">
                {/* Maid Name Setting - Global Admin Only */}
                <div className="setting-card glass-strong">
                    <div className="setting-icon">👸</div>
                    <h2>Maid's Name (Global)</h2>
                    <p className="setting-description">
                        The name your companion uses across all servers
                    </p>

                    <div className="form-group">
                        <input
                            type="text"
                            className="input"
                            value={settings.maidName || 'Seraphina Lumière'}
                            onChange={(e) => handleChange('maidName', e.target.value)}
                            placeholder="Seraphina Lumière"
                        />
                    </div>

                    <div className="preview-box">
                        <span className="preview-label">Preview:</span>
                        <p className="preview-text">
                            "As you wish, Master~ <strong>{settings.maidName || 'Seraphina Lumière'}</strong> shall remind you daily!"
                        </p>
                    </div>
                </div>

                {/* Timezone Setting - Global setting for DM reminders */}
                <div className="setting-card glass-strong">
                    <div className="setting-icon">🕐</div>
                    <h2>Reminder Timezone (Global)</h2>
                    <p className="setting-description">
                        When midnight strikes for daily reminders sent in DMs
                    </p>

                    <div className="form-group">
                        <select
                            className="input"
                            value={settings.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST - India)</option>
                            <option value="America/New_York">America/New_York (EST - US East)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (PST - US West)</option>
                            <option value="Europe/London">Europe/London (GMT - UK)</option>
                            <option value="Europe/Paris">Europe/Paris (CET - Europe)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST - Japan)</option>
                            <option value="Asia/Shanghai">Asia/Shanghai (CST - China)</option>
                            <option value="Australia/Sydney">Australia/Sydney (AEST - Australia)</option>
                        </select>
                    </div>

                    <div className="preview-box">
                        <span className="preview-label">Reminders send at:</span>
                        <p className="preview-text">
                            <strong>12:00 AM</strong> in <strong>{settings.timezone}</strong>
                        </p>
                    </div>
                </div>

                {/* Note about server-specific settings */}
                <div className="setting-card glass-strong">
                    <div className="setting-icon">🏰</div>
                    <h2>Per-Server Settings</h2>
                    <p className="setting-description">
                        Storage channels and learning data are isolated per Discord server
                    </p>

                    <div className="info-box">
                        💡 Server admins configure storage via <code>/setup-storage</code> in Discord
                    </div>

                    <div className="preview-box">
                        <span className="preview-label">How it works:</span>
                        <p className="preview-text">
                            Each server has its own storage channel, learning items, and partnerships. Your data never mixes across servers! 🔒
                        </p>
                    </div>
                </div>

                {/* AI Mode (Phase 2 - Disabled for now) */}
                <div className="setting-card glass-strong disabled">
                    <div className="setting-icon">🤖</div>
                    <h2>AI Mode</h2>
                    <p className="setting-description">
                        Dynamic AI-generated responses (Coming in Phase 2)
                    </p>

                    <div className="toggle-container">
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.aiMode}
                                disabled
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <span className="toggle-label">
                            {settings.aiMode ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    <div className="info-box">
                        💡 Phase 2 feature - Coming soon!
                    </div>
                </div>

                {/* Bot Statistics */}
                <div className="setting-card glass-strong">
                    <div className="setting-icon">📊</div>
                    <h2>Bot Status</h2>
                    <p className="setting-description">
                        Current operational status
                    </p>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Status:</span>
                            <span className="stat-value status-online">● Online</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Maid:</span>
                            <span className="stat-value">{settings.maidName}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Timezone:</span>
                            <span className="stat-value">{settings.timezone}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Storage:</span>
                            <span className="stat-value">
                                {settings.storageChannelId ? '✓ Configured' : '⚠ Not Set'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database & Subscription Management */}
            <div className="settings-grid">
                <div className="settings-card glass">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="icon">💎</span>
                            Subscription Management
                        </h2>
                        <p className="card-subtitle">Grant or revoke Pro subscriptions, Master~</p>
                    </div>

                    <div className="card-content">
                        <div className="form-group">
                            <label>User Discord ID</label>
                            <input
                                type="text"
                                placeholder="1445501186005270538"
                                className="input"
                                value={subUserId}
                                onChange={(e) => setSubUserId(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration</label>
                            <select
                                className="input"
                                value={subDuration}
                                onChange={(e) => setSubDuration(e.target.value)}
                            >
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-success"
                                onClick={handleGrantPro}
                            >
                                💎 Grant Pro
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleRevokePro}
                            >
                                ❌ Revoke Pro
                            </button>
                        </div>

                        <p className="hint-text">
                            💡 User will receive a DM notification
                        </p>
                    </div>
                </div>

                <div className="settings-card glass">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="icon">🗃️</span>
                            Database Management
                        </h2>
                        <p className="card-subtitle danger-text">⚠️ Danger zone - handle with care!</p>
                    </div>

                    <div className="card-content">
                        <button
                            onClick={fetchDbStats}
                            className="btn btn-secondary"
                            style={{ marginBottom: '1rem' }}
                        >
                            📊 View Database Stats
                        </button>

                        {dbStats && (
                            <div className="stats-container" style={{ marginBottom: '1rem' }}>
                                <h3>Database Statistics:</h3>
                                <div className="stats-list">
                                    {Object.entries(dbStats).map(([collection, count]) => (
                                        <div key={collection} className="stat-row">
                                            <span>{collection}:</span>
                                            <span><strong>{count}</strong> documents</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="btn btn-danger"
                        >
                            🗑️ Clear Database (Keep Subscriptions)
                        </button>

                        <p className="hint-text">
                            ⚠️ This will delete all data except Pro subscriptions!
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>⚠️ Clear Database?</h2>
                        <p>This will delete ALL data except Pro subscriptions!</p>
                        <p className="danger-text"><strong>This action cannot be undone, Master~</strong></p>

                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearDatabase}
                                className="btn btn-danger"
                                disabled={isClearing}
                            >
                                {isClearing ? 'Clearing...' : 'Yes, Clear Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="save-section">
                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? '✨' : '❌'} {message.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    className={`btn ${hasChanges ? 'btn-gold' : 'btn-primary'} save-btn`}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? (
                        <>
                            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                            Saving~
                        </>
                    ) : hasChanges ? (
                        <>
                            💾 Save Changes
                        </>
                    ) : (
                        <>
                            ✓ All Saved
                        </>
                    )}
                </button>

                <p className="save-hint">
                    {hasChanges
                        ? "Seraphina awaits your command, Master~"
                        : "All settings are saved, Master ✨"
                    }
                </p>
            </div>
        </div>
    )
}

export default AdminSettings
