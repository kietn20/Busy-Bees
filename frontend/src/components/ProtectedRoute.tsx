'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

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

        //if (!user || !token) {
        //    router.push('/login');
        //}
        if (!user) {
            router.push('/login');
        }
    }, [user, token, isLoading, router]);

    if (isLoading || !user) {
        return <Loading />;
    }

    return <>{children}</>;
}