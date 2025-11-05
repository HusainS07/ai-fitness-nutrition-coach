'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { InfoIcon, SparklesIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { data: session, status } = useSession();
  const [foodInput, setFoodInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount when authenticated
  useEffect(() => {
    if (status === 'authenticated' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-indigo-600 font-medium animate-pulse">Loading your nutrition coach...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 max-w-md w-full text-center transform transition-all hover:scale-105 duration-500 border border-white/20">
          {/* Animated background elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Nutrition Coach
            </h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Your personal AI nutritionist is ready to help you make healthier choices and track your wellness journey.
            </p>
            <button
              onClick={() => signIn('google')}
              className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2 transform hover:-translate-y-1"
              aria-label="Sign in with Google"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodInput.trim()) {
      setError('Please enter what you ate today.');
      return;
    }
    setError('');
    setResponse('');
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/chat', {
        foodInput,
        email: session?.user?.email,
      });
      setResponse(res.data.message);
    } catch (error) {
      console.error('Error submitting food input:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to get AI response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Nutrition Coach
              </h1>
              <p className="text-gray-600 text-sm">Welcome back, {session?.user?.name?.split(' ')[0]}!</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="group flex items-center space-x-2 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300"
            aria-label="Sign out"
          >
            <UserIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 sm:p-8 border border-white/20">
              {/* Animated background elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-5 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-5 animate-pulse delay-1000"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Daily Food Tracker</h2>
                    <p className="text-gray-600 text-sm">Log your meals for personalized insights</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="foodInput" className="block text-gray-700 font-semibold text-lg">
                      What did you eat today?
                    </label>
                    <div className="relative">
                      <input
                        id="foodInput"
                        type="text"
                        value={foodInput}
                        onChange={(e) => setFoodInput(e.target.value)}
                        placeholder="e.g., Greek yogurt with berries, grilled chicken salad, quinoa bowl..."
                        className="w-full bg-white/90 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 rounded-xl py-4 px-6 text-base placeholder-gray-400 shadow-sm"
                        aria-label="Enter food consumed today"
                        disabled={isSubmitting}
                        ref={inputRef}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className={`group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2 transform hover:-translate-y-1 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                    aria-label="Get nutritional feedback"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing your nutrition...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        Get AI Feedback
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>

                {response && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl animate-fade-in shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 mb-2">AI Nutrition Insights</h3>
                        <p className="text-green-700 text-base leading-relaxed">{response}</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl animate-fade-in shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <InfoIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800 mb-2">Oops!</h3>
                        <p className="text-red-700 text-base">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/plan" className="group flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-indigo-700">View Meal Plan</p>
                    <p className="text-sm text-gray-600">See your personalized plan</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Pro Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Be specific about portions and cooking methods</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Include snacks and drinks in your log</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Track meals consistently for better insights</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}