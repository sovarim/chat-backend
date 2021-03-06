const express = require("express");
const { createServer } = require("http");
const { Server } = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./src/routes/user");
const message = require("./src/routes/message");
const chat = require("./src/routes/chat");
const { socket } = require("./src/controllers/MessageController");
const checkAuth = require("./src/middlewares/checkAuth");
require("dotenv").config();

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(checkAuth);
app.use(bodyParser.json());
app.use("/user", user);
app.use("/message", message);
app.use("/chat", chat);

const server = createServer(app);
const wss = new Server({ server });
wss.on("connection", (ws) => {
  ws.on("error", (e) => ws.send(e));
  ws.on("message", (m) => {
    socket(JSON.parse(m), ws);
  });
  ws.send(JSON.stringify({ message: "Ok" }));
});

server.listen(process.env.PORT || 8888, () => {
  console.log(` URL: http://localhost:${process.env.PORT || 8888}/`);
});
