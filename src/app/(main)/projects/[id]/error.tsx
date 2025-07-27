'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Page error:', error);
  
  return (
    <div className="p-8">
      <h2>Something went wrong!</h2>
      <p>Error: {error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
