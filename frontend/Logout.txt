function MainComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center font-pixelify-sans text-3xl">
          Sign Out
        </h1>

        {error && (
          <div className="rounded border border-black p-3 font-pixelify-sans">
            {error}
          </div>
        )}

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <PixelifySansButton
            text={loading ? "Signing Out..." : "Sign Out"}
            onClick={handleSignOut}
            disabled={loading}
            variant="filled"
          />
        </div>
      </div>
    </div>
  );
}


