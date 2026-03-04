async function handler({ parkingLotId }) {
  if (!parkingLotId) {
    return { error: "Parking lot ID is required" };
  }

  const slots = await sql`
    SELECT 
      ps.id,
      ps.slot_number,
      ps.status,
      b.id as booking_id,
      b.start_time,
      b.end_time,
      b.status as booking_status
    FROM parking_slots ps
    LEFT JOIN bookings b ON ps.id = b.slot_id 
      AND b.status = 'confirmed' 
      AND b.end_time > CURRENT_TIMESTAMP
    WHERE ps.lot_id = ${parkingLotId}
    ORDER BY ps.slot_number
  `;

  return {
    slots: slots.map((slot) => ({
      id: slot.id,
      slotNumber: slot.slot_number,
      status: slot.status,
      currentBooking: slot.booking_id
        ? {
            id: slot.booking_id,
            startTime: slot.start_time,
            endTime: slot.end_time,
            status: slot.booking_status,
          }
        : null,
    })),
  };
}