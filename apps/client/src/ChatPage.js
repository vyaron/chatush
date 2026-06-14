import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, MoreVertical, Paperclip, Phone, Plus, SendHorizontal, Smile, Video } from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
const ROOM_LIST = ['general', 'random', 'support'];
const NICKNAME_KEY = 'nickname';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const DESIGN_THREAD = [
    { id: 'd1', text: 'Good morning!', timeLabel: '10:10', isMine: true },
    { id: 'd2', text: 'Japan looks amazing!', timeLabel: '10:10', isMine: true },
    { id: 'd3', text: 'I will write from Japan', timeLabel: '17:47', isMine: true },
    { id: 'd4', text: 'Good bye!', timeLabel: '17:47', isMine: true },
    {
        id: 'd5',
        timeLabel: '10:15',
        isMine: true,
        fileName: 'IMG_0481',
        fileType: 'png',
        fileSize: '2.8 MB'
    },
    {
        id: 'd6',
        timeLabel: '10:15',
        isMine: true,
        fileName: 'IMG_0475',
        fileType: 'png',
        fileSize: '2.4 MB'
    },
    {
        id: 'd7',
        timeLabel: '11:51',
        isMine: true,
        fileName: 'IMG_0484',
        fileType: 'png',
        fileSize: '2.6 MB'
    },
    {
        id: 'd8',
        timeLabel: '11:51',
        isMine: true,
        fileName: 'IMG_0483',
        fileType: 'png',
        fileSize: '2.8 MB'
    },
    { id: 'd9', text: 'Do you know what time is it?', timeLabel: '11:40', isMine: false },
    { id: 'd10', text: 'What is the most popular meal in Japan?', timeLabel: '11:45', isMine: false },
    { id: 'd11', text: 'It’s morning in Tokyo 😎', timeLabel: '11:43', isMine: true },
    { id: 'd12', text: 'I think top two are:', timeLabel: '11:50', isMine: true },
    { id: 'd13', text: 'Do you like it?', timeLabel: '11:45', isMine: false }
];
let socketRef = null;
export function ChatPage() {
    const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) ?? '');
    const [draftNickname, setDraftNickname] = useState('');
    const [activeRoom, setActiveRoom] = useState(ROOM_LIST[0]);
    const [messageList, setMessageList] = useState([]);
    const [draftMessage, setDraftMessage] = useState('');
    const isReady = nickname.trim().length >= 2;
    useEffect(() => {
        if (!isReady) {
            return;
        }
        const socket = io(API_URL, { transports: ['websocket'] });
        socketRef = socket;
        socket.on('connect', () => {
            socket.emit('room:join', { room: activeRoom, nickname });
        });
        socket.on('message:new', payload => {
            const incoming = payload;
            setMessageList(current => {
                if (current.some(message => message.id === incoming.id)) {
                    return current;
                }
                return [...current, incoming];
            });
        });
        socket.on('room:user-joined', payload => {
            const { nickname: who, room } = payload;
            if (room === activeRoom) {
                toast.success(`${who} joined #${room}`);
            }
        });
        socket.on('error:event', payload => {
            const body = payload;
            toast.error(body.message);
        });
        return () => {
            socket.disconnect();
            socketRef = null;
        };
    }, [activeRoom, isReady, nickname]);
    useEffect(() => {
        if (!isReady) {
            return;
        }
        fetch(`${API_URL}/api/room/${encodeURIComponent(activeRoom)}/message`)
            .then(async (response) => {
            if (!response.ok) {
                throw new Error('Failed to load room history');
            }
            const payload = (await response.json());
            setMessageList(payload.messageList);
        })
            .catch(() => {
            toast.error('Could not load room history');
        });
    }, [activeRoom, isReady, nickname]);
    const liveThread = useMemo(() => messageList.map(message => ({
        id: message.id,
        text: `${message.nickname}: ${message.text}`,
        isMine: message.nickname === nickname,
        timeLabel: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })), [messageList, nickname]);
    const timeline = useMemo(() => (activeRoom === ROOM_LIST[0] ? [...DESIGN_THREAD, ...liveThread] : liveThread), [activeRoom, liveThread]);
    function onSaveNickname(event) {
        event.preventDefault();
        const nextNickname = draftNickname.trim();
        if (nextNickname.length < 2) {
            toast.error('Nickname must be at least 2 characters');
            return;
        }
        localStorage.setItem(NICKNAME_KEY, nextNickname);
        setNickname(nextNickname);
        setDraftNickname('');
    }
    function onSendMessage(event) {
        event.preventDefault();
        const nextMessage = draftMessage.trim();
        if (!nextMessage) {
            return;
        }
        socketRef?.emit('message:send', {
            room: activeRoom,
            nickname,
            text: nextMessage
        });
        setDraftMessage('');
    }
    if (!isReady) {
        return (_jsx("main", { className: 'app-shell', children: _jsxs("section", { className: 'card nickname-card whatsapp-login', children: [_jsx("p", { className: 'eyebrow', children: "Live chat setup" }), _jsx("h1", { children: "Welcome to WhatsAppUI" }), _jsx("p", { children: "Choose a nickname to join room conversations in real time." }), _jsxs("form", { onSubmit: onSaveNickname, className: 'row', children: [_jsx("input", { value: draftNickname, onChange: event => setDraftNickname(event.target.value), placeholder: 'Type your nickname', "aria-label": 'Nickname' }), _jsx("button", { type: 'submit', children: "Continue" })] })] }) }));
    }
    return (_jsx("main", { className: 'app-shell', children: _jsxs("section", { className: 'card phone-shell', children: [_jsxs("header", { className: 'status-bar', children: [_jsx("span", { children: "9:41" }), _jsxs("div", { className: 'status-icons', children: [_jsxs("span", { className: 'signal-bars', "aria-hidden": 'true', children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }), _jsx("span", { className: 'wifi-glyph', "aria-hidden": 'true' }), _jsx("span", { className: 'battery-glyph', "aria-hidden": 'true', children: _jsx("span", { className: 'battery-level' }) })] })] }), _jsxs("header", { className: 'contact-bar', children: [_jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Back', children: _jsx(ArrowLeft, { size: 17 }) }), _jsx("img", { src: '/figma/martha-avatar.png', alt: 'Martha Craig', className: 'contact-avatar' }), _jsxs("div", { className: 'contact-meta', children: [_jsx("h1", { children: "Martha Craig" }), _jsxs("p", { children: ["#", activeRoom, " \u00B7 tap here for contact info"] })] }), _jsxs("div", { className: 'contact-actions', children: [_jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Video call', children: _jsx(Video, { size: 17 }) }), _jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Call', children: _jsx(Phone, { size: 17 }) }), _jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'More options', children: _jsx(MoreVertical, { size: 17 }) })] })] }), _jsx("nav", { className: 'room-strip', "aria-label": 'Chat rooms', children: ROOM_LIST.map(room => (_jsxs("button", { type: 'button', className: room === activeRoom ? 'room-chip active' : 'room-chip', onClick: () => setActiveRoom(room), children: ["#", room] }, room))) }), _jsxs("section", { className: 'thread', children: [_jsx("div", { className: 'date-pill', children: "Fri, Jul 26" }), timeline.map(message => (_jsxs("article", { className: message.isMine ? 'bubble mine' : 'bubble', children: [message.text && _jsx("p", { children: message.text }), message.fileName && (_jsxs("div", { className: 'file-card', children: [_jsx("div", { className: 'file-icon', children: "DOC" }), _jsx("strong", { children: message.fileName }), _jsxs("small", { children: [message.fileType, " \u2022 ", message.fileSize] })] })), _jsxs("footer", { children: [_jsx("time", { children: message.timeLabel }), message.isMine && _jsx("span", { className: 'tick', children: "\u2713\u2713" })] })] }, message.id)))] }), _jsxs("form", { onSubmit: onSendMessage, className: 'composer', children: [_jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'More', children: _jsx(Plus, { size: 16 }) }), _jsxs("div", { className: 'compose-input', children: [_jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Emoji', children: _jsx(Smile, { size: 16 }) }), _jsx("input", { value: draftMessage, onChange: event => setDraftMessage(event.target.value), placeholder: 'Type your message', "aria-label": 'Message' }), _jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Attach', children: _jsx(Paperclip, { size: 16 }) }), _jsx("button", { type: 'button', className: 'chrome-icon', "aria-label": 'Camera', children: _jsx(Camera, { size: 16 }) })] }), _jsx("button", { type: 'submit', className: 'send-btn', "aria-label": 'Send message', children: _jsx(SendHorizontal, { size: 16 }) })] }), _jsx("footer", { className: 'home-indicator', children: _jsx("span", {}) })] }) }));
}
