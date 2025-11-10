"use client";

import SignUpForm from "@/components/sign-up";
import SignInGoogle from "@/components/sign-in-google";

export default function SignUpPage() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 5rem)" }}
    >
      <div className="w-full max-w-xl p-12 space-y-6 border border-muted-foreground  rounded-xl">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold text-secondary">
            Get Started Now
          </h1>
          <h3 className="text-md text-secondary">
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
  );
}
