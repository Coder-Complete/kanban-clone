/* 
  next:
    - do put routes for everything
    - do patch routes for everything
    - add error handling
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
// home-screen (gets all data for home screen: 1. list of boards, 2. all columns and tasks for the first board)
// GET
app.get("/home-screen", (req, res) => {
  // SELECT id, name
  // FROM board
  // ORDER BY id
  // LIMIT 1;

  // SELECT
  //   c.id AS column_id,
  //   c.name AS column_name,
  //   c.position AS column_position,
  //   t.id AS task_id,
  //   t.title AS task_title,
  //   t.description AS task_description
  // FROM
  //     column AS c
  // LEFT JOIN
  //     tasks AS t ON c.id = t.column_id
  // WHERE
  //     c.board_id = ? -- Replace '?' with the ID of the first board you retrieved
  // ORDER BY
  //     c.position, t.id;
  res.send("You've hit the home screen route!");
});
//     entire-board/{board_id} (all info for board including columns and tasks)
//       - read - GET
app.get("/entire-board/:boardId", async (req, res) => {
  const boardId = req.params.boardId;

  // The JOIN between the board and column tables links them using the board_id foreign key.
  // The LEFT JOIN between the column and tasks tables is used since tasks might not exist in all columns.
  // The WHERE clause filters the results to a specific board using its id.

  const queryResult = await queryDb(
    `SELECT
      b.id AS board_id,
      b.name AS board_name,
      b.created_date AS board_created_date,
      c.id AS column_id,
      c.name AS column_name,
      c.position AS column_position,
      t.id AS task_id,
      t.title AS task_title,
      t.description AS task_description,
      t.created_date AS task_created_date,
      t.parent_id AS task_parent_id
    FROM
      boards AS b
    JOIN
      columns AS c ON b.id = c.board_id
    LEFT JOIN
      tasks AS t ON c.id = t.column_id
    WHERE
      b.id = $1`,
    [boardId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// boards
// GET - gets all the boards
app.get("/boards", async (req, res) => {
  const queryResult = await queryDb("select * from boards;");
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// POST - create a board
app.post("/boards", async (req, res) => {
  const dataFromRequest = req.body;
  const boardName = dataFromRequest.name;
  const queryResult = await queryDb(
    "insert into boards (name) values ($1) returning *;", // it's common to return the object that just got created
    [boardName]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});

// boards/{board_id}
// GET - get an individual board
app.get("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const queryResult = await queryDb("select * from boards where id = $1;", [
    boardId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// PUT
app.put("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const updatedData = req.body;
  try {
    // Perform the SQL update operation
    const updateQuery = `
          UPDATE boards
          SET name = $1
          WHERE id = $2
          RETURNING *
      `;
    const updateValues = [updatedData.name, boardId];
    const queryResult = await pool.query(updateQuery, updateValues);
    res.status(200).json(queryResult);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// PATCH
app.patch("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const updatedFields = req.body;
  try {
    // Generate the SET clause dynamically based on updatedFields
    const setClause = Object.keys(updatedFields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    // Perform the SQL update operation
    const updateQuery = `
        UPDATE boards
        SET ${setClause}
        WHERE id = $${Object.keys(updatedFields).length + 1}
        RETURNING *
    `;
    const updateValues = Object.values(updatedFields).concat(boardId);
    const queryResponse = await pool.query(updateQuery, updateValues);
    res.json(queryResponse);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// DELETE
app.delete("/boards/:boardId", async (req, res) => {
  const boardId = req.params.boardId;
  const queryResult = await queryDb("delete from boards where id = $1;", [
    boardId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});

// boards/{board_id}/columns -> we don't have /columns b/c columns are always inside of boards and this structure is more intuitive to describe that relationship
// GET - read all columns in a board board
app.get("/boards/:boardId/columns", async (req, res) => {
  const boardId = req.params.boardId;
  const queryResult = await queryDb(
    "select * from columns where board_id = $1;",
    [boardId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// POST - create a column in a board
app.post("/boards/:boardId/columns", async (req, res) => {
  const boardId = req.params.boardId;
  const columnData = req.body;
  const queryResult = await queryDb(
    "insert into columns (name, position, board_id) values ($1, $2, $3) returning *;", // this format is neater than string templating (query could get long)
    [columnData.name, columnData.position, boardId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// boards/{board_id}/columns/{column_id}
// GET - read an individual column
app.get("/boards/:boardId/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const queryResult = await queryDb("select * from columns where id = $1;", [
    columnId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// PUT
app.put("/boards/:boardId/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const updatedData = req.body;
  try {
    // Perform the SQL update operation
    const updateQuery = `
          UPDATE columns
          SET name = $1,
            position = $2,
            board_id = $3
          WHERE id = $4
          RETURNING *
      `;
    const updateValues = [
      updatedData.name,
      updatedData.position,
      updatedData.boardId,
      columnId,
    ];
    const queryResult = await pool.query(updateQuery, updateValues);
    res.status(200).json(queryResult);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// PATCH
app.patch("/boards/:boardId/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const updatedFields = req.body;
  try {
    // Generate the SET clause dynamically based on updatedFields
    const setClause = Object.keys(updatedFields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    // Perform the SQL update operation
    const updateQuery = `
        UPDATE columns
        SET ${setClause}
        WHERE id = $${Object.keys(updatedFields).length + 1}
        RETURNING *
    `;
    const updateValues = Object.values(updatedFields).concat(columnId);
    const queryResponse = await pool.query(updateQuery, updateValues);
    res.json(queryResponse);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// DELETE
app.delete("/boards/:boardId/columns/:columnId", async (req, res) => {
  const columnId = req.params.columnId;
  const queryResult = await queryDb("delete from columns where id = $1;", [
    columnId,
  ]);
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});

// /boards/{boardId}/columns/{column_id}/tasks (gets all tasks for column)
// read - GET
app.get("/boards/:boardId/columns/:columnId/tasks", async (req, res) => {
  const columnId = req.params.columnId;
  const queryResult = await queryDb(
    "select * from tasks where column_id = $1;",
    [columnId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
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
      dataFromRequest.columnId,
      dataFromRequest.parentId,
    ]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});

// tasks/{task_id} (individual task) <-- not /boards/{boardId}/columns/{column_id}/tasks/{task_id} b/c tasks can be moved between boards
// read - GET (need to get subtasks as well)
app.get("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const queryResult = await queryDb(
    "select * from tasks where Id = $1 or parent_id = $1",
    [taskId]
  );
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(queryResult);
});
// PUT
app.put("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const updatedData = req.body;
  try {
    // Perform the SQL update operation
    const updateQuery = `
          UPDATE tasks
          SET title = $1,
            description = $2,
            column_id = $3,
            parent_id = $4
          WHERE id = $5
          RETURNING *
      `;
    const updateValues = [
      updatedData.title,
      updatedData.description,
      updatedData.columnId,
      updatedData.parentId,
      taskId,
    ];
    const queryResult = await pool.query(updateQuery, updateValues);
    res.status(200).json(queryResult);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// PATCH
app.patch("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const updatedFields = req.body;
  try {
    // Generate the SET clause dynamically based on updatedFields
    const setClause = Object.keys(updatedFields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    // Perform the SQL update operation
    const updateQuery = `
        UPDATE tasks
        SET ${setClause}
        WHERE id = $${Object.keys(updatedFields).length + 1}
        RETURNING *
    `;
    const updateValues = Object.values(updatedFields).concat(taskId);
    const queryResponse = await pool.query(updateQuery, updateValues);
    res.json(queryResponse);
  } catch (error) {
    console.error("Error updating resource:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
// DELETE
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const queryResult = await queryDb("delete from tasks where id = $1;", [
    taskId,
  ]);
  res.setHeader("Content-Type", "application/json");
  rres.status(200).json(queryResult);
});

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
