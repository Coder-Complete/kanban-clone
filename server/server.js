/* eslint-disable no-undef*/
import express from "express";
import pg from "pg";
import "dotenv/config";

// GET (read), POST (create), PUT (update), PATCH (update), DELETE (delete)

//   const origin = req.headers.origin;
//   const allowedOrigins = [
//     "http://localhost:5173",
//     "https://kanban-clone-frontend.onrender.com",
//   ];
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }

const app = express();
const port = 5030;

const dbConfig = process.env.PGUSER
  ? {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDB,
      password: process.env.PGPWD,
      port: process.env.PGPORT,
    }
  : {
      connectionString:
        "postgres://admin:sOdTEpXhj9zKtcFc5EYdrWAB9fc2KsWz@dpg-cisl9l95rnujejq1v7gg-a.oregon-postgres.render.com/kanban_clone?ssl=true",
    };
const pool = new pg.Pool(dbConfig);

async function queryDb(query) {
  try {
    await pool.connect();
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(
    JSON.stringify({
      message: "You've hit the API!",
    })
  );
});

// home screen (data we want at very beginning of our app)
// - GET: get all the board names, and all the columns and tasks for the first board in the list of boards

// entire board (data we want when we click a different board than the default (first board))
// - GET: get all the columns and tasks within those columns for a specific board

// /boards
// - GET: get list of all boards
app.get("/boards", async (req, res) => {
  let data = await queryDb("select * from boards;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific board
app.get("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const data = await queryDb(`select * from boards where id=${boardId};`);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - POST: create new board
// - PUT & PATCH: edit existing board (change name)
// - DELETE: delete board
app.delete("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const data = await queryDb(`delete from boards where id=${boardId};`);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});

// columns
// - GET: get all columns
app.get("/columns", async (req, res) => {
  const data = await queryDb("select * from columns;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific column
app.get("/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const data = await queryDb(`select * from columns where id=${columnId};`);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get all columns for a board
// - POST: create new column
// - PUT & PATCH: edit existing column (change name or position)
// - DELETE: delete a column
app.delete("/columns/:columnId", async (req, res) => {
  try {
    const columnId = req.params.columnId;
    const data = await queryDb(`delete from columns where id=${columnId};`);
    console.log(data);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
});

// tasks
// - GET: get all tasks
app.get("/tasks", async (req, res) => {
  const data = await queryDb("select * from tasks;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific task
app.get("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const data = await queryDb(`select * from tasks where id=${taskId};`);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get all tasks for a specific column
// - POST: create new task
// - PUT & PATCH: edit existing task (change title, description, column_id, or parent_id)
// - DELETE: delete task
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const data = await queryDb(`delete from tasks where id=${taskId};`);
  console.log(data);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});

app.listen(port, () => {
  console.log(`listening for requests on port ${port}`);
});
