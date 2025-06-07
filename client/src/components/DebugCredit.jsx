// import { useState } from 'react';
// import { useAuth } from '@clerk/clerk-react';
// import axios from 'axios';

// export default function DebugCredit({ onReset }) {
//   const { getToken } = useAuth();
//   const [isResetting, setIsResetting] = useState(false);

//   const handleResetCredits = async () => {
//     try {
//       setIsResetting(true);
//       const token = await getToken();
      
//       await axios.post('http://localhost:5000/api/user/reset-credits', {}, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (onReset) {
//         onReset();
//       }
//     } catch (err) {
//       console.error('Error resetting credits:', err);
//     } finally {
//       setIsResetting(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleResetCredits}
//       disabled={isResetting}
//       className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
//       style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.7 }}
//     >
//       {isResetting ? 'Resetting...' : 'Reset Credits (Debug)'}
//     </button>
//   );
// }