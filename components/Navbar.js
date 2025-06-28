'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Left Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition duration-300"
          >
            Nutrition Coach
          </Link>

          {session && (
            <>
              <Link
                href="/plan"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Meal Plan
              </Link>

              <Link
                href="/userProfile"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Right: Sign In / Sign Out */}
        <div>
          {session ? (
            <button
              onClick={() => signOut()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              aria-label="Sign in with Google"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
