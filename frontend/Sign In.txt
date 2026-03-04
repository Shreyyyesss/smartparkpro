function MainComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signInWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl mb-8 text-center font-pixelify-sans">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded border border-black p-6">
            {error && (
              <div className="mb-4 p-3 border border-black bg-red-100 font-pixelify-sans">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2 font-pixelify-sans">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-black rounded font-pixelify-sans"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-pixelify-sans">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-black rounded font-pixelify-sans"
                required
              />
            </div>

            <PixelifySansButton
              text={loading ? "Signing in..." : "Sign In"}
              variant="filled"
              disabled={loading}
            />
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="font-pixelify-sans">
            Don't have an account?{" "}
            <a href="/account/signup" className="underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


