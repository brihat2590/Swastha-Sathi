// app/protected/ProtectedLayoutClient.tsx
"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import CenteredLoader from '@/components/ui/CenteredLoader';

export default function ProtectedLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session && !error) {
      router.push('/sign-in');
    }
  }, [isPending, session, error, router]);

  if (isPending) return <CenteredLoader label="Please wait loading" />;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <CenteredLoader label="Redirecting to login. Please wait" />;

  return <>{children}</>;
}
