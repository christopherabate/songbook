<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-toggle v-if="route.name !== 'home'">
          <ion-button router-direction="back" :router-link="{ name: 'home' }">
            <font-awesome-icon fixed-width :icon="['fas', 'house']" />
          </ion-button>
        </ion-menu-toggle>
      </ion-buttons>
      <ion-title>Songbook</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ItemList :items="items" :type="type" :filter="filter"></ItemList>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-toggle>
          <ion-button :router-link="{ name: 'settings' }">
            <font-awesome-icon fixed-width :icon="['fas', 'sliders']" />
          </ion-button>
        </ion-menu-toggle>
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button @click="openForm(type)">
          <font-awesome-icon fixed-width :icon="['fas', 'plus']" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { defineEmits } from 'vue';
import ItemList from '@/views/_ItemList.vue';
import EventBus from '@/eventBus.js';

const route = useRoute();

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
  },
  filter: {
    type: Boolean,
    default: false,
  }
});

// Form
const emit = defineEmits(['openForm'])
const openForm = (type, item?) => EventBus.emit('openForm', { type: type, item: item });
</script>