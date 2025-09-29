import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentApp } from '../components/context/app.context';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useCurrentApp();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    if (!user || socketRef.current) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('access_token'),
        userId: user.id
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return {
    socket,
    isConnected,
    connect,
    disconnect
  };
};
