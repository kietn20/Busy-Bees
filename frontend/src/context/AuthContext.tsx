"use client";

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import { logout as apiLogout } from "@/services/authApi";

// define the shape of the user object
export interface User {
    id: string;
    firstName: string;
    email: string;
}

// define the shape of the context's value
interface AuthContextType {

    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
}

// create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// define the props for the provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Step 1: Check for JWT token in localStorage
            const storedToken = localStorage.getItem("authToken");
            if (storedToken) {
                setToken(storedToken);
                // Try to fetch user data with the JWT token
                try {
                    const res = await fetch("http://localhost:8080/api/account", {
                        credentials: "include",
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.user) {
                            setUser(data.user);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user with JWT:", error);
                }
                setIsLoading(false);
                return;
            }

            // Step 2: If no JWT token, try to fetch user from OAuth session
            try {
                const res = await fetch("http://localhost:8080/api/account", {
                    credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.user) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Error fetching user from session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []); // Only run once on mount

    const login = (newToken: string, userData: User) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem("authToken", newToken);
    };

    const logout = async () => {
        // Always try to end server session (OAuth). Ignore errors.
        try { await apiLogout(); } catch { }
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
    };

    const value = { user, token, login, logout, isLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};