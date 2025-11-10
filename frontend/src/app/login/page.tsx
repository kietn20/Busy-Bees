import LogInForm from "@/components/login";
import SignInGoogle from "@/components/sign-in-google";

export default function LoginPage() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 5rem)" }}
    >
      <div className="w-full max-w-xl p-12 space-y-6 border border-muted-foreground rounded-xl">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold text-secondary">
            Welcome back!
          </h1>
          <h3 className="text-md text-secondary">
            Glad to see you again! Please enter your details below to log in to
            your account.
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
        <LogInForm />
      </div>
    </div>
  );
}
