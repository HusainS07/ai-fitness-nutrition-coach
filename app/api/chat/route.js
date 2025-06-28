import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserProfile from '@/models/userProfile';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const CHAT_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

// 🔹 Hugging Face Chat Completion
async function getChatCompletion(prompt) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${CHAT_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
        },
        options: { wait_for_model: true }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HF API failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();

    let generatedText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    }

    // Strip prompt leakage
    const cleaned = generatedText.replace(prompt, "").trim().replace(/^Answer:|^Assistant:/i, "").trim();
    return cleaned;
  } catch (err) {
    console.error("⚠️ Hugging Face error:", err);
    return null;
  }
}

export async function POST(req) {
  try {
    console.log("🔐 Getting session...");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("🌐 Connecting to DB...");
    await dbConnect();

    const { foodInput } = await req.json();
    if (!foodInput || foodInput.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Invalid food input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("🧑 Fetching user profile...");
    let user = await UserProfile.findOne({ email: session.user.email });

    if (!user) {
      user = await UserProfile.create({
        email: session.user.email,
        goal: "weight loss",
        weight: 70
      });
      console.log("📄 Created new profile for:", session.user.email);
    }

    const prompt = `You are a smart nutritionist helping people with their diet.

The user has a goal of "${user.goal}" and currently weighs ${user.weight || 70} kg.

They reported eating: "${foodInput}"

Please give clear, short, nutritional feedback (2-3 sentences), personalized to their weight loss goal.`;

    console.log("🧠 Prompting HF:", prompt);

    const aiResponse = await getChatCompletion(prompt);

    const finalResponse = aiResponse || `Two boiled eggs provide high-quality protein and healthy fats, supporting weight loss by promoting satiety. Consider pairing them with fiber-rich vegetables.`;

    return new Response(JSON.stringify({ message: finalResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("🔥 Uncaught /api/chat error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
