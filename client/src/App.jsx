import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [sketchCode, setSketchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [duration, setDuration] = useState(5);
  const [darkMode, setDarkMode] = useState(false);
  const errorTimerRef = useRef(null);
  const iframeRef = useRef(null);

  // Handle dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      errorTimerRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any video URLs to prevent memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setSketchCode(''); // Clear previous sketch before loading new one
    
    try {
      const res = await axios.post('http://localhost:5000/api/generate-code', { prompt });
      setSketchCode(res.data.code);
    } catch (err) {
      console.error('Error generating sketch:', err);
      if (err.response && err.response.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate animation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportVideo = () => {
    if (!iframeRef.current) return;

    setRecordingVideo(true);
    
    // Send message to iframe to start recording
    iframeRef.current.contentWindow.postMessage({ 
      action: 'startRecording',
      duration: duration * 1000 // Convert to milliseconds
    }, '*');
    
    // Listen for the video data from the iframe
    window.addEventListener('message', function videoMessageHandler(event) {
      if (event.data && event.data.action === 'videoReady') {
        try {
          // Create a URL for the video blob
          const videoBlob = new Blob([event.data.videoData], { type: 'video/webm' });
          const url = URL.createObjectURL(videoBlob);
          setVideoUrl(url);
        } catch (err) {
          console.error('Error creating video:', err);
          setError('Failed to create video. Please try again.');
        } finally {
          setRecordingVideo(false);
        }
        
        // Remove the event listener
        window.removeEventListener('message', videoMessageHandler);
      } else if (event.data && event.data.action === 'recordingError') {
        setError(event.data.error || 'Error recording video');
        setRecordingVideo(false);
        window.removeEventListener('message', videoMessageHandler);
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !recordingVideo) {
      handleGenerate();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">p5.js Animator</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 bg-opacity-20 hover:bg-opacity-30 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Describe your animation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`flex-grow px-4 py-3 rounded-l border focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-400'
              }`}
              disabled={isLoading || recordingVideo}
            />
            <button 
              onClick={handleGenerate}
              disabled={isLoading || recordingVideo || !prompt.trim()}
              className={`px-6 py-3 rounded-r font-medium transition-colors ${
                isLoading || recordingVideo || !prompt.trim()
                  ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : 'Generate Animation'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4 fade-in" role="alert">
              <span className="block sm:inline">{error}</span>
              <button 
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError(null)}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          )}
        </div>

        {sketchCode && !videoUrl && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Generated Animation</h2>
            <div className="relative">
              <iframe
                ref={iframeRef}
                id="p5-iframe"
                title="p5-preview"
                srcDoc={`
                  <html>
                    <head>
                      <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com https://unpkg.com http://localhost:*">
                    </head>
                    <body style="margin:0;overflow:hidden;background-color:${darkMode ? '#1f2937' : '#ffffff'}">
                      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
                      <script src="https://unpkg.com/p5.createloop@0.3.1/dist/p5.createloop.js"></script>
                      <script>
                        // Handle sensor features
                        window.addEventListener('load', function() {
                          if (typeof p5 !== 'undefined') {
                            p5.prototype._ondeviceorientation = function() {};
                            p5.prototype._ondevicemotion = function() {};
                          }
                        });
                        
                        // Enhanced video recording
                        let canvas;
                        let mediaRecorder;
                        let recordedChunks = [];
                        const FPS = 30;
                        let recordingDuration = 5000; // Default 5 seconds
                        
                        function setupRecording() {
                          canvas = document.querySelector('canvas');
                          if (!canvas) {
                            console.error('Canvas element not found');
                            return;
                          }
                          
                          // Listen for messages from parent frame
                          window.addEventListener('message', (event) => {
                            if (event.data && event.data.action === 'startRecording') {
                              // Use requested duration if provided
                              if (event.data.duration) {
                                recordingDuration = event.data.duration;
                              }
                              startRecording();
                            }
                          });
                        }
                        
                        function startRecording() {
                          if (!canvas) {
                            window.parent.postMessage({
                              action: 'recordingError',
                              error: 'Canvas not initialized'
                            }, '*');
                            return;
                          }
                          
                          recordedChunks = [];
                          
                          try {
                            const stream = canvas.captureStream(FPS);
                            const options = { mimeType: 'video/webm;codecs=vp9' };
                            
                            // Use fallback codec if VP9 isn't supported
                            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                              console.log('VP9 not supported, using default codec');
                              mediaRecorder = new MediaRecorder(stream);
                            } else {
                              mediaRecorder = new MediaRecorder(stream, options);
                            }
                            
                            mediaRecorder.ondataavailable = (e) => {
                              if (e.data.size > 0) {
                                recordedChunks.push(e.data);
                              }
                            };
                            
                            mediaRecorder.onstop = () => {
                              const blob = new Blob(recordedChunks, { type: 'video/webm' });
                              window.parent.postMessage({
                                action: 'videoReady',
                                videoData: blob
                              }, '*');
                            };
                            
                            mediaRecorder.onerror = (event) => {
                              console.error('MediaRecorder error:', event);
                              window.parent.postMessage({
                                action: 'recordingError',
                                error: 'MediaRecorder error: ' + event.name
                              }, '*');
                            };
                            
                            // Start recording with smaller time slices for more frequent chunks
                            mediaRecorder.start(200);
                            
                            // Stop recording after duration
                            setTimeout(() => {
                              if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                                mediaRecorder.stop();
                              }
                            }, recordingDuration);
                          } catch (err) {
                            console.error('Recording error:', err);
                            window.parent.postMessage({
                              action: 'recordingError',
                              error: 'Failed to start recording: ' + err.message
                            }, '*');
                          }
                        }
                        
                        // Set up recording after sketch is initialized
                        window.addEventListener('load', () => {
                          // Wait for canvas to be created by p5.js
                          setTimeout(setupRecording, 1000);
                        });
                        
                        // Wrap in try-catch to prevent unhandled errors
                        try {
                          ${sketchCode}
                        } catch(e) {
                          document.body.innerHTML = '<div style="color:${darkMode ? '#f87171' : '#dc2626'};padding:20px;font-family:system-ui;">Error in sketch: ' + e.message + '</div>';
                          console.error(e);
                          
                          // Report error to parent
                          window.parent.postMessage({
                            action: 'recordingError',
                            error: 'Sketch error: ' + e.message
                          }, '*');
                        }
                      </script>
                    </body>
                  </html>
                `}
                className="w-full aspect-square rounded border dark:border-gray-700"
                sandbox="allow-scripts allow-same-origin"
              />
              
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center">
                  <label htmlFor="duration" className="mr-2 text-sm">Duration (seconds):</label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={recordingVideo}
                    className={`rounded border px-2 py-1 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                  </select>
                </div>
                
                <button
                  onClick={handleExportVideo}
                  disabled={recordingVideo}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded font-medium transition-colors ${
                    recordingVideo
                      ? 'bg-green-300 dark:bg-green-800 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white'
                  }`}
                >
                  {recordingVideo ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Recording... ({duration}s)
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" fill="none" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                      Export Video
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {videoUrl && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Exported Video</h2>
            <div className="flex flex-col items-center">
              <video 
                controls 
                src={videoUrl} 
                className="w-full aspect-square rounded mb-4"
              />
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setVideoUrl(null)}
                  className="flex-1 px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Animation
                  </div>
                </button>
                <a
                  href={videoUrl}
                  download={`p5js-${prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}-${new Date().getTime()}.webm`}
                  className="flex-1 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Video
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
        
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>p5.js Animator &copy; {new Date().getFullYear()} | Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;