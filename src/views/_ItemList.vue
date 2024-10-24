<template>
  <ion-list>
    <ion-searchbar
      v-if="filter"
      placeholder="Filter"
      v-model="searchTerm"
      :debounce="200"
    ></ion-searchbar>
    <ion-item-sliding
      v-for="item, index in filteredItems"
      :key="item.id"
    >
      <ion-item
        :detail="false"
        :router-link="{ name: type, params: { id: item.id } }"
        :lines="index === items.length - 1 ? 'none' : undefined"
        :disabled="(route.name === type && route.params.id === item.id)"
      >
        <ion-label>{{ item.name || item.title }}</ion-label>
        <ion-note v-if="item.artist" slot="end">{{ item.artist }}</ion-note>
        <ion-badge v-if="item.songs" color="secondary" slot="end">{{ item.songs.length }}</ion-badge>
      </ion-item>
      <ion-item-options side="start">
        <ion-item-option color="secondary" @click="openForm(type, item)">
          <font-awesome-icon pull="left" :icon="['fas', 'pen']" />
          Edit
        </ion-item-option>
      </ion-item-options>
      <ion-item-options side="end">
        <ion-item-option color="danger" @click="data.remove(type, item.id)">
          <font-awesome-icon pull="left" :icon="['fas', 'trash']" />
          Delete
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Ref, ref, inject, defineProps, defineEmits, computed } from 'vue';
import EventBus from '@/eventBus.js';
import * as data from '@/services/songbook.js';

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');

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

// Search
const searchTerm = ref('');
const filteredItems = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return term
    ? props.items.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)))
    : props.items;
});

// Form
const emit = defineEmits(['openForm'])
const openForm = (type, item) => EventBus.emit('openForm', { type: type, item: item });
</script>