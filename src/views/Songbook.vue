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
        <div v-for="(song, index) in data.songbook" :key="song.id" :id="song.id" class="slide ion-padding" @scroll="scrollProgress = $event.target.scrollTop / ($event.target.scrollHeight - $event.target.clientHeight)">
          <div class="definitions" :style="settings.definitions ? 'display: flex' : 'display: none'"></div>
          <div v-if="song?.score" class="score" v-html="chordPro.toHTML(song.score)"></div>
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
          <ion-button @click="settings.definitions = !settings.definitions" :color="settings.definitions ? 'secondary' : 'primary'">
            <font-awesome-icon fixed-width :icon="['fas', settings.definitions ? 'thumbtack-slash' : 'thumbtack']" />
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
          <ion-button @click="settings.autofit = !settings.autofit" :color="settings.autofit ? 'secondary' : 'primary'">
            <font-awesome-icon fixed-width :icon="['fas', settings.autofit ? 'down-left-and-up-right-to-center' : 'up-right-and-down-left-from-center']" />
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

// Settings
const settings = inject('settings');

// Tempo
const tempo = ref();

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
  () => [data.songs, data.books, settings, route.hash],
  () => {
    load();
    nextTick(() => {
      // Change visible slide
      document.querySelector(`#${CSS.escape(data.song.id)}`)?.scrollIntoView({ behavior: "instant"});

      // Observe slide resize
      const resizeSlideObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          // Keyboard scroll
          const keyActions = {
            arrowup: (target) => target?.scrollBy({ top: -100, behavior: 'smooth' }),
            arrowdown: (target) => target?.scrollBy({ top: 100, behavior: 'smooth' }),
            arrowleft: (target) => target?.previousElementSibling?.scrollIntoView({ behavior: "smooth"}),
            arrowright: (target) => target?.nextElementSibling?.scrollIntoView({ behavior: "smooth"}),
          };
          window.addEventListener("keydown", (event) => {
            const action = keyActions[event.key.toLowerCase()];
            if (action) {
              event.preventDefault();  
              action(entry.target);
            }
          });
          
          // Definitions
          entry.target.parentElement.querySelectorAll('.definitions').forEach(definitions => {
            definitions.innerHTML = [...definitions.parentElement.querySelectorAll('.score .definition')].map(definition => {
              definition.style.display = 'flex';
              return definition.outerHTML;
            }).join('');
          });
          settings.definitions && entry.target.parentElement.querySelectorAll('.score .definition').forEach(definition => definition.style.display = 'none');
          
          // Setup Autoscroll
          scrolling.value && togglescroll();
          autoscroll.value = new AutoScroll(entry.target, data.song?.duration);

          // Autofit
          entry.target.parentElement.querySelectorAll('.score').forEach(slide => {
            if (settings.autofit) textFit.auto(slide, entry.contentRect.width);
            else slide.style.transform = 'scale(1)';
          });
          
          // Progress update
          scrollProgress.value = entry.target.scrollTop / (entry.target.scrollHeight - entry.target.clientHeight) || 0;
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
    });
  },
  { deep: true, immediate: true }
);
</script>
