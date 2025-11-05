import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserProfile from '@/models/userProfile';
import MealProgress from '@/models/mealProgress';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'deepseek/deepseek-r1-0528:free';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'MyNutritionApp';

async function getChatCompletion(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a smart nutritionist helping people with their diet."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("⚠️ OpenRouter error:", err);
    return null;
  }
}

async function updateMealProgressWithRetry(email, selectedDate, mealPlan, progressPercent, userStartDate, userChangePercent, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let mealProgress = await MealProgress.findOne({ email, date: selectedDate });
      if (!mealProgress) {
        mealProgress = await MealProgress.create({
          email,
          date: selectedDate,
          mealsCompleted: mealPlan.map(meal => ({
            time: meal.time,
            description: meal.description,
            completed: false,
          })),
          progress: progressPercent,
          startDate: userStartDate,
          changePercent: userChangePercent || 0,
        });
      } else if (!mealProgress.mealsCompleted.length) {
        mealProgress = await MealProgress.findOneAndUpdate(
          { email, date: selectedDate },
          {
            mealsCompleted: mealPlan.map(meal => ({
              time: meal.time,
              description: meal.description,
              completed: false,
            })),
            progress: progressPercent,
            startDate: userStartDate,
          },
          { new: true, runValidators: true }
        );
      }
      return mealProgress; // Return existing or updated meal plan
    } catch (err) {
      if (err.name === 'VersionError' && attempt < retries) {
        console.warn(`⚠️ VersionError on attempt ${attempt}, retrying...`);
        continue;
      }
      throw err;
    }
  }
}

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

    const { date } = await req.json();
    const selectedDate = date ? new Date(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    console.log('🧑 Fetching user profile...');
    let user = await UserProfile.findOne({ email: session.user.email });
    if (!user) {
      user = await UserProfile.create({
        email: session.user.email,
        goal: 'weight loss',
        weight: 70,
        startDate: new Date(),
      });
      console.log('📄 Created new profile for:', session.user.email);
    }

    // Ensure user has startDate
    if (!user.startDate) {
      user.startDate = new Date();
      await user.save();
      console.log('📄 Added startDate to user profile:', session.user.email);
    }

    // Check for existing meal plan
    console.log('📅 Fetching meal progress...');
    let mealProgress = await MealProgress.findOne({ email: session.user.email, date: selectedDate });
    if (mealProgress && mealProgress.mealsCompleted.length) {
      console.log('📅 Found existing meal plan for:', formattedDate);
      return new Response(JSON.stringify({ mealPlan: mealProgress.mealsCompleted, progress: mealProgress.progress }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate progress
    const daysSinceStart = Math.max(1, Math.round((new Date() - user.startDate) / (1000 * 60 * 60 * 24)));
    const durationMonths = parseInt(user.duration?.match(/\d+/)?.[0] || 3);
    const totalDays = durationMonths * 30; // Approximate
    const totalMeals = totalDays * 4; // 4 meals per day
    const completedMeals = (await MealProgress.find({ email: session.user.email }))
      .reduce((sum, progress) => sum + progress.mealsCompleted.filter(m => m.completed).length, 0);
    const progressPercent = Math.min(100, Math.round((completedMeals / totalMeals) * 100));

    const prompt = `Generate a healthy meal plan for ${formattedDate} for a person with:
- Goal: "${user.goal}"
- Weight: ${user.weight || 70} kg
- Target Change: ${user.changePercent ? `${user.changePercent}%` : 'none'}
- Progress: ${progressPercent}% (based on ${completedMeals} of ${totalMeals} meals eaten)
- Plan Start Date: ${user.startDate.toLocaleDateString('en-US')}
- Age: ${user.age || 'unknown'}
- Gender: ${user.gender || 'unknown'}
- Allergies: ${user.alleries?.join(', ') || 'none'}
- Preferences: ${user.preferences?.join(', ') || 'none'}

Return a valid **JSON array** with 4 meals:
[
  { "time": "Breakfast (8:00 AM)", "description": "..." },
  { "time": "Lunch (1:00 PM)", "description": "..." },
  { "time": "Snack (4:00 PM)", "description": "..." },
  { "time": "Dinner (7:00 PM)", "description": "..." }
]

Do NOT include any explanation — just return raw JSON only.`;

    console.log('🧠 Prompting OpenRouter with:', prompt);
    const aiResponse = await getChatCompletion(prompt);

    let mealPlan;
    if (!aiResponse) {
      console.warn('❌ No AI response, using fallback.');
      mealPlan = [
        { time: 'Breakfast (8:00 AM)', description: 'Oatmeal with banana and chia seeds.' },
        { time: 'Lunch (1:00 PM)', description: 'Grilled chicken salad with olive oil.' },
        { time: 'Snack (4:00 PM)', description: 'Handful of almonds and green tea.' },
        { time: 'Dinner (7:00 PM)', description: 'Steamed fish with broccoli and quinoa.' },
      ];
    } else {
      try {
        let cleanedResponse = aiResponse.replace(/^```json\s*|\s*```$/g, '').trim();
        console.log('🧾 Cleaned AI response:', cleanedResponse);
        mealPlan = JSON.parse(cleanedResponse);
        if (!Array.isArray(mealPlan) || mealPlan.length !== 4 || !mealPlan.every(meal => meal.time && meal.description && typeof meal.time === 'string' && typeof meal.description === 'string')) {
          throw new Error(`Invalid meal plan format: Array length=${mealPlan.length}, items=${JSON.stringify(mealPlan)}`);
        }
        console.log('✅ AI-generated meal plan:', mealPlan);
      } catch (err) {
        console.warn('❌ Invalid AI response, using fallback.');
        console.error('🧾 Raw AI response:', aiResponse);
        console.error('🧾 Validation error:', err.message);
        mealPlan = [
          { time: 'Breakfast (8:00 AM)', description: 'Oatmeal with banana and chia seeds.' },
          { time: 'Lunch (1:00 PM)', description: 'Grilled chicken salad with olive oil.' },
          { time: 'Snack (4:00 PM)', description: 'Handful of almonds and green tea.' },
          { time: 'Dinner (7:00 PM)', description: 'Steamed fish with broccoli and quinoa.' },
        ];
      }
    }

    // Update MealProgress with retry logic
    console.log('📅 Updating meal progress...');
    mealProgress = await updateMealProgressWithRetry(
      session.user.email,
      selectedDate,
      mealPlan,
      progressPercent,
      user.startDate,
      user.changePercent
    );

    console.log('✅ Meal plan generated:', mealPlan);
    return new Response(JSON.stringify({ mealPlan: mealProgress.mealsCompleted, progress: mealProgress.progress }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('🔥 Server error in /api/plan:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}