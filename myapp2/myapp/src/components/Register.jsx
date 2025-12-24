import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        vehicleNumber: '',
        vehicleType: '',
        phone: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('https://smart-parking-backend-z9ww.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess('Registration successful! Logging you in...');

            // Auto-login with token from registration response
            if (data.token && data.user) {
                login(data.token, data.user);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Register for smart parking</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Vehicle Number</label>
                        <input
                            type="text"
                            name="vehicleNumber"
                            placeholder="e.g., ABC1234"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        >
                            <option value="">Select vehicle type</option>
                            <option value="car">Car</option>
                            <option value="bike">Bike</option>
                            <option value="truck">Truck</option>
                            <option value="van">Van</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    {error && <div className="error-message">⚠️ {error}</div>}
                    {success && <div className="success-message">✅ {success}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={onSwitchToLogin} className="auth-link">
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;
