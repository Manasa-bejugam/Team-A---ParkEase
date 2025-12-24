import React from 'react';
import './SlotCard.css';

const SlotCard = ({ slot, onSelect }) => {
  const isAvailable = slot.isAvailable;
  const statusClass = isAvailable ? 'available' : 'booked';
  const statusText = isAvailable ? 'AVAILABLE' : 'BOOKED';

  return (
    <div
      className={`slot-card ${statusClass}`}
      onClick={() => onSelect(slot)}
    >
      <h3>Slot {slot.slotNumber}</h3>
      <p>{statusText}</p>
    </div>
  );
};

export default SlotCard;
