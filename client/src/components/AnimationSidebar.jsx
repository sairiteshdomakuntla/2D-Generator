import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AnimationSidebar({ darkMode, currentAnimationId, onSelectAnimation }) {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
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
  }, []);
  
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
    <div className={`h-full overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Your Animations</h2>
        <button 
          onClick={() => onSelectAnimation('new')}
          className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          aria-label="Create new animation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : animations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            No animations yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-2">
            {animations.map(animation => (
              <div 
                key={animation._id}
                onClick={() => onSelectAnimation(animation._id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentAnimationId === animation._id 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h3 className="font-medium text-sm line-clamp-1">{animation.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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