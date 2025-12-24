import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://smart-parking-backend-z9ww.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            login(data.token, data.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to your parking account</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email or Vehicle Number</label>
                        <input
                            type="text"
                            placeholder="Enter email or vehicle number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {error && <div className="error-message">⚠️ {error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <span onClick={onSwitchToRegister} className="auth-link">
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
