const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertingToCamelCase = (snake_case_array) => {
  const camelCaseArray = snake_case_array.map((eachObj) => {
    const camelCaseObj = {
      movieName: eachObj.movie_name,
    };
    return camelCaseObj;
  });

  return camelCaseArray;
};

const convertingToCamelCaseDirectorTable = (snake_case_array) => {
  const camelCaseArray = snake_case_array.map((eachObj) => {
    const camelCaseObj = {
      directorId: eachObj.director_id,
      directorName: eachObj.director_name,
    };
    return camelCaseObj;
  });

  return camelCaseArray;
};

// GET all movies in camelCase API

app.get("/movies/", async (request, response) => {
  const getAllMoviesArrayQuery = `SELECT movie_name
    FROM 
        movie; `;

  const moviesArraySnakeCase = await db.all(getAllMoviesArrayQuery);
  const camelCaseResultArray = convertingToCamelCase(moviesArraySnakeCase);
  response.send(camelCaseResultArray);
});

//POST movie API
app.post("/movies/", async (request, response) => {
  const movieColumns = request.body;
  const { directorId, movieName, leadActor } = movieColumns;
  const createMovieDetailsQuery = `
        INSERT INTO
          movie (director_id, movie_name, lead_actor)
        VALUES (${directorId}, '${movieName}', '${leadActor}'); `;

  await db.run(createMovieDetailsQuery);
  response.send("Movie Successfully Added");
});

// GET movie based on movie_id API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    SELECT  *
    FROM
        movie
  WHERE
      movie_id = ${movieId} ;`;
  const movieObj = await db.get(getMovieDetailsQuery);
  const resultObj = {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_actor,
  };
  response.send(resultObj);
});

//PUT movie details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `
    UPDATE
      movie
    SET
       director_id = ${directorId},
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
    WHERE
         movie_id = ${movieId};
    `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

// DELETE row from movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsQuery = `
    DELETE FROM
      movie
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(deleteMovieDetailsQuery);
  response.send("Movie Removed");
});

// GET list of all directors in camelCase API
app.get("/directors/", async (request, response) => {
  const getAllDirectorsDetailsQuery = `SELECT *
    FROM 
        director; `;

  const directorDetailsSnakeCase = await db.all(getAllDirectorsDetailsQuery);
  const camelCaseResultArray = convertingToCamelCaseDirectorTable(
    directorDetailsSnakeCase
  );
  response.send(camelCaseResultArray);
});

//GET a list of all movie names directed by a specific director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMoviesArrayQuery = `SELECT movie_name
    FROM 
        movie
    WHERE
        director_id = ${directorId}; `;

  const moviesArraySnakeCase = await db.all(getAllMoviesArrayQuery);
  const camelCaseResultArray = convertingToCamelCase(moviesArraySnakeCase);
  response.send(camelCaseResultArray);
});

module.exports = app;
