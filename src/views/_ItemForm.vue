<template>
  <ion-modal :is-open="openedForm" @did-dismiss="closeForm()" :initial-breakpoint="1" :breakpoints="[0, 1]" :handle="false">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button type="submit" @click="saveItem" color="primary">
            <font-awesome-icon fixed-width :icon="['fas', 'floppy-disk']" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ temp[type].id ? 'Edit ' : 'New ' }} <ion-note>{{ type }}</ion-note></ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeForm()" color="secondary">
            <font-awesome-icon fixed-width :icon="['fas', 'xmark']" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>

      <form v-if="type === 'song'" @submit.prevent="saveItem">
        <ion-list>
          <ion-item>
            <ion-input
              label="Title"
              v-model="temp[type].title"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Artist"
              v-model="temp[type].artist"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Tempo"
              type="number"
              min="30"
              max="400"
              v-model="temp[type].tempo"
            ></ion-input>
            <ion-buttons slot="end">
              <ion-button @click="tapTempo()"><font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" /></ion-button>
            </ion-buttons>
          </ion-item>
          <ion-item>
            <ion-input
              label="Duration"
              type="number"
              min="30"
              max="2000"
              v-model="temp[type].duration"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Score</ion-label>
          </ion-item>
          <ion-item>
            <ion-textarea
              v-if="!showScore"
              aria-label="Score"
              placeholder="Score"
              ref="editor"
              class="editor"
              :auto-grow="true"
              v-model="temp[type].score"
            ></ion-textarea>
            <div v-if="showScore" class="score" v-html="new ChordPro(temp[type].score).toHTML() || 'Preview'"></div>
          </ion-item>
        </ion-list>
      </form>
      
      <form v-if="type === 'book'" @submit.prevent="saveItem">
        <ion-list>
          <ion-item>
            <ion-input
              label="Name"
              v-model="temp[type].name"
              required
            ></ion-input>
          </ion-item>
        </ion-list>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-list>
                <ion-reorder-group :disabled="false" @ionItemReorder="reorderSelection($event)">
                  <ion-item v-for="(song, index) in temp[type].songs.map(id => songs.find(song => song.id === id))" :key="song.id">
                    <ion-label>{{ song.title }}</ion-label>
                    <ion-note slot="end">{{ song.artist }}</ion-note>
                    <ion-reorder slot="end"></ion-reorder>
                  </ion-item>
                </ion-reorder-group>
              </ion-list>
            </ion-col>
            <ion-col>
              <ion-list>
                <ion-searchbar
                  placeholder="Filter"
                  v-model="searchTerm"
                  :debounce="200"
                ></ion-searchbar>
                <ion-item v-for="song, index in filteredItems" :key="song.id">
                  <ion-checkbox slot="start" :checked="temp[type].songs.includes(song.id)" :value="song.id" @ionChange="toggleSelection(song.id, $event)"></ion-checkbox>
                  <ion-label>{{ song.title }}</ion-label>
                  <ion-note slot="end">{{ song.artist }}</ion-note>
                </ion-item>
              </ion-list>
            </ion-col>
          </ion-row>
        </ion-grid>
      </form>

    </ion-content>
    <ion-footer v-if="type === 'song'">
      <ion-toolbar>
        <ion-buttons class="controls" slot="start">
          <ion-button @click="wrapSelection('[', ']')"><font-awesome-icon fixed-width :icon="['fas', 'music']" /></ion-button>
          <ion-button @click="wrapSelection('{start_of_tab}\n', '\n{end_of_tab}')"><font-awesome-icon fixed-width :icon="['fas', 'guitar']" /></ion-button>
          <ion-button @click="wrapSelection('{start_of_tab}\n', '\n{end_of_tab}')"><font-awesome-icon :icon="['fas', 'table-list']" rotation="90" /></ion-button>
          <ion-button @click="wrapSelection('{start_of_verse}\n', '\n{end_of_verse}')"><font-awesome-icon fixed-width :icon="['fas', 'v']" /></ion-button>
          <ion-button @click="wrapSelection('{start_of_chorus}\n', '\n{end_of_chorus}')"><font-awesome-icon fixed-width :icon="['fas', 'c']" /></ion-button>
          <ion-button @click="wrapSelection('{start_of_bridge}\n', '\n{end_of_bridge}')"><font-awesome-icon fixed-width :icon="['fas', 'b']" /></ion-button>
          <ion-button @click="wrapSelection('{comment: ', '}')"><font-awesome-icon fixed-width :icon="['fas', 'message']" /></ion-button>
        </ion-buttons>
        <ion-buttons class="controls" slot="end">
          <ion-button @click="toggleScore()"><font-awesome-icon fixed-width :icon="['fas', showScore ? 'eye' : 'eye-slash']" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { Ref, ref, inject, defineProps, defineEmits, watch, computed } from 'vue';
import { ChordPro } from '@/libs/ChordPro.js';
import * as data from '@/services/songbook.js';

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');

const props = defineProps({
  openedForm: {
    type: Boolean,
  },
  type: {
    type: String,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);
const closeForm = () => emit('close');

const temp = ref({
  song: { ...data.structure.song },
  book: { ...data.structure.book },
});

watch(() => props.item, (record) => {
  if (record && Object.keys(record).length > 0) {
    temp.value[props.type] = { ...data.structure[props.type], ...record };
  } else {
    temp.value.song = { ...data.structure.song };
    temp.value.book = { ...data.structure.book };
  }
});

// Search
const searchTerm = ref('');
const filteredItems = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return term
    ? songs.value.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)))
    : songs.value;
});

// Tap Tempo
let tapTimes = ref([]);
const tapTempo = () => {
  const now = Date.now();
  tapTimes.value = [...tapTimes.value.filter(time => now - time < 2500), now];

  if (tapTimes.value.length > 1) {
    const avgInterval = (now - tapTimes.value[0]) / (tapTimes.value.length - 1);
    temp.value[props.type].tempo = Math.round(60000 / avgInterval);
  }
};

// Text Editor
const editor = ref(null);
const showScore = ref(false);
const wrapSelection = (before, after) => {
  const textarea = editor.value?.$el.querySelector('textarea');
  const { selectionStart: start, selectionEnd: end, value } = textarea || {};

  if (textarea && start !== undefined && end !== undefined) {
    const newText = value.slice(0, start) + before + value.substring(start, end) + after + value.slice(end);
    temp.value[props.type].score = newText;

    requestAnimationFrame(() => {
      textarea.focus();

      (start !== end)
        ? textarea.setSelectionRange(start + before.length, start + before.length + (end - start))
        : textarea.setSelectionRange(start + before.length, start + before.length);
    });
  }
};

const toggleScore = () => {
  showScore.value = !showScore.value;
};

// Toggle song selection
const toggleSelection = (id: string, { detail: { checked } }: CustomEvent) => {
  const selected = temp.value[props.type].songs;
  checked ? selected.push(id) : selected.splice(selected.indexOf(id), 1);
};

// Reorder song list
const reorderSelection = (event: CustomEvent) => {
  temp.value[props.type].songs = event.detail.complete(temp.value[props.type].songs);
};

// Save Item
const saveItem = async () => {
  console.log(temp.value);
  await data.save(props.type, temp.value[props.type]);
  temp.value[props.type] = { ...data.structure[props.type] }
  closeForm();
};
</script>
