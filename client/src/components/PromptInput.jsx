export default function PromptInput({
  prompt,
  setPrompt,
  handleGenerate,
  isLoading,
  recordingVideo,
  handleKeyPress
}) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe the animation you want to create..."
          disabled={isLoading || recordingVideo}
          className="w-full px-5 py-4 pr-28 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-all duration-200"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || recordingVideo || !prompt.trim()}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            isLoading || recordingVideo || !prompt.trim()
              ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </div>
  );
}