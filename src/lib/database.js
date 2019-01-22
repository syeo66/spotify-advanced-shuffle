import Dexie from 'dexie';

const db = new Dexie('spotifyCache');
db.version(1).stores({
    tracks: 'id, uri, name, artist, album',
});

export default db;