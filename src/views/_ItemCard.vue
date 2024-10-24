<template>
  <ion-card>
    <ion-fab vertical="top" horizontal="end">
      <ion-fab-button @click="openForm(type)">
        <font-awesome-icon :icon="['fas', 'plus']" />
      </ion-fab-button>
    </ion-fab>
    <ion-card-header>
      <ion-card-title>{{ type }}s</ion-card-title>
      <ion-card-subtitle>{{ items.length }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ItemList :items="items" :type="type" :filter="filter"></ItemList>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import ItemList from '@/views/_ItemList.vue';
import EventBus from '@/eventBus.js';

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