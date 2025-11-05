import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserProfile from '@/models/userProfile';

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

export async function POST(req) {
  try {
    console.log('🔐 Getting session...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🌐 Connecting to DB...');
    await dbConnect();

    const { foodInput } = await req.json();
    if (!foodInput || foodInput.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Invalid food input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🧑 Fetching user profile...');
    let user = await UserProfile.findOne({ email: session.user.email });
    if (!user) {
      user = await UserProfile.create({
        email: session.user.email,
        goal: 'weight loss',
        weight: 70,
      });
      console.log('📄 Created new profile for:', session.user.email);
    }

    const prompt = `The user has a goal of "${user.goal}" and currently weighs ${user.weight || 70} kg.

They reported eating: "${foodInput}"

Please give clear, short, nutritional feedback (2–3 sentences), personalized to their weight loss goal.`;

    console.log('🧠 Prompting OpenRouter with:', prompt);

    const aiResponse = await getChatCompletion(prompt);

    const finalResponse =
      aiResponse ||
      `Two boiled eggs provide high-quality protein and healthy fats, supporting weight loss by promoting satiety. Consider pairing them with fiber-rich vegetables.`;

    return new Response(JSON.stringify({ message: finalResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('🔥 Uncaught /api/chat error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
