import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full px-6 py-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg blur opacity-60"></div>
            <div className="relative bg-white dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                <path d="M10 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1V8a1 1 0 011-1z" />
              </svg>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
            Sign In to 2D Animator
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to create and share AI-powered animations
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-blue-900/20 dark:to-purple-900/20"></div>
          <div className="relative z-10">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg',
                  card: 'bg-transparent shadow-none',
                  footer: 'hidden'
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </div>
        </div>
      </div>
    </div>
  );
}