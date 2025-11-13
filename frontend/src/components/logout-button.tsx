import React from "react";
import { logout } from "@/services/authApi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "react-hot-toast";

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { logout: authLogout } = useAuth();

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await logout();
      authLogout();
      router.push("/login");
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error("Logout failed.");
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <span className="cursor-pointer w-full text-left" onClick={handleLogout}>
      {isLoading ? "Logging Out..." : "Log Out"}
    </span>
  );
};

export default LogoutButton;
