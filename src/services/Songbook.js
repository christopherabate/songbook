import { ref, reactive } from 'vue';
import { Storage } from '@ionic/storage';
import { v4 as uuidv4 } from 'uuid';
import defaultData from '@/data/default.json';

export const data = reactive({
  songs: [],
  books: [],
});

let storage = null;

/* export const init = async () => {
  storage = new Storage({ name: 'songbook' });
  await storage.create();

  data.songs = JSON.parse(await storage.get('songs')) || [];
  data.books = JSON.parse(await storage.get('books')) || [];
}; */

export const init = async () => {
  storage = new Storage({ name: 'songbook' });
  await storage.create();

  let songs = JSON.parse(await storage.get('songs'));
  let books = JSON.parse(await storage.get('books'));

  if (songs || books) {
    data.songs = songs || [];
    data.books = books || [];
  } else {
    data.songs = defaultData.songs;
    data.books = defaultData.books;
    await sync();
  }

  return storage;
};

export const sync = async () => {
  if (storage) {
    await storage.set('songs', JSON.stringify(data.songs));
    await storage.set('books', JSON.stringify(data.books));
  } else {
    await init();
  }
};

export const load = async (store, id) => {
  await sync();
  return data[store].find(item => item.id === id);
};

export const save = async (store, values) => {
  const id = values.id || uuidv4();
  const index = data[store].findIndex(item => item.id === id);

  if (index !== -1) {
    data[store][index] = { ...data[store][index], ...values };
  } else {
    data[store].push({ id: id, ...values });
  }
    
  await sync();
  return id;
};

export const remove = async (store, id) => {
  const index = data[store].findIndex(item => item.id === id);
  if (index !== -1) {
    data[store].splice(index, 1);

    if (store === 'songs') {
      for (const book of data.books) {
        if (book.songs?.includes(id)) {
          book.songs.splice(book.songs.indexOf(id), 1);
        }
      }
    }
    await sync();
    return true;
  }
  return false;
};

export const search = async (store, params = []) => {
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
    return data[store];
  }

  return data[store].filter(item => 
    params.every(param => {
      const operator = param.operator || operators.equals;
      return operator(item[param.key], param.value);
    })
  );
};