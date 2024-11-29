function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/user-bookings", { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        setBookings(data.bookings);
      } catch (err) {
        setError("Could not load your bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/account/signin?callbackUrl=/bookings";
    return null;
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

  const currentBookings = bookings.filter(
    (booking) => new Date(booking.endTime) > new Date()
  );
  const pastBookings = bookings.filter(
    (booking) => new Date(booking.endTime) <= new Date()
  );

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-pixelify-sans text-3xl">Your Bookings</h1>

        <div className="space-y-8">
          <div>
            <h2 className="mb-4 font-pixelify-sans text-2xl">
              Current Bookings
            </h2>
            {currentBookings.length === 0 ? (
              <div className="rounded border border-black p-4 text-center font-pixelify-sans">
                No current bookings
              </div>
            ) : (
              <div className="space-y-4">
                {currentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded border border-black p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="font-pixelify-sans text-xl">
                          {booking.parkingLot.name}
                        </h3>
                        <p className="font-pixelify-sans">
                          {booking.parkingLot.address}
                        </p>
                        <p className="font-pixelify-sans">
                          Slot: {booking.slot.number}
                        </p>
                        <p className="font-pixelify-sans">
                          Status:{" "}
                          <span
                            className={
                              booking.status === "confirmed"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {booking.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="font-pixelify-sans">
                          Start: {new Date(booking.startTime).toLocaleString()}
                        </p>
                        <p className="font-pixelify-sans">
                          End: {new Date(booking.endTime).toLocaleString()}
                        </p>
                        <p className="font-pixelify-sans">
                          Total: ₹{booking.totalAmount}
                        </p>
                        <div className="mt-2 border border-black p-2 text-center font-pixelify-sans">
                          QR Code: {booking.qrCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 font-pixelify-sans text-2xl">Past Bookings</h2>
            {pastBookings.length === 0 ? (
              <div className="rounded border border-black p-4 text-center font-pixelify-sans">
                No past bookings
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded border border-black p-4 opacity-60"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="font-pixelify-sans text-xl">
                          {booking.parkingLot.name}
                        </h3>
                        <p className="font-pixelify-sans">
                          {booking.parkingLot.address}
                        </p>
                        <p className="font-pixelify-sans">
                          Slot: {booking.slot.number}
                        </p>
                        <p className="font-pixelify-sans">
                          Status: {booking.status}
                        </p>
                      </div>
                      <div>
                        <p className="font-pixelify-sans">
                          Start: {new Date(booking.startTime).toLocaleString()}
                        </p>
                        <p className="font-pixelify-sans">
                          End: {new Date(booking.endTime).toLocaleString()}
                        </p>
                        <p className="font-pixelify-sans">
                          Total: ₹{booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


