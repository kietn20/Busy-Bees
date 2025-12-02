"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function GoogleSignInToast() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && localStorage.getItem("googleSignIn") === "true") {
      toast.success("Logged in successfully.");
      localStorage.removeItem("googleSignIn");
    }
  }, [user]);

  return null;
}