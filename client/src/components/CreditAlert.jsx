import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreditAlert({ error, setError, darkMode, onCreditsPurchased, navigateToCredits = false }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  // Remove state for plans and purchasing
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only reset loading state when error changes
    setIsLoading(false);
  }, [error]);

  if (!error || !error.includes('credits')) {
    return null;
  }

  const handleNavigateToCredits = () => {
    setIsLoading(true);
    navigate('/purchase-credits');
  };

  return (
    <div className={`p-5 mb-6 rounded-lg ${
      darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
              You've Run Out of Credits
            </h3>
            <p className={`mt-1 text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
              Purchase more credits to continue creating amazing animations.
            </p>
          </div>
        </div>
        
        <div className="mt-5 text-center">
          <button
            onClick={handleNavigateToCredits}
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              isLoading
                ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed text-zinc-200' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </span>
            ) : (
              'Buy Credits'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}