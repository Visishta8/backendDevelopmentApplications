const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const fileInput = document.getElementById('fileInput');
const sendButton = document.querySelector('.btn'); 

//Get username and room name from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join chatroom
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Auto-scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


//Message submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Message text with id msg
    const msg = e.target.elements.msg.value;

    //Emit msg as payload to server
    socket.emit('chatMessage', msg);

    //Clear input after sending msg
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Add room-name to DOM 
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML=`
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
/*
function handleFileUpload(input) {
    const file = input.files[0];

    if (file) {
        // Create a FormData object to send the file to the server
        const formData = new FormData();
        formData.append('image', file);

        // Send the FormData object to the server as a POST request
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const imageUrl = data.imageUrl;
                    // Display the image in the chat
                    displayImageInChat(imageUrl);
                    // Emit the image URL as a chatMessage
                    socket.emit('chatMessage', imageUrl);
                } else {
                    console.error('Image upload failed');
                }
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
            });
    }
}

function displayImageInChat(imageUrl) {
    const div = document.createElement('div');
    div.classList.add('message');

    const img = document.createElement('img');
    img.classList.add('image-message')
    img.src = imageUrl;
    img.alt = 'Image';
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="image">
        <Image src="img.src"/>
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}*/