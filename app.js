const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server running at 3001");
    });
  } catch (error) {
    console.log(`DB error: ${error.msg}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/players/", async (require, response) => {
  const sqlQuarryToGetPlayersList = `
    SELECT 
        player_id as playerId,
        player_name as playerName
    FROM
        player_details;
    `;
  const playersList = await db.all(sqlQuarryToGetPlayersList);
  response.send(playersList);
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuarryToGetSpecificPlayerNameAndId = `
        SELECT 
            player_id as playerId,
            player_name as playerName
        FROM 
            player_details
        WHERE
            player_id = ${playerId};
        `;
  const specificPlayer = await db.get(sqlQuarryToGetSpecificPlayerNameAndId);
  response.send(specificPlayer);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const sqlQuarryToUpdatePlayerDetails = `
    UPDATE
        player_details
    SET 
        player_name = "${playerName}"
    WHERE
        player_id = ${playerId};
    `;
  await db.run(sqlQuarryToUpdatePlayerDetails);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getSpecificMatchDetailsQuarry = `
    SELECT
        match_id as matchId,
        match,
        year
    FROM
        match_details
    WHERE
        match_id = ${matchId};
    `;
  const specificMatchDetails = await db.get(getSpecificMatchDetailsQuarry);
  response.send(specificMatchDetails);
});

//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const specificPlayerMatchDetailsQuarry = `
        SELECT
            match_id as matchId,
            match,
            year
        FROM
            match_details NATURAL JOIN player_match_score
        WHERE
            player_id = ${playerId};
    `;
  const specificPlayerMatchesDetails = await db.all(
    specificPlayerMatchDetailsQuarry
  );
  response.send(specificPlayerMatchesDetails);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const sqlQuarryToGetPlayersOfSpecificMatch = `
    SELECT
        player_id as playerId,
        player_name as playerName
    FROM
        player_details NATURAL JOIN player_match_score
    WHERE 
        match_id = ${matchId};
    `;
  const playersOfSpecificMatch = await db.all(
    sqlQuarryToGetPlayersOfSpecificMatch
  );
  response.send(playersOfSpecificMatch);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuarryToGetSpecificPlayerStats = `
    SELECT
        player_id as playerId,
        player_name as playerName,
        SUM(score) as totalScore,
        SUM(fours) as totalFours,
        SUM(sixes) as totalSixes
    FROM 
        player_details NATURAL JOIN player_match_score
    WHERE   
        player_id = ${playerId}
    GROUP BY
        player_id;
    `;
  const specificPlayerStats = await db.get(sqlQuarryToGetSpecificPlayerStats);
  response.send(specificPlayerStats);
});

module.exports = app;
