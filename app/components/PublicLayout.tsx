"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const isExplore = pathname === "/explore";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={isExplore ? "hidden lg:block z-50 absolute top-0 w-full" : ""}>
        <Header />
      </div>
      {/* pb-16 on mobile to clear the fixed bottom nav bar */}
      <main className={`flex-1 ${!isExplore ? "pb-16 lg:pb-0" : ""}`}>
        {children}
      </main>
      {!isExplore && <Footer />}
      <MobileBottomNav />
    </>
  );
}
