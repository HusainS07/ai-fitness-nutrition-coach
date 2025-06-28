import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './db';
import UserProfile from '../models/userProfile';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        const existingUser = await UserProfile.findOne({ email: user.email });
        if (!existingUser) {
          await UserProfile.create({
            email: user.email,
            goal: 'weight loss',
            weight: 70,
          });
          console.log(`Created user profile for ${user.email}`);
        }
        return true;
      } catch (error) {
        console.error('Sign-in error:', error);
        return false;
      }
    },
    async session({ session }) {
      try {
        await connectDB();
        const user = await UserProfile.findOne({ email: session.user.email });
        if (user) {
          session.user.goal = user.goal;
          session.user.weight = user.weight;
        }
        return session;
      } catch (error) {
        console.error('Session error:', error);
        return session;
      }
    },
  },
};