'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function MealPlan() {
  const { data: session } = useSession();
  const [mealPlan, setMealPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchMealPlan = async (date) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/plan', {
        email: session?.user?.email,
        date: date.toISOString(),
      });
      setMealPlan(res.data.mealPlan);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setError(error.response?.data?.error || 'Failed to fetch meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMealPlan(selectedDate);
    }
  }, [session, selectedDate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 flex items-center justify-center">
        <div className="card bg-white shadow-xl p-6 max-w-md w-full text-center">
          <p className="text-gray-600">Please sign in to view your meal plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Personalized Meal Plan</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card bg-white shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Date</h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="border-none shadow-md rounded-lg"
              tileClassName="hover:bg-blue-50 transition duration-200"
              calendarType="gregory"
              aria-label="Select date for meal plan"
            />
          </div>
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            ) : mealPlan ? (
              <div className="grid grid-cols-1 gap-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Meal Plan for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {mealPlan.map((meal, index) => (
                  <div key={index} className="card bg-white shadow-lg hover:shadow-xl transition duration-300">
                    <div className="card-body">
                      <h3 className="card-title text-lg font-semibold text-gray-800">{meal.time}</h3>
                      <p className="text-gray-600">{meal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <p className="text-yellow-700">No meal plan available for this date. Try selecting another date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}