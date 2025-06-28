'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import axios from 'axios';

export default function UserForm() {
  const { data: session } = useSession();
  const [goal, setGoal] = useState('weight loss');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await axios.post('/api/user/update', {
        email: session?.user?.email,
        goal,
        weight: parseFloat(weight),
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return <div className="text-center text-gray-600">Please sign in to update your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 flex items-center justify-center">
      <div className="card bg-white shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="goal" className="label">
              <span className="label-text text-gray-700 font-medium">Goal</span>
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="select select-bordered w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
              aria-label="Select fitness goal"
              disabled={isSubmitting}
            >
              <option value="weight loss">Weight Loss</option>
              <option value="muscle gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="weight" className="label">
              <span className="label-text text-gray-700 font-medium">Weight (kg)</span>
            </label>
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
              placeholder="Enter weight (e.g., 70)"
              aria-label="Enter weight in kilograms"
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
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}