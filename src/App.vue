<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initTranslator } from './services/translator'
import LanguageSelector from './components/generic/LanguageSelector.vue'

onMounted(() => {
  initTranslator()
})
</script>

<template>
  <!-- Container invisível exigido pela engine do Google Translate -->
  <div id="google_translate_element" style="display: none;" translate="no"></div>

  <!-- Botão Flutuante de Seleção de Idioma Global -->
  <LanguageSelector variant="floating" />

  <RouterView />
</template>

<style>
@import './css/translator.css';

body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
}
</style>