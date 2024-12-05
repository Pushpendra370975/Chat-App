# Home Away

Home Away is a modern, full-stack web application for short-term property rentals. Built with Next.js, React, and Supabase, it offers a user-friendly platform for hosts to list properties and for travelers to discover and book accommodations.

## Features

- User authentication and profiles using Clerk
- Property listing creation and management
- Advanced search functionality with multiple filters
- Intuitive booking system with interactive calendar
- Responsive design for seamless mobile and desktop experience

## Tech Stack

- Frontend: Next.js 13 (App Router), React, TypeScript
- Styling: Tailwind CSS
- Backend & Database: Supabase
- Authentication: Clerk
- Deployment: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. Clone the repository: https://github.com/yourusername/home-away.git
2. Navigate to the project directory:
cd home-away


3. Install dependencies:
npm install


4. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key


5. Run the development server:
npm run dev


6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Inspired by Airbnb's user interface and functionality
- Thanks to the Next.js, Supabase, and Clerk teams for their excellent documentation
