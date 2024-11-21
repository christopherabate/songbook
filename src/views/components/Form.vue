<template>
  <ion-modal :is-open="data.form?.open" @did-dismiss="data.form.open = false" :initial-breakpoint="1" :breakpoints="[0, 1]" :handle="false" style="--min-width:100%">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="data.form.open = false" color="secondary">
            <font-awesome-icon fixed-width :icon="['fas', 'xmark']" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t('edit', { type: $t(data.form.type, { count: 1 }), count: Object.keys(toRaw(data.form.item)).length + 1 }) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button type="submit" color="primary" form="form">
            <font-awesome-icon fixed-width :icon="['fas', 'check']" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  

    <ion-content v-if="data.form.type === 'songs'">
      <form id="form" @submit.prevent="save">
        <ion-list :inset="true">
          <ion-item v-if="data.book.id && !data.form.item.id">
            <ion-toggle
              checked="true"
              name="book"
              label-placement="start"
              :value="data.book.id"
            >{{ $t('in', { item: data.book.name }) }}</ion-toggle>
          </ion-item>
          <ion-item>
            <ion-input
              :label="$t('title')"
              v-model="data.form.item.title"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              :label="$t('artist')"
              v-model="data.form.item.artist"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-buttons slot="start">
              <ion-button @click="tapTempo()"><font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" /></ion-button>
            </ion-buttons>
            <ion-input
              :label="$t('tempo')"
              placeholder="120"
              type="number"
              min="30"
              max="400"
              v-model="data.form.item.tempo"
            ></ion-input>
            <ion-note slot="end">BPM</ion-note>
          </ion-item>
          <ion-item>
            <ion-buttons slot="start">
              <ion-button disabled="true"><font-awesome-icon fixed-width :icon="['fas', 'clock']" /></ion-button>
            </ion-buttons>
            <ion-input
              :label="$t('duration')"
              placeholder="240"
              type="number"
              min="30"
              max="2000"
              v-model="data.form.item.duration"
            ></ion-input>
            <ion-note slot="end">{{ $t('seconds') }}</ion-note>
          </ion-item>
        </ion-list>
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col size="12" size-lg="6" :class="!showScore && 'ion-hide-lg-down'">
              <ion-list :inset="true">
                <ion-item>
                  <ion-textarea
                    :aria-label="$t('score')"
                    :placeholder="$t('score')"
                    ref="editor"
                    class="editor"
                    :auto-grow="true"
                    v-model="data.form.item.score"
                  ></ion-textarea>
                </ion-item>
              </ion-list>
            </ion-col>
            <ion-col size="12" size-lg="6" :class="showScore && 'ion-hide-lg-down'">
              <ion-list :inset="true">
                <ion-item>
                  <div
                    v-if="data.form.item.score"
                    class="score"
                    v-html="chordPro.toHTML(data.form.item.score)"
                  ></div>
                </ion-item>
              </ion-list>
            </ion-col>
          </ion-row>
        </ion-grid>
      </form>
    </ion-content>

    <ion-content v-else-if="data.form.type === 'books'">
      <form id="form" @submit.prevent="save">
        <ion-list :inset="true">
          <ion-item>
            <ion-input
              :label="$t('name')"
              v-model="data.form.item.name"
              required
            ></ion-input>
          </ion-item>
        </ion-list>
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col>
              <ion-list :inset="true">
                <ion-list-header>
                  <ion-label>{{ $t('songbook') }}</ion-label>
                </ion-list-header>
                <ion-reorder-group v-if="data.form.item.songs?.map(id => data.songs.find(song => song.id === id)).length > 0" :disabled="false" @ionItemReorder="reorderSelection($event)">
                  <ion-item v-for="(song, index) in data.form.item.songs?.map(id => data.songs.find(song => song.id === id))" :key="song.id">
                    <ion-label>
                      <h2>{{ song.title }}</h2>
                      <p class="ion-text-uppercase">{{ song.artist }}</p>
                    </ion-label>
                    <ion-reorder slot="end"></ion-reorder>
                  </ion-item>
                </ion-reorder-group>
                <ion-item v-else>
                  {{ $t('empty') }}
                </ion-item>
              </ion-list>
            </ion-col>
            <ion-col>
              <ion-list :inset="true">
                <ion-list-header>
                  <ion-label>{{ $t('all') }}</ion-label>
                </ion-list-header>
                <ion-searchbar
                  :placeholder="$t('filter')"
                  v-model="searchTerm"
                  :debounce="200"
                ></ion-searchbar>
                <ion-item v-for="song, index in filteredItems" :key="song.id">
                  <ion-checkbox slot="start" :checked="data.form.item.songs?.includes(song.id)" :value="song.id" @ionChange="toggleSelection(song.id, $event)"></ion-checkbox>
                  <ion-label>
                    <h2>{{ song.title }}</h2>
                    <p class="ion-text-uppercase">{{ song.artist }}</p>
                  </ion-label>
                  <ion-note slot="end">
                    <div v-if="song.tempo"><font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" /> {{ song.tempo }}</div>
                    <div v-if="song.duration"><font-awesome-icon fixed-width :icon="['fas', 'clock']" /> {{ ~~(song.duration / 60) + ':' + Math.floor(song.duration % 60).toString().padStart(2, '0') }}</div>
                  </ion-note>
                </ion-item>
              </ion-list>
            </ion-col>
          </ion-row>
        </ion-grid>
      </form>
    </ion-content>
      
    <ion-footer>
      <ion-toolbar v-if="data.form.type === 'songs'">
        <ion-buttons class="controls" slot="start">
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{define: ', ' base-fret 1 frets x 3 2 0 1 0}', 'C')"><font-awesome-icon fixed-width :icon="['fas', 'guitar']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{define: ', ' keys 1 3 5}', 'C')"><font-awesome-icon fixed-width :icon="['fas', 'square-full']" transform="left-10" :mask="['fas', 'table-list']" rotation="90"/></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{start_of_verse}\n', '\n{end_of_verse}', 'Verse')"><font-awesome-icon fixed-width :icon="['fas', 'v']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{start_of_chorus}\n', '\n{end_of_chorus}', 'Chorus')"><font-awesome-icon fixed-width :icon="['fas', 'c']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{start_of_bridge}\n', '\n{end_of_bridge}', 'Bridge')"><font-awesome-icon fixed-width :icon="['fas', 'b']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '[', ']')"><font-awesome-icon fixed-width :icon="['fas', 'music']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{start_of_tab}\n', '\n{end_of_tab}', 'e|----|\nB|----|\nG|----|\nD|----|\nA|----|\nE|----|')"><font-awesome-icon fixed-width :icon="['fas', 'table-cells']" /></ion-button>
          <ion-button @click="data.form.item.score = chordPro.wrap(editor.$el.querySelector('textarea'), '{comment: ', '}', 'Comment')"><font-awesome-icon fixed-width :icon="['fas', 'comment']" /></ion-button>
        </ion-buttons>
        <ion-buttons class="controls ion-hide-lg-up" slot="end">
          <ion-button @click="showScore = !showScore" :color="showScore ? 'primary' : 'secondary'"><font-awesome-icon fixed-width :icon="['fas', showScore ? 'eye' : 'eye-slash']" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup>
import { ref, toRaw , inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import * as chordPro from '@/scripts/ChordPro.js';
import * as songbook from '@/services/Songbook';
import { useI18n } from 'vue-i18n';

// i18n
const { t } = useI18n();

// Routing
const router = useRouter();

// Data
const data = inject('data');

// Search
const searchTerm = ref('');
const filteredItems = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return term
    ? data.songs.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)))
    : data.songs;
});

// Tap Tempo
let taps = ref([]);
const tapTempo = () => {
  const now = Date.now();
  taps.value = [...taps.value.filter(time => now - time < 2500), now];

  if (taps.value.length > 1) {
    const avgInterval = (now - taps.value[0]) / (taps.value.length - 1);
    data.form.item.tempo = Math.round(60000 / avgInterval);
  }
};

// Text Editor
const editor = ref(null);

// Toggle score
const showScore = ref(false);

// Toggle song selection
const toggleSelection = (id, { detail: { checked } }) => {
  data.form.item.songs ??= [];
  checked
    ? data.form.item.songs.push(id)
    : data.form.item.songs.splice(data.form.item.songs.indexOf(id), 1);
};

// Reorder song list
const reorderSelection = (event) => {
  data.form.item.songs = event.detail.complete(data.form.item.songs);
};

// Save Item
const save = async (event) => {
  try {
    const id = await songbook.save(data.form.type, data.form.item);
    const params = { id: data.form.type === 'songs'? data.book.id || '' : id };
    const hash = data.form.type === 'songs' ? { hash: '#' + id } : {};
    
    if (event.target.book?.value) await songbook.save("books", { ...data.book, songs: [...(data.book.songs ?? []), id] });

    router.replace({ name: 'Songbook', params, ...hash });
    
    await toastController.create({
      message: t('saved', { item: data.form.item.title || data.form.item.name, type: t(data.form.type, { count: 1 }) }),
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
      color: 'primary',
      swipeGesture: 'vertical',
    }).then(toast => toast.present());
  } finally {
    data.form = {
      open: false,
      type: '',
      item: {},
    };
    showScore.value = false;
  }
};
</script>
