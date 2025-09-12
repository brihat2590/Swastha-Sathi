"use client"
import CenteredLoader from '@/components/ui/CenteredLoader'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect } from 'react'

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
    const router = useRouter();

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()

    // Handle redirect when user is not authenticated
    useEffect(() => {
        if (!isPending && !session && !error) {
            router.push('/sign-in')
        }
    }, [isPending, session, error, router])

    // Show loading state
    if (isPending) return <div><CenteredLoader label='Please wait loading'></CenteredLoader></div>
    
    // Show error state but don't redirect (might be temporary network issue)
    if (error) return <div>Error: {error.message}</div>
    
    // If no session and not loading, redirect is happening in useEffect
    if (!session) {
        return <div>Redirecting to login...</div>
    }
    
    // User is authenticated, render children
    return (
        <div>{children}</div>
    )
}

export default ProtectedLayout;