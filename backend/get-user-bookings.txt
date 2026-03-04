async function handler() {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const bookings = await sql`
    SELECT 
      b.id,
      b.start_time,
      b.end_time,
      b.total_amount,
      b.status,
      b.qr_code,
      ps.slot_number,
      pl.name as parking_lot_name,
      pl.address as parking_lot_address
    FROM bookings b
    JOIN parking_slots ps ON b.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    WHERE b.user_id = ${session.user.id}
    ORDER BY b.start_time DESC
  `;

  return {
    bookings: bookings.map(booking => ({
      id: booking.id,
      startTime: booking.start_time,
      endTime: booking.end_time,
      totalAmount: parseFloat(booking.total_amount),
      status: booking.status,
      qrCode: booking.qr_code,
      slot: {
        number: booking.slot_number
      },
      parkingLot: {
        name: booking.parking_lot_name,
        address: booking.parking_lot_address
      }
    }))
  };
}


