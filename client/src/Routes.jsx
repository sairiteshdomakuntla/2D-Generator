import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useUser, SignIn, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import App from './App';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import { useEffect } from 'react';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Redirect to sign-in if user is not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // User is signed in, render the protected content
  return children;
};

// Error handler component for OAuth errors
const OAuthCallbackHandler = () => {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  
  // Directly redirect to home if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = '/';
    }
  }, [isLoaded, isSignedIn]);
  
  // Check if there's an error in the URL
  if (location.search?.includes('err_code=') || location.hash?.includes('err_code=')) {
    console.error("OAuth error detected:", location.search || location.hash);
    // Redirect to the sign-in page
    return <Navigate to="/sign-in" replace />;
  }
  
  // Still render the Clerk component to let it process the callback data
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
      <p className="text-white text-lg">Completing authentication...</p>
      <SignIn routing="path" path="/sign-in/sso-callback" redirectUrl="/" />
    </div>
  );
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ClerkLoading>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </ClerkLoading>
      
      <ClerkLoaded>
        <Routes>
          {/* Main authentication routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          
          {/* Custom OAuth callback handler */}
          <Route path="/sign-in/sso-callback" element={<OAuthCallbackHandler />} />
          
          {/* Important: Add these routes for complete OAuth handling */}
          <Route path="/clerk/*" element={<Navigate to="/" replace />} />
          <Route path="/v1/*" element={<Navigate to="/" replace />} />
          
          {/* Handle any OAuth errors more generally */}
          <Route path="/v1/oauth_callback" element={<OAuthCallbackHandler />} />
          
          {/* Catch other potential SSO callback paths */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          
          {/* Protected home route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback for any unhandled routes */}
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </ClerkLoaded>
    </BrowserRouter>
  );
}