export default function ExportedVideo({ videoUrl, setVideoUrl, prompt, darkMode }) {
  return (
    <div className="mb-12 animate-fade-in animate-slide-up">
      <div className="relative">
        <div className={`absolute -inset-1.5 rounded-2xl blur-lg bg-gradient-to-r ${
          darkMode 
            ? 'from-purple-600 via-indigo-600 to-blue-600' 
            : 'from-purple-400 via-indigo-400 to-blue-500'
          } opacity-30 group-hover:opacity-60 transition duration-500`}></div>
        <div className={`relative rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            Exported Video
            <span className="ml-3 text-xs font-normal px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">Ready to download</span>
          </h2>
          <div className="flex flex-col items-center">
            <div className="relative w-full overflow-hidden rounded-lg shadow-inner mb-8 bg-black/10 dark:bg-black/30">
              <video 
                controls 
                src={videoUrl} 
                className="w-full aspect-square"
                autoPlay
                loop
                muted
              />
              <div className="absolute inset-0 border-4 border-white dark:border-gray-700 opacity-10 pointer-events-none rounded-lg"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <button
                onClick={() => setVideoUrl(null)}
                className="group py-4 px-6 rounded-lg font-bold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/20 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Animation
                </div>
              </button>
              <a
                href={videoUrl}
                download={`p5js-animation-${prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}-${new Date().getTime()}.webm`}
                className="group py-4 px-6 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 text-center"
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Video
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}