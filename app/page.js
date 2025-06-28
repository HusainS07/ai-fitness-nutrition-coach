'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const { data: session, status } = useSession();
  const [foodInput, setFoodInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
        <div className="card bg-white shadow-xl p-6 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AI Nutrition Coach</h1>
          <p className="text-gray-600 mb-6">Sign in to track your meals and get personalized nutritional feedback.</p>
          <button
            onClick={() => signIn('google')}
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 flex items-center justify-center">
      <div className="card bg-white shadow-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">AI Nutrition Coach</h1>
          <button
            onClick={() => signOut()}
            className="btn btn-secondary bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-300"
          >
            Sign Out
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="foodInput" className="label">
              <span className="label-text text-gray-700 font-medium">What did you eat today?</span>
            </label>
            <input
              id="foodInput"
              type="text"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="e.g., 2 boiled eggs"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
              aria-label="Food input"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              'Get Feedback'
            )}
          </button>
        </form>
        {response && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700">{response}</p>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}