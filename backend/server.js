require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL database");
    return client.release();
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
  });

async function initializeDatabase() {
  // Ensure the recommendations table exists on startup
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      user_input TEXT NOT NULL,
      recommended_movies TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.post("/api/recommendations", async (req, res) => {
  const { user_input } = req.body;

  if (!user_input) {
    return res.status(400).json({ error: "Missing user input" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": "Movie Recommendation App",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Based on this preference: "${user_input}", recommend exactly 5 movies. For each movie, provide: title, year, genre, and a brief description. Format your response as JSON array with objects containing: title, year, genre, description fields.`,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "API request failed");
    }

    const content = data.choices[0].message.content;
    let movieList;

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        movieList = JSON.parse(jsonMatch[0]);
      } else {
        movieList = JSON.parse(content);
      }
    } catch {
      const lines = content.split("\n").filter((line) => line.trim());
      movieList = lines.slice(0, 5).map((line) => ({
        title: line
          .replace(/^\d+\.\s*/, "")
          .split("(")[0]
          .trim(),
        year: "N/A",
        genre: "Various",
        description: line,
      }));
    }

    const movies = movieList.slice(0, 5);
    const moviesJson = JSON.stringify(movies);

    // Persist recommendation using PostgreSQL
    await pool.query(
      "INSERT INTO recommendations (user_input, recommended_movies) VALUES ($1, $2)",
      [user_input, moviesJson]
    );

    res.json({ movies });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to get recommendations" });
  }
});

app.get("/api/recommendations", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM recommendations ORDER BY timestamp DESC LIMIT 10"
    );
    const formattedRows = rows.map((row) => ({
      ...row,
      recommended_movies: JSON.parse(row.recommended_movies),
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5001;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
