'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// define the shape of the user object
interface User {
    id: string;
    firstName: string;
    email: string;
}

// define the shape of the context's value
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
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
        // try to load the token from localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };


    const value = { user, token, login, isLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};