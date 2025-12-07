"use client";

import SignUpForm from "@/components/sign-up";
import SignInGoogle from "@/components/sign-in-google";

export default function SignUpPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full relative overflow-hidden">
      {/* Background wrapper */}
      <div
        className="absolute inset-0 bg-[url('/bg-signup.png')] bg-cover bg-center bg-no-repeat"
        style={{
          background: `url('/bg-signup.png') 50% 50% / cover no-repeat`,
          zIndex: -1,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-xl p-12 space-y-6 border border-muted-foreground  rounded-xl">
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-semibold ">Get Started Now</h1>
            <h3 className="text-md">
              Enter your details below to create your account and get started!
            </h3>
          </div>
          <div>
            <SignInGoogle />
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-muted-foreground " />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-muted-foreground " />
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
