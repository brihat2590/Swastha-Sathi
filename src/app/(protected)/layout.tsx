// app/protected/layout.tsx (Server Component)

import Navbar from '@/components/Navbar';
import ProtectedLayoutClient from './ProtectedLayoutClient';
import ReduxProvider from '@/lib/redux/provider';

export const metadata = {
  title: 'Swastha Sathi',
  icons: {
    icon: 'synergy.svg',
  },
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return( 
  
  
  <ProtectedLayoutClient>

    
      
     
      
      {children}
      
      
    
    
    </ProtectedLayoutClient>
  )
}
