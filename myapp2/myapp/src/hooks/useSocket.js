import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_URL } from '../config';

const SOCKET_URL = `${BACKEND_URL}/ws-parking`;

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef({});

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            debug: (str) => {
                console.log('📡 STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('✅ Connected to real-time server (STOMP)');
            setIsConnected(true);
        };

        client.onStompError = (frame) => {
            console.error('❌ STOMP Error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
            setIsConnected(false);
        };

        client.onWebSocketClose = () => {
            console.log('❌ WebSocket connection closed');
            setIsConnected(false);
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    // Subscribe to slot updates
    const onSlotUpdate = (callback) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            if (!subscriptionsRef.current.slotUpdate) {
                subscriptionsRef.current.slotUpdate = stompClientRef.current.subscribe('/topic/slots', (message) => {
                    const data = JSON.parse(message.body);
                    console.log('🔄 Slot updated:', data.slotNumber);
                    setLastUpdate(data);
                    callback(data);
                });
            }
        } else if (stompClientRef.current) {
            // Retry after delay if not connected yet
            setTimeout(() => onSlotUpdate(callback), 1000);
        }
    };

    // Subscribe to alerts
    const onAlertCreated = (callback) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            if (!subscriptionsRef.current.alerts) {
                subscriptionsRef.current.alerts = stompClientRef.current.subscribe('/topic/alerts', (message) => {
                    const data = JSON.parse(message.body);
                    console.log('⚠️ Alert received:', data.type);
                    callback(data);
                });
            }
        } else if (stompClientRef.current) {
            setTimeout(() => onAlertCreated(callback), 1000);
        }
    };

    return {
        isConnected,
        lastUpdate,
        onSlotUpdate,
        onAlertCreated,
        socket: stompClientRef.current,
    };
};
