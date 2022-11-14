const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(401).send({ error: "User not found" });
  }

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).send({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  response.status(200).send(user);
});

app.get("/users", (request, response) => {
  response.status(200).send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  response.status(200).send(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user.todos.push(todo);

  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const task = request.user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).send({ error: "Todo not found" });
  }

  task.title = title;
  task.deadline = new Date(deadline);

  response.status(200).send(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const task = request.user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).send({ error: "Todo not found" });
  }

  task.done = true;

  response.status(200).send(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const task = request.user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).send({ error: "Todo not found" });
  }

  request.user.todos = request.user.todos.filter((todo) => todo.id !== id);

  response.status(204).send(request.user.todos);
});

module.exports = app;
