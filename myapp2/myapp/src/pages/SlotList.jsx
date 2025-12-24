import React from "react";
import SlotCard from "../components/SlotCard";
import "./SlotList.css";

const SlotList = ({ slots, onSelect }) => {
  return (
    <div className="slot-list-container">
      <h2 className="slot-list-title">Parking Slot Availability</h2>

      {/* Slot Grid */}
      <div className="slot-grid">
        {slots && slots.map((slot) => (
          <SlotCard
            key={slot.id || slot._id}
            slot={slot}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SlotList;
