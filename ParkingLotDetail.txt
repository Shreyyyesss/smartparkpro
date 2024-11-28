"use client";
import React from "react";

function MainComponent() {
  const [parkingLot, setParkingLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { data: user } = useUser();

  const searchParams = new URLSearchParams(window.location.search);
  const lotId = searchParams.get("id");

  useEffect(() => {
    const fetchParkingLotData = async () => {
      try {
        const response = await fetch("/api/parking-lots", {
          method: "POST",
          body: JSON.stringify({ id: lotId }),
        });
        if (!response.ok) throw new Error("Failed to fetch parking lot");
        const data = await response.json();
        setParkingLot(data.parkingLots[0]);

        const slotsResponse = await fetch("/api/parking-lot-slots", {
          method: "POST",
          body: JSON.stringify({ parkingLotId: lotId }),
        });
        if (!slotsResponse.ok) throw new Error("Failed to fetch slots");
        const slotsData = await slotsResponse.json();
        setSlots(slotsData.slots);
      } catch (err) {
        setError("Could not load parking lot details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (lotId) {
      fetchParkingLotData();
    }
  }, [lotId]);

  const calculatePrice = () => {
    if (!startTime || !endTime || !parkingLot) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return parkingLot.pricePerHour * hours;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/account/signin?callbackUrl=/parking-lot?id=${lotId}`;
      return;
    }

    setBookingError(null);
    setBookingLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          slotId: selectedSlot,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");

      const data = await response.json();
      if (data.success) {
        window.location.href = "/";
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setBookingError("Could not complete booking");
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded border border-black p-4 text-center font-pixelify-sans">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded border border-black p-6">
          <h1 className="font-pixelify-sans text-3xl">{parkingLot?.name}</h1>
          <p className="font-pixelify-sans text-lg">{parkingLot?.address}</p>
          <p className="font-pixelify-sans text-lg">
            ${parkingLot?.pricePerHour}/hour
          </p>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`aspect-square rounded border border-black p-2 font-pixelify-sans ${
                slot.status === "available"
                  ? selectedSlot === slot.id
                    ? "bg-black text-white"
                    : "bg-white"
                  : "cursor-not-allowed bg-gray-200"
              }`}
              disabled={slot.status !== "available"}
            >
              {slot.slotNumber}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleBooking}
          className="rounded border border-black p-6"
        >
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-pixelify-sans">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-black p-2 font-pixelify-sans"
                required
              />
            </div>
            <div>
              <label className="mb-2 block font-pixelify-sans">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-black p-2 font-pixelify-sans"
                required
              />
            </div>
          </div>

          {startTime && endTime && (
            <div className="mb-4 font-pixelify-sans">
              Total Price: ${calculatePrice().toFixed(2)}
            </div>
          )}

          {bookingError && (
            <div className="mb-4 rounded border border-black bg-red-100 p-2 font-pixelify-sans">
              {bookingError}
            </div>
          )}

          <PixelifySansButton
            text={bookingLoading ? "Booking..." : "Book Now"}
            disabled={!selectedSlot || !startTime || !endTime || bookingLoading}
            variant="filled"
          />
        </form>
      </div>
    </div>
  );
}

export default MainComponent;