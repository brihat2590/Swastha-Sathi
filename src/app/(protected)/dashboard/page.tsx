"use client"
import { authClient } from '@/lib/auth-client'
import React from 'react'


const Dashboard = () => {

    const signoutHandler = async () => {
        await authClient.signOut();
    }

    return (
        <div className='pt-16'>This is the user Dashboard

            <button onClick={signoutHandler}>logout</button>

            
        </div>
    )
}


export default Dashboard