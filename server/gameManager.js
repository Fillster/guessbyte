import { customAlphabet } from 'nanoid';

const generatePin = customAlphabet('0123456789', 6);

const rooms = new Map();

export function createRoom(hostName) {
    const pin = generatePin();
    const room = {
        pin,
        players: [{ name: hostName, id: null }],
        host: hostName,
        currentTurn: 0,
        stage: 'waiting', // 'picking', 'guessing', 'showingResult'
        cardOptions: [],
        selectedCard: null,
        guesses: {},
    };
    rooms.set(pin, room);
    return room;
}

export function getRoom(pin) {
    return rooms.get(pin);
}

export function joinRoom(pin, playerName) {
    const room = rooms.get(pin);
    if (!room) return null;
    room.players.push({ name: playerName, id: null }); // Socket id will be assigned later
    return room;
}

export function removeRoom(pin) {
    rooms.delete(pin);
}
