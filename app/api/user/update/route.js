import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import UserProfile from '@/models/userProfile';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  try {
    console.log('🔐 Getting session for GET...');
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('❌ No session found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    console.log('🌐 Connecting to DB for GET...');
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email || email !== session.user.email) {
      console.error('❌ Invalid or unauthorized email');
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }

    console.log('🧑 Fetching user for GET...');
    const user = await UserProfile.findOne({ email });
    if (!user) {
      console.log(`🧑 No profile found for ${email}`);
      return new Response(JSON.stringify({ user: null }), { status: 200 });
    }

    console.log('✅ Profile fetched successfully:', user);
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    console.error('🔥 Uncaught error in /api/user/update GET:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log('🔐 Getting session for POST...');
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('❌ No session found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    console.log('🌐 Connecting to DB for POST...');
    await connectDB();

    const profileData = await req.json();
    console.log('📥 Received profile data:', profileData);

    if (!profileData.email || profileData.email !== session.user.email) {
      console.error('❌ Invalid or unauthorized email');
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }

    // Validate required fields
    const requiredFields = ['name', 'age', 'gender', 'weight', 'goal', 'duration'];
    const missingFields = requiredFields.filter((field) => !profileData[field] && profileData[field] !== 0);
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return new Response(JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }), { status: 400 });
    }

    // Validate numeric fields
    if (isNaN(profileData.age) || profileData.age <= 0) {
      console.error('❌ Invalid age');
      return new Response(JSON.stringify({ error: 'Invalid age' }), { status: 400 });
    }
    if (isNaN(profileData.weight) || profileData.weight <= 0) {
      console.error('❌ Invalid weight');
      return new Response(JSON.stringify({ error: 'Invalid weight' }), { status: 400 });
    }
    if (profileData.changePercent !== null && isNaN(profileData.changePercent)) {
      console.error('❌ Invalid change percentage');
      return new Response(JSON.stringify({ error: 'Invalid change percentage' }), { status: 400 });
    }

    console.log('🧑 Fetching user for POST...');
    let user = await UserProfile.findOne({ email: session.user.email });

    if (user) {
      console.log(`🧑 Updating profile for ${session.user.email}`);
      user = await UserProfile.findOneAndUpdate(
        { email: session.user.email },
        {
          $set: {
            name: profileData.name,
            age: profileData.age,
            gender: profileData.gender,
            weight: profileData.weight,
            goal: profileData.goal,
            changePercent: profileData.changePercent,
            duration: profileData.duration,
            allergies: profileData.allergies || [],
            preferences: profileData.preferences || [],
          },
        },
        { new: true }
      );
      console.log('🔄 Updated user:', user);
    } else {
      console.log(`🧑 Creating new profile for ${session.user.email}`);
      user = await UserProfile.create({
        email: session.user.email,
        name: profileData.name,
        age: profileData.age,
        gender: profileData.gender,
        weight: profileData.weight,
        goal: profileData.goal,
        changePercent: profileData.changePercent,
        duration: profileData.duration,
        allergies: profileData.allergies || [],
        preferences: profileData.preferences || [],
      });
      console.log('🆕 Created user:', user);
    }

    console.log('✅ Profile saved successfully');
    return new Response(JSON.stringify({ message: 'Profile saved successfully', user }), { status: 200 });
  } catch (error) {
    console.error('🔥 Uncaught error in /api/user/update POST:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}