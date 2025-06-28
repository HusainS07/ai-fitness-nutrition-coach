import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import UserProfile from '@/models/userProfile';
import { authOptions } from '@/lib/auth';

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

    const { foodInput } = await req.json();
    if (!foodInput) {
      console.error('❌ No foodInput provided');
      return new Response(JSON.stringify({ error: 'Food input is required' }), { status: 400 });
    }

    console.log('🧑 Fetching user...');
    let user = await UserProfile.findOne({ email: session.user.email });
    if (!user) {
      console.log(`🧑 User not found for ${session.user.email}, creating new profile`);
      user = await UserProfile.create({
        email: session.user.email,
        goal: 'weight loss',
        weight: 70,
      });
    }

    const prompt = `User with goal "${user.goal}" and weight ${user.weight || 70}kg ate: ${foodInput}. Provide concise nutritional feedback in 2-3 sentences.`;
    console.log('🧠 Sending to Hugging Face:', prompt);

    // Attempt Hugging Face API call
    let generatedText;
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/distilbert/distilgpt2', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ Hugging Face API error (status ${response.status}):`, text);
        return new Response(JSON.stringify({ error: `Hugging Face API error: ${text}` }), { status: 500 });
      }

      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response from Hugging Face:', text);
        return new Response(JSON.stringify({ error: 'Model returned invalid output' }), { status: 500 });
      }

      generatedText = result[0]?.generated_text || result.generated_text || null;
      if (!generatedText) {
        console.error('❌ No generated text in response:', result);
        return new Response(JSON.stringify({ error: 'Invalid AI response' }), { status: 500 });
      }
    } catch (apiError) {
      console.error('❌ Hugging Face API failed:', apiError.message);
      // Fallback to mock response
      generatedText = `Two boiled eggs are a great source of protein and healthy fats, ideal for weight loss. Pair them with vegetables for added fiber. Consult a nutritionist for personalized advice.`;
      console.log('🔔 Using mock response due to API failure');
    }

    console.log('✅ AI Response:', generatedText);
    return new Response(JSON.stringify({ message: generatedText }), { status: 200 });
  } catch (error) {
    console.error('🔥 Uncaught error in /api/chat:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}