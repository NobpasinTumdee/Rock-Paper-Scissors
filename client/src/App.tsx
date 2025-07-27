import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('ws://localhost:3000');

function App() {
  const [messages, setMessages] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('chat', (payload) => {
      console.log('message', payload);
    });

    return () => {
      socket.off('chat');
    };
  }, [])

  const sendMessage = () => {
    if (messages.trim()) {
      socket.emit('chat', messages);
    }
  };

  return (
    <>
      <h1>App</h1>
      <form action={sendMessage}>
        <input type="text" onChange={(e) => setMessages(e.target.value)} />
        <button>Send</button>
      </form>
    </>
  )
}

export default App
