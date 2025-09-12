"use client"
import { authClient } from '@/lib/auth-client'
import React from 'react'
import HealthStatusPage from '@/components/ui/HealthStatusform'
import Profileform from '@/components/ui/Profileform'

const Dashboard = () => {

    const signoutHandler = async () => {
        await authClient.signOut();
    }

    return (
        <div className='pt-16'>This is the user Dashboard

            <button onClick={signoutHandler}>logout</button>

            <Profileform/>
            <HealthStatusPage/>
        </div>
    )
}


export default Dashboard