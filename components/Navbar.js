'use client';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { SparklesIcon, ChartBarIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-gradient-to-r from-indigo-100 to-purple-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 transform">
                <SparklesIcon className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-500">
              AI Nutrition Coach
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session && (
              <div className="flex items-center space-x-6">
                <Link
                  href="/plan"
                  className="group relative flex items-center space-x-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                >
                  <ChartBarIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Meal Plan</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  href="/userProfile"
                  className="group relative flex items-center space-x-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                >
                  <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Profile</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            )}

            {/* Enhanced Auth Button */}
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300">
                    <div className="relative">
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-9 h-9 rounded-full ring-2 ring-indigo-200 hover:ring-indigo-300 transition-all duration-300 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <span className="text-gray-700 font-semibold hidden lg:block">
                      {session.user.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:-translate-y-0.5 hover:scale-105"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                  aria-label="Sign in with Google"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="relative text-gray-700 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 transition-all duration-300 p-2 rounded-xl hover:bg-indigo-50 transform hover:scale-110"
              aria-label="Toggle mobile menu"
            >
              <div className="relative">
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 transform rotate-180 transition-transform duration-300" />
                ) : (
                  <Bars3Icon className="w-6 h-6 transform rotate-0 transition-transform duration-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl mt-2 border border-gray-200 mx-2">
              {session && (
                <>
                  <Link
                    href="/plan"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                  >
                    <ChartBarIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold">Meal Plan</span>
                  </Link>
                  <Link
                    href="/userProfile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                  >
                    <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold">Profile</span>
                  </Link>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="relative">
                        <img
                          src={session.user.image}
                          alt={session.user.name}
                          className="w-10 h-10 rounded-full ring-2 ring-indigo-200 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      <span className="text-gray-700 font-semibold">{session.user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full mt-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              
              {!session && (
                <button
                  onClick={() => {
                    signIn('google');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <span className="relative z-10">Sign In with Google</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}