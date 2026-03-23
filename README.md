# Swastha-Sathi (Health Companion) 

Swastha-Sathi is an AI-powered health companion built with Next.js answering various health inquiries, managing your health data, finding nearby medical facilities, and providing context-aware AI interactions.

##  Features

- **Personalized AI Health Assistant:** Powered by LangChain, OpenAI, Google GenAI, and `mem0ai` for intelligent, memory-augmented interactions.
- **Interactive Health Maps:** Find local clinics, hospitals, and pharmacies integrating `react-leaflet`.
- **Secure Authentication:** `better-auth` combined with PostgreSQL and Prisma for secure user state management and data privacy.
- **Beautiful & Accessible UI:** Crafted with Tailwind CSS, Framer Motion, and Radix UI primitives.
- **Data Dashboard:** Real-time health metrics visualized with Recharts.

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database ORM:** [Prisma](https://www.prisma.io/) with PostgreSQL Adapter
- **AI Tooling:**  AI SDK, 
- **Authentication:** Better Auth
- **Styling:** Tailwind CSS & Framer Motion
- **Maps:** Leaflet via React Leaflet

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and your preferred package manager installed (`npm`, `yarn`, `pnpm`, or `bun`). You will also need a PostgreSQL database instance and API keys for OpenAI/Google GenAI.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd Swastha-Sathi
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or yarn install, pnpm install
   ```

3. Setup Environment Variables:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *Fill in your database connection string, AI provider keys, and other required environment variables.*

4. Initialize the Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the Development Server:
   ```bash
   npm run dev
   # or yarn dev, pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas on how to improve Swastha-Sathi.

## 📜 License

This project is open-sourced under the MIT License - see the [LICENSE](LICENSE) file for details.
