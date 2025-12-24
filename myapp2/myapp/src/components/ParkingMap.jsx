import React from 'react';
import './ParkingMap.css';

const ParkingMap = ({ slots }) => {
    // Group slots by rows (assuming slot numbers like A1, A2, B1, B2, etc.)
    const groupSlotsByRow = () => {
        const rows = {};
        slots.forEach(slot => {
            const slotNum = slot.slotNumber || '';
            const row = slotNum.charAt(0) || 'A'; // Get first character as row
            if (!rows[row]) {
                rows[row] = [];
            }
            rows[row].push(slot);
        });
        return rows;
    };

    const slotRows = groupSlotsByRow();

    return (
        <div className="parking-map-container">
            <div className="map-header">
                <h3>🗺️ Parking Lot Layout</h3>
                <div className="map-legend">
                    <span className="legend-item">
                        <span className="legend-dot available"></span> Available
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot booked"></span> Booked
                    </span>
                </div>
            </div>

            <div className="parking-lot">
                <div className="entrance-marker">
                    <div className="entrance-arrow">⬇️</div>
                    <div className="entrance-text">ENTRANCE</div>
                </div>

                <div className="parking-rows">
                    {Object.keys(slotRows).sort().map(row => (
                        <div key={row} className="parking-row">
                            <div className="row-label">Row {row}</div>
                            <div className="row-slots">
                                {slotRows[row].map(slot => (
                                    <div
                                        key={slot._id}
                                        className={`map-slot ${slot.isAvailable ? 'available' : 'booked'}`}
                                        title={`${slot.slotNumber} - ${slot.isAvailable ? 'Available' : 'Booked'}`}
                                    >
                                        <div className="slot-number">{slot.slotNumber}</div>
                                        <div className="car-icon">🚗</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="exit-marker">
                    <div className="exit-text">EXIT</div>
                    <div className="exit-arrow">⬆️</div>
                </div>
            </div>
        </div>
    );
};

export default ParkingMap;
