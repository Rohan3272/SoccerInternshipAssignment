import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const teamNameToId = {
  "Arsenal": 133604,
  "Manchester City": 133613,
  "Real Madrid": 133738,
  "Liverpool": 133602,
  "Chelsea": 133610
};


app.get("/matches", async (req, res) => {
  const teamName = req.query.team || "Arsenal";
  const teamId = teamNameToId[teamName];

  if (!teamId) {
    return res.status(400).json({ error: "Invalid team name" });
  }

  const url = `https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${teamId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.events || !Array.isArray(data.events)) {
      return res.status(500).json({ error: "No events found" });
    }

    const matches = data.events.map(event => ({
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      utcDate: new Date(`${event.dateEvent}T${event.strTime || "00:00:00"}Z`).toISOString(),
      stadium: event.strVenue,
      league: event.strLeague,
      logo: event.strThumb || ""
    }));

    res.json(matches);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
