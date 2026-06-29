<template>
  <div>
    <button class="menu-trigger" @click="abrirMenu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="menu-icon">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <Transition name="fade">
      <div v-if="menuAberto" class="menu-overlay" @click="fecharMenu"></div>
    </Transition>

    <aside :class="['menu-lateral', { 'is-open': menuAberto }]" @click="lidarCliqueMenu">
      
      <div class="menu-body">
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
            
            <button class="menu-link btn-menu" @click="abrirLinkar">Linkar Óculos</button>
            <button class="menu-link btn-menu" @click="abrirGerenciar">Gerenciar Óculos</button>
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
      </div>

      <div class="menu-footer" @click.stop>
        <div class="account-badge">
          <div class="avatar-mini">
            {{ userData?.email ? userData.email.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="account-details">
            <span class="email-display" :title="userData?.email">
              {{ userData?.email || 'carregando...' }}
            </span>
          </div>
        </div>

        <button @click="handleLogout" class="btn-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-logout">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sair da Conta
        </button>
      </div>

    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// Adicionado o evento de gerenciar óculos na emissão do componente
const emit = defineEmits(['abrir-linkar-oculos', 'abrir-gerenciar-oculos'])

const router = useRouter()
const menuAberto = ref(false)

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

const lidarCliqueMenu = (event) => {
  if (event.target.tagName !== 'A' && event.target.tagName !== 'BUTTON') {
    fecharMenu()
  }
}

const abrirLinkar = () => {
  fecharMenu()
  emit('abrir-linkar-oculos')
}

const abrirGerenciar = () => {
  fecharMenu()
  emit('abrir-gerenciar-oculos') // Emite o sinal para abrir a gerência
}

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error("Erro ao realizar logout:", error)
  }
}
</script>

<style scoped>
:root {
  --primary: #0066FF;
  --text-dark: #0f172a;
  --text-gray: #64748b;
  --border-color: #e2e8f0;
}

.menu-trigger {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #0066FF;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}

.menu-trigger:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 102, 255, 0.15);
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.menu-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  z-index: 10001;
}

.menu-lateral {
  position: fixed;
  top: 0; 
  left: 0;
  bottom: 0; 
  width: 290px;
  background: #ffffff; 
  border-right: 1px solid #e2e8f0;
  box-shadow: 12px 0 35px rgba(15, 23, 42, 0.08);
  z-index: 10002;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  padding-bottom: 32px; 
  box-sizing: border-box; 
  overflow-y: auto; 
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-lateral.is-open {
  transform: translateX(0);
}

.menu-body {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.menu-logo {
  width: 38px;
  height: auto;
  object-fit: contain;
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 24px;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-menu {
  background: none;
  border: 1px solid transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.menu-link {
  padding: 12px 14px;
  border-radius: 12px;
  color: #64748b;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.menu-link:hover,
.menu-link.router-link-active {
  background: #eff6ff; 
  color: #0066FF;
  border-color: #bfdbfe;
  transform: translateX(4px);
}

.menu-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066FF, #10b981);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.account-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.email-display {
  font-size: 0.85rem;
  color: #0f172a;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #ef4444;
  padding: 11px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.icon-logout {
  width: 16px;
  height: 16px;
}

.menu-error {
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 10px;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>