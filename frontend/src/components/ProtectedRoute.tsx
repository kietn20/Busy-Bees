'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user || !token) {
            router.push('/login');
        }
    }, [user, token, isLoading, router]);

    if (isLoading || !user) {
        return <div>Loading...</div>; // add a spinning loading icon later???
    }

    
    return <>{children}</>;
}