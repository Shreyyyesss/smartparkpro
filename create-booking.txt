async function handler({ slotId, startTime, endTime }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  if (!slotId || !startTime || !endTime) {
    return { error: "Missing required fields" };
  }

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate || startDate < new Date()) {
      return { error: "Invalid booking time range" };
    }

    const durationHours = (endDate - startDate) / (1000 * 60 * 60);

    const slotCheck = await sql`
      SELECT 
        ps.id,
        ps.status,
        pl.price_per_hour
      FROM parking_slots ps
      JOIN parking_lots pl ON ps.lot_id = pl.id
      WHERE ps.id = ${slotId}
      AND ps.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.slot_id = ps.id
        AND b.status = 'confirmed'
        AND (
          (${startTime} BETWEEN b.start_time AND b.end_time)
          OR (${endTime} BETWEEN b.start_time AND b.end_time)
          OR (b.start_time BETWEEN ${startTime} AND ${endTime})
        )
      )
    `;

    if (slotCheck.length === 0) {
      return { error: "Slot is not available for the selected time period" };
    }

    const totalAmount = parseFloat(slotCheck[0].price_per_hour) * durationHours;
    const qrCode = `PARKING-${slotId}-${Date.now()}`;

    const result = await sql.transaction([
      sql`
        INSERT INTO bookings (
          user_id, slot_id, start_time, end_time, 
          total_amount, status, qr_code
        ) VALUES (
          ${session.user.id}, ${slotId}, ${startTime}, ${endTime}, 
          ${totalAmount}, 'confirmed', ${qrCode}
        ) RETURNING id
      `,
      sql`
        UPDATE parking_slots 
        SET status = 'booked' 
        WHERE id = ${slotId}
      `,
    ]);

    return {
      success: true,
      booking: {
        id: result[0][0].id,
        startTime,
        endTime,
        totalAmount,
        qrCode,
      },
    };
  } catch (error) {
    return { error: "Failed to create booking" };
  }
}



