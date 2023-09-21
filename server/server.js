/* eslint-disable no-undef*/
// import http from "http";
import express from "express";
import pg from "pg";
import "dotenv/config";

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
  res.statusCode = 200;
  res.send(
    JSON.stringify({
      message: "You've hit the API!",
    })
  );
});

app.listen(port, () => {
  console.log(`listening for requests on port ${port}`);
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

//   // console.log(req.url);
//   // let urlSegments = req.url.split("/");
//   // console.log(urlSegments);

//   // let boardId = urlSegments[2]

//   if (req.url === "/") {
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
//     res.write(
//       JSON.stringify({
//         message: "You've hit the API!",
//       })
//     );
//   }

//   // GET (read), POST (create), PUT (update), PATCH (update), DELETE (delete)

//   // home screen (data we want at very beginning of our app)
//   // - GET: get all the board names, and all the columns and tasks for the first board in the list of boards

//   // entire board (data we want when we click a different board than the default (first board))
//   // - GET: get all the columns and tasks within those columns for a specific board

//   // /boards
//   // - GET: get list of all boards
//   else if (req.url === "/boards" && req.method === "GET") {
//     let data = await queryDb("select * from boards;");
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
//     res.write(JSON.stringify(data));
//   }
//   // - GET: get info for a specific board
//   // - POST: create new board
//   // - PUT & PATCH: edit existing board (change name)
//   // - DELETE: delete board

//   // columns
//   // - GET: get all columns
//   else if (req.url === "/columns") {
//     // localhost:5030/boards/2/columns
//     // ...
//   }
//   // - GET: get all columns for a board
//   else if (req.url === "/boards/:boardId/columns") {
//     // localhost:5030/boards/2/columns
//     // ...
//   }
//   // - GET: get info for a specific column
//   else if (req.url === "/boards/:boardId/columns/:columndId") {
//     // localhost:5030/boards/2/columns
//     // ...
//   }
//   // - POST: create new column
//   // - PUT & PATCH: edit existing column (change name or position)
//   // - DELETE: delete a column

//   // tasks
//   // - GET: get all tasks
//   // - GET: get all tasks for a specific column
//   // - GET: get info for a specific task
//   // - POST: create new task
//   // - PUT & PATCH: edit existing task (change title, description, column_id, or parent_id)
//   // - DELETE: delete task
//   else if (req.url === "/boards" && req.method === "POST") {
//     // create new board w/ sql by parsing the data sent from the frontend and doing an sql query "insert into ..."
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
//   console.log("listening for requests on port 5030");
// });
