/* eslint-disable no-undef*/
import express from "express";
import pg from "pg";
import morgan from "morgan";
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

async function queryDb(query, values) {
  try {
    await pool.connect();
    const res = await pool.query(query, values || []);
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

app.use(morgan("tiny"));
app.use(express.json());

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
  let data = await queryDb("SELECT * FROM boards;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific board
app.get("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const data = await queryDb("SELECT * FROM boards WHERE id=$1;", [boardId]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - POST: create new board
app.post("/boards", async (req, res) => {
  const name = req.body.name;
  const data = await queryDb(
    "INSERT INTO boards (name) VALUES ($1) RETURNING *;",
    [name]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - PUT & PATCH: edit existing board (change name)
app.put("/boards/:boardId", async (req, res) => {
  const name = req.body.name;
  const boardId = req.params.boardId;
  const data = await queryDb(
    "UPDATE boards SET name=$1 WHERE id=$2 RETURNING *;",
    [name, boardId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - DELETE: delete board
app.delete("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const data = await queryDb("DELETE FROM boards WHERE id=$1;", [boardId]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});

// columns
// - GET: get all columns
app.get("/columns", async (req, res) => {
  const data = await queryDb("SELECT * FROM columns;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific column
app.get("/boards/:boardId/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const data = await queryDb("SELECT * FROM columns WHERE id=$1;", [columnId]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});

// - GET: get all columns for a board
app.get("/boards/:boardId/columns", async (req, res) => {
  const boardId = req.params.boardId;
  const data = await queryDb("SELECT * FROM columns WHERE board_id=$1;", [
    boardId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - POST: create new column
app.post("/boards/:boardId/columns", async (req, res) => {
  const name = req.body.name;
  const position = req.body.position;
  const boardId = req.params.boardId;
  const data = await queryDb(
    "INSERT INTO columns (name, position, board_id) VALUES ($1, $2, $3) RETURNING *;",
    [name, position, boardId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - PUT & PATCH: edit existing column (change name or position)
app.put("/boards/:boardId/columns/:columnId", async (req, res) => {
  const boardId = req.params.boardId;
  const columnId = req.params.columnId;
  const name = req.body.name;
  const position = req.body.position;
  const data = await queryDb(
    "UPDATE columns SET name=$1, position=$2, board_id=$3 WHERE id=$4 RETURNING *;",
    [name, position, boardId, columnId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - DELETE: delete a column
app.delete("/boards/:boardId/columns/:columnId", async (req, res) => {
  try {
    const columnId = req.params.columnId;
    const data = await queryDb("DELETE FROM columns WHERE id=$1;", [columnId]);
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
  const data = await queryDb("SELECT * FROM tasks;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get info for a specific task
app.get("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const data = await queryDb("SELECT * FROM tasks WHERE id=$1;", [taskId]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - GET: get all tasks for a specific column
app.get("/boards/:boardId/columns/:columnId/tasks", async (req, res) => {
  const columnId = req.params.columnId;
  const data = await queryDb("SELECT * FROM tasks WHERE column_id=$1;", [
    columnId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});
// - POST: create new task
app.post("/tasks", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const columnId = req.body.column_id;
  const data = await queryDb(
    "INSERT INTO tasks (title, description, column_id) VALUES ($1, $2, $3) RETURNING *;",
    [title, description, columnId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - PUT & PATCH: edit existing task (change title, description, column_id, or parent_id)
app.put("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const title = req.body.title;
  const description = req.body.description;
  const columnId = req.body.column_id;
  const parentId = req.body.parent_id;
  const data = await queryDb(
    "UPDATE tasks SET title=$1, description=$2, column_id=$3, parent_id=$4 WHERE id=$5 RETURNING *;",
    [title, description, columnId, parentId, taskId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ data }));
});
// - DELETE: delete task
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const data = await queryDb("DELETE FROM tasks WHERE id=$1;", [taskId]);
  console.log(data);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
});

app.listen(port, () => {
  console.log(`listening for requests on port ${port}`);
});
