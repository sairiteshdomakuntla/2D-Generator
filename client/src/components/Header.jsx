import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from 'react';

export default function Header({ darkMode, setDarkMode }) {
  const { isSignedIn, user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 ${
      darkMode ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-white border-b border-zinc-200'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-8 w-8 ${darkMode ? 'text-white' : 'text-zinc-900'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                AnimateAI
              </span>
            </a>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-md ${
                darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
              } transition-colors duration-200`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Auth buttons */}
            {isSignedIn ? (
              <div className={`ml-4 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <button className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    darkMode 
                      ? 'text-white hover:bg-zinc-800' 
                      : 'text-zinc-900 hover:bg-zinc-100'
                  } transition-colors duration-200`}>
                    Sign in
                  </button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <button className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                    darkMode 
                      ? 'bg-white text-zinc-900 hover:bg-zinc-100' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  } transition-colors duration-200`}>
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}