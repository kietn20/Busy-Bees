import LogInForm from "@/components/login-in";
import SignInGoogle from "@/components/sign-in-google";
const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <div className="w-full max-w-xl p-12 space-y-6 border border-gray-300 rounded-lg shadow-lg">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <h3 className="text-md text-muted-foreground">
            Glad to see you again! Please enter your details below to log in to
            your account.
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
        <LogInForm />
      </div>
    </div>
  );
};

export default Login;
