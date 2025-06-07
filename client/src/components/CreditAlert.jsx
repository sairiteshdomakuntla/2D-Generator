import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

export default function CreditAlert({ error, setError, darkMode, onCreditsPurchased }) {
  const { getToken } = useAuth();
  const [purchaseAmount, setPurchaseAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  if (!error || !error.includes('credits')) {
    return null;
  }

  const handlePurchaseCredits = async () => {
    // This is a placeholder for Razorpay integration
    // Later you'll replace this with actual Razorpay payment flow
    try {
      setIsLoading(true);
      const token = await getToken();
      
      const res = await axios.post('http://localhost:5000/api/user/refresh-credits', 
        { credits: purchaseAmount },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setError(null);
        // Call the callback to refresh credits display
        if (onCreditsPurchased) {
          onCreditsPurchased();
        }
      }
    } catch (err) {
      console.error('Error purchasing credits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 mb-6 rounded-lg ${
      darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
            Insufficient Credits
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
            You've run out of credits. Purchase more to continue creating animations.
          </p>
          
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <select 
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
                className={`rounded-md text-sm py-1.5 ${
                  darkMode 
                    ? 'bg-zinc-800 text-white border border-zinc-700' 
                    : 'bg-white text-zinc-900 border border-zinc-300'
                }`}
              >
                <option value="10">10 credits - $5</option>
                <option value="25">25 credits - $10</option>
                <option value="50">50 credits - $18</option>
                <option value="100">100 credits - $30</option>
              </select>
              
              <button
                onClick={handlePurchaseCredits}
                disabled={isLoading}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  isLoading 
                    ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : 'Purchase Credits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}