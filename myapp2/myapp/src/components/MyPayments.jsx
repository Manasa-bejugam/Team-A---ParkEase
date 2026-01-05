import React, { useState, useEffect } from 'react';
import './MyPayments.css';

const MyPayments = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            // Ensure data is an array
            if (Array.isArray(data)) {
                setBookings(data);
            } else if (data && Array.isArray(data.bookings)) {
                setBookings(data.bookings);
            } else {
                console.error('Invalid bookings data:', data);
                setBookings([]);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const calculatePayment = (booking) => {
        console.log('Calculating payment for booking:', {
            id: booking._id,
            parkingStatus: booking.parkingStatus,
            actualDuration: booking.actualDuration,
            actualEntryTime: booking.actualEntryTime,
            paymentAmount: booking.payment?.amount
        });

        // If booking has been checked out, use actual duration and payment amount
        if (booking.parkingStatus === 'CHECKED_OUT' && booking.actualDuration) {
            const hours = (booking.actualDuration / 60).toFixed(2);
            const amount = booking.payment?.amount || 0;
            console.log('Using CHECKED_OUT data:', { hours, amount });
            return { hours, amount: amount.toFixed(2) };
        }

        // If checked in but not checked out, calculate current usage
        if (booking.parkingStatus === 'CHECKED_IN' && booking.actualEntryTime) {
            const now = new Date();
            const entryTime = new Date(booking.actualEntryTime);
            const minutes = Math.abs(now - entryTime) / 60000; // milliseconds to minutes
            const hours = (minutes / 60).toFixed(2);
            // Calculate fee based on 15-minute intervals (₹5 per 15 min)
            const roundedMinutes = Math.ceil(minutes / 15) * 15;
            const amount = (roundedMinutes / 15) * 5;
            console.log('Using CHECKED_IN data:', { minutes, hours, amount });
            return { hours, amount: amount.toFixed(2) };
        }

        // For scheduled bookings or fallback, show booked duration
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        const hours = Math.abs(end - start) / 36e5; // milliseconds to hours
        const amount = hours * 20; // ₹20 per hour
        console.log('Using SCHEDULED/fallback data:', { hours, amount, parkingStatus: booking.parkingStatus });
        return { hours: hours.toFixed(2), amount: amount.toFixed(2) };
    };

    const handlePayNow = (booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const processPayment = async (method) => {
        try {
            const token = localStorage.getItem('token');
            const payment = calculatePayment(selectedBooking);

            const response = await fetch('http://localhost:5000/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId: selectedBooking._id,
                    amount: parseFloat(payment.amount),
                    method: method
                })
            });

            if (response.ok) {
                alert('Payment successful!');
                setShowPaymentModal(false);
                loadBookings(); // Refresh to show updated payment status
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    if (loading) {
        return <div className="payments-loading">Loading payments...</div>;
    }

    return (
        <div className="my-payments-container">
            <h2>💳 My Payments</h2>

            {bookings.length === 0 ? (
                <div className="no-payments">
                    <p>No bookings yet. Book a slot to see payments here!</p>
                </div>
            ) : (
                <div className="payments-list">
                    {bookings.map((booking) => {
                        const payment = calculatePayment(booking);
                        const isPaid = booking.paymentStatus === 'PAID';

                        return (
                            <div key={booking._id} className="payment-card">
                                <div className="payment-header">
                                    <span className="slot-number">Slot {booking.slot?.slotNumber || 'N/A'}</span>
                                    <span className={`payment-status ${isPaid ? 'paid' : 'pending'}`}>
                                        {isPaid ? '✅ Paid' : '⏳ Pending'}
                                    </span>
                                </div>

                                <div className="payment-location">
                                    📍 {booking.slot?.address || 'Location not available'} • {booking.slot?.city || ''}
                                </div>

                                <div className="payment-details">
                                    <div className="detail-row">
                                        <span>🚗 Vehicle:</span>
                                        <span>{booking.vehicleNumber}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>📅 Date:</span>
                                        <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>⏰ Time:</span>
                                        <span>
                                            {new Date(booking.startTime).toLocaleTimeString()} -
                                            {new Date(booking.endTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span>⏱️ Duration (Actual):</span>
                                        <span>{payment.hours} hours</span>
                                    </div>
                                    <div className="detail-row amount-row">
                                        <span>💰 Amount:</span>
                                        <span className="amount">₹{payment.amount}</span>
                                    </div>
                                </div>

                                {!isPaid && (
                                    <button
                                        className="pay-now-btn"
                                        onClick={() => handlePayNow(booking)}
                                    >
                                        Pay Now
                                    </button>
                                )}

                                {isPaid && booking.paymentMethod && (
                                    <div className="payment-method-info">
                                        Paid via {booking.paymentMethod.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedBooking && (
                <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Select Payment Method</h3>
                        <div className="payment-amount-display">
                            <span>Amount to Pay:</span>
                            <span className="modal-amount">₹{calculatePayment(selectedBooking).amount}</span>
                        </div>

                        <div className="payment-methods-grid">
                            <button
                                className="payment-method-btn credit-card"
                                onClick={() => processPayment('credit_card')}
                            >
                                <span className="method-icon">💳</span>
                                <span>Credit Card</span>
                            </button>

                            <button
                                className="payment-method-btn paypal"
                                onClick={() => processPayment('paypal')}
                            >
                                <span className="method-icon">📱</span>
                                <span>PayPal</span>
                            </button>

                            <button
                                className="payment-method-btn upi"
                                onClick={() => processPayment('upi')}
                            >
                                <span className="method-icon">🏦</span>
                                <span>UPI</span>
                            </button>
                        </div>

                        <button
                            className="cancel-payment-btn"
                            onClick={() => setShowPaymentModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPayments;
