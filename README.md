# Inventory Management Authentication

A modern authentication system for an inventory management dashboard built with Next.js 16 and Shadcn UI components.

## Features

- **Modern Design**: Clean, professional interface matching inventory dashboard theme
- **Authentication Pages**: Sign-in and sign-up pages with form validation
- **Dashboard Preview**: Complete inventory management dashboard layout
- **Responsive Design**: Mobile-first responsive layout
- **TypeScript**: Full TypeScript support for type safety
- **Shadcn UI**: Beautiful, accessible UI components

## Pages

- `/` - Home page (redirects to sign-in)
- `/signin` - Sign-in page with social auth options
- `/signup` - Sign-up page with password strength indicator
- `/dashboard` - Inventory management dashboard preview

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality UI components
- **Lucide React** - Beautiful icons

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (redirects to signin)
│   ├── signin/
│   │   └── page.tsx          # Sign-in page
│   ├── signup/
│   │   └── page.tsx          # Sign-up page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard preview
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/
│   └── ui/                   # Shadcn UI components
└── lib/
    └── utils.ts              # Utility functions
```

## Key Features

### Sign-in Page

- Email and password authentication
- Password visibility toggle
- Remember me checkbox
- Social authentication (Google, GitHub)
- Forgot password link
- Modern split-screen layout with dashboard preview

### Sign-up Page

- Complete registration form
- Password strength indicator
- Real-time password validation
- Terms and conditions checkbox
- Social authentication options
- Feature highlights on left panel

### Dashboard

- Inventory metrics cards
- Search and filter functionality
- Inventory grid with status indicators
- Sidebar navigation
- User profile section
- Alert notifications

## Customization

The theme is designed to match your inventory management dashboard. You can customize:

- Colors in `src/app/globals.css`
- Component styles in individual page files
- Layout and spacing using Tailwind classes
- Icons and imagery

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Shadcn UI](https://ui.shadcn.com) - learn about the UI components
- [Tailwind CSS](https://tailwindcss.com) - learn about the CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
