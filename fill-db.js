/* eslint-disable no-undef, no-unsafe-finally */
import pg from "pg";
import "dotenv/config"; // uncomment if want to use local postgres

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

// Sample data to be inserted
const sampleBoardData = [{ name: "Project 1" }, { name: "Project 2" }];

const sampleColumnData = [
  { name: "To Do", position: 0, board_id: 1 },
  { name: "In Progress", position: 1, board_id: 1 },
  { name: "Done", position: 2, board_id: 1 },
];

const sampleTaskData = [
  {
    id: 1,
    title: "Research new technology",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cum voluptas fugiat similique odit, iste accusamus alias eveniet perspiciatis? Consequuntur delectus laboriosam aut accusantium id error quibusdam ratione, quasi voluptatibus excepturi.",
    column_id: 1,
    parent_id: null,
  },
  {
    id: 2,
    title: "Bigger task",
    description: "lorem ipsum dolor sit amet consectetur adipis",
    column_id: 2,
    parent_id: null,
  },
  {
    id: 3,
    title: "Subtask",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus nihil voluptatem quia velit laborum, provident suscipit id eveniet sint a recusandae magni praesentium beatae aliquid! Qui optio nulla eos commodi.",
    column_id: 2,
    parent_id: 2,
  },
  {
    id: 4,
    title: "Build an easy feature",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed blanditiis minima totam praesentium animi, iure veritatis cum velit sit eaque, labore cumque dolore, aliquid accusantium eos! Earum soluta odit consequatur.",
    column_id: 3,
    parent_id: null,
  },
];

async function populateDatabase() {
  const pool = new pg.Pool(dbConfig);

  try {
    await pool.connect();

    // delete the existing table
    await pool.query(`DROP TABLE IF EXISTS tasks`);
    await pool.query(`DROP TABLE IF EXISTS columns`);
    await pool.query(`DROP TABLE IF EXISTS boards`);

    // // Create a table (if not exists) to store the data
    await pool.query(
      `CREATE TABLE IF NOT EXISTS boards (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
    );
    await pool.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position INT NOT NULL,
        board_id INTEGER REFERENCES boards(id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        column_id INTEGER REFERENCES columns(id),
        parent_id INTEGER REFERENCES tasks(id)
      )
    `);

    // Insert sample data into the table
    for (const data of sampleBoardData) {
      await pool.query(
        `
        INSERT INTO boards (name)
        VALUES ($1)
      `,
        [data.name]
      );
    }

    for (const data of sampleColumnData) {
      await pool.query(
        `
        INSERT INTO columns (name, position, board_id)
        VALUES ($1, $2, $3)
      `,
        [data.name, data.position, data.board_id]
      );
    }

    // todo: need to add id (for parent_id to work)
    for (const data of sampleTaskData) {
      await pool.query(
        `
        INSERT INTO tasks (id, title, description, column_id, parent_id)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [data.id, data.title, data.description, data.column_id, data.parent_id]
      );
    }

    console.log("Sample data inserted successfully!");
    return;
  } catch (error) {
    console.error("Error occurred:", error);
    return;
  } finally {
    pool.end();
  }
}

populateDatabase();
