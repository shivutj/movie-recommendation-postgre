# Movie Recommendation App

A full-stack MERN application that provides AI-powered movie recommendations using OpenRouter API.

## Features

- AI-powered movie recommendations based on user preferences
- PostgreSQL database to store recommendation history
- Clean and simple UI
- RESTful API with Express.js

## Tech Stack

**Frontend:** React, JavaScript, CSS
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**AI API:** OpenRouter (GPT-4o-mini)

## Project Structure

```
movie-recommender/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Prerequisites

- Node.js (v18 or later)
- npm
- PostgreSQL (local or remote)
- OpenRouter API key ([Get it here](https://openrouter.ai/keys))

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd movie-recommender
```

### 2. Backend Setup

Navigate to backend folder:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file in the backend folder:
```env
OPENROUTER_API_KEY=your_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/movie_recommendation
PORT=5001
SITE_URL=http://localhost:3000
```

Start the backend server:
```bash
npm start
```

Backend will run on: `http://localhost:5001`

### 3. Frontend Setup

Open a new terminal and navigate to frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend:
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Enter your movie preference (e.g., "Superhero movies in india ")
4. Click "Get Recommendations"
5. View AI-generated movie recommendations with title, year, genre, and description

## API Endpoints

### POST /api/recommendations
Generate and save movie recommendations

**Request Body:**
```json
{
  "user_input": "sci-fi movies",
  "movie_count": 5
}
```

**Response:**
```json
{
  "movies": [
    {
      "title": "Inception",
      "year": "2010",
      "genre": "Sci-Fi",
      "description": "A thief who steals corporate secrets..."
    }
  ]
}
```

**Response:**
```json
[
  {
    "id": 1,
    "user_input": "sci-fi movies",
    "recommended_movies": [...],
    "movie_count": 5,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

## Database Schema

```sql
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_input TEXT NOT NULL,
  recommended_movies TEXT NOT NULL,
  movie_count INTEGER DEFAULT 5,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

**Backend (.env):**
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Backend server port (default: 5001)
- `SITE_URL` - Frontend URL for CORS

## Deployment

### Backend Deployment (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Update API URL in `App.js` to your deployed backend URL

## Troubleshooting

**Port Already in Use:**
```bash
lsof -ti:5001
kill -9 $(lsof -ti:5001)
```

**PostgreSQL Connection Error:**
- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure database exists

**API Key Error:**
- Verify OPENROUTER_API_KEY in .env file
- Check if API key is valid
- Ensure .env file is in backend folder

## Notes

- API key is stored securely in backend .env file
- Never commit .env file to Git (included in .gitignore)
- Free tier on Render may have cold starts
- OpenRouter API usage is billed separately
