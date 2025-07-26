// 0. Baseline – should stay Server Component
import { cookies } from 'next/headers';
export default async function Test0() {
  console.log('[TEST-0] Running on server');
  await (await cookies()).has('jwtToken');
  return (
    <>
      <h1>Test 0 – empty baseline</h1>
      <a href="/rsc-test/1-fetch">Next →</a>
    </>
  );
}
