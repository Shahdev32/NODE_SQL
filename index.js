//npm install express @faker-js/faker mysql2 method-override uuid ejs

const express = require("express");
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let getUser = () => {
  return [
    faker.datatype.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "delta_app",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
});

app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) AS count FROM user`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error occurred");
    }
    let count = result[0].count;
    res.render("home.ejs", { count });
  });
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error occurred");
    }
    res.render("users.ejs", { data: result });
  });
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error with DB");
    }
    res.render("edit.ejs", { user: result[0] });
  });
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username, password } = req.body;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error with DB");
    }
    let user = result[0];
    if (user.password !== password) {
      return res.send("WRONG Password entered!");
    }
    let q2 = `UPDATE user SET username = ? WHERE id = ?`;
    connection.query(q2, [username, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Some error with DB");
      }
      res.redirect("/user");
    });
  });
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
  connection.query(q, [id, username, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error occurred");
    }
    res.redirect("/user");
  });
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error with DB");
    }
    res.render("delete.ejs", { user: result[0] });
  });
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Some error with DB");
    }
    let user = result[0];
    if (user.password !== password) {
      return res.send("WRONG Password entered!");
    }
    let q2 = `DELETE FROM user WHERE id = ?`;
    connection.query(q2, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Some error with DB");
      }
      res.redirect("/user");
    });
  });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
