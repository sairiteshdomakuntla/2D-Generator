import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Credits({ darkMode, refreshTrigger, onBuyMore }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/credits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCredits(res.data.credits);
      setError(null);
    } catch (err) {
      console.error('Error fetching credits:', err);
      
      // If we get a 500 error and haven't retried too many times, retry after a delay
      if (err.response?.status === 500 && retryCount < 3) {
        console.log(`Retrying credits fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000); // Wait 1 second before retry
        return;
      }
      
      setError('Failed to load credits');
      // Default to showing 20 credits for new users when there's an error
      setCredits(20);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [refreshTrigger, getToken, retryCount]);

  // Handle navigation directly in the component
  const handleBuyCredits = () => {
    navigate('/purchase-credits');
  };

  return (
    <div className="flex items-center">
      <div 
        onClick={handleBuyCredits} 
        className={`flex items-center px-3 py-1.5 rounded-l-full text-sm cursor-pointer hover:opacity-90 transition-opacity ${
          darkMode 
            ? 'bg-blue-900 text-white' 
            : 'bg-blue-100 text-blue-700'
        }`}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : error ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        )}
        <span className="cursor-pointer">
          {loading ? 'Loading...' : error ? '20 credits' : `${credits} credits`}
        </span>
      </div>
      
      <button
        onClick={handleBuyCredits}
        className={`px-2 py-1.5 text-xs font-medium rounded-r-full transition-all ${
          darkMode 
            ? 'bg-blue-800 hover:bg-blue-700 text-white' 
            : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
        }`}
      >
        + Buy More
      </button>
    </div>
  );
}