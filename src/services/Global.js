import { reactive, watch } from 'vue';

export const settings = reactive({
  definitions: localStorage.getItem('definitions') !== 'false',
  definitionZoom: parseInt(localStorage.getItem('definitionZoom') || '100', 10),
  autofit: localStorage.getItem('autofit') !== 'false',
});

watch(settings, () => {
  localStorage.setItem('definitions', settings.definitions?.toString());
  localStorage.setItem('definitionZoom', settings.definitionZoom?.toString());
  localStorage.setItem('autofit', settings.autofit?.toString());
}, { deep: true, immediate: true });