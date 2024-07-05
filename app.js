import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
const app = express();
const port = 8000;
const server = createServer(app);
let users = {};
const messageshistory = [];
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("HEllo world");
});

io.on("connection", (socket) => {
  socket.on("username", (m) => {
    if (!nameTaken(m.userName)) {
      users[socket.id] = m;
      socket.emit("approved username");
    } else {
      socket.emit("duplicate username", m);
    }
  });

  socket.on("message", ({ message, room, user }) => {
    console.log("heloooo", { message, room, user });
    messageshistory.push({ nmessages: message, ruser: user, myroom:room });

    if (room) {
      const x = messageshistory.length;
      io.to(room).emit("receive-message", { message, user, messageshistory });
    } else {
      io.emit("receive-message", message);
    }
  });
  socket.on("join-room", (room) => {
    socket.join(room);
    socket.emit("history", messageshistory);
    console.log(`user joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

function nameTaken(userName) {
  for (const socketid in users) {
    if (users[socketid].userName === userName) {
      return true;
    }
  }

  return false;
}

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
