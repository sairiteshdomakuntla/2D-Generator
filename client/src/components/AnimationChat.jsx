import { useState, useRef, useEffect } from 'react';

export default function AnimationChat({ 
  darkMode, 
  messages = [], 
  onSendMessage, 
  loading 
}) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && !loading) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-zinc-900' : 'bg-white'} border ${darkMode ? 'border-zinc-800' : 'border-zinc-200'} rounded-lg`}>
      <div className={`p-3 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <h2 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
          Animation Controls
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 p-4">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className={`text-sm text-center ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Start by asking for modifications to your animation
            </p>
            <p className={`text-xs text-center ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Try "make it move faster" or "change colors to blue"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'ml-auto' 
                    : 'mr-auto'
                }`}
              >
                <div className={`rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? darkMode
                      ? 'bg-zinc-700 text-white' 
                      : 'bg-zinc-800 text-white'
                    : darkMode
                      ? 'bg-zinc-800 text-zinc-200' 
                      : 'bg-zinc-100 text-zinc-800'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user'
                    ? 'text-right'
                    : ''
                } ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className={`border-t border-zinc-200 dark:border-zinc-800 p-4`}>
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type instructions for your animation..."
            disabled={loading}
            className={`flex-1 rounded-l-lg py-2.5 px-4 focus:outline-none text-sm ${
              darkMode 
                ? 'bg-zinc-800 text-white placeholder-zinc-500 border-zinc-700' 
                : 'bg-zinc-100 text-zinc-900 placeholder-zinc-500 border-zinc-200'
            } border border-r-0`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className={`rounded-r-lg px-4 py-2.5 font-medium text-sm ${
              !newMessage.trim() || loading
                ? darkMode
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : darkMode
                  ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
            } transition-colors duration-200`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}