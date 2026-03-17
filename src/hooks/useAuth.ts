import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function useAuth(){
    const[user,setUser]=useState<any>(null);
    const[authloading,setAuthloading]=useState(false);

    useEffect(()=>{
        setAuthloading(true);

        const initialSession=async()=>{

            try{
                const session=await authClient.getSession();

                setUser(session?.data?.user || null);
            }
            catch(err){
                console.log(err)
                setUser(null)
            }
            finally{
                setAuthloading(false)
            }
           
        }
        initialSession();
    },[])

    return{user,authloading}
}