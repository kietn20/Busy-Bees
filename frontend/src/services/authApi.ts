import api from "./config";
import { User } from "@/context/AuthContext";
import { AxiosError } from "axios";

// Define the shape of the function arguments for type safety
interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  token: string;
  user: User;
}



export const login = async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  const res = await api.post("/account/logout");
  return res.data;
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const message = axiosError.response?.data?.message || "Signup failed. Please try again.";
    throw new Error(message);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};