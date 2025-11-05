'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarIcon, ClockIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

export default function MealPlan() {
  const { data: session, status } = useSession();
  const [mealPlan, setMealPlan] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const cacheRef = useRef({}); // Cache for meal plans by date

  const fetchMealPlan = useCallback(
    debounce(async (date, email, retries = 3) => {
      if (isLoading || !email) return; // Prevent concurrent calls or no email
      const dateKey = date.toISOString().split('T')[0]; // Cache key (YYYY-MM-DD)
      if (cacheRef.current[dateKey]) {
        console.log('📅 Using cached meal plan for:', dateKey);
        setMealPlan(cacheRef.current[dateKey].mealPlan);
        setProgress(cacheRef.current[dateKey].progress);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await axios.post('/api/plan', {
            email,
            date: date.toISOString(),
          });
          setMealPlan(res.data.mealPlan);
          setProgress(res.data.progress);
          cacheRef.current[dateKey] = { mealPlan: res.data.mealPlan, progress: res.data.progress };
          setIsLoading(false);
          return;
        } catch (error) {
          console.error(`Error fetching meal plan (attempt ${attempt}):`, error);
          if (attempt === retries) {
            setError(error.response?.data?.error || 'Failed to fetch meal plan after multiple attempts. Please try again.');
            setIsLoading(false);
          }
        }
      }
    }, 1000), // Increased to 1000ms debounce
    [isLoading]
  );

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      fetchMealPlan(selectedDate, session.user.email);
    }
  }, [session?.user?.email, status, selectedDate, fetchMealPlan]);

  const toggleMealCompletion = async (mealIndex, completed) => {
    try {
      const res = await axios.post('/api/meal-progress', {
        email: session.user.email,
        date: selectedDate.toISOString(),
        mealIndex,
        completed,
      });
      setProgress(res.data.progress);
      setMealPlan(prev => {
        const updated = [...prev];
        updated[mealIndex].completed = completed;
        const dateKey = selectedDate.toISOString().split('T')[0];
        cacheRef.current[dateKey] = { mealPlan: updated, progress: res.data.progress };
        return updated;
      });
    } catch (error) {
      console.error('Error updating meal completion:', error);
      setError('Failed to update meal completion. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-semibold text-gray-800">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-semibold text-gray-800">Please sign in to view your meal plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
        Your Personalized Meal Plan
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Select Date</h2>
            </div>
            <Calendar
              onChange={(date) => {
                setSelectedDate(date);
              }}
              value={selectedDate}
              calendarType="gregory"
              className="border-none rounded-lg shadow-inner"
              tileClassName="hover:bg-blue-50 transition-colors"
            />
            <button
              onClick={() => fetchMealPlan(selectedDate, session.user.email)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="h-5 w-5" />
                  <span>Generate Meal Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meal Plan Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Progress</h2>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}% of your meal plan completed</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2 text-lg text-gray-700">Loading meal plan...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-600 py-6">
                <ExclamationCircleIcon className="h-6 w-6" />
                <p>{error}</p>
                <button
                  onClick={() => fetchMealPlan(selectedDate, session.user.email)}
                  className="ml-4 bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : mealPlan ? (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Meal Plan for {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h2>
                <div className="grid gap-4">
                  {mealPlan.map((meal, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-start space-x-3"
                    >
                      <input
                        type="checkbox"
                        checked={meal.completed || false}
                        onChange={(e) => toggleMealCompletion(index, e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-medium text-gray-900">{meal.time}</h3>
                          {meal.completed && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                        </div>
                        <p className="mt-2 text-gray-700">{meal.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-yellow-700 flex items-center justify-center space-x-2">
                <ExclamationCircleIcon className="h-6 w-6" />
                <p>No meal plan generated yet. Select a date and click "Generate Meal Plan".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}