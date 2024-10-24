<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Songbook</ion-title>
        <ion-buttons slot="end">
          <ion-button :router-link="{ name: 'settings' }">
            <font-awesome-icon fixed-width :icon="['fas', 'sliders']" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col><ItemCard :items="songs" type="song" :filter="true"></ItemCard></ion-col>
          <ion-col><ItemCard :items="books" type="book" :filter="false"></ItemCard></ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Ref, inject } from 'vue';
import ItemCard from '@/views/_ItemCard.vue';

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');
</script>