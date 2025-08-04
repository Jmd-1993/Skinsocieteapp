# Skin Societe

Australia's first integrated skincare clinic + e-commerce app with advanced gamification.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Clerk
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **File Storage**: Cloudinary

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your actual API keys and credentials

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
skin-societe/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   ├── components/      # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Key Features

- E-commerce store with 1000+ SKUs
- Clinic appointment booking system
- 4-tier loyalty system with gamification
- User profiles with skin analysis
- Photo upload for before/after comparisons
- Educational content and community features
- Referral system and social sharing

## Development

This project uses:
- TypeScript for type safety
- Prisma for database management
- Clerk for authentication
- Stripe for payments
- Tailwind CSS for styling
