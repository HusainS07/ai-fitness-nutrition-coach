🤖 AI Fitness & Nutrition Coach

🎯 Aim

To develop an AI-powered Fitness and Nutrition Coach that delivers personalized workout plans, customized meal suggestions, and interactive coaching. The system leverages large language models to provide goal-oriented advice, helping users achieve fitness, weight management, or muscle gain objectives with minimal manual effort. The project emphasizes adaptability across different fitness goals and dietary preferences while maintaining an intuitive, modern user experience.

📘 Details

A Next.js application integrating AI to generate personalized fitness and nutrition guidance. Users can interact with an AI coach to receive workout routines and meal plans tailored to their goals. The system includes a modular architecture for easy extension and maintenance.

Personalized AI Coaching: Real-time fitness and nutrition advice.

Goal-Oriented Plans: Workouts and meals based on user input.

Modern Interface: Clean, responsive, and user-friendly design.

Modular Architecture: components for UI and lib/models for AI logic.

⚙️ Tech Stack Category Technologies Description Framework Next.js (App Router) Handles frontend and backend API routes. Language JavaScript Entire application is built in JS. Styling Tailwind CSS Utility-first framework for fast, responsive UI. AI Integration LLM API (Gemini, OpenAI) Powers the AI “coach” functionality.

## 📁 Detailed File Structure

ai-fitness-nutrition-coach/
```
├── app/                     # Next.js App Router: Houses pages, layouts, and API routes
│   ├── api/                 # Backend API routes for data fetching and logic
│   │   ├── auth/[...nextauth]/route.js  # Authentication endpoints
│   │   ├── chat/route.js                # Primary AI chat interaction API
│   │   ├── plan/route.js                # API for generating/fetching plans
│   │   └── user/update/route.js         # Endpoint for updating user profile data
│   ├── globals.css          # Global CSS file
│   ├── layout.js            # Root layout component
│   ├── page.js              # Home (landing) page
│   ├── plan/page.js         # Frontend page to display the plan
│   └── userProfile/page.js  # Frontend page for user input and profile management
│
├── components/              # Reusable React components
│   ├── ClientWrapper.js     # Component for client-side interactivity
│   ├── MealPlan.js          # Component to display a formatted meal plan
│   └── Navbar.js            # Global navigation bar
│
├── lib/                     # Library/utility files for shared functions
│   ├── auth.js              # Helper functions for authentication
│   └── db.js                # Database connection and initialization
│
├── models/                  # Database schemas (e.g., Mongoose models)
│   ├── aim.js               # Data model, possibly for AI Interaction Metrics
│   └── userProfile.js       # Data model for storing user fitness goals and metrics
│
├── public/                  # Static assets accessible from the root URL
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── jsconfig.json            # Configuration for path aliases
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Lock file for exact dependency versions
├── next.config.mjs          # Next.js specific configuration
├── postcss.config.mjs       # Configuration for PostCSS (Tailwind CSS)
└── README.md                # Project documentation
```

Node.js and npm/yarn/pnpm/bun installed

Install dependencies:

npm install

or
yarn install

or
pnpm install

or
bun install

Add AI API key in .env.local:

NEXT_PUBLIC_AI_API_KEY="YOUR_API_KEY_HERE"

🚀 Getting Started

Clone the repository:

git clone https://github.com/HusainS07/ai-fitness-nutrition-coach.git cd ai-fitness-nutrition-coach

Run development server:

npm run dev

or
yarn dev

or
pnpm dev

or
bun dev

Open http://localhost:3000 to use the app.

🌍 Deployment

Deploy easily on Vercel, which natively supports Next.js applications. Refer to Next.js deployment documentation .

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch: git checkout -b feature/AmazingFeature

Commit your changes: git commit -m 'Add AmazingFeature'

Push to your branch: git push origin feature/AmazingFeature

Open a Pull Request
