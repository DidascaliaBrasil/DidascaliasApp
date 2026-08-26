<template>
  <div 
    :class="['lang-selector-root', `variant-${variant}`, { 'is-open': isOpen, 'is-translating': isTranslating }]"
    ref="rootRef"
  >
    <!-- MODO FLOATING / CAPSULE (Ideal para cantos superiores, telas de Login/Cadastro e topo) -->
    <template v-if="variant === 'floating'">
      <button 
        type="button" 
        class="lang-trigger-btn"
        @click="toggleDropdown"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        title="Alterar Idioma / Change Language / Cambiar Idioma"
      >
        <span class="flag-icon notranslate">{{ activeLangInfo.flag }}</span>
        <span class="lang-code notranslate">{{ activeLangInfo.label }}</span>
        
        <svg 
          class="chevron-icon" 
          :class="{ 'rotated': isOpen }"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>

        <span v-if="isTranslating" class="spinner-dot"></span>
      </button>

      <!-- Dropdown Flutuante -->
      <Transition name="lang-dropdown">
        <div v-if="isOpen" class="lang-dropdown-menu" role="listbox">
          <div class="dropdown-header">
            <span class="dropdown-title">Selecionar Idioma</span>
          </div>

          <div class="dropdown-list">
            <button
              v-for="lang in SUPPORTED_LANGUAGES"
              :key="lang.code"
              type="button"
              :class="['lang-option', { 'active': currentLanguage === lang.code }]"
              @click="selectLanguage(lang.code)"
              role="option"
              :aria-selected="currentLanguage === lang.code"
            >
              <span class="option-flag notranslate">{{ lang.flag }}</span>
              <div class="option-details">
                <span class="option-name notranslate">{{ lang.name }}</span>
                <span class="option-country notranslate">{{ lang.country }}</span>
              </div>
              <svg 
                v-if="currentLanguage === lang.code" 
                class="check-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </template>

    <!-- MODO INLINE (Ideal para o Menu Lateral ou painéis de configuração) -->
    <template v-else-if="variant === 'inline'">
      <div class="inline-lang-container">
        <div class="inline-lang-label">
          <svg class="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Idioma</span>
        </div>

        <div class="segmented-control">
          <button
            v-for="lang in SUPPORTED_LANGUAGES"
            :key="lang.code"
            type="button"
            :class="['segment-btn', { 'active': currentLanguage === lang.code }]"
            @click="selectLanguage(lang.code)"
            :title="`${lang.name} (${lang.country})`"
          >
            <span class="seg-flag notranslate">{{ lang.flag }}</span>
            <span class="seg-code notranslate">{{ lang.label }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SUPPORTED_LANGUAGES, currentLanguage, isTranslating, changeLanguage } from '../../services/translator'

defineProps({
  variant: {
    type: String,
    default: 'floating',
    validator: (v) => ['floating', 'inline'].includes(v)
  }
})

const isOpen = ref(false)
const rootRef = ref(null)

const activeLangInfo = computed(() => {
  return (
    SUPPORTED_LANGUAGES.find((item) => item.code === currentLanguage.value) ||
    SUPPORTED_LANGUAGES[0]
  )
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (code) => {
  changeLanguage(code)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (rootRef.value && !rootRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Container Raiz */
.lang-selector-root {
  position: relative;
  font-family: inherit;
  user-select: none;
}

/* ==========================================================================
   VARIANTE FLOATING (Capsule Glass Flutuante)
   ========================================================================== */
.lang-selector-root.variant-floating {
  position: fixed;
  top: 16px;
  right: 20px;
  z-index: 10000;
}

.lang-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 14px 0 12px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  color: #1e293b;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.lang-trigger-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 113, 227, 0.15);
  border-color: rgba(0, 113, 227, 0.4);
}

.lang-trigger-btn:active {
  transform: translateY(0) scale(0.98);
}

.flag-icon {
  font-size: 1.15rem;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.lang-code {
  font-size: 0.82rem;
  letter-spacing: 0.5px;
  color: #334155;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: #64748b;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  color: #0071e3;
}

.spinner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0071e3;
  animation: pulse-dot 1s infinite alternate;
}

@keyframes pulse-dot {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.3); }
}

/* Menu Dropdown */
.lang-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform-origin: top right;
  z-index: 10001;
}

.dropdown-header {
  padding: 6px 10px 4px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  margin-bottom: 2px;
}

.dropdown-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
}

.dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.lang-option:hover {
  background: rgba(239, 246, 255, 0.85);
  border-color: rgba(191, 219, 254, 0.8);
  transform: translateX(3px);
}

.lang-option.active {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.8));
  border-color: rgba(147, 197, 253, 0.9);
}

.option-flag {
  font-size: 1.3rem;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12));
}

.option-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.option-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.lang-option.active .option-name {
  color: #0071e3;
}

.option-country {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #0071e3;
  flex-shrink: 0;
}

/* Transições de Entrada/Saída */
.lang-dropdown-enter-active,
.lang-dropdown-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.lang-dropdown-enter-from,
.lang-dropdown-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-6px);
}

/* ==========================================================================
   VARIANTE INLINE (Menu Lateral / Barras de Configuração)
   ========================================================================== */
.inline-lang-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.inline-lang-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  padding: 0 4px;
}

.globe-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.segmented-control {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  padding: 3px;
  gap: 3px;
}

.segment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 4px;
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  color: #64748b;
  font-weight: 700;
  font-size: 0.78rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.segment-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #0f172a;
}

.segment-btn.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.seg-flag {
  font-size: 0.95rem;
  line-height: 1;
}
</style>
