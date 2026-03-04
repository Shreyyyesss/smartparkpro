function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="font-pixelify-sans text-3xl mb-8">SmartParkPro</h1>

      {userLoading ? (
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
      ) : user ? (
        <div className="text-center space-y-4">
          <p className="font-pixelify-sans">Welcome, {user.email}</p>
          <PixelifySansButton
            text="Book Now"
            onClick={() => (window.location.href = "/booking-page")}
            className="w-40"
          />
          <PixelifySansButton
            text="Log Out"
            onClick={() => (window.location.href = "/account/logout")}
            className="w-40"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <PixelifySansButton
            text="Sign In"
            onClick={() => (window.location.href = "/account/signin")}
            className="w-40"
          />
          <PixelifySansButton
            text="Sign Up"
            onClick={() => (window.location.href = "/account/signup")}
            variant="filled"
            className="w-40"
          />
          <PixelifySansButton
            text="Book Now"
            onClick={() => (window.location.href = "/booking-page")}
            className="w-40"
          />
        </div>
      )}
    </div>
  );
}


