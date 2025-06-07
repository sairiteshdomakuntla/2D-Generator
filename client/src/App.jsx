// filepath: d:\proj\video-generator\client\src\App.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import ErrorAlert from './components/ErrorAlert';
import AnimationCanvas from './components/AnimationCanvas';
import ExportedVideo from './components/ExportedVideo';

function App() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [sketchCode, setSketchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [duration, setDuration] = useState(5);
  const [darkMode, setDarkMode] = useState(true);
  const errorTimerRef = useRef(null);
  const iframeRef = useRef(null);

  // Handle dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark !== null ? isDark : true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, []);

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

  // Add the missing handleKeyPress function
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !recordingVideo && prompt.trim()) {
      handleGenerate();
    }
  };
  
  // Add the missing handleExportVideo function
  const handleExportVideo = () => {
    if (recordingVideo || !iframeRef.current) return;
    
    setRecordingVideo(true);
    setError(null);
    
    try {
      // Send message to iframe to start recording
      iframeRef.current.contentWindow.postMessage({
        action: 'startRecording',
        duration: duration * 1000 // Convert to milliseconds
      }, '*');
      
      // Set up listener for when video is ready
      const handleMessage = (event) => {
        if (event.data && event.data.action === 'videoReady') {
          const blob = event.data.videoData;
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setRecordingVideo(false);
          window.removeEventListener('message', handleMessage);
        }
        
        if (event.data && event.data.action === 'recordingError') {
          setError(`Recording error: ${event.data.error}`);
          setRecordingVideo(false);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('Error starting video export:', err);
      setError('Failed to start video export');
      setRecordingVideo(false);
    }
  };

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
      // Get the token without specifying a template name
      const token = await getToken(); // Remove the parameters that are causing the error
      
      // Send API request with authentication
      const res = await axios.post('http://localhost:5000/api/generate-code', 
        { prompt },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setSketchCode(res.data.code);
    } catch (err) {
      console.error('Error generating sketch:', err);
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please sign in again.');
      } else if (err.response && err.response.status === 429) {
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

  // User greeting
  const userGreeting = user ? `Hello, ${user.firstName || user.username || 'Creator'}!` : '';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} transition-all duration-500 ease-in-out`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {userGreeting && (
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">{userGreeting}</p>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-4">
            Create AI-Powered 2D Animations
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Turn your ideas into beautiful procedural animations with a simple text prompt
          </p>
        </div>

        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          handleGenerate={handleGenerate}
          isLoading={isLoading}
          recordingVideo={recordingVideo}
          handleKeyPress={handleKeyPress}
        />
        
        <ErrorAlert error={error} setError={setError} />
        
        {sketchCode && !videoUrl && (
          <AnimationCanvas 
            sketchCode={sketchCode}
            darkMode={darkMode}
            duration={duration}
            setDuration={setDuration}
            recordingVideo={recordingVideo}
            handleExportVideo={handleExportVideo}
            iframeRef={iframeRef}
          />
        )}
        
        {videoUrl && (
          <ExportedVideo
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            prompt={prompt}
            darkMode={darkMode}
          />
        )}

        {!sketchCode && !isLoading && (
          <div className="mt-16 mb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`rounded-xl shadow-lg p-6 text-center ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm`}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Describe Your Idea</h3>
              <p className="text-gray-600 dark:text-gray-400">Use natural language to describe the animation you want to create</p>
            </div>
            
            <div className={`rounded-xl shadow-lg p-6 text-center ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm`}>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Generate Animation</h3>
              <p className="text-gray-600 dark:text-gray-400">AI creates custom 2D Animations that brings your description to life</p>
            </div>
            
            <div className={`rounded-xl shadow-lg p-6 text-center ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm`}>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Export & Share</h3>
              <p className="text-gray-600 dark:text-gray-400">Download your animation as a video file to use anywhere</p>
            </div>
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;