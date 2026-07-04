# Frontend Setup

This is the frontend for the Webhook Delivery System, built with Next.js, TypeScript, Tailwind CSS, and Redux Toolkit.

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variable:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This should point to your API Gateway URL.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create the `.env.local` file with your API URL

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable React components
- `src/redux/` - Redux store and slices
- `src/lib/` - Utility functions and API client

## Features

- Authentication (Login/Register)
- Dashboard with statistics
- Webhook management (CRUD operations)
- Event tracking and monitoring
- Delivery logs monitoring
- Real-time updates
- Responsive design

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React
