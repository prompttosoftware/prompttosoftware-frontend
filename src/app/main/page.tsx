import { redirect } from 'next/navigation';

export default function MainPageIndex() {
  redirect('/main/dashboard');
  return null;
}
