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
                <span>Criação de Grupos e Turmas</span>
              </div>
              <h1 class="welcome-title">Criar Novo Grupo de Alunos</h1>
              <p class="welcome-subtitle">Nomeie sua turma e selecione os participantes cadastrados na sua instituição.</p>
            </div>
          </div>
        </div>

        <!-- Card de Configuração do Nome do Grupo -->
        <div class="glass-action-card">
          <div class="group-input-row">
            <div class="input-with-icon">
              <span class="input-prefix-icon">✏️</span>
              <input 
                v-model="novoGrupoNome" 
                type="text" 
                placeholder="Insira o nome do grupo ou turma (ex: Turma 101 - Manhã)" 
                class="glass-text-input" 
              />
            </div>
            
            <button 
              @click="criarGrupo" 
              class="btn-save-group-glass" 
              :disabled="isCreatingGroup || !novoGrupoNome.trim() || selectedMembers.length === 0"
            >
              <span v-if="isCreatingGroup" class="spinner-btn"></span>
              <span>{{ isCreatingGroup ? 'Salvando...' : 'Salvar Grupo' }}</span>
              <span class="selected-counter" v-if="selectedMembers.length > 0">
                {{ selectedMembers.length }}
              </span>
            </button>
          </div>

          <div v-if="mensagemGrupo" :class="['feedback-toast-glass', { 'error': mensagemGrupo.includes('Erro') || mensagemGrupo.includes('Selecione') || mensagemGrupo.includes('vazio'), 'success': !mensagemGrupo.includes('Erro') && !mensagemGrupo.includes('Selecione') && !mensagemGrupo.includes('vazio') }]">
            {{ mensagemGrupo }}
          </div>
        </div>

        <!-- Seção de Seleção de Participantes -->
        <section class="selection-section">
          <div class="selection-header-glass">
            <div class="selection-title-group">
              <h3 class="section-title">Selecionar Participantes da Instituição</h3>
              <span class="selected-pill">
                {{ selectedMembers.length }} selecionado(s) de {{ membros.length }}
              </span>
            </div>

            <!-- Busca Instantânea -->
            <div class="search-box-glass">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Pesquisar por nome ou e-mail..." 
                class="search-input-field" 
              />
            </div>
          </div>

          <div v-if="loadingMembros" class="sub-loading-glass">
            <div class="mini-spinner"></div>
            <span>Carregando membros da instituição...</span>
          </div>

          <div v-else class="cards-grid">
            <div 
              v-for="membro in membrosFiltrados" 
              :key="membro.id" 
              :class="['glass-card member-select-card', { 'is-selected': isSelected(membro.id) }]"
              @click="toggleSelection(membro.id)"
            >
              <div class="card-top">
                <span :class="['role-pill', `pill-${(membro.tipoCadastro || membro.tipo || '').toLowerCase()}`]">
                  {{ membro.tipoCadastro || membro.tipo || 'Aluno' }}
                </span>
                
                <div class="glass-checkbox">
                  <svg v-if="isSelected(membro.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <div class="member-profile-row">
                <div class="membro-avatar-mini notranslate" translate="no">
                  {{ (membro.nome || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="member-meta">
                  <span class="membro-name notranslate" translate="no">{{ membro.nome }}</span>
                  <span class="membro-email notranslate" translate="no" :title="membro.email">{{ membro.email }}</span>
                </div>
              </div>
            </div>

            <div v-if="membrosFiltrados.length === 0" class="empty-state-glass">
              <span class="empty-emoji">🔍</span>
              <p>Nenhum membro encontrado com o termo de pesquisa informado.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get, push, set, query, orderByChild, equalTo } from 'firebase/database'
import { useAuthStore } from '../stores/auth'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const userData = ref({})

const membros = ref([])
const loadingMembros = ref(true)

const novoGrupoNome = ref('')
const searchQuery = ref('')
const selectedMembers = ref([])
const isCreatingGroup = ref(false)
const mensagemGrupo = ref('')

const initials = computed(() => {
  const nome = (userData.value.nome || '?').trim()
  const nomes = nome.split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const membrosFiltrados = computed(() => {
  if (!searchQuery.value) return membros.value
  const query = searchQuery.value.toLowerCase()
  return membros.value.filter(m => 
    (m.nome && m.nome.toLowerCase().includes(query)) || 
    (m.email && m.email.toLowerCase().includes(query))
  )
})

const isSelected = (id) => selectedMembers.value.includes(id)

const toggleSelection = (id) => {
  if (isSelected(id)) {
    selectedMembers.value = selectedMembers.value.filter(mId => mId !== id)
  } else {
    selectedMembers.value.push(id)
  }
}

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      await fetchMembrosInstituicao(profile.instituicaoId)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
  } finally {
    isLoading.value = false
  }
})

const fetchMembrosInstituicao = async (instituicaoId) => {
  if (!instituicaoId) {
    loadingMembros.value = false
    return
  }
  
  try {
    const qUsers = query(dbRef(database, 'usuarios'), orderByChild('instituicaoId'), equalTo(instituicaoId))
    const snapshot = await get(qUsers)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      membros.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    } else {
      membros.value = []
    }
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
  } finally {
    loadingMembros.value = false
  }
}

const criarGrupo = async () => {
  if (!novoGrupoNome.value.trim()) {
    mensagemGrupo.value = "O nome do grupo não pode estar vazio."
    return
  }
  if (selectedMembers.value.length === 0) {
    mensagemGrupo.value = "Selecione ao menos um participante."
    return
  }
  
  isCreatingGroup.value = true
  mensagemGrupo.value = "Salvando grupo..."

  try {
    const instituicaoId = userData.value.instituicaoId
    if (!instituicaoId) throw new Error("Instituição não vinculada.")

    const gruposRef = dbRef(database, `instituicoes/${instituicaoId}/grupos`)
    const novoGrupoRef = push(gruposRef)
    
    const participantesData = selectedMembers.value.map(id => {
      const m = membros.value.find(user => user.id === id)
      return {
        id: m.id,
        nome: m.nome,
        email: m.email,
        tipo: m.tipoCadastro || m.tipo || 'Usuário'
      }
    })

    await set(novoGrupoRef, {
      nome: novoGrupoNome.value,
      facilitadorId: userData.value.id,
      facilitadorNome: userData.value.nome,
      participantes: participantesData,
      criadoEm: new Date().toISOString()
    })

    mensagemGrupo.value = "Grupo salvo com sucesso!"
    novoGrupoNome.value = ""
    selectedMembers.value = []
    
    setTimeout(() => {
      router.push('/home')
    }, 1500)
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    mensagemGrupo.value = "Erro ao salvar o grupo."
  } finally {
    isCreatingGroup.value = false
    setTimeout(() => { mensagemGrupo.value = "" }, 4000)
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
  margin-bottom: 28px;
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
  background: linear-gradient(135deg, #10b981 0%, #0071e3 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
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
  background: rgba(236, 253, 245, 0.9);
  border: 1px solid rgba(167, 243, 208, 0.9);
  color: #059669;
  align-self: flex-start;
  margin-bottom: 4px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
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

/* Action Card */
.glass-action-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 24px 28px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
  margin-bottom: 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-input-row {
  display: flex;
  gap: 14px;
}

.input-with-icon {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix-icon {
  position: absolute;
  left: 16px;
  font-size: 1.1rem;
}

.glass-text-input {
  width: 100%;
  padding: 14px 16px 14px 46px;
  border-radius: 14px;
  border: 2px solid rgba(203, 213, 225, 0.8);
  background: #ffffff;
  font-size: 0.98rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.25s ease;
}

.glass-text-input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12);
}

.btn-save-group-glass {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 113, 227, 0.25);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-save-group-glass:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 113, 227, 0.35);
}

.btn-save-group-glass:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.selected-counter {
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.8rem;
}

.spinner-btn {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.feedback-toast-glass {
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: center;
}

.feedback-toast-glass.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-toast-glass.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* Selection Section */
.selection-section {
  width: 100%;
}

.selection-header-glass {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.selection-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.selected-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #a7f3d0;
}

.search-box-glass {
  position: relative;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-input-field {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border-radius: 12px;
  border: 1.5px solid rgba(203, 213, 225, 0.8);
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input-field:focus {
  border-color: #0071e3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

/* Cards Grid Glass */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.glass-card.member-select-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 2px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.glass-card.member-select-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.9);
  border-color: #cbd5e1;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.glass-card.member-select-card.is-selected {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.9), rgba(209, 250, 229, 0.75));
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.18);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.glass-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid rgba(203, 213, 225, 0.9);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
}

.member-select-card.is-selected .glass-checkbox {
  background: #10b981;
  border-color: #10b981;
}

.glass-checkbox svg { width: 14px; height: 14px; }

.member-profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.membro-avatar-mini {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.member-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.membro-name {
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
  overflow-wrap: break-word;
}

.membro-email {
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 9999px;
}

.pill-facilitador { background: #ecfdf5; color: #059669; }
.pill-usuario { background: #eff6ff; color: #0071e3; }

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
  padding: 50px 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 2px dashed rgba(203, 213, 225, 0.8);
  border-radius: 20px;
  color: #64748b;
}

.empty-emoji { font-size: 2.5rem; display: block; margin-bottom: 8px; }

@media (max-width: 680px) {
  .group-input-row { flex-direction: column; }
  .btn-save-group-glass { padding: 14px; justify-content: center; }
  .search-box-glass { min-width: 100%; }
}
</style>
