import React, { useState, useEffect } from 'react';
import { getAllUsers, createSlot, getAllBookings, fetchSlots, getAnalytics, deleteSlot } from '../api';
import AdminAnalytics from '../components/AdminAnalytics';
import RecentActivity from '../components/RecentActivity';
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
    const [newSlotSection, setNewSlotSection] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newArea, setNewArea] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('');
    const [newPlaceType, setNewPlaceType] = useState('Shopping Mall');
    const [isAvailable, setIsAvailable] = useState(true);
    const [selectedSection, setSelectedSection] = useState('All');

    // UI Toggles
    const [showCoordinates, setShowCoordinates] = useState(false);

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
                section: newSlotSection || 'General',
                isAvailable: isAvailable,
                city: newCity || 'Hyderabad',
                area: newArea || 'Madhapur',
                address: newAddress || 'Smart Parking Complex',
                placeType: newPlaceType,
                latitude: newLatitude || null,
                longitude: newLongitude || null
            });

            setSuccess(`Slot ${newSlotNumber} created successfully!`);
            setNewSlotNumber('');
            setNewSlotSection('');
            setNewCity('');
            setNewArea('');
            setNewAddress('');
            setNewLatitude('');
            setNewLongitude('');
            setNewPlaceType('Shopping Mall');
            setIsAvailable(true);

            // Reload slots
            const slotsData = await fetchSlots();
            setSlots(slotsData);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;
        try {
            await deleteSlot(slotId);
            setSuccess('Slot deleted successfully');
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
                    <div className="dashboard-overview">
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
                        <RecentActivity />
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
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Slot ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., A1"
                                            value={newSlotNumber}
                                            onChange={(e) => setNewSlotNumber(e.target.value)}
                                            required
                                            className="slot-input"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Floor/Section</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Level 1"
                                            value={newSlotSection}
                                            onChange={(e) => setNewSlotSection(e.target.value)}
                                            className="slot-input"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Hyderabad"
                                            value={newCity}
                                            onChange={(e) => setNewCity(e.target.value)}
                                            className="slot-input"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Area</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Madhapur"
                                            value={newArea}
                                            onChange={(e) => setNewArea(e.target.value)}
                                            className="slot-input"
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Detailed Address (Location Name)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Inorbit Mall, Main Entrance"
                                            value={newAddress}
                                            onChange={(e) => setNewAddress(e.target.value)}
                                            className="slot-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-secondary">
                                    <div className="input-group">
                                        <label>Place Type</label>
                                        <select
                                            value={newPlaceType}
                                            onChange={(e) => setNewPlaceType(e.target.value)}
                                            className="slot-input"
                                        >
                                            <option value="Shopping Mall">Shopping Mall</option>
                                            <option value="Cinema">Cinema</option>
                                            <option value="Hospital">Hospital</option>
                                            <option value="Metro Station">Metro Station</option>
                                            <option value="Market">Market</option>
                                            <option value="Office Complex">Office Complex</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Airport">Airport</option>
                                            <option value="Railway Station">Railway Station</option>
                                        </select>
                                    </div>

                                    <div className="status-toggle">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={isAvailable}
                                                onChange={(e) => setIsAvailable(e.target.checked)}
                                            />
                                            <span>Initially Available</span>
                                        </label>
                                    </div>

                                    <button type="submit" className="create-btn">
                                        Create Slot
                                    </button>
                                </div>

                                <div className="gps-toggle-section">
                                    <label className="checkbox-label gps-toggle">
                                        <input
                                            type="checkbox"
                                            checked={showCoordinates}
                                            onChange={(e) => setShowCoordinates(e.target.checked)}
                                        />
                                        <span>Set Precise GPS Position (Optional)</span>
                                    </label>
                                </div>
                                {showCoordinates && (
                                    <div className="gps-inputs anim-fade-in">
                                        <div className="input-group">
                                            <label>Latitude</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 17.516"
                                                value={newLatitude}
                                                onChange={(e) => setNewLatitude(e.target.value)}
                                                className="slot-input"
                                                step="0.000001"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Longitude</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 78.3456"
                                                value={newLongitude}
                                                onChange={(e) => setNewLongitude(e.target.value)}
                                                className="slot-input"
                                                step="0.000001"
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="table-container">
                            <div className="table-header-row">
                                <h3>All Parking Slots</h3>
                                <div className="filter-group">
                                    <label>Filter by Location:</label>
                                    <select
                                        className="admin-filter-select"
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                    >
                                        <option value="All">-- All Locations --</option>
                                        {[...new Set(slots.map(s => s.city || 'Hyderabad'))].sort().map(city => (
                                            <optgroup key={city} label={city}>
                                                {[...new Set(slots.filter(s => (s.city || 'Hyderabad') === city).map(s => s.address || 'Smart Parking Complex'))].map(address => {
                                                    const count = slots.filter(s => (s.address || 'Smart Parking Complex') === address).length;
                                                    const placeType = slots.find(s => (s.address || 'Smart Parking Complex') === address)?.placeType || 'General';
                                                    return (
                                                        <option key={address} value={address}>
                                                            {address} ({placeType}) - {count} slots
                                                        </option>
                                                    );
                                                })}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Slot Number</th>
                                        <th>Location</th>
                                        <th>City / Area</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots
                                        .filter(slot => selectedSection === 'All' || (slot.address || 'Smart Parking Complex') === selectedSection)
                                        .map(slot => (
                                            <tr key={slot._id}>
                                                <td>{slot.slotNumber}</td>
                                                <td>{slot.address || 'Smart Parking Complex'} ({slot.section || 'General'})</td>
                                                <td>{slot.city || 'Hyderabad'}, {slot.area || 'Madhapur'}</td>
                                                <td>
                                                    <span className={`status-badge ${slot.isAvailable ? 'available' : 'booked'}`}>
                                                        {slot.isAvailable ? 'Available' : 'Booked'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteSlot(slot._id)}
                                                    >
                                                        Delete
                                                    </button>
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
                    <div className="bookings-section">
                        {/* Current Bookings */}
                        <div className="table-container">
                            <h3>🟢 Current Bookings</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Slot</th>
                                        <th>Vehicle</th>
                                        <th>Start Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.filter(b => b.status === 'BOOKED').length === 0 ? (
                                        <tr><td colSpan="5" className="empty-state">No active bookings</td></tr>
                                    ) : (
                                        bookings.filter(b => b.status === 'BOOKED').map(booking => (
                                            <tr key={booking._id}>
                                                <td>{booking.user?.name || 'N/A'}</td>
                                                <td>{booking.slot?.slotNumber || 'N/A'} ({booking.slot?.section || 'General'})</td>
                                                <td>{booking.vehicleNumber}</td>
                                                <td>{formatDate(booking.startTime)}</td>
                                                <td>
                                                    <span className="status-badge booked">Active</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Booking History */}
                        <div className="table-container" style={{ marginTop: '40px' }}>
                            <h3>📜 Booking History</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Slot</th>
                                        <th>Vehicle</th>
                                        <th>Duration</th>
                                        <th>End Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.filter(b => b.status !== 'BOOKED').length === 0 ? (
                                        <tr><td colSpan="6" className="empty-state">No booking history</td></tr>
                                    ) : (
                                        bookings.filter(b => b.status !== 'BOOKED').map(booking => (
                                            <tr key={booking._id}>
                                                <td>{booking.user?.name || 'N/A'}</td>
                                                <td>{booking.slot?.slotNumber || 'N/A'}</td>
                                                <td>{booking.vehicleNumber}</td>
                                                <td>{booking.actualDuration ? `${Math.round(booking.actualDuration)} mins` : '-'}</td>
                                                <td>{formatDate(booking.endTime)}</td>
                                                <td>
                                                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                                .filter(([slot]) => slot !== 'Unknown' && slot !== 'null' && slot !== 'undefined')
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

                                {/* New Visual Analytics Charts */}
                                <AdminAnalytics data={analytics} />

                                <div className="analytics-note">
                                    ℹ️ Analytics powered by Java Spring Boot microservice & Node.js
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
