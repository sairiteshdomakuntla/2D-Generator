import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AnimationSidebar({ darkMode, currentAnimationId, onSelectAnimation, refreshTrigger }) {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add refreshTrigger to dependency array to fetch animations when it changes
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        setLoading(true);
        const token = await window.Clerk.session.getToken();
        
        const response = await fetch('http://localhost:5000/api/animations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch animations');
        }
        
        const data = await response.json();
        setAnimations(data.animations);
      } catch (err) {
        console.error('Error fetching animations:', err);
        setError('Failed to load your animations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimations();
  }, [refreshTrigger]); // Add refreshTrigger dependency
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className={`h-full overflow-hidden flex flex-col ${darkMode ? 'bg-zinc-900' : 'bg-white'} border-r ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h2 className={`font-medium text-base ${darkMode ? 'text-white' : 'text-zinc-800'}`}>Your Animations</h2>
        <button 
          onClick={() => onSelectAnimation('new')}
          className={`p-2 rounded-md ${darkMode ? 'hover:bg-zinc-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'} transition-colors duration-200`}
          aria-label="Create new animation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-5 w-5 border-2 border-zinc-400 dark:border-zinc-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 text-sm">
            {error}
          </div>
        ) : animations.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-32 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'} space-y-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v19"></path>
              <path d="M5 8l7-5 7 5"></path>
              <path d="M5 16l7 5 7-5"></path>
            </svg>
            <p className="text-sm font-medium">No animations yet</p>
            <button 
              onClick={() => onSelectAnimation('new')}
              className={`text-xs py-1 px-3 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'} transition-colors duration-200`}
            >
              Create your first one
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {animations.map(animation => (
              <div 
                key={animation._id}
                onClick={() => onSelectAnimation(animation._id)}
                className={`p-3 rounded-md cursor-pointer transition-all ${
                  currentAnimationId === animation._id 
                    ? darkMode 
                      ? 'bg-zinc-800 border-l-2 border-white' 
                      : 'bg-zinc-100 border-l-2 border-zinc-900'
                    : darkMode
                      ? 'hover:bg-zinc-800/70' 
                      : 'hover:bg-zinc-100'
                }`}
              >
                <h3 className={`font-medium text-sm line-clamp-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{animation.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {formatDate(animation.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}