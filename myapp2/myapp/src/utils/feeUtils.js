export const calculateFee = (booking) => {
    const BASE_FEE = 20.0;  // ₹20 base fee
    const RATE_PER_15_MIN = 5.0;  // ₹5 per 15 minutes

    if (!booking) {
        return { hours: '0.00', amount: BASE_FEE.toFixed(2) };
    }

    // If booking has been checked out, use actual duration and payment amount
    if ((booking.parkingStatus === 'CHECKED_OUT' || booking.status === 'COMPLETED') && booking.actualDuration) {
        const hours = (booking.actualDuration / 60).toFixed(2);
        const amount = booking.payment?.amount || BASE_FEE; // Show minimum BASE_FEE if amount is 0
        return { hours, amount: parseFloat(amount).toFixed(2) };
    }

    // If checked in but not checked out, calculate current usage based on actual time
    if (booking.parkingStatus === 'CHECKED_IN' && booking.actualEntryTime) {
        const now = new Date();
        const entryTime = new Date(booking.actualEntryTime);
        const minutes = Math.max(0, (now - entryTime) / 60000); // milliseconds to minutes, ensure non-negative
        const hours = (minutes / 60).toFixed(2);

        // Calculate fee: ₹20 base + (rounded minutes / 15) * ₹5
        const roundedMinutes = Math.ceil(minutes / 15) * 15;
        const timeCharge = (roundedMinutes / 15) * RATE_PER_15_MIN;
        const amount = BASE_FEE + timeCharge;

        return { hours, amount: amount.toFixed(2) };
    }

    // For scheduled bookings (not yet checked in), show minimum charge
    return { hours: '0.00', amount: BASE_FEE.toFixed(2) };
};
