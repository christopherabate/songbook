<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <Menu></Menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
    <Form></Form>
  </ion-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, provide, onMounted } from 'vue';
import Menu from '@/views/components/Menu.vue';
import Form from '@/views/components/Form.vue';
import * as songbook from '@/services/Songbook';

const data = reactive(songbook.data);

const sync = async () => {
  await songbook.sync();
};

onMounted(() => {
  sync();
});

provide('data', data);
</script>