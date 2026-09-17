<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
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

      <div v-else class="groups-container-glass stagger-in-2">
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Meus Grupos</span>
              </div>
              <h1 class="welcome-title">Turmas e Grupos Vinculados</h1>
              <p class="welcome-subtitle">Acompanhe as turmas das quais você faz parte e veja seus colegas e orientadores.</p>
            </div>
          </div>
        </div>

        <!-- Seção de Grupos -->
        <section class="content-section">
          <div class="section-header">
            <div class="section-title-group">
              <h3 class="section-title">Grupos de Estudo</h3>
              <span class="count-badge">{{ grupos.length }}</span>
            </div>
          </div>

          <div v-if="loadingGrupos" class="sub-loading-glass">
            <div class="mini-spinner"></div>
            <span>Carregando seus grupos...</span>
          </div>

          <div v-else class="cards-grid">
            <div 
              v-for="grupo in grupos" 
              :key="grupo.id" 
              class="glass-card grupo-card clickable-card" 
              @click="abrirModal(grupo)"
            >
              <div class="card-top">
                <div class="group-icon-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span class="member-count-badge">
                  {{ grupo.participantes ? grupo.participantes.length : 0 }} participante(s)
                </span>
              </div>

              <h4 class="grupo-title notranslate" translate="no">{{ grupo.nome }}</h4>
              
              <div class="facilitador-info-pill">
                <span class="f-label">Facilitador:</span>
                <span class="f-name notranslate" translate="no">{{ grupo.facilitadorNome || 'Orientador' }}</span>
              </div>

              <div class="card-footer-action">
                <span class="btn-action-text">Ver Participantes &rarr;</span>
              </div>
            </div>

            <div v-if="grupos.length === 0" class="empty-state-glass">
              <span class="empty-emoji">👥</span>
              <h3>Você ainda não possui grupos</h3>
              <p>Nenhum facilitador adicionou sua conta a um grupo de alunos ainda.</p>
            </div>
          </div>

          <!-- Modal Apple Glass de Detalhes do Grupo -->
          <Teleport to="body">
            <Transition name="glass-modal">
              <div v-if="modalAberto" class="modal-overlay" @click="fecharModal">
                <div class="modal-glass-container" @click.stop>
                  
                  <div class="modal-header">
                    <div class="modal-title-wrapper">
                      <span class="modal-tag">DETALHES DA TURMA</span>
                      <h3 class="modal-title notranslate" translate="no">{{ grupoSelecionado?.nome }}</h3>
                    </div>
                    <button class="close-btn" @click="fecharModal" aria-label="Fechar modal">&times;</button>
                  </div>

                  <div class="modal-body">
                    <div class="facilitador-hero-glass">
                      <span class="f-label">Facilitador Responsável</span>
                      <span class="f-hero-name notranslate" translate="no">{{ grupoSelecionado?.facilitadorNome || 'Orientador da Turma' }}</span>
                    </div>
                    
                    <h4 class="section-subtitle" style="margin-top: 20px;">
                      Participantes do Grupo ({{ grupoSelecionado?.participantes?.length || 0 }})
                    </h4>
                    
                    <div class="participants-list-glass">
                      <div v-for="p in grupoSelecionado?.participantes" :key="p.id" class="member-item-glass">
                        <div class="p-avatar-glass notranslate" translate="no">{{ (p.nome || 'U').charAt(0).toUpperCase() }}</div>
                        <div class="p-info-glass">
                          <span class="p-name-glass notranslate" translate="no">{{ p.nome }}</span>
                          <span class="p-email-glass notranslate" translate="no">{{ p.email }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </Transition>
          </Teleport>

        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useAuthStore } from '../stores/auth'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const userData = ref({})

const grupos = ref([])
const loadingGrupos = ref(true)

const modalAberto = ref(false)
const grupoSelecionado = ref(null)

const abrirModal = (grupo) => {
  grupoSelecionado.value = grupo
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  grupoSelecionado.value = null
}

const initials = computed(() => {
  const nome = (userData.value.nome || '?').trim()
  const nomes = nome.split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      await fetchGrupos(userData.value)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
  } finally {
    isLoading.value = false
  }
})

const fetchGrupos = async (userObj) => {
  try {
    let todosGrupos = {}
    if (userObj.instituicaoId) {
      const gruposRef = dbRef(database, `instituicoes/${userObj.instituicaoId}/grupos`)
      const snapshot = await get(gruposRef)
      if (snapshot.exists()) {
        todosGrupos = snapshot.val()
      }
    } else {
      const gruposRef = dbRef(database, 'grupos')
      const snapshot = await get(gruposRef)
      if (snapshot.exists()) {
        todosGrupos = snapshot.val()
      }
    }

    if (Object.keys(todosGrupos).length > 0) {
      grupos.value = Object.keys(todosGrupos)
        .map(key => ({ id: key, ...todosGrupos[key] }))
        .filter(g => {
          if (g.participantes && Array.isArray(g.participantes)) {
            return g.participantes.some(p => p.id === userObj.id)
          }
          if (g.membros) {
            return g.membros[userObj.id]
          }
          return false
        })
    }
  } catch (error) {
    console.error("Erro ao buscar grupos do professor:", error)
  } finally {
    loadingGrupos.value = false
  }
}
</script>

<style scoped>
.groups-container-glass {
  width: 100%;
  animation: glassFadeUp 0.5s ease both;
}

.profile-hero-glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
  margin-bottom: 32px;
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-glass {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0071e3 0%, #3b82f6 50%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
  flex-shrink: 0;
  overflow: hidden;
  padding: 4px;
  text-align: center;
  letter-spacing: -0.5px;
}

.welcome-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-role-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(239, 246, 255, 0.9);
  border: 1px solid rgba(191, 219, 254, 0.9);
  color: #0071e3;
  align-self: flex-start;
  margin-bottom: 4px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0071e3;
  box-shadow: 0 0 8px #0071e3;
}

.welcome-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.content-section { width: 100%; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.count-badge {
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  padding: 2px 8px;
  border-radius: 9999px;
}

/* Cards Grid Glass */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.glass-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px rgba(0, 113, 227, 0.1);
  border-color: rgba(191, 219, 254, 0.8);
}

.clickable-card { cursor: pointer; }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.group-icon-pill {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  border: 1px solid #bfdbfe;
}

.group-icon-pill svg { width: 20px; height: 20px; }

.member-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: #0071e3;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
}

.grupo-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.facilitador-info-pill {
  background: rgba(248, 250, 252, 0.85);
  border-radius: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
  min-width: 0;
}

.f-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  word-break: break-word;
}

.f-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.card-footer-action {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.btn-action-text {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0071e3;
}

.sub-loading-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #64748b;
  font-weight: 500;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid rgba(0, 113, 227, 0.2);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state-glass {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 2px dashed rgba(203, 213, 225, 0.8);
  border-radius: 24px;
  color: #64748b;
}

.empty-emoji { font-size: 3rem; display: block; margin-bottom: 12px; }

/* Modal Apple Glass */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-glass-container {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
  width: 100%;
  max-width: 520px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 22px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-wrapper { display: flex; flex-direction: column; gap: 2px; }
.modal-tag { font-size: 0.7rem; font-weight: 800; color: #0071e3; letter-spacing: 0.8px; }
.modal-title { margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; }

.close-btn {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }

.modal-body { padding: 24px 28px; overflow-y: auto; }

.facilitador-hero-glass {
  background: rgba(239, 246, 255, 0.85);
  border: 1px solid rgba(191, 219, 254, 0.9);
  padding: 14px 18px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.f-hero-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0071e3;
}

.section-subtitle {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.participants-list-glass {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
}

.member-item-glass {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
}

.p-avatar-glass {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.84rem;
}

.p-info-glass { display: flex; flex-direction: column; }
.p-name-glass { font-size: 0.88rem; font-weight: 700; color: #0f172a; }
.p-email-glass { font-size: 0.76rem; color: #64748b; }

.glass-modal-enter-active, .glass-modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-modal-enter-from, .glass-modal-leave-to { opacity: 0; transform: scale(0.96) translateY(10px); }
</style>
