// src/app/(main)/layout.tsx

import { getInitialAuthData } from "@/lib/data/user";
import MainUI from "./components/MainUI";
import AuthInitializer from "./components/AuthInitializer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getInitialAuthData();
  
  return (
    <>
    <AuthInitializer user={user} />
    <MainUI>
      {children}
    </MainUI>
    </>
  );
}
