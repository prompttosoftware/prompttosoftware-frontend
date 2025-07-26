// src/app/(main)/layout.tsx
import MainUI from "./components/MainUI";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <>
    <MainUI>
      {children}
    </MainUI>
    </>
  );
}
