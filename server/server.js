/* 
  next:
    - get individual task
    - do delete routes for everything
    - do update routes for everything
    - entire board route
    - home-screen route
*/

/* eslint-disable no-undef*/
// import http from "http";
import pg from "pg";
import "dotenv/config";
import express from "express";

let dbConfig = process.env.PGUSER
  ? {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDB,
      password: process.env.PGPWD,
      port: process.env.PGPORT,
    }
  : {
      connectionString:
        "postgres://admin:sOdTEpXhj9zKtcFc5EYdrWAB9fc2KsWz@dpg-cisl9l95rnujejq1v7gg-a/kanban_clone",
    };

const pool = new pg.Pool(dbConfig);

async function queryDb(query, values) {
  try {
    const res = await pool.query(query, values || []); // do i need "|| []" ?
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

const port = 5030;
const app = express();

app.use(express.json());

// do i need cors? <-- wait to see if i need it. by default app.us(cors()) will allow all origins, but can configure to specify origins

app.get("/", (req, res) => {
  res.send("You've hit the API!");
});
//     home-screen (gets all data for home screen: 1. list of boards, 2. all columns and tasks for the first board)
//       - read - GET
//     entire-board/{board_id} (all info for board including columns and tasks)
//       - read - GET

// boards
// GET - gets all the boards
app.get("/boards", async (req, res) => {
  const data = await queryDb("select * from boards;");
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});
// POST - create a board
app.post("/boards", async (req, res) => {
  const dataFromRequest = req.body;
  const boardName = dataFromRequest.boardName;
  const queryResult = await queryDb(
    "insert into boards (name) values ($1) returning *;", // it's common to return the object that just got created
    [boardName]
  );
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(queryResult));
});

// boards/{board_id}
// GET - get an individual board
app.get("/boards/:boardID", async (req, res) => {
  const boardID = req.params.boardID;
  const data = await queryDb(`select * from boards where id = $1;`, [boardID]);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});
//       - update - POST
//       - delete - POST

// boards/{board_id}/columns -> we don't have /columns b/c columns are always inside of boards and this structure is more intuitive to describe that relationship
// GET - read all columns in a board board
app.get("/boards/:boardID/columns", async (req, res) => {
  const boardID = req.params.boardID;
  const data = await queryDb("select * from columns where board_id = $1;", [
    boardID,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});
// POST - create a column in a board
app.post("/boards/:boardID/columns", async (req, res) => {
  const boardID = req.params.boardID;
  const columnData = req.body;
  const queryResult = await queryDb(
    "insert into columns (name, position, board_id) values ($1, $2, $3) returning *;", // this format is neater than string templating (query could get long)
    [columnData.name, columnData.position, boardID]
  );
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(queryResult));
});
// boards/{board_id}/columns/{column_id}
// GET - read an individual column
app.get("/boards/:boardID/columns/:columnID", async (req, res) => {
  const columnID = req.params.columnID;
  const data = await queryDb("select * from columns where id = $1;", [
    columnID,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});
// update - POST
// delete - POST

// /boards/{boardId}/columns/{column_id}/tasks (gets all tasks for column)
// read - GET
app.get("/boards/:boardId/columns/:columnID/tasks", async (req, res) => {
  const columnID = req.params.columnID;
  const data = await queryDb("select * from tasks where column_id = $1;", [
    columnID,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});

// tasks
// create - POST
app.post("/tasks", async (req, res) => {
  const dataFromRequest = req.body;
  // const boardName = dataFromRequest.boardName;
  const queryResult = await queryDb(
    // it's common to return the object that just got created
    "insert into tasks (title, description, column_id, parent_id) values ($1, $2, $3, $4) returning *;",
    [
      dataFromRequest.title,
      dataFromRequest.description,
      dataFromRequest.columnID,
      dataFromRequest.parentID,
    ]
  );
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(queryResult));
});

// tasks/{task_id} (individual task) <-- not /boards/{boardId}/columns/{column_id}/tasks/{task_id} b/c tasks can be moved between boards
app.get("/tasks/:taskID", async (req, res) => {
  const taskID = req.params.taskID;
  const data = await queryDb(
    "select * from tasks where id = $1 or parent_id = $1",
    [taskID]
  );
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});

// read - GET (need to get subtasks as well)
// update - POST
// delete - POST

app.listen(port, () => {
  console.log(
    `Express server is running on port ${port}, url http://127.0.0.1:${port}`
  );
});

// const server = http.createServer(async (req, res) => {
//   const origin = req.headers.origin;
//   const allowedOrigins = [
//     "http://localhost:5173",
//     "https://kanban-clone-frontend.onrender.com",
//   ];
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }

//   /*
//     DEMONSTRATING WHY VANILLA NODE.JS IS UGLY

//     const segments = req.url.split("/");
//     for the /entire-board/{board_id} route, board_id will be segments[2]
//     and the if case for this is if (segments[1] === 'entire-board' && segments.length === 2)
//     this is quite ugly

//     elaborate on all the different if conditions we'd need
//   */

//   // if (req.url === "/") {
//   //   res.setHeader("Content-Type", "application/json");
//   //   res.statusCode = 200;
//   //   res.write(
//   //     JSON.stringify({
//   //       name: "jared",
//   //       age: 30,
//   //     })
//   //   );
//   // } else
//    if (req.url === "/boards") {
//     let data = await queryDb("select * from boards;");
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
//     res.write(JSON.stringify(data));
//   } else if (req.url === "/user/1") {
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
//     res.write(
//       JSON.stringify({
//         name: "jared",
//         age: 30,
//       })
//     );
//   } else if (req.url === "/group/1") {
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
//     res.write(
//       JSON.stringify({
//         name: "friends",
//         members: 100,
//       })
//     );
//   } else {
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 404;
//     JSON.stringify({
//       error: true,
//       message: "endpoint doesn't exist",
//     });
//   }
//   res.end();
// });

// server.listen(5030, () => {
//   console.log(
//     "listening for requests on port 5030, url is http://127.0.0.1:5030"
//   );
// });
