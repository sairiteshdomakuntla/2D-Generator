import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PurchaseCredits({ darkMode, onPurchaseComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  useEffect(() => {
    // Load available plans when component mounts
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const res = await axios.get('http://localhost:5000/api/plans', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPlans(res.data.plans);
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [getToken]);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setPurchaseStatus(null);
      const token = await getToken();
      
      // Create Razorpay order
      const orderRes = await axios.post('http://localhost:5000/api/create-order', 
        { planId: selectedPlan },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const { order_id, amount, currency, plan } = orderRes.data;
      
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: amount,
          currency: currency,
          name: 'AnimateAI',
          description: `${plan.name} - ${plan.credits} Credits`,
          order_id: order_id,
          handler: async function(response) {
            try {
              console.log('Payment successful, verifying...', response);
              
              // Verify payment on server
              const verifyRes = await axios.post('http://localhost:5000/api/verify-payment',
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: selectedPlan
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              console.log('Verification response:', verifyRes.data);
              
              if (verifyRes.data.success) {
                setPurchaseStatus('success');
                setTimeout(() => {
                  if (onPurchaseComplete) {
                    onPurchaseComplete(verifyRes.data.credits);
                  }
                  navigate('/');
                }, 2000);
              } else {
                setPurchaseStatus('error');
                setIsLoading(false);
              }
            } catch (err) {
              console.error('Payment verification failed:', err);
              setPurchaseStatus('error');
              setIsLoading(false);
            }
          },
          prefill: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
            email: user?.primaryEmailAddress?.emailAddress || '',
          },
          theme: {
            color: darkMode ? '#4f46e5' : '#4338ca',
          },
          modal: {
            ondismiss: function() {
              setIsLoading(false);
            }
          }
        };
        
        const razorpayWindow = new window.Razorpay(options);
        razorpayWindow.open();
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setPurchaseStatus('error');
        setIsLoading(false);
      };
      
    } catch (err) {
      console.error('Error initiating payment:', err);
      setPurchaseStatus('error');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 mt-16">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className={`flex items-center mb-8 text-sm ${
          darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>
      
      <div className={`rounded-xl p-8 shadow-lg ${
        darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-200'
      }`}>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          Purchase Credits
        </h1>
        <p className={`mb-6 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Add more credits to your account to continue creating amazing animations.
        </p>
        
        {purchaseStatus === 'success' ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              Payment Successful!
            </h3>
            <p className={`mt-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Credits have been added to your account. Redirecting you back...
            </p>
          </div>
        ) : purchaseStatus === 'error' ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
              Payment Failed
            </h3>
            <p className={`mt-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              There was a problem processing your payment. Please try again.
            </p>
            <button
              onClick={() => setPurchaseStatus(null)}
              className={`mt-4 px-6 py-2 text-sm font-medium rounded-md ${
                darkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
              }`}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div className={`border-b pb-4 ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <h2 className={`text-lg font-medium mb-3 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Select a Credit Package
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div 
                      key={i}
                      className={`rounded-lg border p-6 animate-pulse ${
                        darkMode ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-50'
                      }`}
                    >
                      <div className={`h-6 mb-2 rounded ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                      <div className={`h-4 w-3/4 mb-4 rounded ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                      <div className={`h-5 w-1/2 mb-4 rounded ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                      <div className={`h-6 w-1/4 rounded ${darkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                    </div>
                  ))
                ) : (
                  plans.map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative rounded-lg border p-6 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? darkMode 
                            ? 'border-indigo-500 bg-indigo-900/30 ring-2 ring-indigo-500' 
                            : 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500'
                          : darkMode
                            ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50'
                            : 'border-zinc-200 hover:border-zinc-100 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{plan.name}</p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.description}</p>
                        <div className="mt-4">
                          <span className={`font-semibold text-xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {plan.credits} Credits
                          </span>
                        </div>
                        <div className="mt-auto pt-4">
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                            ₹{(plan.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className={`absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-indigo-500' : 'bg-indigo-600'
                        }`}>
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-6 flex justify-end">
                <button
                  onClick={handlePurchase}
                  disabled={isLoading || !selectedPlan || plans.length === 0}
                  className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                    isLoading || !selectedPlan || plans.length === 0
                      ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed text-zinc-200' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Purchase Credits`
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}