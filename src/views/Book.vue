<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button>
            <font-awesome-icon fixed-width :icon="['fas', 'book']" />
          </ion-menu-button>
        </ion-buttons>
        <ion-title>{{ song?.title }} <ion-note>{{ song?.artist }}</ion-note></ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openSongs($event)">
            <font-awesome-icon fixed-width :icon="['fas', 'ellipsis-vertical']" />
          </ion-button>
          <ion-popover
            :is-open="songsOpen"
            :dismiss-on-select="true"
            @did-dismiss="songsOpen = false"
            :event="popoverEvent"
          >
            <ion-content>
              <ion-list>
                <ion-item-group>
                  <ion-item>
                    <ion-label><strong>{{ book?.name }}</strong></ion-label>
                    <ion-badge v-if="book.songs" color="secondary" slot="end">{{ book.songs.length }}</ion-badge>
                  </ion-item>
                </ion-item-group>
                <ion-item-group>
                  <ion-item
                    v-for="(songIndex, index) in book.songs?.map(id => songs?.find(song => song.id === id))"
                    :key="songIndex.id"
                    button
                    detail="false"
                    @click="slideTo(index)"
                    :disabled="(songIndex.id === song.id)"
                  >
                    <ion-label>{{ songIndex.title }}</ion-label>
                    <ion-note slot="end">{{ songIndex.artist }}</ion-note>
                  </ion-item>
                </ion-item-group>
                <ion-item-group>
                  <ion-item lines="none" button detail="false" :router-link="{ name: 'edit' }">
                    <font-awesome-icon slot="end" fixed-width :icon="['fas', 'share-from-square']" />
                    Share
                  </ion-item>
                  <ion-item lines="none" button detail="false" @click="openForm('book', book)">
                    <font-awesome-icon slot="end" fixed-width :icon="['fas', 'pen']" />
                    Edit
                  </ion-item>
                  <ion-item lines="none" button detail="false" @click="data.remove('book', book.id)">
                    <font-awesome-icon slot="end" fixed-width :icon="['fas', 'trash']" />
                    Delete
                  </ion-item>
                </ion-item-group>
              </ion-list>
            </ion-content>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :scrollX="false" :scrollY="false" ref="content">
      <swiper @swiper="sliderInit" :pagination="true">
        <swiper-slide
          class="slide ion-padding"
          :style="`height: ${height}px;`"
          v-for="(song, index) in book.songs?.map(id => songs?.find(song => song.id === id))"
          :key="song.id"
          :data-index="song.id"
        >
          <div class="score" v-html="new ChordPro(song.score).toHTML()"></div>
        </swiper-slide>
      </swiper>
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="transpose(song.id, -1)">
            <font-awesome-icon fixed-width :icon="['fas', 'arrow-down']" />
          </ion-button>
          {{ transposition[song.id] | 0 }}
          <ion-button @click="transpose(song.id, +1)">
            <font-awesome-icon fixed-width :icon="['fas', 'arrow-up']" />
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button
            v-if="song.tempo"
            @click="tempo[song.id] = !tempo[song.id]"
            :class="{ tempo: tempo[song.id] }"
            :style="tempo[song.id] ? `--bpm: ${song.tempo};` : ''"
            :color="tempo[song.id] ? 'primary' : 'secondary'"
          >
            <font-awesome-icon pull="left" :icon="['fas', 'heart-pulse']" />
            {{ song.tempo }}
          </ion-button>
          <ion-button @click="toggleScroll(song.id)" :color="isScrolling[song.id] ? 'primary' : 'secondary'">
            <font-awesome-icon
              fixed-width
              :icon="['fas', isScrolling[song.id] ? 'circle-pause' : 'circle-chevron-down']"
            />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { useElementSize  } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router';
import { ref, Ref, defineEmits, onMounted, inject, computed } from 'vue';
import EventBus from '@/eventBus.js';
import * as data from '@/services/songbook.js';
import { AutoScroll } from '@/libs/AutoScroll.js';
import { ChordPro } from '@/libs/ChordPro.js';
import { autoFit } from '@/libs/TextFit.js';

const route = useRoute();
const router = useRouter();

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');

// Current book
const book = computed(() => {
  return books?.value.find(book => book.id === route.params.id) || {};
});

// Current song
const song = ref({});

// Popovers
const songsOpen = ref(false);
const popoverEvent = ref<Event | null>(null);
const openSongs = (e: Event) => {
  popoverEvent.value = e;
  songsOpen.value = true;
};

// Slider
const slider = ref();
const sliderInit = swiper => (slider.value = swiper);
const content = ref(null)
const { width, height } = useElementSize(content);
const slideTo = (index) => slider.value?.slideTo(index);

// Tempo
const tempo = ref([]);

// Transposition
const transposition = ref([]);
const transpose = (index, semitones) => {
  transposition.value[index]
    ? transposition.value[index] = transposition.value[index] + semitones
    : transposition.value[index] = semitones
};

// AutoScroll
const isScrolling = ref([]);
const autoScroll = ref([]);
const toggleScroll = (index) => {
  isScrolling.value[index]
    ? autoScroll.value[index].pause()
    : autoScroll.value[index].play(() => (isScrolling.value[index] = false))
  isScrolling.value[index] = !isScrolling.value[index];
};

onMounted(async () => {
  ['slidesUpdated', 'slideChange'].forEach(event => {
    slider.value.on(event, function() {
      // Current slide
      const slide = slider.value.slides[slider.value.activeIndex];

      if (slide) {
        // Current song
        song.value = songs?.value.find(song => song.id === slide.dataset.index);
        // AutoScroll
        autoScroll.value[slide.dataset.index] = new AutoScroll(slide, song.value.duration || 240);
        // AutoFit
        autoFit(slide.querySelector('.score'), slide.getBoundingClientRect().width - 92);
      }
    });
  });
});

// Form
const emit = defineEmits(['openForm'])
const openForm = (type, item) => EventBus.emit('openForm', { type: type, item: item });
</script>