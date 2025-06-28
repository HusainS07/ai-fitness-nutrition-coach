import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import UserProfile from '@/models/userProfile';
import { authOptions } from '@/lib/auth';

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const CHAT_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

async function getChatCompletion(prompt) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${CHAT_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Hugging Face API error (status ${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    let generatedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    }

    // Strip prompt leakage
    const cleaned = generatedText.replace(prompt, '').trim().replace(/^Answer:|^Assistant:/i, '').trim();
    return cleaned;
  } catch (err) {
    console.error('⚠️ Hugging Face error:', err);
    return null;
  }
}

export async function POST(req) {
  try {
    console.log('🔐 Getting session...');
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('❌ No session found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    console.log('🌐 Connecting to DB...');
    await connectDB();

    console.log('🧑 Fetching user...');
    const user = await UserProfile.findOne({ email: session.user.email });
    if (!user) {
      console.error('❌ User not found');
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const { date } = await req.json();
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'today';

    const prompt = `Generate a daily meal plan for a user with goal "${user.goal}" and weight ${user.weight || 70}kg for ${formattedDate}. Provide 4 meals (Breakfast, Lunch, Snack, Dinner) with time and a brief description (1-2 sentences each). Format as a JSON array of objects with "time" and "description" fields.`;
    console.log('🧠 Sending to Hugging Face:', prompt);

    const aiResponse = await getChatCompletion(prompt);

    let mealPlan;
    if (aiResponse) {
      try {
        mealPlan = JSON.parse(aiResponse);
        if (!Array.isArray(mealPlan) || mealPlan.length === 0) {
          throw new Error('Invalid meal plan format');
        }
      } catch (err) {
        console.error('❌ Invalid AI response format:', aiResponse);
        mealPlan = [
          { time: 'Breakfast (8:00 AM)', description: 'Oatmeal with berries and a boiled egg for protein and fiber.' },
          { time: 'Lunch (1:00 PM)', description: 'Grilled chicken salad with mixed greens and olive oil dressing.' },
          { time: 'Snack (4:00 PM)', description: 'Greek yogurt with a handful of almonds for a protein boost.' },
          { time: 'Dinner (7:00 PM)', description: 'Baked salmon with steamed broccoli and quinoa.' },
        ];
      }
    } else {
      console.log('🔔 Using mock meal plan');
      mealPlan = [
        { time: 'Breakfast (8:00 AM)', description: 'Oatmeal with berries and a boiled egg for protein and fiber.' },
        { time: 'Lunch (1:00 PM)', description: 'Grilled chicken salad with mixed greens and olive oil dressing.' },
        { time: 'Snack (4:00 PM)', description: 'Greek yogurt with a handful of almonds for a protein boost.' },
        { time: 'Dinner (7:00 PM)', description: 'Baked salmon with steamed broccoli and quinoa.' },
      ];
    }

    return new Response(JSON.stringify({ mealPlan }), { status: 200 });
  } catch (error) {
    console.error('🔥 Uncaught error in /api/plan:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to generate meal plan' }), { status: 500 });
  }
}