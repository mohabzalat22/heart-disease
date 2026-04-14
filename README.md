# 🫀 CardioAI — Heart Disease AI Chat Assistant

A full-stack AI-powered chat application built with **Next.js**, **PostgreSQL**, and **Ollama**, designed to assist users with heart disease-related queries through intelligent, conversational AI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)

---

## Overview

CardioAI is a Next.js web application that provides users with a chat interface powered by a locally running Ollama LLM. Users can register, log in, manage multiple chat sessions, and interact with an AI assistant trained or prompted for heart disease-related conversations.

---

## Tech Stack

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Framework    | Next.js 16 (App Router)          |
| Language     | TypeScript                       |
| Styling      | Tailwind CSS v4                  |
| UI Components| Shadcn/UI + Radix UI             |
| Database     | PostgreSQL                       |
| ORM          | Prisma v7                        |
| AI / LLM     | Ollama (local inference)         |
| Auth         | JWT via `jose` + bcrypt          |
| Forms        | React Hook Form + Zod validation |

---

## Prerequisites

Make sure the following are installed on your system before setting up the project:

- **Node.js** `v20+` — [Download](https://nodejs.org/)
- **npm** `v10+` (comes with Node.js)
- **PostgreSQL** `v14+` — [Download](https://www.postgresql.org/download/)
- **Ollama** — [Download](https://ollama.com/download)
  - After installing, pull a model (e.g.):
    ```bash
    ollama pull minimax-m2.5:cloud
    ```
  - Make sure Ollama is running locally on port `11434`:
    ```bash
    ollama serve
    ```

---

## Dependencies

### Production Dependencies

| Package                    | Version   | Purpose                                      |
| -------------------------- | --------- | -------------------------------------------- |
| `next`                     | `16.1.6`  | React framework with App Router              |
| `react`                    | `19.2.3`  | UI library                                   |
| `react-dom`                | `19.2.3`  | DOM bindings for React                       |
| `@prisma/client`           | `^7.5.0`  | Prisma ORM client for database queries       |
| `@prisma/adapter-pg`       | `^7.5.0`  | Prisma adapter for PostgreSQL via `pg`       |
| `pg`                       | `^8.20.0` | PostgreSQL client for Node.js                |
| `jose`                     | `^6.2.1`  | JWT creation and verification                |
| `bcryptjs`                 | `^3.0.3`  | Password hashing                             |
| `zod`                      | `^4.3.6`  | Schema validation                            |
| `react-hook-form`          | `^7.71.2` | Form state management                        |
| `@hookform/resolvers`      | `^5.2.2`  | Zod resolver adapter for React Hook Form     |
| `shadcn`                   | `^4.0.8`  | CLI tool for Shadcn/UI components            |
| `radix-ui`                 | `^1.4.3`  | Headless accessible UI primitives            |
| `lucide-react`             | `^0.577.0`| Icon library                                 |
| `class-variance-authority` | `^0.7.1`  | Utility for building variant-based classes   |
| `clsx`                     | `^2.1.1`  | Conditional className utility                |
| `tailwind-merge`           | `^3.5.0`  | Merges Tailwind classes without conflicts    |
| `tw-animate-css`           | `^1.4.0`  | CSS animations for Tailwind                  |
| `sonner`                   | `^2.0.7`  | Toast notification library                   |

### Development Dependencies

| Package                | Version   | Purpose                              |
| ---------------------- | --------- | ------------------------------------ |
| `prisma`               | `^7.5.0`  | Prisma CLI (migrations, generation)  |
| `typescript`           | `^5.9.3`  | Static typing                        |
| `tailwindcss`          | `^4`      | Utility-first CSS framework          |
| `@tailwindcss/postcss` | `^4`      | PostCSS plugin for Tailwind          |
| `postcss`              | —         | CSS processing tool                  |
| `eslint`               | `^9`      | JavaScript/TypeScript linter         |
| `eslint-config-next`   | `16.1.6`  | ESLint rules for Next.js             |
| `prettier`             | `^3.8.1`  | Code formatter                       |
| `dotenv`               | `^17.3.1` | Loads `.env` files for scripts       |
| `tsx`                  | `^4.21.0` | TypeScript executor (for scripts)    |
| `@types/node`          | `^20`     | Node.js type definitions             |
| `@types/react`         | `^19`     | React type definitions               |
| `@types/react-dom`     | `^19`     | React DOM type definitions           |
| `@types/pg`            | `^8.18.0` | Type definitions for `pg`            |
| `@types/bcryptjs`      | `^2.4.6`  | Type definitions for `bcryptjs`      |

---

## Environment Variables

Create a `.env` file at the root of the project with the following variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>?schema=public"

# JWT secret key — change this in production!
JWT_SECRET="your-super-secret-jwt-key"

# Ollama base URL (default local port)
OLLAMA_BASE_URL="http://127.0.0.1:11434"
```

> **⚠️ Security Warning**: Never commit your `.env` file to version control. It is already listed in `.gitignore`.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mohabzalat22/heart-disease.git
cd heart-disease
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example below into a new `.env` file and fill in your values:

```bash
cp .env.example .env  
```

Then edit `.env` with your PostgreSQL credentials and desired JWT secret.

### 4. Set Up the Database

Make sure PostgreSQL is running, then run:

```bash
# Apply all migrations to create the database schema
npx prisma migrate deploy

# Generate the Prisma client
npx prisma generate
```

### 5. Start Ollama

Ensure Ollama is running and a model is available:

```bash
ollama serve         # Start the Ollama server
ollama pull minimax-m2.5:cloud   # Pull the model the app uses (adjust as needed)
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Database Setup

The project uses **Prisma** with **PostgreSQL**. The schema defines the following models:

| Model     | Description                                      |
| --------- | ------------------------------------------------ |
| `User`    | Stores user credentials, name, email, and avatar |
| `Chat`    | Represents a chat session belonging to a user    |
| `Message` | Individual messages within a chat (user or AI)   |
| `Prompt`  | System prompt configuration per user             |

### Useful Prisma Commands

```bash
# Create a new migration after editing schema.prisma
npx prisma migrate dev --name <migration-name>

# Apply existing migrations (for production / fresh setup)
npx prisma migrate deploy

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (visual DB editor)
npx prisma studio
```

---

## Available Scripts

| Script            | Command                   | Description                          |
| ----------------- | ------------------------- | ------------------------------------ |
| `dev`             | `npm run dev`             | Start the Next.js development server |
| `build`           | `npm run build`           | Build the production bundle          |
| `start`           | `npm run start`           | Start the production server          |
| `lint`            | `npm run lint`            | Run ESLint across the project        |
| `format`          | `npm run format`          | Format all files with Prettier       |
| `format:check`    | `npm run format:check`    | Check formatting without writing     |
| `types`           | `npm run types`           | Run TypeScript type-checking         |

---

## Project Structure

```
heart-disease/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── api/              # API route handlers
│   ├── chat/             # Chat interface pages
│   └── settings/         # User settings pages
├── components/           # Reusable React components
├── actions/              # Next.js server actions
├── repositories/         # Database access layer (Prisma queries)
├── services/             # Business logic layer
├── hooks/                # Custom React hooks
├── store/                # Client-side state management
├── types/                # TypeScript type definitions
├── lib/                  # Utility functions and shared helpers
├── prisma/
│   ├── schema.prisma     # Database schema definition
│   └── migrations/       # Prisma migration history
├── generated/            # Auto-generated Prisma client
├── public/               # Static assets
├── .env                  # Environment variables (not committed)
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

## License

This project is for educational and research purposes. All rights reserved.
