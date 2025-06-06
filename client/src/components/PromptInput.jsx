export default function PromptInput({ prompt, setPrompt, handleGenerate, isLoading, recordingVideo, handleKeyPress }) {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="relative group transition-all duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-300 animate-gradient"></div>
        <div className="relative flex rounded-lg overflow-hidden shadow-xl">
          <input
            type="text"
            placeholder="Describe your animation dream..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow px-5 py-5 text-base md:text-lg rounded-l-lg border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100"
            disabled={isLoading || recordingVideo}
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || recordingVideo || !prompt.trim()}
            className={`px-8 py-4 font-medium transition-all duration-300 flex items-center justify-center min-w-[160px] rounded-r-lg ${
              isLoading || recordingVideo || !prompt.trim()
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-white/70 dark:text-white/50'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]'
            }`}
            aria-label="Generate Animation"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Creating Magic...</span>
              </div>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                Generate Animation
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Try: "A colorful fish swimming in the ocean" or "Stars twinkling in the night sky"
        </p>
      </div>
    </div>
  );
}