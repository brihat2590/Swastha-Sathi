// app/protected/layout.tsx (Server Component)
import ProtectedLayoutClient from './ProtectedLayoutClient';

export const metadata = {
  title: 'Swastha Sathi',
  icons: {
    icon: 'synergy.svg',
  },
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
