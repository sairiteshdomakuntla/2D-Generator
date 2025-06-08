import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';

export default function CreditPurchaseModal({ isOpen, onClose, darkMode, onPurchaseComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState(null); // 'success', 'error', or null

  useEffect(() => {
    // Load available plans when modal opens
    const fetchPlans = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPlans(res.data.plans);
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };

    if (isOpen) {
      fetchPlans();
      setPurchaseStatus(null);
    }
  }, [isOpen, getToken]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setPurchaseStatus(null);
      const token = await getToken();
      
      // Create Razorpay order
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-order`, 
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
              // Verify payment on server
              const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-payment`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: selectedPlan
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              if (verifyRes.data.success) {
                setPurchaseStatus('success');
                setTimeout(() => {
                  if (onPurchaseComplete) {
                    onPurchaseComplete(verifyRes.data.credits);
                  }
                  onClose();
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
              // User closed Razorpay modal
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

  // Get selected plan details
  const currentPlan = plans.find(plan => plan.id === selectedPlan) || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className={`absolute inset-0 ${darkMode ? 'bg-zinc-900' : 'bg-gray-500'} opacity-75`}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
            darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white'
          }`}
        >
          {purchaseStatus === 'success' ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`mt-3 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Successful!
              </h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                Credits have been added to your account.
              </p>
            </div>
          ) : purchaseStatus === 'error' ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className={`mt-3 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Failed
              </h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                There was a problem processing your payment. Please try again.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setPurchaseStatus(null)}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md ${
                    darkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Purchase Credits
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        Select a credit package to continue creating amazing animations.
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      {plans.map(plan => (
                        <div 
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                            selectedPlan === plan.id
                              ? darkMode 
                                ? 'border-indigo-500 bg-indigo-900/30 ring-1 ring-indigo-500' 
                                : 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500'
                              : darkMode
                                ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-md font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{plan.description}</p>
                              <p className={`mt-1 font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                {plan.credits} Credits
                              </p>
                            </div>
                            <div>
                              <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${darkMode ? 'border-t border-zinc-700' : 'bg-gray-50'}`}>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white'
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
                    `Purchase`
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    darkMode 
                      ? 'border-zinc-600 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}