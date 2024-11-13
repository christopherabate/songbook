<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-toggle>
            <ion-button>
              <font-awesome-icon fixed-width :icon="['fas', 'book-open']" />
            </ion-button>
          </ion-menu-toggle>
        </ion-buttons>
        <ion-title>{{ data.song.title }} <ion-note class="ion-text-uppercase">{{ data.song.artist }}</ion-note></ion-title>
        <ion-buttons slot="end">
          <ion-button @click="data.form = { open: true, type: 'songs', item: { ...data.song } }" color="primary">
            <font-awesome-icon fixed-width :icon="['fas', 'pen']" />
          </ion-button>
        </ion-buttons>
        <ion-progress-bar :value="scrollProgress"></ion-progress-bar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="data?.songbook?.length > 0" class="slides" :id="data.book.id || 'allSongs'">
        <div v-for="(song, index) in data.songbook" :key="song.id" :id="song.id" class="slide" @scroll="scrollProgress = $event.target.scrollTop / ($event.target.scrollHeight - $event.target.clientHeight)">
          <div v-if="song?.score" class="score ion-padding" v-html="chordPro.toHTML(song.score)"></div>
          <ion-list class="notes ion-no-padding" lines="none" :style="notes ? 'display: unset' : 'display: none'">
            <ion-item>
              <ion-label class="noteslist">
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
      
      <ion-card v-else>
        <ion-card-header><ion-card-title>{{ $t('empty') }}</ion-card-title></ion-card-header>
        <ion-card-content>{{ $t('create') }}</ion-card-content>
      </ion-card>
    </ion-content>

    <ion-footer :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            v-for="(song, index) in data.songbook"
            size="small"
            :disabled="(song.id === data.song.id)"
            :router-link="{ hash: '#' + song.id }"
          >
            <font-awesome-icon fixed-width :icon="['fas', 'circle']" size="xs" />
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="togglenotes":color="notes ? 'secondary' : 'primary'">
            <font-awesome-icon fixed-width :icon="['fas', notes ? 'thumbtack-slash' : 'thumbtack']" />
          </ion-button>
          <ion-button v-if="data.song.tempo" @click="tempo = !tempo" :class="{ tempo: tempo }" :style="tempo ? `--bpm: ${data.song.tempo}` : ''" :color="tempo ? 'primary' : 'secondary'">
            {{ data.song.tempo }}
            <font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" />
          </ion-button>
          <ion-button v-else disabled="true">
            <font-awesome-icon fixed-width :icon="['fas', 'heart-pulse']" />
          </ion-button>
          <ion-button v-if="data.song.duration" @click="togglescroll" :color="scrolling ? 'primary' : 'secondary'" :disabled="scrollProgress < 1 ? false : true">
            {{ ~~(data.song.duration * (1 - scrollProgress) / 60) + ':' + Math.floor(data.song.duration * (1 - scrollProgress) % 60).toString().padStart(2, '0') }}
            <font-awesome-icon fixed-width :icon="['fas', scrolling ? 'arrow-down' : 'clock']" />
          </ion-button>
          <ion-button v-else disabled="true">
            <font-awesome-icon fixed-width :icon="['fas', 'clock']" />
          </ion-button>
          <ion-button @click="togglefit" :color="autofit ? 'secondary' : 'primary'">
            <font-awesome-icon fixed-width :icon="['fas', autofit ? 'down-left-and-up-right-to-center' : 'up-right-and-down-left-from-center']" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { ref, nextTick, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AutoScroll } from '@/scripts/AutoScroll.js';
import * as chordPro from '@/scripts/ChordPro.js';
import * as textFit from '@/scripts/TextFit.js';

// Routing
const route = useRoute();
const router = useRouter();

// Data
const data = inject('data');

// Tempo
const tempo = ref();

// Notes
const notes = ref(localStorage.getItem('notes') !== 'false');
const togglenotes = () => {
  notes.value = !notes.value;
  localStorage.setItem('notes', notes.value.toString());
};

// Progress
const scrollProgress = ref(0);

// Autoscroll
const scrolling = ref(false);
const autoscroll = ref();
const togglescroll = () => {
  if (scrolling.value) autoscroll.value.pause();
  else autoscroll.value.play(() => (scrolling.value = false));
  scrolling.value = !scrolling.value;
};

// Autofit
const slides = ref([]);
const slideWidth = ref();
const autofit = ref(localStorage.getItem('autofit') !== 'false');
const togglefit = () => {
  autofit.value = !autofit.value;
  localStorage.setItem('autofit', autofit.value.toString());
  slides.value.forEach(slide => {
    if (autofit.value) textFit.auto(slide, slideWidth.value);
    else slide.style.fontSize = window.getComputedStyle(document.documentElement).fontSize;
  });
};

// Data
const load = () => {
  data.book = route.params.id
    ? data.books.find(book => book.id === route.params.id) || router.replace('/songbook')
    : {};

  data.songbook = data.book.id
    ? data.book.songs?.map(id => data.songs.find(song => song.id === id)) || []
    : data.songs;

  data.song = route.hash
    ? data.songs.find(song => song.id === route.hash.substring(1)) || router.replace('/songbook')
    : data.songbook
      ? data.songbook.find(() => true) || {}
      : data.songs.find(() => true);
};

watch(
  () => [data.songs, data.books, route.hash],
  () => {
    load();
    nextTick(() => {
      // Change visible slide
      document.querySelector(`#${CSS.escape(data.song.id)}`)?.scrollIntoView({ behavior: "instant"});

      // Observe slide resize
      const resizeSlideObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          // Progress update
          scrollProgress.value = entry.target.scrollTop / (entry.target.scrollHeight - entry.target.clientHeight) || 0;
          
          // Setup Autoscroll
          scrolling.value && togglescroll();
          autoscroll.value = new AutoScroll(entry.target, data.song?.duration);

          // Autofit
          slides.value = document.querySelectorAll('.score');
          slideWidth.value = entry.contentRect.width;
          autofit.value && slides.value.forEach(slide => textFit.auto(slide, slideWidth.value));
        });
      });

      // Observe slide change
      const activeSlideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            resizeSlideObserver.observe(entry.target);
            router.replace({ hash: '#' + entry.target.id });
          } else {
            resizeSlideObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.99 });
      document.querySelectorAll('.slide').forEach(slide => activeSlideObserver.observe(slide));
      
      // Observe notes
      const activeNotesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const note = Array.from(document.querySelector('.noteslist').children).find(child => child.isEqualNode(entry.target));
          
          if (entry.isIntersecting && !note) {
            document.querySelector('.noteslist').append(entry.target.cloneNode(true));
          } else if (!entry.isIntersecting && note) {
            document.querySelector('.noteslist').removeChild(note);
          }
        });
      }, { threshold: 1 });
      document.querySelectorAll('.score .note').forEach(note => activeNotesObserver.observe(note));
    });
  },
  { deep: true, immediate: true }
);
</script>
