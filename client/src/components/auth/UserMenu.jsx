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
        className={`text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors`}
      >
        Sign In
      </Link>
      <Link
        to="/sign-up"
        className={`px-4 py-2 rounded-lg font-medium ${
          darkMode 
            ? 'bg-white text-zinc-900 hover:bg-zinc-200' 
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
        } transition-all duration-200`}
      >
        Sign Up
      </Link>
    </div>
  );
}