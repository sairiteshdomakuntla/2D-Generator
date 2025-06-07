import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import ErrorAlert from './components/ErrorAlert';
import AnimationCanvas from './components/AnimationCanvas';
import ExportedVideo from './components/ExportedVideo';
import AnimationSidebar from './components/AnimationSidebar';
import AnimationChat from './components/AnimationChat';

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
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const errorTimerRef = useRef(null);
  const iframeRef = useRef(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  // Handle dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark !== null ? isDark : true);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !recordingVideo && prompt.trim()) {
      handleGenerate();
    }
  };
  
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
          
          // If we have a current animation, save the video URL
          if (currentAnimation) {
            saveVideoUrl(currentAnimation.id, url);
          }
          
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

  // Save video URL to the database
  const saveVideoUrl = async (animationId, url) => {
    try {
      const token = await getToken();
      
      await axios.put(`http://localhost:5000/api/animations/${animationId}/save-video`, 
        { videoUrl: url },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error saving video URL:', err);
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
      const token = await getToken();
      
      // Create new animation
      const res = await axios.post('http://localhost:5000/api/animations', 
        { prompt },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCurrentAnimation(res.data.animation);
      setSketchCode(res.data.animation.code);
      setMessages(res.data.animation.messages);

      setSidebarRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error generating animation:', err);
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

  // Handle selecting an animation from the sidebar
  const handleSelectAnimation = async (animationId) => {
    if (animationId === 'new') {
      setCurrentAnimation(null);
      setSketchCode('');
      setMessages([]);
      setVideoUrl(null);
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      const res = await axios.get(`http://localhost:5000/api/animations/${animationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const animation = res.data.animation;
      setCurrentAnimation({
        id: animation._id,
        title: animation.title,
        code: animation.currentCode
      });
      setSketchCode(animation.currentCode);
      setMessages(animation.messages);
      setVideoUrl(animation.videoUrl || null);
    } catch (err) {
      console.error('Error loading animation:', err);
      setError('Failed to load animation');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a chat message to modify the animation
  const handleSendMessage = async (messageContent) => {
    if (!currentAnimation || !messageContent.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message immediately for better UX
      setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
      
      const token = await getToken();
      
      // Send message to API to modify animation
      const res = await axios.put(`http://localhost:5000/api/animations/${currentAnimation.id}/modify`, 
        { prompt: messageContent },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Update with the complete message history from the server
      setMessages(res.data.animation.messages);
      setSketchCode(res.data.animation.code);
    } catch (err) {
      console.error('Error modifying animation:', err);
      setError('Failed to modify animation');
      
      // Remove the temporary user message if there was an error
      setMessages(prev => prev.filter((_, index) => index !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // User greeting
  const userGreeting = user ? `Hello, ${user.firstName || user.username || 'Creator'}!` : '';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-zinc-900' : 'bg-zinc-50'} transition-all duration-300 ease-in-out`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="relative z-10 pt-16 min-h-[calc(100vh-64px)]">
        {/* Sidebar toggle button for mobile */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed z-20 top-20 left-2 bg-zinc-800 dark:bg-zinc-700 text-white p-2 rounded-full"
        >
          {showSidebar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className={`${
            showSidebar 
              ? 'translate-x-0 md:w-72 w-full fixed md:relative z-10' 
              : '-translate-x-full hidden md:block md:w-0'
            } transition-all duration-300 ease-in-out`}>
                <AnimationSidebar 
                  darkMode={darkMode} 
                  currentAnimationId={currentAnimation?.id}
                  onSelectAnimation={handleSelectAnimation}
                  refreshTrigger={sidebarRefreshTrigger}
                />
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 px-4 py-6 md:px-8 overflow-y-auto">
              {userGreeting && (
                <div className="text-center mb-6">
                  <p className="text-lg text-zinc-700 dark:text-zinc-300">{userGreeting}</p>
                </div>
              )}
              
              <ErrorAlert error={error} setError={setError} />
              
              {!currentAnimation && !sketchCode ? (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <div className="relative mb-6">
        <div className={`absolute inset-x-0 top-1/2 h-px ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
        <div className="relative flex justify-center">
          <span className={`px-6 ${darkMode ? 'bg-zinc-900' : 'bg-zinc-50'} ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
            <span className="text-xl font-semibold">AnimateAI</span>
          </span>
        </div>
      </div>
      
      <h1 className={`text-5xl md:text-6xl font-bold mb-6 tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
        <span className="block">Create AI-Powered</span>
        <span className={`block ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>2D Animations</span>
      </h1>
      
      <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Transform your imagination into mesmerizing procedural animations using just text prompts.
      </p>
    </div>
    
    <div className={`p-6 md:p-10 mb-16 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-200 bg-white'} shadow-lg`}>
      <div className="mb-4">
        <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          What would you like to animate today?
        </h2>
        <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Try "a flock of birds flying across the sunset" or "particles forming a spinning galaxy"
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
    </div>
    
    <div className="mb-12">
      <div className="flex items-center mb-8">
        <div className={`h-px flex-grow ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
        <span className={`px-4 text-sm uppercase tracking-wider font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>How it works</span>
        <div className={`h-px flex-grow ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`rounded-xl p-6 text-center relative overflow-hidden transition-all duration-300 ${
          darkMode 
            ? 'bg-zinc-800/70 border border-zinc-700 hover:border-zinc-600' 
            : 'bg-white border border-zinc-200 hover:border-zinc-400'
        } group hover:shadow-xl`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${darkMode ? 'bg-zinc-300' : 'bg-zinc-900'}`}></div>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-300 ${
              darkMode 
                ? 'bg-zinc-700' 
                : 'bg-zinc-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                darkMode 
                  ? 'text-white' 
                  : 'text-zinc-800'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              darkMode 
                ? 'text-white' 
                : 'text-zinc-900'
            }`}>Describe Your Idea</h3>
            <p className={`${
              darkMode 
                ? 'text-zinc-400' 
                : 'text-zinc-600'
            } text-sm leading-relaxed`}>Use natural language to describe the animation you want to create. Be specific or abstract.</p>
          </div>
        </div>
        
        <div className={`rounded-xl p-6 text-center relative overflow-hidden transition-all duration-300 ${
          darkMode 
            ? 'bg-zinc-800/70 border border-zinc-700 hover:border-zinc-600' 
            : 'bg-white border border-zinc-200 hover:border-zinc-400'
        } group hover:shadow-xl`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${darkMode ? 'bg-zinc-300' : 'bg-zinc-900'}`}></div>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-300 ${
              darkMode 
                ? 'bg-zinc-700' 
                : 'bg-zinc-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                darkMode 
                  ? 'text-white' 
                  : 'text-zinc-800'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              darkMode 
                ? 'text-white' 
                : 'text-zinc-900'
            }`}>Generate Animation</h3>
            <p className={`${
              darkMode 
                ? 'text-zinc-400' 
                : 'text-zinc-600'
            } text-sm leading-relaxed`}>Our AI generates custom code that brings your description to life with beautiful visual effects.</p>
          </div>
        </div>
        
        <div className={`rounded-xl p-6 text-center relative overflow-hidden transition-all duration-300 ${
          darkMode 
            ? 'bg-zinc-800/70 border border-zinc-700 hover:border-zinc-600' 
            : 'bg-white border border-zinc-200 hover:border-zinc-400'
        } group hover:shadow-xl`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${darkMode ? 'bg-zinc-300' : 'bg-zinc-900'}`}></div>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-300 ${
              darkMode 
                ? 'bg-zinc-700' 
                : 'bg-zinc-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                darkMode 
                  ? 'text-white' 
                  : 'text-zinc-800'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              darkMode 
                ? 'text-white' 
                : 'text-zinc-900'
            }`}>Export & Share</h3>
            <p className={`${
              darkMode 
                ? 'text-zinc-400' 
                : 'text-zinc-600'
            } text-sm leading-relaxed`}>Download your animation as a video file to use in presentations, social media, or anywhere you need.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className={`p-8 rounded-2xl text-center ${darkMode ? 'bg-zinc-800/30 border border-zinc-700' : 'bg-zinc-100/60 border border-zinc-200'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Ready to create something amazing?</h2>
      <p className={`mb-6 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Start with a simple prompt and refine your animation through conversation.</p>
      <button 
        onClick={() => setPrompt("A colorful geometric pattern that morphs and transforms")}
        className={`px-8 py-3 text-sm font-medium rounded-lg transition-all ${
          darkMode
            ? 'bg-white text-zinc-900 hover:bg-zinc-200'
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        }`}
      >
        Try a sample prompt
      </button>
    </div>
  </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 h-full">
                  {/* Animation display */}
                  <div className="md:w-2/3">
                    {sketchCode && !videoUrl && (
                      <div className={`rounded-lg overflow-hidden border ${
                        darkMode 
                          ? 'border-zinc-700' 
                          : 'border-zinc-200'
                      } shadow-md`}>
                        <AnimationCanvas 
                          sketchCode={sketchCode}
                          darkMode={darkMode}
                          duration={duration}
                          setDuration={setDuration}
                          recordingVideo={recordingVideo}
                          handleExportVideo={handleExportVideo}
                          iframeRef={iframeRef}
                        />
                      </div>
                    )}
                    
                    {videoUrl && (
                      <div className={`rounded-lg overflow-hidden border ${
                        darkMode 
                          ? 'border-zinc-700' 
                          : 'border-zinc-200'
                      } shadow-md`}>
                        <ExportedVideo
                          videoUrl={videoUrl}
                          setVideoUrl={setVideoUrl}
                          prompt={currentAnimation?.title || prompt}
                          darkMode={darkMode}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Chat interface */}
                  <div className="md:w-1/3 h-[600px] rounded-lg overflow-hidden shadow-md">
                    <AnimationChat 
                      darkMode={darkMode} 
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      loading={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;