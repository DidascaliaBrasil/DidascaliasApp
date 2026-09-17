<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
      @abrir-linkar-oculos="oculosModalStore.abrirLinkar()"
      @abrir-gerenciar-oculos="oculosModalStore.abrirGerenciar()"
    />

    <nav class="navbar">
      <div class="logo-area stagger-in">
        <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
        <span class="brand-name notranslate" translate="no">Didascalias</span>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="isLoading" class="loading-state stagger-in">
        <div class="spinner"></div>
        <p>A carregar o ambiente...</p>
      </div>

      <div v-else class="welcome-section stagger-in-2">
        <HomeInstituicao 
          v-if="tipoNormalizado === 'instituicao'" 
          :user-data="userData" 
          @abrir-linkar-oculos="oculosModalStore.abrirLinkar()"
          @abrir-gerenciar-oculos="oculosModalStore.abrirGerenciar()"
        />
        
        <HomeFacilitador 
          v-else-if="tipoNormalizado === 'facilitador'" 
          :user-data="userData" 
        />
        
        <HomeUsuario 
          v-else-if="tipoNormalizado === 'usuario'" 
          :user-data="userData" 
        />

        <div v-else class="error-box">
          <p>Erro: Tipo de conta não reconhecido ou dados inexistentes.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOculosModalStore } from '../stores/oculosModal'

import MenuLateral from '../components/generic/MenuLateral.vue' 
import HomeInstituicao from '../components/instituicao/HomeInstituicao.vue'
import HomeFacilitador from '../components/facilitador/HomeFacilitador.vue'
import HomeUsuario from '../components/usuario/HomeUsuario.vue'

const router = useRouter()
const authStore = useAuthStore()
const oculosModalStore = useOculosModalStore()
const isLoading = ref(true)
const userData = ref({})

const tipoNormalizado = computed(() => {
  if (!userData.value.tipo) return 'indefinido'
  return String(userData.value.tipo)
    .trim() 
    .toLowerCase() 
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/g, "") 
})

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* CSS para gerenciar a animação de entrada e saída dos painéis laterais à direita */
.slide-side-enter-active,
.slide-side-leave-active {
  transition: opacity 0.3s ease;
}

.slide-side-enter-active :deep(.panel-content),
.slide-side-leave-active :deep(.panel-content) {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-side-enter-from { opacity: 0; }
.slide-side-leave-to { opacity: 0; }

.slide-side-enter-from :deep(.panel-content) { transform: translateX(100%); }
.slide-side-leave-to :deep(.panel-content) { transform: translateX(100%); }
</style>