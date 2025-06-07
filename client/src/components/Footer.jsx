export default function Footer({ darkMode }) {
  return (
    <footer className={`py-6 ${
      darkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
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
            <span className="text-sm font-medium">AnimateAI</span>
          </div>
          
          <div className="text-xs">
            © {new Date().getFullYear()} AnimateAI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}