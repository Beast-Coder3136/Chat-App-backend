import express from 'express'
import dotenv from 'dotenv'
import { connectDb } from './lib/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoute from './routes/userRoute.js'
import chatRoute from './routes/chatRoute.js'
import messageRoute from './routes/messageRoute.js'
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config({});

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "https://chat-app-frontend-pink-beta.vercel.app",
  credentials: true
}))
app.use(cookieParser());


app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

app.use(notFound);
app.use(errorHandler);

const server = createServer(app);

// Sockets 
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  }
})
// On connecting to client we get a socket 
// This socket is used to transmit content  

const onlineUser = new Map();

io.on("connection", (socket) => {
  console.log("Client is now connected");
  // here we are creating a new Socket with name 'setup' through this socket we will take data from frontend
  // On the frontend side we will emit the socket with name 'setup'
  socket.on("setup", (userData) => {
    socket.join(userData._id) // this join function will create a room in we multiple client can connect
    onlineUser.set(userData._id, socket.id)
    socket.emit("connected");   //this emit function is like a call to , server is calling the frontend and
    io.emit("online-users", Array.from(onlineUser.keys()))
  })
  // here room is just a chat._id
  socket.on("join-chat", (room) => {
    socket.join(room);
  })
  socket.on("new-message", (newMessageRecieved) => {
    let { chat } = newMessageRecieved;
    if (!chat.users) return

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) {
        return;
      }
      socket.in(user._id).emit("message-recieved", newMessageRecieved);
    }
    )
  })

  socket.on("typing", (room) => {
    socket.in(room).emit("typing")
  })
  socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUser) {
      if (socketId === socket.id) {
        onlineUser.delete(userId)
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUser.keys()))
  })
})

const port = process.env.PORT;
server.listen(port, () => {
  connectDb();
  console.log("Server is running on port: 5001");
})
