"use client";
import React from "react";

function MainComponent() {
  const [parkingLots, setParkingLots] = React.useState([]);
  const [selectedLot, setSelectedLot] = React.useState(null);
  const [slots, setSlots] = React.useState([]);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [bookingConfirmation, setBookingConfirmation] = React.useState(null);
  const [isPaying, setIsPaying] = React.useState(false);
  const { data: user } = useUser();

  React.useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await fetch("/api/parking-lots", { method: "POST" });
        if (!response.ok) throw new Error("Failed to fetch parking lots");
        const data = await response.json();
        setParkingLots(data.parkingLots);
      } catch (err) {
        setError("Could not load parking lots");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingLots();
  }, []);

  React.useEffect(() => {
    if (selectedLot) {
      const fetchSlots = async () => {
        try {
          const response = await fetch("/api/parking-lot-slots", {
            method: "POST",
            body: JSON.stringify({ parkingLotId: selectedLot.id }),
          });
          if (!response.ok) throw new Error("Failed to fetch slots");
          const data = await response.json();
          setSlots(data.slots);
        } catch (err) {
          setError("Could not load parking slots");
          console.error(err);
        }
      };
      fetchSlots();
    }
  }, [selectedLot]);

  const calculatePrice = () => {
    if (!startTime || !endTime || !selectedLot) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return selectedLot.pricePerHour * hours;
  };

  const handleBooking = async () => {
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/book";
      return;
    }

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
        setBookingConfirmation(data);
        setStep(4);
      }
    } catch (err) {
      setError("Could not complete booking");
      console.error(err);
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
        <div className="mb-8 flex justify-between">
          <h1 className="font-pixelify-sans text-3xl">SmartParkPro</h1>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full ${
                  step >= i ? "bg-black" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-pixelify-sans text-xl">Select Parking Lot</h2>
            {parkingLots.map((lot) => (
              <div
                key={lot.id}
                onClick={() => {
                  setSelectedLot(lot);
                  setStep(2);
                }}
                className={`cursor-pointer rounded border border-black p-4 ${
                  selectedLot?.id === lot.id ? "bg-black text-white" : ""
                }`}
              >
                <h3 className="font-pixelify-sans text-xl">{lot.name}</h3>
                <p className="font-pixelify-sans">{lot.address}</p>
                <p className="font-pixelify-sans"> ₹{lot.pricePerHour}/hour</p>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-pixelify-sans text-xl">Select Time</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-pixelify-sans">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded border border-black p-2 font-pixelify-sans"
                />
              </div>
              <div>
                <label className="mb-2 block font-pixelify-sans">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded border border-black p-2 font-pixelify-sans"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <PixelifySansButton
                text="Back"
                onClick={() => {
                  setStep(1);
                  setSelectedLot(null);
                }}
                variant="outlined"
              />
              <PixelifySansButton
                text="Next"
                onClick={() => setStep(3)}
                disabled={!startTime || !endTime}
                variant="filled"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-pixelify-sans text-xl">Select Slot</h2>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
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

            <div className="rounded border border-black p-4">
              <h3 className="mb-2 font-pixelify-sans text-xl">
                Booking Summary
              </h3>
              <p className="font-pixelify-sans">
                Total Time:{" "}
                {(
                  (new Date(endTime) - new Date(startTime)) /
                  (1000 * 60 * 60)
                ).toFixed(1)}{" "}
                hours
              </p>
              <p className="font-pixelify-sans">
                Total Cost: ₹{calculatePrice().toFixed(2)}
              </p>
            </div>

            <div className="flex gap-4">
              <PixelifySansButton
                text="Back"
                onClick={() => setStep(2)}
                variant="outlined"
              />
              <PixelifySansButton
                text="Confirm Booking"
                onClick={handleBooking}
                disabled={!selectedSlot}
                variant="filled"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-pixelify-sans text-xl">Payment</h2>
            <div className="rounded border border-black p-4 space-y-4">
              {!isPaying ? (
                <>
                  <div>
                    <label className="block font-pixelify-sans mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded border border-black p-2 font-pixelify-sans"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-pixelify-sans mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full rounded border border-black p-2 font-pixelify-sans"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-pixelify-sans mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        className="w-full rounded border border-black p-2 font-pixelify-sans"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <PixelifySansButton
                      text="Back"
                      onClick={() => {
                        setStep(3);
                        setBookingConfirmation(null);
                      }}
                      variant="outlined"
                    />
                    <PixelifySansButton
                      text={`Pay ₹${calculatePrice().toFixed(2)}`}
                      onClick={() => {
                        setIsPaying(true);
                        setTimeout(() => setStep(5), 3000);
                      }}
                      variant="filled"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="mb-4 font-pixelify-sans">
                    Processing payment, please wait...
                  </p>
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && bookingConfirmation && (
          <div className="space-y-4">
            <h2 className="font-pixelify-sans text-xl">Booking Confirmed!</h2>
            <div className="rounded border border-black p-4">
              <div className="mb-4 text-center">
                <div className="inline-block rounded border border-black p-4">
                  <div className="font-pixelify-sans">QR Code</div>
                  <div className="mt-2 font-pixelify-sans">
                    {bookingConfirmation.qrCode}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <PixelifySansButton
                  text="Make Another Booking"
                  onClick={() => {
                    setStep(1);
                    setSelectedLot(null);
                    setSelectedSlot(null);
                    setStartTime("");
                    setEndTime("");
                    setBookingConfirmation(null);
                    setIsPaying(false);
                  }}
                  variant="outlined"
                />
                <PixelifySansButton
                  text="View My Bookings"
                  onClick={() => (window.location.href = "/bookings")}
                  variant="filled"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;