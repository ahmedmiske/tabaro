import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token'), // Set token after login
  },
});
socket.on('connectedToRoom', (roomId) => {
  console.log(`✅ تم الانضمام إلى الغرفة: ${roomId}`);
});

export default socket;