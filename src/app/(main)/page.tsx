// src/app/(main)/page.tsx
import { redirect } from 'next/navigation';

export default function MainPageIndex() {
  redirect('/dashboard');
}
