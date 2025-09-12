"use client"
import CenteredLoader from '@/components/ui/CenteredLoader';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react'

const AuthLayout = ({ children }: { children: ReactNode }) => {

  const router = useRouter();

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  console.log(session);
  
  // Handle redirect when user is not authenticated
  useEffect(() => {
    if (!isPending && session && !error) {
      router.push('/dashboard')
    }
  }, [isPending, session, error, router])

  // Show loading state
  if (isPending) return <div><CenteredLoader label='Loading.. Please wait'/></div>

  // Show error state but don't redirect (might be temporary network issue)
  if (error) return <div>Error: {error.message}</div>

  // If no session and not loading, redirect is happening in useEffect
  if (session) {
    return <div>

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>

        <div>wait loading..</div>
    </div>
  }

  return (
    <div>{children}</div>
  )
}

export default AuthLayout