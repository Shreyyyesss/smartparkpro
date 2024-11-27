async function handler({ action, lotData, lotId }) {
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

  try {
    switch (action) {
      case 'create': {
        if (!lotData?.name || !lotData?.address || !lotData?.latitude || 
            !lotData?.longitude || !lotData?.pricePerHour || !lotData?.totalSlots) {
          return { error: "Missing required fields" };
        }

        const result = await sql.transaction([
          sql`
            INSERT INTO parking_lots (
              name, address, latitude, longitude, 
              price_per_hour, total_slots
            ) VALUES (
              ${lotData.name}, ${lotData.address}, ${lotData.latitude}, 
              ${lotData.longitude}, ${lotData.pricePerHour}, ${lotData.totalSlots}
            ) RETURNING id
          `,
          ...Array.from({ length: lotData.totalSlots }, (_, i) => 
            sql`
              INSERT INTO parking_slots (lot_id, slot_number, status)
              SELECT id, ${'A' + (i + 1)}, 'available'
              FROM parking_lots
              WHERE id = (SELECT currval('parking_lots_id_seq'))
            `
          )
        ]);

        return { success: true, lotId: result[0][0].id };
      }

      case 'update': {
        if (!lotId) return { error: "Lot ID is required" };

        const setClause = [];
        const values = [];
        let paramCount = 1;

        if (lotData.name) {
          setClause.push(`name = $${paramCount}`);
          values.push(lotData.name);
          paramCount++;
        }
        if (lotData.address) {
          setClause.push(`address = $${paramCount}`);
          values.push(lotData.address);
          paramCount++;
        }
        if (lotData.latitude) {
          setClause.push(`latitude = $${paramCount}`);
          values.push(lotData.latitude);
          paramCount++;
        }
        if (lotData.longitude) {
          setClause.push(`longitude = $${paramCount}`);
          values.push(lotData.longitude);
          paramCount++;
        }
        if (lotData.pricePerHour) {
          setClause.push(`price_per_hour = $${paramCount}`);
          values.push(lotData.pricePerHour);
          paramCount++;
        }

        if (setClause.length === 0) {
          return { error: "No fields to update" };
        }

        values.push(lotId);
        await sql(
          `UPDATE parking_lots SET ${setClause.join(', ')} WHERE id = $${paramCount}`,
          values
        );

        return { success: true };
      }

      case 'delete': {
        if (!lotId) return { error: "Lot ID is required" };

        const activeBookings = await sql`
          SELECT COUNT(*) as count
          FROM bookings b
          JOIN parking_slots ps ON b.slot_id = ps.id
          WHERE ps.lot_id = ${lotId}
          AND b.status = 'confirmed'
        `;

        if (activeBookings[0].count > 0) {
          return { error: "Cannot delete lot with active bookings" };
        }

        await sql.transaction([
          sql`DELETE FROM parking_slots WHERE lot_id = ${lotId}`,
          sql`DELETE FROM parking_lots WHERE id = ${lotId}`
        ]);

        return { success: true };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    return { error: "Operation failed" };
  }
}


