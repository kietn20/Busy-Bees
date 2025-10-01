import React from "react";
import { Button } from "./ui/button";
import { logout } from "@/services/authApi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { logout: authLogout } = useAuth();

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear local state for security
      authLogout();
      router.push("/login");
      setIsLoading(false);
    }
  };
  return (
    <>
      <Button variant="destructive" onClick={handleLogout} disabled={isLoading}>
        {isLoading ? "Logging out..." : "Log out"}
      </Button>
    </>
  );
};

export default LogoutButton;
