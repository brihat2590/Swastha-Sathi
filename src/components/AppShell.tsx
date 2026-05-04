"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

const HIDE_NAVBAR_ROUTES = new Set(["/", "/updateHealth"]);

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideNavbar = pathname ? HIDE_NAVBAR_ROUTES.has(pathname) : false;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "flex-1" : "flex-1 pt-16"}>{children}</main>
    </>
  );
}