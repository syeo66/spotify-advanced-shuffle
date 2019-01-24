import Dexie from 'dexie';

const db = new Dexie('spotifyCache');
db.version(1).stores({
    tracks: 'id, name, isSynced',
});
db.open();

export default db;