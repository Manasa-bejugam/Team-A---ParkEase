import React from 'react';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <nav className="bottom-nav">
            <button
                className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => onTabChange('map')}
            >
                <span className="nav-icon">🗺️</span>
                <span className="nav-label">Map</span>
            </button>

            <button
                className={`nav-item ${activeTab === 'slots' ? 'active' : ''}`}
                onClick={() => onTabChange('slots')}
            >
                <span className="nav-icon">🅿️</span>
                <span className="nav-label">Slots</span>
            </button>

            <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => onTabChange('bookings')}
            >
                <span className="nav-icon">📋</span>
                <span className="nav-label">Bookings</span>
            </button>

            <button
                className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => onTabChange('payments')}
            >
                <span className="nav-icon">💳</span>
                <span className="nav-label">Payments</span>
            </button>

            <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => onTabChange('profile')}
            >
                <span className="nav-icon">👤</span>
                <span className="nav-label">Profile</span>
            </button>
        </nav>
    );
};

export default BottomNav;
