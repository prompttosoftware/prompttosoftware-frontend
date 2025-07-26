// app/(main)/rsc-test/7-force-server/page.tsx
import { headers } from 'next/headers';

export default async function Test7() {
  // This will crash if the file ever becomes a Client Component:
  const h = await headers();
  console.log('[TEST-7] Running on server', h.get('host'));

  return <h1>Test 7 – forced server with headers()</h1>;
}
