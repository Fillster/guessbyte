const BASE_URL = 'http://localhost:3000';

/**
 * Create a new game room
 * @param {string} name - Player name (creator)
 * @returns {Promise<string>} - The room PIN
 */
export async function createRoomAPI(name) {
  try {
    const res = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create room');
    }

    return data.pin;
  } catch (err) {
    console.error('Create room error:', err);
    throw err;
  }
}

/**
 * Join an existing game room
 * @param {string} gameCode - Room PIN
 * @param {string} playerName - Your player name
 * @returns {Promise<void>}
 */
export async function joinRoomAPI(gameCode, playerName) {
  try {
    const res = await fetch(`${BASE_URL}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: gameCode, name: playerName }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to join room');
    }
  } catch (err) {
    console.error('Join room error:', err);
    throw err;
  }
}
