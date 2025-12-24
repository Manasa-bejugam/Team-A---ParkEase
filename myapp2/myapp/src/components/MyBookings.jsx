import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../api';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await getMyBookings();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bookings-container">
                <h2>📋 My Bookings</h2>
                <div className="loading">Loading your bookings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bookings-container">
                <h2>📋 My Bookings</h2>
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="bookings-container">
            <h2>📋 My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>No bookings yet. Book a slot to get started!</p>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <span className="slot-badge">
                                    🅿️ Slot {booking.slot?.slotNumber || 'N/A'}
                                </span>
                                <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                                    {booking.status || 'BOOKED'}
                                </span>
                            </div>

                            <div className="booking-location">
                                📍 {booking.slot?.address || 'Location not available'}
                            </div>

                            <div className="booking-details">
                                <div className="detail-row">
                                    <span className="label">🚗 Vehicle:</span>
                                    <span className="value">{booking.vehicleNumber}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">⏰ Start:</span>
                                    <span className="value">{formatDate(booking.startTime)}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">⏱️ End:</span>
                                    <span className="value">{formatDate(booking.endTime)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
