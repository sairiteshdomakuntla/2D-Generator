// filepath: d:\proj\video-generator\client\src\components\AnimationCanvas.jsx
import { useRef } from 'react';

export default function AnimationCanvas({ sketchCode, darkMode, duration, setDuration, recordingVideo, handleExportVideo, iframeRef }) {
  return (
    <div className="mb-12 animate-fade-in animate-slide-up">
      <div className="relative">
        <div className={`absolute -inset-1.5 rounded-2xl blur-lg bg-gradient-to-r ${
          darkMode 
            ? 'from-blue-600 via-indigo-600 to-purple-600' 
            : 'from-blue-400 via-indigo-400 to-purple-500'
          } opacity-30 group-hover:opacity-60 transition duration-500`}></div>
        <div className={`relative rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
            Generated Animation
            <span className="ml-3 text-xs font-normal px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">Live Preview</span>
          </h2>
          
          <div className="relative group">
            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
              <iframe
                ref={iframeRef}
                id="p5-iframe"
                title="p5-preview"
                srcDoc={`
                  <html>
                    <head>
                      <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com https://unpkg.com http://localhost:*">
                      <style>
                        body { 
                          margin: 0;
                          overflow: hidden;
                          background-color: ${darkMode ? '#1f2937' : '#ffffff'};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        canvas {
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        }
                      </style>
                    </head>
                    <body>
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
                className="w-full aspect-square rounded-lg shadow-inner bg-white dark:bg-gray-900"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative flex items-center bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg shadow-inner">
                <label htmlFor="duration" className="font-medium mr-3 text-gray-700 dark:text-gray-300">Video Length:</label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={recordingVideo}
                  className={`flex-1 rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white transition-colors focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-600 focus:ring-blue-500' 
                      : 'bg-white focus:ring-blue-400'
                  }`}
                >
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </div>
              
              <button
                onClick={handleExportVideo}
                disabled={recordingVideo}
                className={`relative group py-4 px-6 rounded-lg font-bold transition-all duration-300 ${
                  recordingVideo
                    ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white hover:shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-1'
                }`}
              >
                {recordingVideo ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Recording... ({duration}s)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>
    </div>
  );
}