import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="success-container">
            <div className="success-card">
                <div className="success-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="40" fill="#10b981" />
                        <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1>🎉 Welcome to Seraphina Pro!</h1>
                <p className="success-message">
                    Your subscription has been activated successfully!
                </p>

                <div className="benefits">
                    <h2>✨ What you've unlocked:</h2>
                    <ul>
                        <li>💎 Unlimited learning items</li>
                        <li>🎀 Ad-free experience</li>
                        <li>👥 Partner system access</li>
                        <li>📦 Archive features</li>
                        <li>🌟 Priority support</li>
                        <li>🤖 Future AI enhancements</li>
                    </ul>
                </div>

                <div className="next-steps">
                    <h3>🚀 Next Steps:</h3>
                    <ol>
                        <li>Head to your Discord server</li>
                        <li>Use <code>/upload</code> to add unlimited items</li>
                        <li>Enjoy an ad-free experience!</li>
                    </ol>
                </div>

                <div className="action-buttons">
                    <button
                        className="dashboard-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </button>
                    <button
                        className="secondary-button"
                        onClick={() => window.open('https://discord.com', '_blank')}
                    >
                        Open Discord
                    </button>
                </div>

                <p className="redirect-notice">
                    Redirecting to dashboard in 5 seconds...
                </p>
            </div>
        </div>
    );
};

export default Success;
