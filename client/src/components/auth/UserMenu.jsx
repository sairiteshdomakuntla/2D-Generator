import { UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function UserMenu({ darkMode }) {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-10 h-10',
            userButtonTrigger: 'focus:shadow-none focus:outline-none'
          }
        }}
      />
    );
  }
  
  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/sign-in"
        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Sign In
      </Link>
      <Link
        to="/sign-up"
        className={`px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5`}
      >
        Sign Up
      </Link>
    </div>
  );
}