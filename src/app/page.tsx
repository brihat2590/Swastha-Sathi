import {auth} from "@/lib/auth"
import LandingPage from "@/components/Landing"
import Features from "@/components/Features"
import PricingSection from "@/components/PricingTable"
import Footer from "@/components/Footer"
  
export default function page(){
  return(
    <>
    <LandingPage/>
    <Features/>
    <PricingSection/>
    <Footer/>
    
    
    </>


  )
}