import React, { useState, useEffect } from 'react';
import { getAllUsers, createSlot, getAllBookings, fetchSlots, getAnalytics } from '../api';
import './AdminDashboard.css';

const AdminDashboard = ({ onSwitchToUserView }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [users, setUsers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Slot creation form
    const [newSlotNumber, setNewSlotNumber] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // Statistics
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0
    });

    // Analytics from Java service
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Load data based on active tab
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'stats' || activeTab === 'slots') {
                const slotsData = await fetchSlots();
                setSlots(slotsData);

                const available = slotsData.filter(s => s.isAvailable).length;
                setStats(prev => ({
                    ...prev,
                    totalSlots: slotsData.length,
                    availableSlots: available,
                    bookedSlots: slotsData.length - available
                }));
            }

            if (activeTab === 'stats' || activeTab === 'users') {
                const usersData = await getAllUsers();
                setUsers(usersData);
                setStats(prev => ({ ...prev, totalUsers: usersData.length }));
            }

            if (activeTab === 'bookings') {
                const bookingsData = await getAllBookings();
                setBookings(bookingsData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        setError('');
        try {
            const analyticsData = await getAnalytics();
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Analytics error:', err);
            setError(err.message || 'Failed to load analytics. Please ensure Java service is running.');
            // Set empty analytics to prevent display errors
            setAnalytics({
                totalBookings: 0,
                activeBookings: 0,
                completedBookings: 0,
                totalRevenue: 0,
                averageDuration: 0,
                peakHour: 'N/A',
                slotUsage: {}
            });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await createSlot({
                slotNumber: newSlotNumber,
                isBooked: !isAvailable
            });

            setSuccess(`Slot ${newSlotNumber} created successfully!`);
            setNewSlotNumber('');
            setIsAvailable(true);

            // Reload slots
            const slotsData = await fetchSlots();
            setSlots(slotsData);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>🛡️ Admin Dashboard</h2>
                <button onClick={onSwitchToUserView} className="switch-view-btn">
                    Switch to User View
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    📊 Statistics
                </button>
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Users
                </button>
                <button
                    className={`tab ${activeTab === 'slots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('slots')}
                >
                    🅿️ Slots
                </button>
                <button
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    📋 Bookings
                </button>
                <button
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('analytics'); loadAnalytics(); }}
                >
                    📈 Analytics
                </button>
            </div>

            {/* Content Area */}
            <div className="admin-content">
                {loading && <div className="loading">Loading...</div>}
                {error && <div className="error-msg">⚠️ {error}</div>}
                {success && <div className="success-msg">✅ {success}</div>}

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{stats.totalUsers}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🅿️</div>
                            <div className="stat-value">{stats.totalSlots}</div>
                            <div className="stat-label">Total Slots</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon">✅</div>
                            <div className="stat-value">{stats.availableSlots}</div>
                            <div className="stat-label">Available</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-icon">🚫</div>
                            <div className="stat-value">{stats.bookedSlots}</div>
                            <div className="stat-label">Booked</div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && !loading && (
                    <div className="table-container">
                        <h3>Registered Users</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Vehicle Number</th>
                                    <th>Vehicle Type</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.vehicleNumber}</td>
                                        <td>{user.vehicleType}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Slots Tab */}
                {activeTab === 'slots' && !loading && (
                    <div className="slots-section">
                        <div className="create-slot-form">
                            <h3>Create New Slot</h3>
                            <form onSubmit={handleCreateSlot}>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Slot Number (e.g., A1, B2)"
                                        value={newSlotNumber}
                                        onChange={(e) => setNewSlotNumber(e.target.value)}
                                        required
                                        className="slot-input"
                                    />
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                        />
                                        Available
                                    </label>
                                    <button type="submit" className="create-btn">
                                        Create Slot
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="table-container">
                            <h3>All Parking Slots</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Slot Number</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots.map(slot => (
                                        <tr key={slot._id}>
                                            <td>{slot.slotNumber}</td>
                                            <td>
                                                <span className={`status-badge ${slot.isAvailable ? 'available' : 'booked'}`}>
                                                    {slot.isAvailable ? 'Available' : 'Booked'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && !loading && (
                    <div className="table-container">
                        <h3>All Bookings</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Slot</th>
                                    <th>Vehicle</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>{booking.user?.name || 'N/A'}</td>
                                        <td>{booking.slot?.slotNumber || 'N/A'}</td>
                                        <td>{booking.vehicleNumber}</td>
                                        <td>{formatDate(booking.startTime)}</td>
                                        <td>{formatDate(booking.endTime)}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="analytics-section">
                        {analyticsLoading && <div className="loading">Loading analytics from Java service...</div>}
                        {analytics && (
                            <>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">📊</div>
                                        <div className="stat-value">{analytics.totalBookings}</div>
                                        <div className="stat-label">Total Bookings</div>
                                    </div>
                                    <div className="stat-card green">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-value">{analytics.activeBookings}</div>
                                        <div className="stat-label">Active Bookings</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">💰</div>
                                        <div className="stat-value">₹{analytics.totalRevenue.toFixed(2)}</div>
                                        <div className="stat-label">Total Revenue</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">⏱️</div>
                                        <div className="stat-value">{analytics.averageDuration.toFixed(1)}h</div>
                                        <div className="stat-label">Avg Duration</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">⏰</div>
                                        <div className="stat-value">{analytics.peakHour}</div>
                                        <div className="stat-label">Peak Hour</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">✔️</div>
                                        <div className="stat-value">{analytics.completedBookings}</div>
                                        <div className="stat-label">Completed</div>
                                    </div>
                                </div>

                                {analytics.slotUsage && Object.keys(analytics.slotUsage).length > 0 && (
                                    <div className="slot-usage-section">
                                        <h3>Slot Usage Statistics</h3>
                                        <div className="slot-usage-grid">
                                            {Object.entries(analytics.slotUsage)
                                                .sort((a, b) => b[1] - a[1])
                                                .slice(0, 10)
                                                .map(([slot, count]) => (
                                                    <div key={slot} className="slot-usage-item">
                                                        <span className="slot-name">{slot}</span>
                                                        <div className="usage-bar-container">
                                                            <div
                                                                className="usage-bar"
                                                                style={{ width: `${(count / Math.max(...Object.values(analytics.slotUsage))) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="usage-count">{count} bookings</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                <div className="analytics-note">
                                    ℹ️ Analytics powered by Java Spring Boot microservice
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
