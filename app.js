const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const connectingDbAndServer = async (req, res) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (error) {
    console.log(error);
  }
};

connectingDbAndServer();

app.get("/todos/", async (req, res) => {
  const { search_q = "", priority, status } = req.query;
  let sqlQuery = `select * from todo where todo like "%${search_q}%"`;
  if (priority !== undefined && status !== undefined) {
    sqlQuery += `and status="${status}" and priority="${priority}"`;
  } else if (priority !== undefined) {
    sqlQuery += `and priority="${priority}"`;
  } else if (status !== undefined) {
    sqlQuery += `and status="${status}"`;
  }
  const result = await db.all(sqlQuery);
  res.send(result);
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const sqlQuery = `select * from todo where id=${todoId}`;
  const result = await db.get(sqlQuery);
  res.send(result);
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;

  const sqlQuery = `insert into todo (id,todo,priority,status)
  values (${id},"${todo}","${priority}","${status}");`;
  const result = await db.run(sqlQuery);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const { status, priority, todo } = req.body;
  const { todoId } = req.params;
  let query = "";
  const sqlQueryForId = `select * from todo ${query} where id=${todoId}`;
  if (status !== undefined && priority !== undefined && todo !== undefined) {
    query = `set status="${status}",
      priority="${priority}",
      todo="${todo}"`;
    await db.run(sqlQueryForId);
  } else {
    if (status !== undefined) {
      query = `set status="${status}"`;
      await db.run(sqlQueryForId);
      res.send("Status Updated");
    }
    if (priority !== undefined) {
      query = `set priority="${priority}"`;
      await db.run(sqlQueryForId);
      res.send("Priority Updated");
    }
    if (todo !== undefined) {
      query = `set todo="${todo}"`;
      await db.run(sqlQueryForId);
      res.send("Todo Updated");
    }
  }
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const sqlQuery = `delete from todo where id=${todoId}`;
  const result = await db.run(sqlQuery);
  res.send("Todo Deleted");
});

module.exports = app;
