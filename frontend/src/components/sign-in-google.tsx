"use client";

import { Button } from "@/components/ui/button";

const handleGoogleSignIn = () => {
  localStorage.setItem("googleSignIn", "true"); // <-- Add this line
  // Start Google OAuth flow (e.g., redirect to Google)
  window.location.href = "http://localhost:8080/api/auth/google";
};

const SignInGoogle = () => {
  return (
    <div>
      <Button 
      variant="outline" 
      className="w-full cursor-pointer"
      // change the URL when we deploy
      onClick={handleGoogleSignIn}>
        Sign in with Google
      </Button>
    </div>
  );
};

export default SignInGoogle;
