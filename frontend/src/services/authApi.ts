import api from "./config";
import { User } from "@/context/AuthContext"; // Assuming User type is exported from AuthContext

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

export const logout = async (): Promise<any> => {
  // Assuming the logout response data is not critical
  const res = await api.post("/account/logout");
  return res.data;
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  } catch (error: any) {
    console.error('Signup API Error:', error.response?.data || error.message);
    
    // Provide more specific error messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
      throw new Error(`Validation Error: ${validationErrors}`);
    } else if (error.response?.status === 400) {
      throw new Error("Invalid signup data. Please check your inputs.");
    } else if (error.response?.status === 409) {
      throw new Error("An account with this email already exists.");
    } else {
      throw new Error("Signup failed. Please try again.");
    }
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};