import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../store/AuthContext';
import { BACKEND_URL } from '../services/api';

export const useSocket = (auctionId?: string) => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestBid, setLatestBid] = useState<{
    bidId: string;
    bidderName: string;
    amount: number;
    timestamp: string;
  } | null>(null);
  const [statusChange, setStatusChange] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const socketUrl = BACKEND_URL || window.location.origin;

    // Establish WebSocket connection, attaching the JWT in the query handshake
    const socket = io(socketUrl, {
      query: accessToken ? { token: accessToken } : {},
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (auctionId) {
        socket.emit('join_auction', auctionId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen to real-time bid updates
    socket.on('bid_update', (data: any) => {
      if (data.auctionId === auctionId) {
        setLatestBid({
          bidId: data.bidId,
          bidderName: data.bidderName,
          amount: data.amount,
          timestamp: data.timestamp
        });
      }
    });

    // Listen to live status changes
    socket.on('auction_status_change', (data: any) => {
      if (data.auctionId === auctionId) {
        setStatusChange(data.status);
      }
    });

    // Handle incoming validation errors
    socket.on('bid_error', (data: { message: string }) => {
      setErrorMsg(data.message);
      // Automatically clear error after 4 seconds
      setTimeout(() => setErrorMsg(null), 4000);
    });

    return () => {
      if (auctionId) {
        socket.emit('leave_auction', auctionId);
      }
      socket.disconnect();
    };
  }, [auctionId, accessToken]);

  const placeBid = (amount: number) => {
    if (socketRef.current && isConnected && auctionId) {
      socketRef.current.emit('place_bid', { auctionId, amount });
    }
  };

  return { isConnected, latestBid, statusChange, errorMsg, placeBid };
};
