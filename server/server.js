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

async function queryDb(query) {
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

const port = 5030;
const app = express();

// app.use(express.json()); <-- let's wait til we see when we need this one (i've only done gets so far with no arguments in the request)

// do i need cors? <-- wait to see if i need it. by default app.us(cors()) will allow all origins, but can configure to specify origins

app.get("/", (req, res) => {
  res.send("You've hit the API!");
});

//     home-screen (gets all data for home screen: 1. list of boards, 2. all columns and tasks for the first board)
//       - read - GET
//     entire-board/{board_id} (all info for board including columns and tasks)
//       - read - GET
//     boards (gets all the boards)
//       - read - GET
app.get("/boards", async (req, res) => {
  let data = await queryDb("select * from boards;");
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.send(JSON.stringify(data));
});
//     boards/{board_id} (individual board)
//       - create - POST
//       - read - GET
//       - update - POST
//       - delete - POST
//     boards/{board_id}/columns (gets all columns for board)
//       - read - GET
//     columns/{column_id} (individual column)
//       - create - POST
//       - read - GET
//       - update - POST
//       - delete - POST
//     columns/{column_id}/tasks (gets all tasks for column)
//       - read - GET
//     tasks/{task_id} (individual task)
//       - create - POST
//       - read - GET (need to get subtasks as well)
//       - update - POST
//       - delete - POST
//
app.get("/", (req, res) => {
  res.send("You've hit the API!");
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
