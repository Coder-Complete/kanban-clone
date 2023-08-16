/* eslint-disable no-undef*/
import http from "http";
import pg from "pg";
import "dotenv/config";

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

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "https://kanban-clone-frontend.onrender.com",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  if (req.url === "/") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(
      JSON.stringify({
        name: "jared",
        age: 30,
      })
    );
  } else if (req.url === "/boards") {
    let data = await queryDb("select * from boards;");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(JSON.stringify(data));
  } else if (req.url === "/user/1") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(
      JSON.stringify({
        name: "jared",
        age: 30,
      })
    );
  } else if (req.url === "/group/1") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(
      JSON.stringify({
        name: "friends",
        members: 100,
      })
    );
  } else {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 404;
    JSON.stringify({
      error: true,
      message: "endpoint doesn't exist",
    });
  }
  res.end();
});

server.listen(5030, () => {
  console.log(
    "listening for requests on port 5030, url is http://127.0.0.1:5030"
  );
});
