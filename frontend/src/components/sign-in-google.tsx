"use client";

import { Button } from "@/components/ui/button";

const SignInGoogle = () => {
  return (
    <div>
      <Button 
      variant="outline" 
      className="w-full cursor-pointer"
      // change the URL when we deploy
      onClick={() => window.location.href="http://localhost:8080/api/auth/google"}>
        Sign in with Google
      </Button>
    </div>
  );
};

export default SignInGoogle;
