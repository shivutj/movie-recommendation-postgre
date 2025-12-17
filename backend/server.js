require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./recommendations.db", (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_input TEXT NOT NULL,
    recommended_movies TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

    db.run(
      "INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)",
      [user_input, moviesJson],
      function (err) {
        if (err) {
          console.error("Database error:", err);
        }
      }
    );

    res.json({ movies });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to get recommendations" });
  }
});

app.get("/api/recommendations", (req, res) => {
  db.all(
    "SELECT * FROM recommendations ORDER BY timestamp DESC LIMIT 10",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      const formattedRows = rows.map((row) => ({
        ...row,
        recommended_movies: JSON.parse(row.recommended_movies),
      }));
      res.json(formattedRows);
    }
  );
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
