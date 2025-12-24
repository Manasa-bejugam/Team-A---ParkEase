import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import { fetchSlots } from "./api";
import { useSocket } from "./hooks/useSocket";
import "./App.css";

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
      setSlots([]); // Start with no slots visible - user must select location
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
      setSlots([]); // No location selected = no slots shown
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
    setActiveTab('slots'); // Switch to slots tab when selecting from map
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
          {/* Location Filter - Show on map and slots tabs */}
          {(activeTab === 'map' || activeTab === 'slots') && allSlots.length > 0 && (
            <LocationFilter
              slots={allSlots}
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
            />
          )}

          {activeTab === 'map' && (
            <ParkingMap slots={slots} onSelectSlot={handleSelectSlot} />
          )}

          {activeTab === 'slots' && (
            <>
              <SlotList slots={slots} onSelect={handleSelectSlot} />
              <BookingForm
                slots={slots}
                selectedSlot={selectedSlot}
                onBookingSuccess={handleBookingSuccess}
              />
            </>
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
            <div className="tab-content">
              <div className="profile-card">
                <h2>👤 Profile</h2>
                <div className="profile-info">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Vehicle:</strong> {user?.vehicleNumber}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                </div>
              </div>
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
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;
