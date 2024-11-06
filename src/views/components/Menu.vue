<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="tab !== 'settings'">{{ data.book?.name || $t('songbook') }}</ion-title>
        <ion-title v-else>{{ $t('settings') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="tab = 'settings'" :color="tab === 'settings' ? 'primary' : 'secondary'">
            <font-awesome-icon fixed-width :icon="['fas', 'sliders']" />
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="start">
          <ion-button v-if="$route.params.id && tab !== 'settings'" @click="data.form = { open: true, type: 'books', item: { ...data.book } }" color="primary">
            <font-awesome-icon fixed-width :icon="['fas', 'pen']" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="tab">
          <ion-segment-button value="books">
            <ion-label>{{ $t('books', { count: 2 }) }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="songs">
            <ion-label>{{ $t('songs', { count: 2 }) }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>

      <ion-list v-if="tab === 'books'" ref="list">
        <ion-item
          :disabled="!$route.params.id ? true : false"
          :router-link="{ name: 'Songbook' }"
          routerDirection="root"
          :detail="false"
        >
          <ion-label>{{ $t('all') }}</ion-label>
          <ion-note slot="end">{{ data.songs.length }}</ion-note>
        </ion-item>
        <ion-item-sliding v-for="(book, index) in data.books" :key="book.id">
          <ion-item
            :disabled="(book.id === $route.params.id)"
            :router-link="{ name: 'Songbook', params: { id: book.id } }"
            routerDirection="root"
            :detail="false"
          >
            <ion-label>{{ book.name }}</ion-label>
            <ion-note slot="end">{{ book.songs?.length }}</ion-note>
          </ion-item>
          <ion-item-options side="start">
            <ion-item-option color="secondary" @click="data.form = { open: true, type: 'books', item: {...book} }">
              <font-awesome-icon fixed-width :icon="['fas', 'pen']" />
            </ion-item-option>
          </ion-item-options>
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="remove('books', book.id)">
              <font-awesome-icon fixed-width :icon="['fas', 'trash']" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-list v-if="tab === 'songs'" ref="list">
        <ion-searchbar
          :placeholder="$t('filter')"
          v-model="searchTerm"
          :debounce="200"
        ></ion-searchbar>
        <ion-item-sliding v-for="(song, index) in filteredSongs" :key="song.id">
          <ion-item
            :router-link="{ hash: '#' + song.id }"
            :disabled="(song.id === data.song.id)"
            :detail="false"
          >
            <ion-label>
              <h2>{{ song.title }}</h2>
              <p class="ion-text-uppercase">{{ song.artist }}</p>
            </ion-label>
            <ion-note slot="end">
              <div v-if="song.tempo"><font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" /> {{ song.tempo }}</div>
              <div v-if="song.duration"><font-awesome-icon fixed-width :icon="['fas', 'clock']" /> {{ ~~(song.duration / 60) + ':' + Math.floor(song.duration % 60).toString().padStart(2, '0') }}</div>
            </ion-note>
          </ion-item>
          <ion-item-options side="start">
            <ion-item-option color="secondary" @click="data.form = { open: true, type: 'songs', item: { ...song } }">
              <font-awesome-icon fixed-width :icon="['fas', 'pen']" />
            </ion-item-option>
          </ion-item-options>
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="remove('songs', song.id)">
              <font-awesome-icon fixed-width :icon="['fas', 'trash']" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      
      <ion-card v-if="tab === 'settings'">
        <ion-card-header>
          <ion-card-title>{{ $t('display') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item class="ion-no-padding">
              <ion-select :label="$t('locale')" v-model="locale" interface="popover" @ionChange="changeLocale">
                <ion-select-option value="">{{ $t('device') }} ({{ deviceLocale }})</ion-select-option>
                <ion-select-option
                  v-for="availableLocale in availableLocales" 
                  :key="availableLocale"
                  :value="availableLocale"
                  :disabled="availableLocale === deviceLocale ? true : false"
                >{{ availableLocale }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      
      <ion-card v-if="tab === 'settings'">
        <ion-card-header>
          <ion-card-title>{{ $t('data') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item @click="exportSongbook" class="ion-no-padding" :button="true" :detail="false">
              <ion-label>{{ $t('export') }}</ion-label>
              <ion-text slot="end">
                <font-awesome-icon fixed-width :icon="['fas', 'file-export']" />
              </ion-text>
            </ion-item>
            <ion-item @click="importSongbook" class="ion-no-padding" :button="true" :detail="false">
              <ion-label>{{ $t('import') }}</ion-label>
              <input type="file" id="fileInput" @change="onFileChange" accept=".json" hidden />
              <ion-text slot="end">
                <font-awesome-icon fixed-width :icon="['fas', 'file-import']" />
              </ion-text>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      
      <ion-card v-if="tab === 'settings'">
        <ion-card-header>
          <ion-card-title>{{ $t('about') }}&hellip;</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><ion-text>2024</ion-text></p>
          <p><ion-text>christopherabate.com</ion-text></p>
        </ion-card-content>
      </ion-card>

    </ion-content>
    <ion-footer v-if="tab !== 'settings'">
      <ion-toolbar>
        <ion-buttons slot="start">          
          <ion-button @click="data.form = { open: true, type: tab, item: {} }" color="primary">
            <font-awesome-icon fixed-width :icon="['fas', 'plus']" />
            <ion-label>{{ $t('new', { type: $t(tab) }) }}</ion-label>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-menu>

</template>

<script setup>
import { ref, inject, computed, watch } from 'vue';
import { toastController } from '@ionic/vue';
import { Dialog } from '@capacitor/dialog';
import * as songbook from '@/services/Songbook';
import { useI18n } from 'vue-i18n';

// i18n
const { t, locale, availableLocales } = useI18n();
const deviceLocale = navigator.language.split('-')[0];
const changeLocale = (event) => {
  localStorage.setItem('lang', event.detail.value);
  locale.value = localStorage.getItem('lang') || deviceLocale;
};

// Data
const data = inject('data');

// Default opened Tab
const tab = ref('books');

// Close opened sliders
const list = ref(null);
watch(() => data.form?.open, open => {
  open && list.value?.$el.closeSlidingItems();
});

// Search
const searchTerm = ref('');
const filteredSongs = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return term
    ? data.songbook.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)))
    : data.songbook;
});

// Remove Item
const remove = async (type, id) => {
  const item = data[type].find(item => item.id === id);
  const { value } = await Dialog.confirm({
    message: t('delete?', { item: item.title || item.name, type: t(type, { count: 2 }) }),
    okButtonTitle: t('delete'),
    cancelButtonTitle: t('cancel'),
  });
  
  if (value) {
    try {
      await songbook.remove(type, id);
      await toastController.create({
        message: t('deleted', { type: t(type) }),
        duration: 1500,
        position: 'top',
        color: 'secondary',
        swipeGesture: 'vertical',
      }).then(toast => toast.present());
    } catch (error) {
      await toastController.create({
        message: error,
        duration: 1500,
        position: 'top',
        color: 'danger',
        swipeGesture: 'vertical',
      }).then(toast => toast.present());
    }
  } else {
    list.value?.$el.closeSlidingItems()
  }
};

// Import
const importSongbook = () => {
  document.getElementById('fileInput')?.click();
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        const importedData = JSON.parse(result);
        console.log(importedData);
        alert(importedData);
      }
    };
    reader.readAsText(file);
  }
};

// Export
const exportSongbook = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify( data.songs , null, 2)], { type: 'application/json' }));
  a.download = 'songbook.json';
  a.click();
  URL.revokeObjectURL(a.href);
};
</script>
