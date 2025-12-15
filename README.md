# Warm Lead Sourcer

**Turn Social Engagement Into Warm Leads — Instantly**

Extract and enrich engagement data from LinkedIn posts to identify and qualify warm leads with proven interest in your content.

## 🎯 Overview

Warm Lead Sourcer automates the process of:
1. **Extracting** comments and reactions from LinkedIn posts
2. **Enriching** user profiles with education, experience, and contact data
3. **Scoring** leads based on relevance and data completeness
4. **Exporting** qualified leads as CSV files

## ✨ Key Features

- **Automated Lead Generation** - Extract engaged users from LinkedIn posts
- **Profile Enrichment** - Gather education, experience, and contact information
- **Smart Scoring** - Rate leads based on profile completeness and relevance
- **Email Generation** - Generate university-based email addresses
- **Advanced Filtering** - Filter by location, university, company, and score
- **Secure Authentication** - JWT-based auth with Google OAuth integration
- **Real-time Processing** - Live status updates during extraction

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- RapidAPI account with LinkdAPI subscription

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DirectEd-Development/Warm-Lead-Sourcer.git
cd Warm-Lead-Sourcer
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Backend `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/warm-lead-sourcer
RAPIDAPI_KEY=your-rapidapi-key-here
RAPIDAPI_HOST=linkdapi-best-unofficial-linkedin-api.p.rapidapi.com
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

Frontend `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start the application**
```bash
npm run dev
```

---

## 🎮 How to Use

### Web Interface

1. **Sign up** at the application homepage
2. **Navigate to** the input page
3. **Paste a LinkedIn post URL**
   ```
   https://www.linkedin.com/posts/username_activity-123456789
   ```
4. **Click "START EXTRACTION"** and wait for processing
5. **View results** in the dashboard with filtering options
6. **Export leads** as CSV for your CRM

### Sample LinkedIn Post
```
https://www.linkedin.com/posts/munashe-masomeke-803475217_dataabrscience-dataabranalytics-activity-7402045266020794369-Hb47
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, MongoDB
- **Authentication**: JWT, Google OAuth
- **APIs**: LinkedIn RapidAPI integration

### Project Structure
```
├── backend/              # NestJS API server
│   ├── src/modules/
│   │   ├── auth/        # Authentication & authorization
│   │   ├── users/       # User management
│   │   ├── posts/       # Post processing
│   │   ├── scraping/    # LinkedIn data extraction
│   │   ├── leads/       # Lead management & filtering
│   │   └── export/      # CSV export functionality
│   └── test/            # Unit & integration tests
├── frontend/            # Next.js web application
│   ├── app/             # App router pages
│   ├── components/      # Reusable UI components
│   └── contexts/        # React contexts
└── genai_service/       # Future AI enhancements
```

---

## 📡 API Reference

### Core Endpoints

**Posts**
- `POST /api/posts` - Submit LinkedIn URL for processing
- `GET /api/posts/:id` - Get processing status

**Leads**
- `GET /api/leads` - Retrieve leads with filtering
- `GET /api/leads/export` - Export leads as CSV

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth

### Query Parameters
- `postId` - Filter by specific post
- `minScore` - Minimum match score (0-100)
- `country` - Filter by country
- `university` - Filter by university
- `company` - Filter by company

---

## 🧪 Testing

### Run Tests
```bash
# Backend unit tests
cd backend && npm test

# Test coverage
npm run test:cov

# Integration tests
npm run test:e2e
```

### Build for Production
```bash
npm run build:all
```

---

## 🚀 Deployment

### Environment Setup
Ensure all environment variables are configured for production:
- Database connection string
- RapidAPI credentials
- JWT secret
- OAuth credentials (if using Google login)

### Build Commands
```bash
# Build all services
npm run build:all

# Run tests
npm run test:all
```

---

## 📊 CSV Export Fields

The exported CSV includes:
- Full Name
- Professional Headline  
- LinkedIn Profile URL
- Engagement Type & Content
- Match Score (0-100)
- Guessed Email Address
- University/Institution
- Degree & Field of Study
- Export Date

---

## 🔒 Privacy & Compliance

- Only processes publicly available LinkedIn data
- Respects platform Terms of Service
- Secure data handling with automatic cleanup
- GDPR-compliant data processing

---

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check the documentation
- Review the API reference

---

## 📄 License

This project is licensed under the MIT License.