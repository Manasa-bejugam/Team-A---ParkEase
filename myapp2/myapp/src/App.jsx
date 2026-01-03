import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Login from "./components/Login";
import Register from "./components/Register";
import SlotList from "./pages/SlotList";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./pages/AdminDashboard";
import ParkingMap from "./components/ParkingMap";
import BottomNav from "./components/BottomNav";
import MyBookings from "./components/MyBookings";
import MyPayments from "./components/MyPayments";
import LocationFilter from "./components/LocationFilter";
import { fetchSlots, getMyBookings } from "./api";
import { useSocket } from "./hooks/useSocket";
import { API_BASE_URL } from "./config";
import AvailableSlotsGrid from "./components/AvailableSlotsGrid";
import "./App.css";
import "./styles/profile.css";
import "./styles/edit-profile.css";

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      style={{
        background: 'transparent',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0 10px',
        transition: 'transform 0.3s ease'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// Profile Content Component with Real-time Stats
const ProfileContent = ({ user }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    loading: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    vehicleNumber: user?.vehicleNumber || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        vehicleNumber: user.vehicleNumber || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const bookings = await getMyBookings();

      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b => b.parkingStatus === 'CHECKED_IN').length;
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const totalSpent = bookings
        .filter(b => b.payment?.status === 'completed')
        .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

      setStats({
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ text: '', type: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current user data
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      vehicleNumber: user?.vehicleNumber || '',
      phone: user?.phone || ''
    });
    setMessage({ text: '', type: '' });
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...editForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ text: '✓ Profile updated successfully!', type: 'success' });

      setTimeout(() => {
        setIsEditing(false);
        window.location.reload(); // Refresh to show updated data
      }, 1500);

    } catch (error) {
      setMessage({ text: `✗ ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className={`role-badge ${user?.role}`}>
              {user?.role === 'admin' ? '🛡️ Admin' : '👤 User'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{stats.loading ? '...' : stats.totalBookings}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <span className="stat-value">{stats.loading ? '...' : stats.activeBookings}</span>
            <span className="stat-label">Active Parkings</span>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.loading ? '...' : stats.completedBookings}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card money">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-value">₹{stats.loading ? '...' : stats.totalSpent.toFixed(2)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="profile-details-grid">
        <div className="profile-info-card">
          <div className="info-card-icon">📱</div>
          <div className="info-card-content">
            <span className="info-label">Phone Number</span>
            <span className="info-value">{user?.phone || 'Not provided'}</span>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="info-card-icon">🚗</div>
          <div className="info-card-content">
            <span className="info-label">Vehicle Number</span>
            <span className="info-value">{user?.vehicleNumber || 'Not provided'}</span>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="info-card-icon">📅</div>
          <div className="info-card-content">
            <span className="info-label">Last Booking</span>
            <span className="info-value">
              {stats.loading ? '...' : stats.totalBookings > 0 ? 'Recently' : 'No bookings yet'}
            </span>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="info-card-icon">🎉</div>
          <div className="info-card-content">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              }) : 'Dec 2025'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="profile-action-btn edit-btn" onClick={handleEditClick}>
          ✏️ Edit Profile
        </button>
        <button className="profile-action-btn settings-btn" onClick={() => setIsSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>✏️ Edit Profile</h3>
              <button className="close-btn" onClick={handleCancelEdit}>✕</button>
            </div>

            <div className="edit-modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={editForm.vehicleNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter vehicle number"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              {message.text && (
                <div className={`edit-message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="edit-modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="modal-btn save-btn"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>⚙️ Settings</h3>
              <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>✕</button>
            </div>

            <div className="edit-modal-body">
              <div className="settings-section">
                <h4>Account Information</h4>
                <div className="settings-info">
                  <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                  <p><strong>Account Type:</strong> {user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Registration Date:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="settings-section">
                <h4>Preferences</h4>
                <div className="settings-option">
                  <label className="settings-label">
                    <input type="checkbox" defaultChecked />
                    <span>Email Notifications</span>
                  </label>
                  <p className="settings-desc">Receive booking confirmations and updates via email</p>
                </div>
                <div className="settings-option">
                  <label className="settings-label">
                    <input type="checkbox" defaultChecked />
                    <span>SMS Alerts</span>
                  </label>
                  <p className="settings-desc">Get text messages for important parking updates</p>
                </div>
              </div>

              <div className="settings-section danger-zone">
                <h4>Danger Zone</h4>
                <p className="danger-text">These actions cannot be undone</p>
                <button className="danger-btn">
                  🗑️ Delete Account
                </button>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setIsSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// User Dashboard Component (protected)
const UserDashboard = () => {
  const [slots, setSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]); // Store all slots
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [notification, setNotification] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(''); // Location filter by slot ID
  const { user, logout } = useAuth();
  const { isConnected, onSlotUpdate, onBookingCreated } = useSocket();

  // Fetch slots from backend
  useEffect(() => {
    loadSlots();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    // Listen for slot updates
    onSlotUpdate((updatedSlot) => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === updatedSlot._id ? updatedSlot : slot
        )
      );

      // Show notification
      showNotification(`Slot ${updatedSlot.slotNumber} ${updatedSlot.isAvailable ? 'is now available' : 'was just booked'}!`);
    });

    // Listen for booking notifications
    onBookingCreated((booking) => {
      showNotification(`${booking.userName} just booked slot ${booking.slotNumber}!`);
      // Reload slots to get latest data
      loadSlots();
    });
  }, [onSlotUpdate, onBookingCreated]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const slotsData = await fetchSlots();
      setAllSlots(slotsData);
      setSlots(slotsData); // Show all slots by default for the map
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots by location (address)
  const handleLocationChange = (address) => {
    setSelectedLocation(address);
    if (address === '') {
      setSlots(allSlots); // Show all slots
    } else {
      const filtered = allSlots.filter(slot => slot.address === address);
      setSlots(filtered);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000); // Hide after 5 seconds
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setActiveTab('book'); // Switch to book tab when selecting from map
  };

  const handleBookingSuccess = () => {
    // Reload slots after successful booking
    loadSlots();
    setSelectedSlot(null);
  };

  return (
    <div className="App app-with-bottom-nav">
      {/* Header with user info and logout */}
      <header className="app-header">
        <h1>🚗 Smart Parking System</h1>
        <div className="user-info">
          <ThemeToggle />
          <span>Welcome, {user?.name}!</span>
          {isConnected && <span className="live-indicator">🟢 Live</span>}
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Real-time notification banner */}
      {notification && (
        <div className="notification-banner">
          <span>🔔 {notification}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading parking slots...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-container">
          <p>⚠️ Error: {error}</p>
          <button onClick={loadSlots} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Main content - Tab based */}
      {!loading && !error && (
        <>
          {/* MAP TAB */}
          {activeTab === 'map' && (
            <div className="dashboard-split-view">
              <div className="map-section">
                {/* Location Filter above map */}
                <div style={{ marginBottom: '15px' }}>
                  <LocationFilter
                    slots={allSlots}
                    selectedLocation={selectedLocation}
                    onLocationChange={handleLocationChange}
                  />
                </div>
                <ParkingMap
                  slots={slots}
                  onSelectSlot={handleSelectSlot}
                />
              </div>
              <div className="side-panel">
                <AvailableSlotsGrid slots={allSlots} />
              </div>
            </div>
          )}

          {/* BOOK TAB */}
          {activeTab === 'book' && (
            <div className="tab-content">
              <div className="booking-container-layout">
                <div className="filter-section">
                  <LocationFilter
                    slots={allSlots}
                    selectedLocation={selectedLocation}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                <div className="booking-form-section">
                  {selectedSlot ? (
                    <div className="booking-form-wrapper">
                      <h3>🅿️ Booking Slot {selectedSlot.slotNumber}</h3>
                      <BookingForm
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onBookingSuccess={handleBookingSuccess}
                      />
                    </div>
                  ) : (
                    <div className="no-slot-selected">
                      <h3>👈 Select a Parking Spot</h3>
                      <p>Pick a location above and select a slot from the list below:</p>
                      <SlotList slots={slots} onSelect={handleSelectSlot} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="tab-content">
              <MyBookings />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="tab-content">
              <MyPayments />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content profile-tab">
              <ProfileContent user={user} />
            </div>
          )}

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
};

// Main Dashboard Component - Role-based routing
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'admin', 'user'

  // Determine which view to show
  const isAdmin = user?.role === 'admin';
  const showAdminView = viewMode === 'admin' || (viewMode === 'auto' && isAdmin);

  return (
    <div className="App">
      {showAdminView ? (
        <>
          <header className="app-header">
            <h1>🚗 Smart Parking System</h1>
            <div className="user-info">
              <ThemeToggle />
              <span>Admin: {user?.name}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </header>
          <AdminDashboard onSwitchToUserView={() => setViewMode('user')} />
        </>
      ) : (
        <>
          {isAdmin && (
            <div className="view-switcher">
              <button
                onClick={() => setViewMode('admin')}
                className="admin-switch-btn"
              >
                🛡️ Switch to Admin View
              </button>
            </div>
          )}
          <UserDashboard />
        </>
      )}
    </div>
  );
};

// Auth Wrapper Component
const AuthWrapper = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return showLogin ? (
      <Login onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <Register onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return <Dashboard />;
};

// Root App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
