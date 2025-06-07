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
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Start by asking for modifications to your animation
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-3/4 ${
                  msg.role === 'user' 
                    ? 'ml-auto bg-blue-500 text-white' 
                    : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                } rounded-lg p-3`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask for changes to your animation..."
            disabled={loading}
            className={`flex-1 rounded-l-lg border-0 py-3 px-4 focus:ring-2 ${
              darkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-300'
            }`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className={`rounded-r-lg px-4 py-3 font-medium ${
              !newMessage.trim() || loading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}