import { useState } from 'react'
import { API_URL } from '../config'
import './Login.css'

function Login({ onLogin }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (data.success) {
                onLogin(data.token)
            } else {
                setError(data.error || 'Invalid password')
            }
        } catch (error) {
            setError('Failed to login. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container fade-in">
            <div className="login-card glass-strong">
                <div className="ribbon">
                    ✨ Seraphina Lumière's Chamber ✨
                </div>

                <div className="login-header">
                    <h1>🎀 Welcome, dear Master~</h1>
                    <p className="maid-quote">
                        Please present your credentials to enter
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="password">🔐 Admin Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            ❌ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={isLoading || !password}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                                Verifying~
                            </>
                        ) : (
                            <>
                                🎀 Enter Chamber
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Seraphina awaits your command, Master~ ✨</p>
                </div>
            </div>
        </div>
    )
}

export default Login
