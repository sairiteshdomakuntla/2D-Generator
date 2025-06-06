// import { useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [prompt, setPrompt] = useState('');
//   const [sketchCode, setSketchCode] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) {
//       setError('Please enter a prompt');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const res = await axios.post('http://localhost:5000/api/generate-code', { prompt });
//       setSketchCode(res.data.code);
//     } catch (err) {
//       console.error('Error generating sketch:', err);
//       if (err.response && err.response.status === 429) {
//         setError('Rate limit exceeded. Please try again later.');
//       } else if (err.response && err.response.data && err.response.data.error) {
//         setError(err.response.data.error);
//       } else {
//         setError('Failed to generate sketch. Please try again.');
//       }
//       setSketchCode('');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
//       <h1>p5.js Animator</h1>
//       <div style={{ marginBottom: '20px' }}>
//         <input
//           type="text"
//           placeholder="Enter a prompt..."
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           style={{ 
//             padding: '8px', 
//             width: '70%',
//             marginRight: '10px'
//           }}
//           disabled={isLoading}
//         />
//         <button 
//           onClick={handleGenerate}
//           disabled={isLoading}
//           style={{ 
//             padding: '8px 16px',
//             cursor: isLoading ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {isLoading ? 'Generating...' : 'Generate Sketch'}
//         </button>
//       </div>

//       {error && (
//         <div style={{ 
//           color: 'red', 
//           marginBottom: '15px', 
//           padding: '10px', 
//           border: '1px solid red',
//           borderRadius: '4px',
//           backgroundColor: '#ffeeee'
//         }}>
//           {error}
//         </div>
//       )}

//       {sketchCode && (
//         <div>
//           <h3>Generated Sketch</h3>
//           <iframe
//             title="p5-preview"
//             srcDoc={`
//               <html>
//                 <head>
//                   <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com http://localhost:*">
//                 </head>
//                 <body style="margin:0;overflow:hidden;">
//                   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
//                   <script>
//                     // Disable sensor features that cause permission policy violations
//                     window.addEventListener('load', function() {
//                       if (typeof p5 !== 'undefined') {
//                         // Override deviceOrientation methods to prevent errors
//                         p5.prototype._ondeviceorientation = function() {};
//                         p5.prototype._ondevicemotion = function() {};
//                       }
//                     });
                    
//                     // Handle file loading differently to avoid CORS
//                     window.preloadFiles = {
//                       // You can add pre-loaded data here if needed
//                     };
                    
//                     // Wrap in try-catch to prevent unhandled errors
//                     try {
//                       ${sketchCode}
//                     } catch(e) {
//                       document.body.innerHTML = '<div style="color:red;padding:20px;">Error in sketch: ' + e.message + '</div>';
//                       console.error(e);
//                     }
//                   </script>
//                 </body>
//               </html>
//             `}
//             width="400"
//             height="400"
//             sandbox="allow-scripts allow-same-origin"
//             style={{ border: '1px solid #ccc', marginBottom: '20px' }}
//           />
//           <div>
//             <h4>Code</h4>
//             <pre style={{ 
//               backgroundColor: '#f5f5f5', 
//               padding: '10px', 
//               borderRadius: '4px',
//               overflow: 'auto',
//               maxHeight: '300px'
//             }}>
//               <code>{sketchCode}</code>
//             </pre>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;





import { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [sketchCode, setSketchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    
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
        setError('Failed to generate sketch. Please try again.');
      }
      setSketchCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportVideo = () => {
    const iframe = document.getElementById('p5-iframe');
    if (!iframe) return;

    setRecordingVideo(true);
    
    // Send message to iframe to start recording
    iframe.contentWindow.postMessage({ action: 'startRecording' }, '*');
    
    // Listen for the video data from the iframe
    window.addEventListener('message', function videoMessageHandler(event) {
      if (event.data && event.data.action === 'videoReady') {
        // Create a URL for the video blob
        const videoBlob = new Blob([event.data.videoData], { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        setRecordingVideo(false);
        
        // Remove the event listener
        window.removeEventListener('message', videoMessageHandler);
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>p5.js Animator</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter a prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ 
            padding: '8px', 
            width: '70%',
            marginRight: '10px'
          }}
          disabled={isLoading || recordingVideo}
        />
        <button 
          onClick={handleGenerate}
          disabled={isLoading || recordingVideo}
          style={{ 
            padding: '8px 16px',
            cursor: (isLoading || recordingVideo) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Animation'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px', 
          padding: '10px', 
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#ffeeee'
        }}>
          {error}
        </div>
      )}

      {sketchCode && !videoUrl && (
        <div>
          <h3>Generated Animation</h3>
          <div style={{ position: 'relative' }}>
            <iframe
              id="p5-iframe"
              title="p5-preview"
              srcDoc={`
                <html>
                  <head>
                    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com http://localhost:*">
                  </head>
                  <body style="margin:0;overflow:hidden;">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
                    <script src="https://unpkg.com/p5.createloop@0.3.1/dist/p5.createloop.js"></script>
                    
                    <!-- Add MediaRecorder polyfill -->
                    <script src="https://unpkg.com/webm-writer@0.3.0/WebMWriter.js"></script>

                    <script>
                      // Disable sensor features that cause permission policy violations
                      window.addEventListener('load', function() {
                        if (typeof p5 !== 'undefined') {
                          p5.prototype._ondeviceorientation = function() {};
                          p5.prototype._ondevicemotion = function() {};
                        }
                      });
                      
                      // Handle video recording
                      let canvas;
                      let mediaRecorder;
                      let recordedChunks = [];
                      const FPS = 30;
                      let recordingStartTime;
                      let recordingDuration = 5000; // 5 seconds
                      
                      // Custom recording function
                      function setupRecording() {
                        canvas = document.querySelector('canvas');
                        if (!canvas) return;
                        
                        // Listen for messages from parent frame
                        window.addEventListener('message', (event) => {
                          if (event.data && event.data.action === 'startRecording') {
                            startRecording();
                          }
                        });
                      }
                      
                      function startRecording() {
                        recordedChunks = [];
                        const stream = canvas.captureStream(FPS);
                        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
                        
                        mediaRecorder.ondataavailable = (e) => {
                          if (e.data.size > 0) {
                            recordedChunks.push(e.data);
                          }
                        };
                        
                        mediaRecorder.onstop = () => {
                          const blob = new Blob(recordedChunks, { type: 'video/webm' });
                          // Send the video data back to the parent
                          window.parent.postMessage({
                            action: 'videoReady',
                            videoData: blob
                          }, '*');
                        };
                        
                        recordingStartTime = Date.now();
                        mediaRecorder.start(100);
                        
                        // Stop recording after duration
                        setTimeout(() => {
                          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                            mediaRecorder.stop();
                          }
                        }, recordingDuration);
                      }
                      
                      // Set up recording after sketch is initialized
                      window.addEventListener('load', () => {
                        setTimeout(setupRecording, 1000);
                      });
                      
                      // Wrap in try-catch to prevent unhandled errors
                      try {
                        ${sketchCode}
                      } catch(e) {
                        document.body.innerHTML = '<div style="color:red;padding:20px;">Error in sketch: ' + e.message + '</div>';
                        console.error(e);
                      }
                    </script>
                  </body>
                </html>
              `}
              width="400"
              height="400"
              sandbox="allow-scripts allow-same-origin"
              style={{ border: '1px solid #ccc', marginBottom: '20px' }}
            />
            <button
              onClick={handleExportVideo}
              disabled={recordingVideo}
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '10px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: recordingVideo ? 'not-allowed' : 'pointer'
              }}
            >
              {recordingVideo ? 'Recording...' : 'Export Video'}
            </button>
          </div>
        </div>
      )}
      
      {videoUrl && (
        <div>
          <h3>Exported Video</h3>
          <video 
            controls 
            src={videoUrl} 
            width="400" 
            height="400"
            style={{ border: '1px solid #ccc', marginBottom: '20px' }}
          />
          <div>
            <button
              onClick={() => setVideoUrl(null)}
              style={{
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Animation
            </button>
            <a
              href={videoUrl}
              download="p5js-animation.webm"
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Download Video
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;