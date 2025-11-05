'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserIcon, ScaleIcon, TrophyIcon, ClockIcon, HeartIcon, StarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ProfileForm() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    goal: '',
    changePercent: '',
    duration: '',
    allergies: '',
    preferences: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (session) {
      setProfile((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));

      const fetchProfile = async () => {
        try {
          const res = await axios.get('/api/user/update', {
            params: { email: session.user.email },
          });
          const user = res.data.user;
          if (user) {
            setProfile({
              name: user.name || '',
              age: user.age?.toString() || '',
              gender: user.gender || '',
              weight: user.weight?.toString() || '',
              goal: user.goal || '',
              changePercent: user.changePercent?.toString() || '',
              duration: user.duration || '',
              allergies: user.allergies?.join(', ') || '',
              preferences: user.preferences?.join(', ') || '',
              email: session.user.email,
            });
            console.log('Profile fetched:', user);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };
      fetchProfile();
    }
  }, [session]);

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name) newErrors.name = 'Name is required';
    if (!profile.age || isNaN(profile.age) || Number(profile.age) <= 0) newErrors.age = 'Valid age is required';
    if (!profile.gender) newErrors.gender = 'Gender is required';
    if (!profile.weight || isNaN(profile.weight) || Number(profile.weight) <= 0) newErrors.weight = 'Valid weight is required';
    if (!profile.goal) newErrors.goal = 'Goal is required';
    if (profile.changePercent && isNaN(profile.changePercent)) newErrors.changePercent = 'Valid percentage is required';
    if (!profile.duration) newErrors.duration = 'Duration is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      email: session.user.email,
      name: profile.name,
      age: Number(profile.age),
      gender: profile.gender,
      weight: Number(profile.weight),
      goal: profile.goal,
      changePercent: profile.changePercent !== '' && !isNaN(profile.changePercent) ? Number(profile.changePercent) : null,
      duration: profile.duration,
      allergies: profile.allergies && profile.allergies.trim() !== '' ? profile.allergies.split(',').map((a) => a.trim()) : [],
      preferences: profile.preferences && profile.preferences.trim() !== '' ? profile.preferences.split(',').map((p) => p.trim()) : [],
    };
    console.log('Sending payload:', payload);

    try {
      setIsLoading(true);
      const res = await axios.post('/api/user/update', payload);
      setIsLoading(false);
      console.log('Profile saved successfully:', res.data.user);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error saving profile:', errorMessage);
      alert(`Failed to save profile: ${errorMessage}`);
    }
  };

  const formSections = [
    {
      title: 'Personal Information',
      icon: UserIcon,
      fields: [
        { id: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g., John Doe' },
        { id: 'age', label: 'Age', type: 'number', placeholder: 'e.g., 30' },
        { id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'] },
      ]
    },
    {
      title: 'Physical Stats',
      icon: ScaleIcon,
      fields: [
        { id: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g., 70' },
      ]
    },
    {
      title: 'Fitness Goals',
      icon: TrophyIcon,
      fields: [
        { id: 'goal', label: 'Primary Goal', type: 'text', placeholder: 'e.g., weight loss, muscle gain, maintain health' },
        { id: 'changePercent', label: 'Target Change (%)', type: 'number', placeholder: 'e.g., -20 for 20% loss, 10 for 10% gain' },
        { id: 'duration', label: 'Timeline', type: 'text', placeholder: 'e.g., 3 months, 6 months' },
      ]
    },
    {
      title: 'Dietary Preferences',
      icon: HeartIcon,
      fields: [
        { id: 'allergies', label: 'Allergies & Restrictions', type: 'text', placeholder: 'e.g., peanuts, shellfish, dairy' },
        { id: 'preferences', label: 'Food Preferences', type: 'text', placeholder: 'e.g., vegetarian, low-carb, Mediterranean' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Help us personalize your nutrition journey by sharing some details about yourself and your goals.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <p className="text-green-700 font-medium">Profile saved successfully! 🎉</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {formSections.map((section, sectionIndex) => (
            <div key={section.title} className="relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 sm:p-8 border border-white/20">
              {/* Animated background elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-5 animate-pulse"></div>
              
              <div className="relative z-10">
                {/* Section Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field) => (
                    <div key={field.id} className={field.id === 'goal' || field.id === 'allergies' || field.id === 'preferences' ? 'md:col-span-2' : ''}>
                      <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          id={field.id}
                          name={field.id}
                          value={profile[field.id]}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-gray-800 bg-white/90 ${
                            errors[field.id] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                          } focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm`}
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.id}
                          name={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={profile[field.id]}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-gray-800 bg-white/90 ${
                            errors[field.id] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                          } focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm placeholder-gray-400`}
                        />
                      )}
                      
                      {errors[field.id] && (
                        <div className="mt-2 flex items-center space-x-2 text-red-600">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <p className="text-sm">{errors[field.id]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2 transform hover:-translate-y-1 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Saving your profile...
                </span>
              ) : (
                <span className="flex items-center">
                  <StarIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Save My Profile
                </span>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}