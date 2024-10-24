<template>
  <ion-app>
    <ion-menu content-id="main-content">
      <ion-segment v-model="tab">
        <ion-segment-button value="songs">
          <ion-label>Songs</ion-label>
        </ion-segment-button>
        <ion-segment-button value="books">
          <ion-label>Books</ion-label>
        </ion-segment-button>
      </ion-segment>
      <ItemTab v-if="tab === 'books'" :items="books" type="book" :filter="false"></ItemTab>
      <ItemTab v-if="tab === 'songs'" :items="songs" type="song" :filter="true"></ItemTab>
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
    <ItemForm :openedForm="openedForm" :type="typeRef" :item="itemRef" @close="closeForm"></ItemForm>
  </ion-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, provide } from 'vue';
import EventBus from '@/eventBus.js';
import ItemTab from '@/views/_ItemTab.vue';
import ItemForm from '@/views/_ItemForm.vue';
import * as data from '@/services/songbook.js';

const route = useRoute();

// Data
const songs = ref([]);
const books = ref([]);

// Form
const typeRef = ref();
const itemRef = ref();
const openedForm = ref(false);
const closeForm = () => openedForm.value = false;

onMounted(async () => {
  songs.value = await data.search('song');
  books.value = await data.search('book');

  EventBus.on('openForm', ({ type, item }) => {
    openedForm.value = true;
    typeRef.value = type;
    itemRef.value = item;
  });
});

// Provide Data
provide('songs', songs);
provide('books', books);

// Default opened Tab
const tab = ref('books');
</script>
