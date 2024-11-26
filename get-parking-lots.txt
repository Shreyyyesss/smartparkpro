async function handler({ latitude, longitude }) {
  const parkingLotsQuery = `
    SELECT 
      pl.*,
      COUNT(CASE WHEN ps.status = 'available' THEN 1 END) as available_slots
    FROM parking_lots pl
    LEFT JOIN parking_slots ps ON pl.id = ps.lot_id
    GROUP BY pl.id
  `;

  let parkingLots;

  if (latitude && longitude) {
    const earthRadius = 6371; // km
    parkingLots = await sql(
      `
      ${parkingLotsQuery}
      HAVING point(longitude, latitude) <@> point($1, $2) <= 10
      ORDER BY point(longitude, latitude) <@> point($1, $2)
    `,
      [longitude, latitude]
    );
  } else {
    parkingLots = await sql(parkingLotsQuery);
  }

  return {
    parkingLots: parkingLots.map((lot) => ({
      id: lot.id,
      name: lot.name,
      address: lot.address,
      latitude: parseFloat(lot.latitude),
      longitude: parseFloat(lot.longitude),
      pricePerHour: parseFloat(lot.price_per_hour),
      totalSlots: lot.total_slots,
      availableSlots: parseInt(lot.available_slots),
      occupancyPercentage: Math.round(
        (parseInt(lot.available_slots) / lot.total_slots) * 100
      ),
    })),
  };
}