import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [paymentKey, setPaymentKey] = useState('');

    useEffect(() => {
        fetchUserStats();
        fetchPaymentKey();
    }, []);

    const fetchUserStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/subscription/${getUserId()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUserStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPaymentKey = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/payment-key`);
            const data = await response.json();
            setPaymentKey(data.key);
        } catch (error) {
            console.error('Error fetching payment key:', error);
        }
    };

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    };

    const handleUpgrade = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const userId = getUserId();

            // Create subscription
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            const { subscriptionId } = await response.json();

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: paymentKey, // Dynamically fetched from backend
                    subscription_id: subscriptionId,
                    name: 'Seraphina Lumière',
                    description: 'Pro Subscription - Unlimited Learning',
                    image: '/seraphina-icon.png',
                    handler: async function (response) {
                        // Verify payment
                        try {
                            await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_subscription_id: response.razorpay_subscription_id,
                                    razorpay_signature: response.razorpay_signature,
                                    userId
                                })
                            });
                            navigate('/success');
                        } catch (error) {
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: '',
                        email: '',
                        contact: ''
                    },
                    theme: {
                        color: '#9b59b6'
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
                setLoading(false);
            };
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Failed to start checkout. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="pricing-container">
            <div className="pricing-header">
                <h1>🎀 Choose Your Plan</h1>
                <p>Unlock unlimited learning with Seraphina Pro</p>
            </div>

            {userStats && userStats.isPro && (
                <div className="current-plan-banner">
                    ✨ You're on the Pro plan! Enjoying unlimited learning~
                </div>
            )}

            <div className="pricing-cards">
                {/* Free Tier */}
                <div className="pricing-card">
                    <div className="plan-header">
                        <h2>Free</h2>
                        <div className="price">
                            <span className="currency">₹</span>
                            <span className="amount">0</span>
                            <span className="period">/forever</span>
                        </div>
                    </div>

                    <ul className="features">
                        <li className="included">✅ 25 learning items</li>
                        <li className="included">✅ All reminder frequencies</li>
                        <li className="included">✅ Basic commands</li>
                        <li className="included">✅ Discord integration</li>
                        <li className="excluded">❌ Ads included</li>
                        <li className="excluded">❌ No partner features</li>
                        <li className="excluded">❌ No archive system</li>
                    </ul>

                    <button className="plan-button current" disabled>
                        Current Plan
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="pricing-card featured">
                    <div className="popular-badge">Most Popular</div>
                    <div className="plan-header">
                        <h2>Pro</h2>
                        <div className="price">
                            <span className="currency">₹</span>
                            <span className="amount">399</span>
                            <span className="period">/month</span>
                        </div>
                    </div>

                    <ul className="features">
                        <li className="included">✅ Unlimited learning items</li>
                        <li className="included">✅ No ads</li>
                        <li className="included">✅ Partner system</li>
                        <li className="included">✅ Archive features</li>
                        <li className="included">✅ Priority support</li>
                        <li className="included">✅ Future AI features</li>
                        <li className="included">✅ Export data</li>
                    </ul>

                    <button
                        className="plan-button upgrade"
                        onClick={handleUpgrade}
                        disabled={loading || (userStats && userStats.isPro)}
                    >
                        {loading ? 'Processing...' : userStats && userStats.isPro ? '✓ Active' : 'Upgrade Now'}
                    </button>
                    <p className="guarantee">💳 Secure payment via Razorpay</p>
                </div>

                {/* Enterprise Tier */}
                <div className="pricing-card">
                    <div className="plan-header">
                        <h2>Enterprise</h2>
                        <div className="price">
                            <span className="currency">₹</span>
                            <span className="amount">2,999</span>
                            <span className="period">/month</span>
                        </div>
                    </div>

                    <ul className="features">
                        <li className="included">✅ Everything in Pro</li>
                        <li className="included">✅ Custom branding</li>
                        <li className="included">✅ Premium support 24/7</li>
                        <li className="included">✅ Custom integrations</li>
                        <li className="included">✅ Dedicated server</li>
                        <li className="included">✅ SLA guarantee</li>
                    </ul>

                    <button className="plan-button contact">
                        Contact Sales
                    </button>
                </div>
            </div>

            <div className="pricing-faq">
                <h2>💬 Frequently Asked Questions</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>Can I cancel anytime?</h3>
                        <p>Yes! Cancel anytime from your dashboard. You'll keep Pro access until the end of your billing period.</p>
                    </div>
                    <div className="faq-item">
                        <h3>What payment methods do you accept?</h3>
                        <p>We accept UPI, Credit/Debit Cards, Netbanking, and all major wallets via Razorpay.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Is my payment secure?</h3>
                        <p>Absolutely! All payments are processed by Razorpay with bank-level encryption.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Do you offer refunds?</h3>
                        <p>Yes, full refund within 7 days if you're not satisfied. No questions asked!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
