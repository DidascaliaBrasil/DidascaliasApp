<template>
  <div>
    <button class="menu-trigger glass-effect" @click="abrirMenu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      Menu
    </button>

    <Transition name="fade">
      <div v-if="menuAberto" class="menu-overlay" @click="fecharMenu"></div>
    </Transition>

    <aside :class="['menu-lateral glass-effect', { 'is-open': menuAberto }]" @click="lidarCliqueMenu">
      
      <div class="menu-header">
        <img src="../../assets/Didas_Logo.png" alt="Logo Didascalias" class="menu-logo" />
        <span class="brand-name">Didascalias</span>
      </div>

      <div class="divider"></div>

      <nav class="menu-nav">
        <template v-if="tipoConta === 'instituicao'">
          <router-link to="/home" class="menu-link" @click="fecharMenu">Home</router-link>
          <router-link to="/gerenciar-membros" class="menu-link" @click="fecharMenu">Gerenciar Membros</router-link>
          <router-link to="/gerenciar-grupos" class="menu-link" @click="fecharMenu">Gerenciar Grupos</router-link>
          <router-link to="/relatorios" class="menu-link" @click="fecharMenu">Relatórios Gerais</router-link>
          <router-link to="/oculos" class="menu-link" @click="fecharMenu">Linkar Óculos</router-link>
        </template>

        <template v-else-if="tipoConta === 'facilitador'">
          <router-link to="/home" class="menu-link" @click="fecharMenu">Home</router-link>
          <router-link to="/meus-grupos-facilitador" class="menu-link" @click="fecharMenu">Gerenciar Grupos</router-link>
        </template>

        <template v-else-if="tipoConta === 'usuario'">
          <router-link to="/home" class="menu-link" @click="fecharMenu">Home</router-link>
          <router-link to="/meus-grupos-usuario" class="menu-link" @click="fecharMenu">Meus Grupos</router-link>
        </template>

        <template v-else>
          <p class="menu-error">Perfil não identificado.</p>
        </template>
      </nav>

    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // Recebe os dados de quem está logado para decidir o que renderizar
  userData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const menuAberto = ref(false)

// Normaliza o tipo de conta usando a mesma lógica à prova de falhas da HomeView
const tipoConta = computed(() => {
  if (!props.userData.tipo) return 'indefinido'
  
  return String(props.userData.tipo)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
})

const abrirMenu = () => {
  menuAberto.value = true
}

const fecharMenu = () => {
  menuAberto.value = false
}

// Permite ocultar o menu clicando em qualquer parte do fundo dele
const lidarCliqueMenu = (event) => {
  // Se o clique não foi num link, fecha o menu (comportamento de clique para esconder)
  if (event.target.tagName !== 'A') {
    fecharMenu()
  }
}
</script>

<style scoped>
/* Botão que fica flutuando ou posicionado na tela principal */
.menu-trigger {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-weight: bold;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
}

.menu-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-icon {
  width: 20px;
  height: 20px;
}

/* Fundo escuro para destacar o menu */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 95;
}

/* Container do menu lateral */
.menu-lateral {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(25, 25, 30, 0.85); /* Fundo escuro translúcido */
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer; /* Indica que o fundo é clicável */
}

/* Classe ativada quando o menu está aberto */
.menu-lateral.is-open {
  transform: translateX(0);
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  pointer-events: none; /* Impede que clicar na logo feche o menu de forma estranha */
}

.menu-logo {
  width: 50px;
  height: auto;
  object-fit: contain;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  letter-spacing: 1px;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Estilo dos botões/links do menu */
.menu-link {
  padding: 12px 15px;
  border-radius: 8px;
  color: #e0e0e0;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
}

.menu-link:hover,
.menu-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateX(5px);
}

.menu-error {
  color: #ff4444;
  font-style: italic;
  padding: 10px;
}

/* Transição do fade da overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>