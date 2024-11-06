import { Storage } from '@ionic/storage';
const storage = new Storage({ name: 'songbook' });
await storage.create();

export default storage;
