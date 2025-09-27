"use client";

import SignUpForm from "@/components/sign-up";
import { Button } from "@/components/ui/button";
import SignInGoogle from "@/components/sign-in-google";

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <div className="w-full max-w-xl p-12 space-y-6 border border-gray-300 rounded-lg shadow-lg">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold">Get Started Now</h1>
          <h3 className="text-md text-muted-foreground">
            Enter your details below to create your account and get started!
          </h3>
        </div>
        <div>
          <SignInGoogle />
        </div>
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
