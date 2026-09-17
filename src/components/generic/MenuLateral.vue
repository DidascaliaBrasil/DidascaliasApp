<template>
  <div>
    <!-- Botão Trigger Flutuante Glass -->
    <button class="menu-trigger" @click="abrirMenu" aria-label="Abrir Menu de Navegação">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon">
        <line x1="4" y1="7" x2="20" y2="7"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="17" x2="20" y2="17"></line>
      </svg>
    </button>

    <!-- Overlay Glass com Blur Suave -->
    <Transition name="fade-overlay">
      <div v-if="menuAberto" class="menu-overlay" @click="fecharMenu"></div>
    </Transition>

    <!-- Drawer Lateral Apple Glass -->
    <aside :class="['menu-lateral', { 'is-open': menuAberto }]" @click="lidarCliqueMenu">
      
      <div class="menu-body">
        <!-- Cabeçalho do Menu com Logo e Botão de Fechar -->
        <div class="menu-header">
          <div class="brand-wrapper">
            <img src="../../assets/Didas_Logo.png" alt="Logo Didascalias" class="menu-logo" />
            <div class="brand-info">
              <span class="brand-name notranslate" translate="no">Didascalias</span>
              <span class="brand-tagline">Virtual Reality</span>
            </div>
          </div>
          <button class="btn-close-menu" @click="fecharMenu" aria-label="Fechar menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Badge de Perfil / Cargo Ativo -->
        <div class="role-badge-container">
          <div :class="['role-badge', `role-${tipoConta}`, { 'role-plus': userData?.FacilitadorPlus }]">
            <span class="status-indicator"></span>
            <span class="role-text">{{ roleDisplayName }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Navegação com Ícones SVG Estilizados -->
        <nav class="menu-nav">
          <!-- LINKS INSTITUIÇÃO -->
          <template v-if="tipoConta === 'instituicao'">
            <div class="nav-section-label">Painel Institucional</div>
            <router-link to="/home" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span class="link-label">Visão Geral</span>
            </router-link>

            <router-link to="/resultados-instituicao" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 20V10"></path>
                  <path d="M12 20V4"></path>
                  <path d="M6 20v-6"></path>
                </svg>
              </span>
              <span class="link-label">Relatórios & Desempenho VR</span>
              <span class="badge-action">Novo</span>
            </router-link>

            <router-link to="/gerenciar-grupos" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <span class="link-label">Grupos da Instituição</span>
            </router-link>

            <div class="nav-section-label" style="margin-top: 12px;">Dispositivos VR</div>
            <button class="menu-link btn-menu" @click="abrirLinkar">
              <span class="link-icon icon-vr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              <span class="link-label">Sincronizar Óculos</span>
              <span class="badge-action">Novo</span>
            </button>

            <button class="menu-link btn-menu" @click="abrirGerenciar">
              <span class="link-icon icon-vr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              <span class="link-label">Gerenciar Óculos</span>
            </button>
          </template>

          <!-- LINKS FACILITADOR -->
          <template v-else-if="tipoConta === 'facilitador'">
            <div class="nav-section-label">Ambiente do Facilitador</div>
            <router-link to="/home" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span class="link-label">Visão Geral</span>
            </router-link>

            <router-link to="/resultados-facilitador" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </span>
              <span class="link-label">Resultados das Salas VR</span>
              <span class="badge-action">Novo</span>
            </router-link>

            <router-link to="/meus-grupos-facilitador" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </span>
              <span class="link-label">Criar Novo Grupo</span>
            </router-link>

            <router-link to="/criar-sala" class="menu-link" @click="fecharMenu">
              <span class="link-icon icon-vr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
              <span class="link-label">Criar Sala VR</span>
            </router-link>
          </template>

          <!-- LINKS USUÁRIO / PROFESSOR -->
          <template v-else-if="tipoConta === 'usuario'">
            <div class="nav-section-label">Espaço de Aprendizagem</div>
            <router-link to="/home" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span class="link-label">Início</span>
            </router-link>

            <router-link to="/meus-resultados" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              <span class="link-label">Meus Resultados VR</span>
              <span class="badge-action">Novo</span>
            </router-link>

            <router-link to="/meus-grupos-usuario" class="menu-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <span class="link-label">Meus Grupos</span>
            </router-link>
          </template>

          <template v-else>
            <p class="menu-error">Perfil não identificado.</p>
          </template>

          <!-- SEÇÃO ESPECIAL FACILITADOR PLUS -->
          <template v-if="userData?.FacilitadorPlus && tipoConta !== 'facilitador'">
            <div class="divider" style="margin: 16px 0 12px 0;"></div>
            <div class="nav-section-label plus-label">
              <span>Recursos Facilitador Plus</span>
              <span class="plus-chip">PLUS</span>
            </div>
            
            <router-link to="/resultados-facilitador" class="menu-link plus-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </span>
              <span class="link-label">Resultados VR (Plus)</span>
            </router-link>

            <router-link to="/meus-grupos-facilitador" class="menu-link plus-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </span>
              <span class="link-label">Criar Grupo (Plus)</span>
            </router-link>

            <router-link to="/criar-sala" class="menu-link plus-link" @click="fecharMenu">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
              <span class="link-label">Criar Sala VR</span>
            </router-link>
          </template>
        </nav>
      </div>

      <!-- Rodapé do Menu com Dados da Conta e Logout Glass -->
      <div class="menu-footer" @click.stop>
        <!-- Seletor de Idiomas Inline -->
        <LanguageSelector variant="inline" />

        <div class="account-card">
          <div class="avatar-glass notranslate" translate="no">
            {{ userInitial }}
          </div>
          <div class="account-details">
            <span class="account-name notranslate" translate="no" :title="userDisplayName">{{ userDisplayName }}</span>
            <span class="email-display notranslate" translate="no" :title="userData?.email">
              {{ userData?.email || 'Carregando...' }}
            </span>
          </div>
        </div>

        <button @click="handleLogout" class="btn-logout" aria-label="Sair da Conta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-logout">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Encerrar Sessão
        </button>
      </div>

    </aside>

    <!-- Modais VR Teleportados para o Body (disponíveis em qualquer rota da aplicação) -->
    <Teleport to="body">
      <Transition name="slide-side">
        <LinkarOculos 
          v-if="oculosModalStore.isLinkarOpen && instituicaoId" 
          :instituicaoId="instituicaoId"
          @fechar="oculosModalStore.fecharLinkar()"
        />
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="slide-side">
        <GerenciarOculos 
          v-if="oculosModalStore.isGerenciarOpen && instituicaoId" 
          :instituicaoId="instituicaoId"
          @fechar="oculosModalStore.fecharGerenciar()"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'
import { useAuthStore } from '../../stores/auth'
import { useOculosModalStore } from '../../stores/oculosModal'
import LanguageSelector from './LanguageSelector.vue'
import LinkarOculos from '../instituicao/LinkarOculos.vue'
import GerenciarOculos from '../instituicao/GerenciarOculos.vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['abrir-linkar-oculos', 'abrir-gerenciar-oculos'])

const router = useRouter()
const authStore = useAuthStore()
const oculosModalStore = useOculosModalStore()
const menuAberto = ref(false)

const instituicaoId = computed(() => {
  return props.userData?.instituicaoId || props.userData?.id || ''
})

const tipoConta = computed(() => {
  if (!props.userData.tipo) return 'indefinido'
  return String(props.userData.tipo)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
})

const roleDisplayName = computed(() => {
  if (props.userData?.FacilitadorPlus) return 'Facilitador Plus'
  if (tipoConta.value === 'instituicao') return 'Instituição'
  if (tipoConta.value === 'facilitador') return 'Facilitador'
  if (tipoConta.value === 'usuario') return 'Professor / Usuário'
  return 'Conta Ativa'
})

const userDisplayName = computed(() => {
  return props.userData?.nomeFaculdade || props.userData?.nomeInstituicao || props.userData?.nome || 'Usuário'
})

const userInitial = computed(() => {
  const name = userDisplayName.value || props.userData?.email || 'U'
  return name.charAt(0).toUpperCase()
})

const abrirMenu = () => {
  menuAberto.value = true
}

const fecharMenu = () => {
  menuAberto.value = false
}

const lidarCliqueMenu = (event) => {
  if (event.target.tagName !== 'A' && event.target.tagName !== 'BUTTON' && !event.target.closest('a') && !event.target.closest('button')) {
    fecharMenu()
  }
}

const abrirLinkar = () => {
  fecharMenu()
  oculosModalStore.abrirLinkar()
  emit('abrir-linkar-oculos')
}

const abrirGerenciar = () => {
  fecharMenu()
  oculosModalStore.abrirGerenciar()
  emit('abrir-gerenciar-oculos')
}

const handleLogout = async () => {
  try {
    authStore.clearProfile()
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error("Erro ao realizar logout:", error)
  }
}
</script>

<style scoped>
/* Botão Trigger Flutuante */
.menu-trigger {
  position: fixed;
  top: 16px;
  left: 20px;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  color: #0071e3;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-trigger:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 12px 28px rgba(0, 113, 227, 0.18);
  border-color: rgba(0, 113, 227, 0.4);
}

.menu-icon {
  width: 22px;
  height: 22px;
}

/* Overlay Glass */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10001;
}

/* Drawer Lateral Sólido (Sem transparência) */
.menu-lateral {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  box-shadow: 16px 0 40px rgba(15, 23, 42, 0.16);
  z-index: 10002;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
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
  justify-content: space-between;
  margin-bottom: 20px;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-logo {
  width: 36px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 113, 227, 0.25));
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 0.7rem;
  font-weight: 600;
  color: #0071e3;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-close-menu {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-menu:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.btn-close-menu svg {
  width: 16px;
  height: 16px;
}

/* Role Badge */
.role-badge-container {
  margin-bottom: 16px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: #475569;
}

.role-badge .status-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
}

.role-badge.role-instituicao {
  background: rgba(239, 246, 255, 0.85);
  border-color: rgba(191, 219, 254, 0.9);
  color: #0071e3;
}
.role-badge.role-instituicao .status-indicator {
  background: #0071e3;
  box-shadow: 0 0 8px #0071e3;
}

.role-badge.role-facilitador {
  background: rgba(236, 253, 245, 0.85);
  border-color: rgba(167, 243, 208, 0.9);
  color: #059669;
}
.role-badge.role-facilitador .status-indicator {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.role-badge.role-plus {
  background: linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(245, 243, 255, 0.95));
  border-color: rgba(196, 181, 253, 0.9);
  color: #7c3aed;
}
.role-badge.role-plus .status-indicator {
  background: #8b5cf6;
  box-shadow: 0 0 8px #8b5cf6;
}

.role-badge.role-usuario {
  background: rgba(240, 249, 255, 0.85);
  border-color: rgba(186, 230, 253, 0.9);
  color: #0284c7;
}
.role-badge.role-usuario .status-indicator {
  background: #0ea5e9;
  box-shadow: 0 0 8px #0ea5e9;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.9), transparent);
  margin-bottom: 18px;
}

/* Navegação */
.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  padding: 8px 12px 4px 12px;
}

.nav-section-label.plus-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8b5cf6;
}

.plus-chip {
  font-size: 0.65rem;
  background: #8b5cf6;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 800;
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  color: #475569;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
  background: transparent;
}

.link-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.link-icon svg {
  width: 18px;
  height: 18px;
}

.link-label {
  flex: 1;
}

.badge-action {
  font-size: 0.68rem;
  font-weight: 700;
  background: #eff6ff;
  color: #0071e3;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #0071e3;
  border-color: rgba(191, 219, 254, 0.7);
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
  transform: translateX(4px);
}

.menu-link:hover .link-icon {
  color: #0071e3;
  transform: scale(1.1);
}

.menu-link.router-link-active {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.8));
  color: #0071e3;
  border-color: rgba(147, 197, 253, 0.9);
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.12);
}

.menu-link.router-link-active .link-icon {
  color: #0071e3;
}

.plus-link:hover {
  color: #7c3aed;
  border-color: #ddd6fe;
  background: #f5f3ff;
}
.plus-link:hover .link-icon {
  color: #7c3aed;
}

/* Rodapé do Menu */
.menu-footer {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.avatar-glass {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0071e3 0%, #3b82f6 50%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 113, 227, 0.25);
}

.account-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.account-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-display {
  font-size: 0.76rem;
  color: #64748b;
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
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #fee2e2;
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.icon-logout {
  width: 16px;
  height: 16px;
}

.menu-error {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 10px;
  background: #fef2f2;
  border-radius: 10px;
  text-align: center;
}

.fade-overlay-enter-active, .fade-overlay-leave-active { 
  transition: opacity 0.3s ease; 
}
.fade-overlay-enter-from, .fade-overlay-leave-to { 
  opacity: 0; 
}
</style>