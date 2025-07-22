// src/app/coming-soon/page.tsx
export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h1>
          <p className="text-gray-600">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>🚀</span>
            <span>Almost ready to launch</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              For early access, please contact our team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
