// API base configuration
const API_BASE_URL = 'https://smart-parking-backend-z9ww.onrender.com/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// Fetch all slots
export const fetchSlots = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/slots/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slots');
        }

        const data = await response.json();
        return data.slots;
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw error;
    }
};

// Create a booking
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create booking');
        }

        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

// Get user's bookings
export const getMyBookings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL} /bookings/my - bookings`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

// ============ ADMIN API FUNCTIONS ============

// Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL} /admin/users`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Create a new slot (admin only)
export const createSlot = async (slotData) => {
    try {
        const response = await fetch(`${API_BASE_URL} /admin/create - slot`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(slotData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create slot');
        }

        return data;
    } catch (error) {
        console.error('Error creating slot:', error);
        throw error;
    }
};

// Get all bookings (admin only)
export const getAllBookings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL} /bookings/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch all bookings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

// Get analytics (admin only)
export const getAnalytics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL} /analytics/dashboard`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch analytics');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

