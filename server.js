const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
//const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Chat-App";
/*const storage = multer.diskStorage({
    destination: './public/uploads/', // Define the destination folder for uploaded images
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({
    storage: storage,
});*/
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const messageSchema = new mongoose.Schema({
    author: String,
    content: String,
    image: String
});

const Message = mongoose.model('Message', messageSchema)

//Set static folder
app.use(express.static(path.join(__dirname,'public')));

// Create an endpoint for handling image uploads
/*app.post('/upload', upload.single('image'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.json({ success: false, message: 'No file uploaded' });
    }

    // Get the path of the uploaded image
    const imagePath = req.file.path;

    // Send the image file as a response
    res.sendFile(imagePath, { root: __dirname });
});*/

const botName = 'ChatCord Bot';

//Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome new user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        //Broadcast when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send users andd room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        };

        //Send users andd room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

