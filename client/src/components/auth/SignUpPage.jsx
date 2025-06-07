import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-md w-full px-6 py-8">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span className="text-xl font-semibold">AnimateAI</span>
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Join AnimateAI to create stunning procedural animations
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-xl p-6">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white',
                formFieldInput: 'border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white',
                formFieldLabel: 'text-zinc-700 dark:text-zinc-300',
                footerActionLink: 'text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300',
                card: 'bg-transparent shadow-none',
                footer: 'hidden'
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}