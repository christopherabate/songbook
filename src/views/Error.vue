<template>
  <ion-page>
    <ion-content>
      
      <ion-list>
            <ion-item v-for="(book, index) in books" :key="index" :router-link="{ name: 'book', params: { id: book.id }}" :class="{ selected: route.name === 'book' && route.params.id === book.id }">
              {{ book.name }}
            </ion-item>
        </ion-list>

<!-- Bouton pour ouvrir la modale -->
<ion-button id="open-modal" expand="block">Open</ion-button>
    </ion-content>

    <!-- Modale avec trigger et fermeture automatique -->
    <ion-modal ref="modal" trigger="open-modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <!-- Bouton pour fermer la modale -->
            <ion-button data-dismiss="modal">Cancel</ion-button>
          </ion-buttons>
          <ion-title>Welcome</ion-title>
          <ion-buttons slot="end">
            <ion-button :strong="true" data-dismiss="modal">Confirm</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            label="Enter your name"
            label-placement="stacked"
            ref="input"
            type="text"
            placeholder="Your name"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, Ref, inject } from 'vue';

const route = useRoute();
const router = useRouter();

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');
</script>