import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserProfile from '@/models/userProfile';
import MealProgress from '@/models/mealProgress';

export async function POST(req) {
  try {
    console.log('🔐 Getting session...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('❌ No session found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🌐 Connecting to DB...');
    await dbConnect();

    const { date, mealIndex, completed } = await req.json();
    if (!date || mealIndex === undefined || completed === undefined) {
      console.error('❌ Invalid request body:', { date, mealIndex, completed });
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day

    console.log('📅 Updating meal progress for:', session.user.email, selectedDate);
    let mealProgress = await MealProgress.findOne({ email: session.user.email, date: selectedDate });
    if (!mealProgress) {
      console.error('❌ No meal progress found for date:', selectedDate);
      return new Response(JSON.stringify({ error: 'No meal plan found for this date' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (mealIndex < 0 || mealIndex >= mealProgress.mealsCompleted.length) {
      console.error('❌ Invalid meal index:', mealIndex);
      return new Response(JSON.stringify({ error: 'Invalid meal index' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update meal completion with retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        mealProgress.mealsCompleted[mealIndex].completed = completed;
        mealProgress.markModified('mealsCompleted'); // Ensure array changes are saved

        // Recalculate progress
        const user = await UserProfile.findOne({ email: session.user.email });
        if (!user) {
          console.error('❌ User profile not found');
          return new Response(JSON.stringify({ error: 'User profile not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const daysSinceStart = Math.max(1, Math.round((new Date() - user.startDate) / (1000 * 60 * 60 * 24)));
        const durationMonths = parseInt(user.duration?.match(/\d+/)?.[0] || 3);
        const totalDays = durationMonths * 30; // Approximate
        const totalMeals = totalDays * 4; // 4 meals per day
        const completedMeals = (await MealProgress.find({ email: session.user.email }))
          .reduce((sum, progress) => sum + progress.mealsCompleted.filter(m => m.completed).length, 0);
        mealProgress.progress = Math.min(100, Math.round((completedMeals / totalMeals) * 100));

        await mealProgress.save();
        console.log('✅ Meal progress updated:', { mealIndex, completed, progress: mealProgress.progress });
        return new Response(JSON.stringify({ progress: mealProgress.progress }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        if (err.name === 'VersionError' && attempt < 3) {
          console.warn(`⚠️ VersionError on attempt ${attempt}, retrying...`);
          mealProgress = await MealProgress.findOne({ email: session.user.email, date: selectedDate });
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    console.error('🔥 Server error in /api/meal-progress:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}