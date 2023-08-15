/* eslint-disable no-undef, no-unused-vars */

import pg from "pg";
// import "dotenv/config";

// Replace these with your actual PostgreSQL database credentials
// const dbConfig = {
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDB,
//   password: process.env.PGPWD,
//   port: process.env.PGPORT,
// };

const dbConfig = {
  connectionString:
    "postgres://admin:sOdTEpXhj9zKtcFc5EYdrWAB9fc2KsWz@dpg-cisl9l95rnujejq1v7gg-a.oregon-postgres.render.com/kanban_clone?ssl=true",
};

// Sample data to be inserted
const boardData = [
  { id: 1, name: "project", created_date: Date.now() },
  { id: 2, name: "project two", created_date: Date.now() },
];
const columnData = [
  { id: 1, name: "To Do", position: 1, board_id: 1 },
  { id: 2, name: "In Progress", position: 2, board_id: 1 },
  { id: 3, name: "Done", position: 3, board_id: 1 },
  { id: 4, name: "To Do", position: 1, board_id: 2 },
];
const taskData = [
  {
    id: 1,
    title: "do something",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti dolore aliquid facere explicabo repudiandae veniam iste dolorum laboriosam impedit, eaque adipisci consequuntur animi incidunt veritatis, repellat repellendus commodi quia similique!",
    created_date: Date.now(),
    column_id: 1,
  },
  {
    id: 2,
    title: "cool feature",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti dolore aliquid facere explicabo repudiandae veniam iste dolorum laboriosam impedit, eaque adipisci consequuntur animi incidunt veritatis, repellat repellendus commodi quia similique!",
    created_date: Date.now(),
    column_id: 2,
  },
  {
    id: 3,
    title: "subtask",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti dolore aliquid facere explicabo repudiandae veniam iste dolorum laboriosam impedit, eaque adipisci consequuntur animi incidunt veritatis, repellat repellendus commodi quia similique!",
    created_date: Date.now(),
    column_id: 2,
    parent_id: 2,
  },
];

async function populateDatabase() {
  const pool = new pg.Pool(dbConfig);

  try {
    await pool.connect();

    // Drop tables
    await pool.query(`
      DROP TABLE IF EXISTS tasks;
    `);
    await pool.query(`
      DROP TABLE IF EXISTS columns;
    `);
    await pool.query(`
      DROP TABLE IF EXISTS boards;
    `);

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        position INTEGER NOT NULL,
        board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE DEFAULT NULL
      )
    `);

    /*
      TODO:
        Frontend should make sure user knows that if they delete a column, it will delete all the tasks in that column too.
        So advise user to drag the tasks into different columns first, before deleting that column.
    */

    for (const board of boardData) {
      await pool.query(
        `
          INSERT INTO boards (name)
          VALUES ($1)
        `,
        [board.name]
      );
    }

    for (const column of columnData) {
      await pool.query(
        `
          INSERT INTO columns (name, position, board_id)
          VALUES ($1, $2, $3)
        `,
        [column.name, column.position, column.board_id]
      );
    }

    for (const task of taskData) {
      await pool.query(
        `
          INSERT INTO tasks (title, description, column_id, parent_id)
          VALUES ($1, $2, $3, $4)
        `,
        [task.title, task.description, task.column_id, task.parent_id]
      );
    }

    console.log("Sample data inserted successfully!");
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    pool.end();
  }
}

populateDatabase();
