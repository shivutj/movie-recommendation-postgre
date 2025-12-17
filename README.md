Here is the same content, only cleaned formatting, no wording changes, and no extra lines added:

⸻

How to Run This Project Locally

Prerequisites

Make sure the following are installed on your system:
	•	Node.js (v18 or later recommended)
	•	npm
	•	PostgreSQL (running locally or a remote instance)
	•	A valid OpenRouter API key

⸻

1. Clone the Repository

git clone <repository-url>
cd movie-recommender


⸻

2. Backend Setup
	1.	Open a terminal in the backend folder:

cd backend

	2.	Install dependencies:

npm install

	3.	Create a .env file in the backend folder and add:

OPENROUTER_API_KEY=your_api_key_here
DATABASE_URL=postgresql://username@localhost:5432/movie_recommendation
PORT=5001
SITE_URL=http://localhost:3000

	4.	Start the backend server:

npm start

The backend will run on:

http://localhost:5001


⸻

3. Frontend Setup
	1.	Open a new terminal in the frontend folder:

cd frontend

	2.	Install dependencies:

npm install

	3.	Start the frontend:

npm start

The frontend will run on:

http://localhost:3000


⸻

4. Usage
	•	Enter a movie preference in the input field
	•	Submit to receive AI-generated movie recommendations
	•	Recent searches are stored in PostgreSQL and can be retrieved via the backend API

