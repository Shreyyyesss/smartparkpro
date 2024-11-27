async function handler() {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const adminCheck = await sql`
    SELECT id FROM admin_users 
    WHERE user_id = ${session.user.id}
  `;

  if (adminCheck.length === 0) {
    return { error: "Unauthorized access" };
  }

  const [bookingStats, revenueStats, occupancyStats] = await sql.transaction([
    sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `,
    sql`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_booking_value
      FROM bookings 
      WHERE status != 'cancelled'
      AND created_at >= NOW() - INTERVAL '30 days'
    `,
    sql`
      SELECT 
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as occupied_slots,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots
      FROM parking_slots
    `
  ]);

  return {
    bookings: {
      total: parseInt(bookingStats[0].total_bookings),
      active: parseInt(bookingStats[0].active_bookings),
      completed: parseInt(bookingStats[0].completed_bookings),
      cancelled: parseInt(bookingStats[0].cancelled_bookings)
    },
    revenue: {
      total: parseFloat(revenueStats[0].total_revenue),
      averagePerBooking: parseFloat(revenueStats[0].average_booking_value)
    },
    occupancy: {
      totalSlots: parseInt(occupancyStats[0].total_slots),
      occupiedSlots: parseInt(occupancyStats[0].occupied_slots),
      availableSlots: parseInt(occupancyStats[0].available_slots),
      occupancyRate: occupancyStats[0].total_slots > 0 
        ? (parseInt(occupancyStats[0].occupied_slots) / parseInt(occupancyStats[0].total_slots)) * 100 
        : 0
    }
  };
}


