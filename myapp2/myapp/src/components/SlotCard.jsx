import React, { useState } from 'react';
import AlertBadge from './AlertBadge';
import AlertModal from './AlertModal';
import './SlotCard.css';

const SlotCard = ({ slot, alerts, onSelect }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);

  const isAvailable = slot.isAvailable;
  const statusClass = isAvailable ? 'available' : 'booked';
  const statusText = isAvailable ? 'AVAILABLE' : 'BOOKED';

  // Filter relevant alerts from centralized state
  const relevantAlerts = React.useMemo(() => {
    if (!alerts || !slot) return [];

    const slotId = slot._id || slot.id;
    return alerts.filter(alert => {
      // Alert targets this specific slot
      if (alert.slot && (alert.slot._id === slotId || alert.slot.id === slotId)) return true;
      // Alert targets this area
      if (alert.area && alert.area === slot.area) return true;
      // Alert targets this city
      if (alert.city && alert.city === slot.city) return true;
      return false;
    });
  }, [alerts, slot]);

  const handleAlertClick = (e) => {
    e.stopPropagation(); // Prevent slot selection when clicking alert
    setShowAlertModal(true);
  };

  const handleSlotClick = () => {
    // Check if there are warning or critical alerts
    if (hasWarningOrCritical) {
      setShowAlertModal(true); // Show alert instead of allowing booking
      return;
    }

    onSelect(slot);
  };

  // UI Logic
  const hasWarningOrCritical = relevantAlerts.some(
    alert => alert.severity === 'warning' || alert.severity === 'critical'
  );

  return (
    <>
      <div
        className={`slot-card ${statusClass}`}
        onClick={handleSlotClick}
      >
        <h3>Slot {slot.slotNumber}</h3>
        <p>{statusText}</p>

        {slot.distance !== undefined && slot.distance !== Infinity && (
          <div className={`distance-badge ${slot.distance < 500 ? 'closest-badge' : ''}`}>
            📍 {slot.distance > 1000
              ? `${(slot.distance / 1000).toFixed(1)}km`
              : `${Math.round(slot.distance)}m`} away
          </div>
        )}

        {/* Alert Badge */}
        {relevantAlerts.length > 0 && (
          <AlertBadge alerts={relevantAlerts} onClick={handleAlertClick} />
        )}
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal
          alerts={relevantAlerts}
          slotNumber={slot.slotNumber}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </>
  );
};

export default SlotCard;
