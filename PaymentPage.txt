function MainComponent() {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState("upi");
  const [amount, setAmount] = useState(0);
  const [lotName, setLotName] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAmount(params.get("amount") || 0);
    setLotName(params.get("lotName") || "");
    setSlot(params.get("slot") || "");
  }, []);

  const handleFakePayment = () => {
    if (!method) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaid(true);
    }, 2000);
  };

  useEffect(() => {
    if (paid) {
      setTimeout(() => {
        window.location.href = "/bookings";
      }, 3000);
    }
  }, [paid]);

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full border border-black rounded p-6 font-pixelify-sans">
        {!paid ? (
          <>
            <h1 className="text-2xl mb-4 text-center"></h1>
            <p className="mb-6 text-center">Amount to Pay: ₹{amount}</p>

            <div className="mb-6 space-y-2">
              <h2 className="text-lg mb-2">Choose Payment Method:</h2>
              <label className="block">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={method === "upi"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mr-2"
                />
                UPI
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={method === "card"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mr-2"
                />
                Debit / Credit Card
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={method === "netbanking"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mr-2"
                />
                Net Banking
              </label>
            </div>

            <div className="mb-4 text-center">
              <p>Parking Lot: {lotName}</p>
              <p>Slot: {slot}</p>
            </div>

            <PixelifySansButton
              text={loading ? "Processing Payment..." : "Pay Now"}
              onClick={handleFakePayment}
              disabled={loading}
              variant={loading ? "default" : "filled"}
            />
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl mb-4 text-green-600">
              Payment Successful!
            </h1>
            <p>Redirecting to your bookings page...</p>
          </div>
        )}
      </div>
    </div>
  );
}


