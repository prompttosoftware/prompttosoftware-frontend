// src/app/coming-soon/page.tsx
export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-12">
        
        {/* Coming Soon with typewriter effect */}
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-light text-white tracking-widest">
            <span className="inline-block animate-pulse">COMING</span>
            <br />
            <span className="inline-block animate-pulse delay-1000">SOON</span>
          </h1>
          
          {/* Subtle underline animation */}
          <div className="mt-8 mx-auto w-32 h-px bg-white opacity-0 animate-pulse delay-2000"></div>
        </div>

        {/* Email with fade-in effect */}
        <div className="opacity-0 animate-pulse delay-3000">
          <div className="text-gray-400 text-sm font-mono tracking-wide">
            contact@prompttosoftware.com
          </div>
        </div>

      </div>
    </div>
  );
}
