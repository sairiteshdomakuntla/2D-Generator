import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import ErrorAlert from './components/ErrorAlert';
import CreditAlert from './components/CreditAlert';
import AnimationCanvas from './components/AnimationCanvas';
import ExportedVideo from './components/ExportedVideo';
import AnimationSidebar from './components/AnimationSidebar';
import AnimationChat from './components/AnimationChat';
import PurchaseCredits from './pages/PurchaseCredits';


function App() {
  const { user, isSignedIn } = useUser();  // Add isSignedIn here
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
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [creditsRefreshTrigger, setCreditsRefreshTrigger] = useState(0);
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
      
      await axios.put(`${import.meta.env.VITE_API_URL}/api/animations/${animationId}/save-video`, 
        { videoUrl: url },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error saving video URL:', err);
    }
  };

  // Clean up handleGenerate function by removing console logs
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
      const token = await getToken();
      
      // Create new animation
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/animations`, 
        { prompt },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCurrentAnimation(res.data.animation);
      setSketchCode(res.data.animation.code);
      setMessages(res.data.animation.messages);
      
      // Force a credits refresh
      setCreditsRefreshTrigger(prev => prev + 1);
      setSidebarRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error generating animation:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate animation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting an animation from the sidebar
  const handleSelectAnimation = async (animationId) => {
    if (!user || !isSignedIn) {
      return;
    }
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
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/animations/${animationId}`, {
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

  // Clean up handleSendMessage function
  const handleSendMessage = async (messageContent) => {
    if (!currentAnimation || !messageContent.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message immediately for better UX
      setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
      
      const token = await getToken();
      
      // Send message to API to modify animation
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/animations/${currentAnimation.id}/modify`, 
        { prompt: messageContent },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessages(res.data.animation.messages);
      setSketchCode(res.data.animation.code);
      
      // Force a credits refresh
      setCreditsRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error modifying animation:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to modify animation');
      }
      
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

  // Clean up handleCreditsPurchased function
  const handleCreditsPurchased = async (newCreditCount) => {
    // Remove console.log
    // Force refresh sidebar and credits
    setSidebarRefreshTrigger(prev => prev + 1);
    setCreditsRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout 
            darkMode={darkMode}
            setDarkMode={setDarkMode} 
            creditsRefreshTrigger={creditsRefreshTrigger}
          >
            <Dashboard 
              user={user}
              prompt={prompt}
              setPrompt={setPrompt}
              handleGenerate={handleGenerate}
              isLoading={isLoading}
              recordingVideo={recordingVideo}
              error={error}
              setError={setError}
              userGreeting={userGreeting}
              sketchCode={sketchCode}
              currentAnimation={currentAnimation}
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}  // Add this missing prop
              handleExportVideo={handleExportVideo}
              handleKeyPress={handleKeyPress}
              duration={duration}
              setDuration={setDuration}
              iframeRef={iframeRef}
              handleSelectAnimation={handleSelectAnimation}
              showSidebar={showSidebar}
              toggleSidebar={toggleSidebar}
              sidebarRefreshTrigger={sidebarRefreshTrigger}
              darkMode={darkMode}
              messages={messages}
              handleSendMessage={handleSendMessage}
              onCreditsPurchased={handleCreditsPurchased}
            />
          </MainLayout>
        } />
        <Route path="/purchase-credits" element={
          <MainLayout 
            darkMode={darkMode}
            setDarkMode={setDarkMode} 
            creditsRefreshTrigger={creditsRefreshTrigger}
          >
            <PurchaseCredits 
              darkMode={darkMode} 
              onPurchaseComplete={handleCreditsPurchased} 
            />
          </MainLayout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Create a layout component to share the header and footer across routes
function MainLayout({ children, darkMode, setDarkMode, creditsRefreshTrigger }) {
  const navigate = useNavigate();
  
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-zinc-900' : 'bg-zinc-50'} transition-all duration-300 ease-in-out`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        creditsRefreshTrigger={creditsRefreshTrigger}
        onBuyCredits={() => navigate('/purchase-credits')}
      />
      <div className="relative z-10 pt-16 min-h-[calc(100vh-64px)]">
        {children}
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
}

// Create a Dashboard component containing your main content
function Dashboard(props) {
  const {
    user, prompt, setPrompt, handleGenerate, isLoading, recordingVideo, error, setError,
    userGreeting, sketchCode, currentAnimation, videoUrl, setVideoUrl, handleExportVideo, handleKeyPress, 
    duration, setDuration, iframeRef, handleSelectAnimation, showSidebar, toggleSidebar, 
    sidebarRefreshTrigger, darkMode, messages, handleSendMessage, onCreditsPurchased
  } = props;
  
  return (
    <>
      {/* Sidebar toggle button for mobile */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-20 p-2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-white"
      >
        {showSidebar ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            <CreditAlert 
              error={error} 
              setError={setError} 
              darkMode={darkMode} 
              onCreditsPurchased={onCreditsPurchased}
              navigateToCredits={true} // Enable navigation to credits page
            />

            {!currentAnimation && !sketchCode ? (
              <div className="max-w-4xl mx-auto">
                {/* Your landing page content here... */}
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
                
                {/* Prompt input section */}
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
                
                {/* How it works section */}
                <div className="mb-12">
                  {/* ...your existing how it works content */}
                  <div className="flex items-center mb-8">
                    <div className={`h-px flex-grow ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                    <span className={`px-4 text-sm uppercase tracking-wider font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>How it works</span>
                    <div className={`h-px flex-grow ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                  </div>
                  
                  {/* Features grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Your feature cards here */}
                    {/* (I'm omitting the full cards for brevity) */}
                  </div>
                </div>
                
                {/* CTA section */}
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
    </>
  );
}

export default App;