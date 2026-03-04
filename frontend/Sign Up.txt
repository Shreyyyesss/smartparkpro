function MainComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true
      });
    } catch (err) {
      const errorMessages = {
        Credentials: "Invalid email or password",
        OAuthSignin: "Could not sign up with provider",
        OAuthCallback: "Error occurred during sign up",
        OAuthCreateAccount: "Could not create account",
        EmailCreateAccount: "Could not create account",
        Callback: "Error occurred during sign up",
        OAuthAccountNotLinked: "Email already used with different provider",
        EmailSignin: "Check your email for sign up link",
        CredentialsSignin: "Sign up failed. Check credentials.",
        Configuration: "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one."
      };

      setError(errorMessages[err.message] || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center font-pixelify-sans text-3xl">Create Account</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block font-pixelify-sans">Email</label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded border border-black p-2 font-pixelify-sans"
            />
          </div>

          <div>
            <label className="block font-pixelify-sans">Password</label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded border border-black p-2 font-pixelify-sans"
            />
          </div>

          {error && (
            <div className="rounded border border-black p-3 font-pixelify-sans">
              {error}
            </div>
          )}

          <PixelifySansButton
            text={loading ? "Loading..." : "Sign Up"}
            type="submit"
            disabled={loading}
            variant="filled"
          />

          <p className="text-center font-pixelify-sans">
            Already have an account?{" "}
            <a href="/account/signin" className="underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}


