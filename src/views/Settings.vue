<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button router-direction="back" :router-link="{ name: 'home' }">
            <font-awesome-icon fixed-width :icon="['fas', 'arrow-left']" />
          </ion-button>
        </ion-buttons>
        <ion-title>Songbook</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Data</ion-card-title>
          <ion-card-subtitle>Import and export</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <input type="file" id="fileInput" @change="onFileChange" accept=".json" hidden>
          <ion-button @click="importSongbook">
            <font-awesome-icon pull="left" :icon="['fas', 'file-import']" />
            Import
          </ion-button>
          <ion-button @click="exportSongbook" download>
            <font-awesome-icon pull="left" :icon="['fas', 'file-export']" />
            Export
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Ref, inject } from 'vue';

// Data
const songs = inject<Ref>('songs');
const books = inject<Ref>('books');

const importSongbook = () => {
  document.getElementById('fileInput')?.click();
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        const importedData = JSON.parse(result as string);
        console.log(importedData);
      }
    };
    reader.readAsText(file);
  }
};

const exportSongbook = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ songs: songs.value, books: books.value }, null, 2)], { type: 'application/json' }));
  a.download = 'songbook.json';
  a.click();
  URL.revokeObjectURL(a.href);
};
</script>