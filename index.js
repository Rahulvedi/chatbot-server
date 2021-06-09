const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const router = require('./router')
const cors=require('cors')
const Port = process.env.PORT|| 3001
const origin=process.env.ORIGIN  || 'localhost:3000'
const { addUser, removeUser, getUser, getUserInRoom } = require('./user.js')


const app = express();
app.use(router);
app.use(cors())
const server = http.createServer(app)


server.listen(Port, () => {
  console.log('connected to server')
})

const io = socketio(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})



io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room })
    if (error) return callback(error);

    // admin genrated messages


    socket.emit('message', { user: 'admin', text: `${user.name} Welcome to the room ${user.room}` })


    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })
    socket.join(user.room)
    callback();
  })

  // user genrated messages


  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    callback();

  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
      // io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room)});
    }
  })
})