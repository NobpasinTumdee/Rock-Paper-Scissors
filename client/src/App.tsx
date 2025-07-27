import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('ws://localhost:3000'); // เชื่อมกับ backend websocket

interface GameResult {
  myChoice: string;
  opponentChoice: string;
  winnerText: string;
}

function App() {
  const [status, setStatus] = useState('กำลังเชื่อมต่อ...');
  const [result, setResult] = useState<GameResult | null>(null);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    socket.on('connect', () => {
      setStatus('เชื่อมต่อแล้ว รอผู้เล่น...');
    });

    socket.on('waiting', (msg: string) => {
      setStatus(msg);
    });

    socket.on('start', (msg: string) => {
      setStatus(msg);
      setResult(null); // reset ผลลัพธ์เมื่อเริ่มเกมใหม่
    });

    socket.on('result', (data: { choices: Record<string, string>; winner: string }) => {
      const myId = socket.id!;
      const myChoice = data.choices[myId];
      const opponentId = Object.keys(data.choices).find((id) => id !== myId) || '';
      const opponentChoice = data.choices[opponentId];

      const winnerText =
        data.winner === 'draw'
          ? 'เสมอกัน!'
          : data.winner === myId
          ? 'คุณชนะ!'
          : 'คุณแพ้ 😢';

      setResult({
        myChoice,
        opponentChoice,
        winnerText,
      });

      setStatus('เลือกรอบใหม่เพื่อเล่นอีกครั้ง');
    });

    return () => {
      socket.off('waiting');
      socket.off('start');
      socket.off('result');
    };
  }, []);

  const sendChoice = (choice: string) => {
    setSelected(choice);
    socket.emit('choice', choice);
    setStatus('รอผู้เล่นอีกคนเลือก...');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>เกมเป่ายิ้งฉุบ 🪨📄✂️</h1>
      <p>{status}</p>
      {/* <p>{selected}</p> */}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => sendChoice('rock')}>✊ ค้อน</button>{' '}
        <button onClick={() => sendChoice('paper')}>✋ กระดาษ</button>{' '}
        <button onClick={() => sendChoice('scissors')}>✌️ กรรไกร</button>
      </div>

      {result && (
        <div>
          <p>คุณเลือก: <strong>{result.myChoice}</strong></p>
          <p>อีกฝ่ายเลือก: <strong>{result.opponentChoice}</strong></p>
          <h2>{result.winnerText}</h2>
        </div>
      )}
    </div>
  );
}

export default App;
