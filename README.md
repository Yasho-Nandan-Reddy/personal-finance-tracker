# Personal Finance Tracker

A modern web application for tracking personal finances, managing budgets, and setting financial goals.

## Features

- 💰 Transaction tracking and management
- 📊 Budget planning and monitoring
- 🎯 Financial goal setting and tracking
- 📈 Visual progress indicators
- 🔐 Secure authentication
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Prisma
- NextAuth.js
- Chart.js

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── budget/         # Budget page
│   ├── goals/          # Goals page
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   └── transactions/   # Transactions page
├── components/         # React components
├── lib/               # Utility functions and configurations
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 