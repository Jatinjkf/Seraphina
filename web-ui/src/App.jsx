import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './config';
import Login from './pages/Login';
import AdminSettings from './pages/AdminSettings';
import ServerStats from './pages/ServerStats';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user has token
        const token = localStorage.getItem('adminToken');
        if (token) {
            // Verify token
            verifyToken(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.valid && data.isAdmin) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (token) => {
        localStorage.setItem('adminToken', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="maid-quote">Seraphina is preparing the chamber~</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/success" element={<Success />} />
                    <Route
                        path="/admin"
                        element={
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
