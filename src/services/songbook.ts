import { Storage } from '@ionic/storage';
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import defaultData from '@/defaultData.json';

export const structure = {
  song: {
    title: '',
    artist: '',
    tempo: null,
    score: '',
    duration: null,
  },
  book: {
    name: '',
    songs: [],
  },
};

const storage = reactive({
  song: [],
  book: [],
});

let storageService: Storage | null = null;

const init = async () => {
  storageService = new Storage({ name: 'songbook' });
  await storageService.create();

  let songs = JSON.parse(await storageService.get('song'));
  let books = JSON.parse(await storageService.get('book'));
  
  if (songs || books) {
    storage.song = songs || [];
    storage.book = books || [];
  } else {
    storage.song = defaultData.songs;
    storage.book = defaultData.books;
  }

  return storageService;
};

export const sync = async () => {
  if (storageService) {
    await storageService.set('song', JSON.stringify(storage.song));
    await storageService.set('book', JSON.stringify(storage.book));
  } else {
    await init();
  }
};

export const load = async (
  store: string,
  id: string,
) => {
  await sync();
  return storage[store].find(item => item.id === id);
};

export const save = async (
  store: string,
  data: any,
) => {
  if (data.id) {
    const index = storage[store].findIndex(item => item.id === data.id);

    if (index !== -1) {
      storage[store][index] = { ...storage[store][index], ...data };
    } else {
      storage[store].push(data);
    }
  } else {
    storage[store].push({ ...data, id: uuidv4() });
  }
  await sync();
};

export const remove = async (
  store: string,
  id: string,
) => {
  const index = storage[store].findIndex(item => item.id === id);
  if (index !== -1) {
    storage[store].splice(index, 1);
    await sync();
  }
};

export const search = async (
  store: string,
  params: Array<{
    key: string;
    value: any;
    operator?: (a: any, b: any) => boolean;
  }> = [],
) => {
  await sync();

  const operators = {
    equals: (a, b) => a === b,
    notEquals: (a, b) => a !== b,
    greaterThan: (a, b) => a > b,
    greaterThanOrEqual: (a, b) => a >= b,
    lessThan: (a, b) => a < b,
    lessThanOrEqual: (a, b) => a <= b,
    startsWith: (a, b) => typeof a === 'string' && a.startsWith(b),
    endsWith: (a, b) => typeof a === 'string' && a.endsWith(b),
    includes: (a, b) => typeof a === 'string' && a.includes(b),
    matches: (a, b) => typeof a === 'string' && new RegExp(b).test(a),
  };
  
  if (params.length === 0) {
    return storage[store];
  }

  return storage[store].filter(item => 
    params.every(param => {
      const operator = param.operator || operators.equals;
      return operator(item[param.key], param.value);
    })
  );
};
