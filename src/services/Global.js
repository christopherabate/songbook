import { reactive, watch } from 'vue';

export const settings = reactive({
  definitions: localStorage.getItem('definitions') !== 'false',
  autofit: localStorage.getItem('autofit') !== 'false',
});

watch(settings, () => {
  localStorage.setItem('definitions', settings.definitions.toString());
  localStorage.setItem('autofit', settings.autofit.toString());
}, { deep: true, immediate: true });