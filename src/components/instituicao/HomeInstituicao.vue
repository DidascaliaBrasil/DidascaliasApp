<template>
  <div class="role-view">
    
    <!-- Hero Profile Header com Glassmorphism -->
    <div class="profile-hero-glass">
      <div class="profile-header-content">
        <div class="user-avatar-glass">{{ initials }}</div>
        <div class="welcome-texts">
          <div class="badge-role-tag">
            <span class="pulse-dot"></span>
            <span>Painel Institucional</span>
          </div>
          <h1 class="welcome-title">
            Bem-vindo(a), <span class="highlight-gradient">{{ userData.nomeFaculdade || userData.nomeInstituicao || 'Gestor' }}</span>!
          </h1>
          <p class="welcome-subtitle">Gerencie membros, salas de aula VR e dispositivos vinculados à sua instituição.</p>
        </div>
      </div>

      <!-- Quick Action Cards no Topo -->
      <div class="quick-actions-bar">
        <router-link to="/resultados-instituicao" class="quick-btn primary" title="Ver relatórios completos de desempenho VR">
          <span class="q-icon">📊</span>
          <div class="q-text">
            <span class="q-title">Relatórios & Desempenho</span>
            <span class="q-desc">Métricas gerais da instituição</span>
          </div>
        </router-link>
        <button class="quick-btn secondary" @click="$emit('abrir-linkar-oculos')" title="Sincronizar novos óculos VR">
          <span class="q-icon">🥽</span>
          <div class="q-text">
            <span class="q-title">Sincronizar Óculos</span>
            <span class="q-desc">Aprovar novos VRs</span>
          </div>
        </button>
        <button class="quick-btn tertiary" @click="$emit('abrir-gerenciar-oculos')" title="Gerenciar óculos da instituição">
          <span class="q-icon">⚙️</span>
          <div class="q-text">
            <span class="q-title">Gerenciar Óculos</span>
            <span class="q-desc">Renomear ou desvincular</span>
          </div>
        </button>
        <router-link to="/gerenciar-grupos" class="quick-btn" title="Ver grupos cadastrados">
          <span class="q-icon">👥</span>
          <div class="q-text">
            <span class="q-title">Grupos de Alunos</span>
            <span class="q-desc">Acompanhar turmas</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Estatísticas Rápidas em Glass Badges -->
    <div class="stats-row">
      <div class="stat-pill">
        <span class="stat-num">{{ membros.length }}</span>
        <span class="stat-label">Membros Cadastrados</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ salasVR.length }}</span>
        <span class="stat-label">Salas VR Ativas</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ totalFacilitadores }}</span>
        <span class="stat-label">Facilitadores</span>
      </div>
    </div>

    <!-- Seção de Membros com Barra de Filtros -->
    <section class="content-section">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Membros da Instituição</h3>
          <span class="count-badge">{{ membrosFiltrados.length }}</span>
        </div>
        <div class="filter-tabs">
          <button 
            :class="['filter-tab', { active: filtroMembro === 'todos' }]" 
            @click="filtroMembro = 'todos'"
          >
            Todos
          </button>
          <button 
            :class="['filter-tab', { active: filtroMembro === 'facilitador' }]" 
            @click="filtroMembro = 'facilitador'"
          >
            Facilitadores
          </button>
          <button 
            :class="['filter-tab', { active: filtroMembro === 'usuario' }]" 
            @click="filtroMembro = 'usuario'"
          >
            Professores / Alunos
          </button>
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
          class="glass-card membro-card"
        >
          <div class="card-top">
            <span :class="['role-pill', `pill-${(membro.tipoCadastro || membro.tipo || '').toLowerCase()}`]">
              {{ membro.tipoCadastro || membro.tipo || 'Membro' }}
            </span>
            <div class="membro-avatar-mini">
              {{ (membro.nome || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
          <span class="membro-name">{{ membro.nome }}</span>
          <span class="membro-email" :title="membro.email">{{ membro.email }}</span>
        </div>

        <div v-if="membrosFiltrados.length === 0" class="empty-state-glass">
          <span class="empty-emoji">👥</span>
          <p>Nenhum membro encontrado com os filtros atuais.</p>
        </div>
      </div>
    </section>

    <!-- Seção de Salas VR -->
    <section class="content-section" style="margin-top: 36px;">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Salas de Aula VR</h3>
          <span class="count-badge">{{ salasVR.length }}</span>
        </div>
        <p class="section-hint">Clique em uma sala para vincular óculos e aluno ativo na sessão.</p>
      </div>

      <div v-if="loadingSalas" class="sub-loading-glass">
        <div class="mini-spinner"></div>
        <span>Carregando salas VR...</span>
      </div>

      <div v-else class="cards-grid">
        <div 
          v-for="sala in salasVR" 
          :key="sala.id" 
          class="glass-card sala-card clickable-card"
          @click="abrirDetalhesSala(sala)"
        >
          <div class="card-top">
            <span class="role-pill pill-vr">SALA VR</span>
            <span class="target-tag">
              {{ sala.targetType === 'grupo' ? '👥 Grupo' : '👤 Individual' }}
            </span>
          </div>

          <h4 class="sala-name">{{ sala.roomName || 'Sala sem nome' }}</h4>
          
          <div class="sala-chips-row">
            <span class="chip-info">Mesas: {{ sala.numDesks || 0 }}</span>
            <span class="chip-info">Alunos: {{ (sala.numBoys || 0) + (sala.numGirls || 0) }}</span>
          </div>

          <div class="sala-footer-status">
            <span v-if="sala.activeHeadsetId" class="status-badge active-vr">
              🥽 Óculos Conectado
            </span>
            <span v-else class="status-badge pending-vr">
              ⚠️ Sem Óculos Vinculado
            </span>
            <span class="action-arrow">&rarr;</span>
          </div>
        </div>

        <div v-if="salasVR.length === 0" class="empty-state-glass">
          <span class="empty-emoji">🥽</span>
          <p>Nenhuma sala VR configurada nesta instituição pelos facilitadores.</p>
        </div>
      </div>
    </section>

    <!-- Modal Apple Glass de Configuração da Sessão Ativa -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="salaSelecionada" class="modal-overlay" @click.self="fecharDetalhesSala">
          <div class="modal-glass-container" @click.stop>
            
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">CONFIGURAÇÃO DE SESSÃO VR</span>
                <h3 class="modal-title">{{ salaSelecionada.roomName || 'Sala VR' }}</h3>
              </div>
              <button class="close-btn" @click="fecharDetalhesSala" aria-label="Fechar modal">&times;</button>
            </div>

            <div class="modal-body">
              <!-- Grid de Especificações da Sala -->
              <div class="vr-specs-glass">
                <div class="spec-item">
                  <span class="spec-label">Facilitador ID</span>
                  <span class="spec-value code-font">{{ salaSelecionada.facilitadorId }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Público</span>
                  <span class="spec-value">{{ salaSelecionada.targetType === 'grupo' ? 'Grupo / Turma' : 'Aluno Individual' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Meninos / Meninas</span>
                  <span class="spec-value">{{ salaSelecionada.numBoys }} 👦 / {{ salaSelecionada.numGirls }} 👧</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Mesas / Formato</span>
                  <span class="spec-value">{{ salaSelecionada.numDesks }} mesas (Formato {{ salaSelecionada.shape }})</span>
                </div>
              </div>

              <div class="divider-subtle"></div>
              
              <!-- Seção de Sessão Ativa -->
              <h4 class="section-subtitle">Vincular Dispositivo e Participante Ativo</h4>
              <p class="subtitle-hint">Defina qual óculos físico e qual estudante estará transmitindo/jogando nesta sessão.</p>

              <div v-if="loadingDetalhes" class="sub-loading-glass">
                <div class="mini-spinner"></div>
                <span>Carregando óculos e participantes...</span>
              </div>
              
              <div v-else class="active-config-form">
                
                <!-- Seleção do Óculos -->
                <div class="form-group-glass">
                  <label class="form-label">
                    <span class="label-icon">🥽</span>
                    Óculos VR Vinculado à Sessão
                  </label>
                  <select v-model="selectedActiveOculos" class="glass-select" :disabled="salvandoAtivos">
                    <option :value="null">Nenhum (Selecione um óculos cadastrado)</option>
                    <option v-for="oculos in oculosDisponiveis" :key="oculos.id" :value="oculos.id">
                      {{ oculos.modelo || 'Óculos VR' }} - N° {{ oculos.numero_oculos || oculos.id.substring(0, 6) }}
                    </option>
                  </select>
                  <p v-if="oculosDisponiveis.length === 0" class="empty-hint">Nenhum óculos cadastrado. Sincronize um novo dispositivo primeiro.</p>
                </div>
                
                <!-- Seleção de Participante Ativo -->
                <div class="form-group-glass">
                  <label class="form-label">
                    <span class="label-icon">👤</span>
                    Participante Ativo (Com o Óculos)
                  </label>
                  <div class="participants-scroll-list">
                    <label 
                      v-for="p in participantesSala" 
                      :key="p.id" 
                      :class="['participant-card-option', { 'is-selected': selectedActiveParticipant === p.id }]"
                    >
                      <input 
                        type="radio" 
                        name="activeParticipant" 
                        :value="p.id" 
                        v-model="selectedActiveParticipant" 
                        :disabled="salaSelecionada.targetType === 'aluno' || salvandoAtivos"
                      />
                      <div class="p-option-avatar">
                        {{ (p.nome || 'P').charAt(0).toUpperCase() }}
                      </div>
                      <div class="p-option-info">
                        <span class="p-option-name">{{ p.nome }}</span>
                        <span class="p-option-email">{{ p.email }}</span>
                      </div>
                      <span v-if="salaSelecionada.targetType === 'aluno'" class="p-option-tag">ALUNO FIXO</span>
                    </label>
                    <p v-if="participantesSala.length === 0" class="empty-hint">Nenhum participante disponível nesta turma.</p>
                  </div>
                </div>

                <!-- Feedback Toast -->
                <div class="feedback-toast" v-if="mensagemAtivos">
                  <p :class="['feedback-text', tipoMensagem]">{{ mensagemAtivos }}</p>
                </div>

                <!-- Botão de Salvar -->
                <button class="btn-save-session" @click="salvarConfiguracoesAtivas" :disabled="salvandoAtivos">
                  <span v-if="salvandoAtivos" class="btn-spinner"></span>
                  <span>{{ salvandoAtivos ? 'Salvando Configuração...' : 'Confirmar e Salvar Sessão' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { database } from '../../firebase' 
import { ref as dbRef, get, update } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

defineEmits(['abrir-linkar-oculos', 'abrir-gerenciar-oculos'])

const membros = ref([])
const loadingMembros = ref(true)
const filtroMembro = ref('todos')

const salasVR = ref([])
const loadingSalas = ref(true)
const salaSelecionada = ref(null)

// Session Config State
const participantesSala = ref([])
const oculosDisponiveis = ref([])
const loadingDetalhes = ref(false)
const selectedActiveParticipant = ref(null)
const selectedActiveOculos = ref(null)
const salvandoAtivos = ref(false)
const mensagemAtivos = ref('')
const tipoMensagem = ref('')

const initials = computed(() => {
  const nome = props.userData.nomeFaculdade || props.userData.nomeInstituicao || 'Gestor'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const totalFacilitadores = computed(() => {
  return membros.value.filter(m => 
    (m.tipoCadastro || m.tipo || '').toLowerCase().includes('facilitador')
  ).length
})

const membrosFiltrados = computed(() => {
  if (filtroMembro.value === 'todos') return membros.value
  return membros.value.filter(m => {
    const t = (m.tipoCadastro || m.tipo || '').toLowerCase()
    return t.includes(filtroMembro.value)
  })
})

const abrirDetalhesSala = async (sala) => {
  salaSelecionada.value = { ...sala }
  selectedActiveParticipant.value = sala.activeParticipantId || null
  selectedActiveOculos.value = sala.activeHeadsetId || null
  mensagemAtivos.value = ''
  
  loadingDetalhes.value = true
  participantesSala.value = []
  oculosDisponiveis.value = []

  try {
    // 1. Buscar Óculos da Instituição
    const oculosRef = dbRef(database, `instituicoes/${props.userData.id}/oculos`)
    const oculosSnap = await get(oculosRef)
    if (oculosSnap.exists()) {
      const dataO = oculosSnap.val()
      oculosDisponiveis.value = Object.keys(dataO).map(k => ({ id: k, ...dataO[k] }))
    }

    // 2. Buscar Participantes/Aluno
    if (sala.targetType === 'grupo') {
      const grupoRef = dbRef(database, `instituicoes/${props.userData.id}/grupos/${sala.targetId}/participantes`)
      const grupoSnap = await get(grupoRef)
      if (grupoSnap.exists()) {
        participantesSala.value = grupoSnap.val() || []
      }
    } else if (sala.targetType === 'aluno') {
      const userRef = dbRef(database, `usuarios/${sala.targetId}`)
      const userSnap = await get(userRef)
      if (userSnap.exists()) {
        const uData = userSnap.val()
        participantesSala.value = [{ id: sala.targetId, nome: uData.nome, email: uData.email }]
        selectedActiveParticipant.value = sala.targetId // Trava no aluno
      }
    }
  } catch (error) {
    console.error("Erro ao carregar dependências da sala:", error)
  } finally {
    loadingDetalhes.value = false
  }
}

const fecharDetalhesSala = () => {
  salaSelecionada.value = null
}

const salvarConfiguracoesAtivas = async () => {
  if (salaSelecionada.value.targetType === 'grupo' && !selectedActiveParticipant.value) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Selecione o participante que estará ativo no jogo.'
    return
  }

  salvandoAtivos.value = true
  mensagemAtivos.value = ''

  try {
    const updates = {}
    let mensagemExtra = ''
    
    // Garante que o óculos selecionado não está ativo em nenhuma outra sala globalmente
    if (selectedActiveOculos.value) {
      const todasSalasRef = dbRef(database, 'classroom_configs')
      const todasSnap = await get(todasSalasRef)
      if (todasSnap.exists()) {
        const todas = todasSnap.val()
        for (const sId in todas) {
          if (sId !== salaSelecionada.value.id && todas[sId].activeHeadsetId === selectedActiveOculos.value) {
            updates[`classroom_configs/${sId}/activeHeadsetId`] = null
            mensagemExtra = ` (Óculos movido da sala anterior)`
          }
        }
      }
    }

    updates[`classroom_configs/${salaSelecionada.value.id}/activeParticipantId`] = selectedActiveParticipant.value
    updates[`classroom_configs/${salaSelecionada.value.id}/activeHeadsetId`] = selectedActiveOculos.value || null

    await update(dbRef(database), updates)

    tipoMensagem.value = 'success'
    mensagemAtivos.value = 'Configuração da sessão salva com sucesso!' + mensagemExtra
    
    await fetchSalas()
  } catch (error) {
    console.error("Erro ao salvar configurações ativas:", error)
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => { mensagemAtivos.value = '' }, 5000)
  }
}

const fetchSalas = async () => {
  try {
    const salasRef = dbRef(database, 'classroom_configs')
    const salasSnap = await get(salasRef)
    if (salasSnap.exists()) {
      const todasSalas = salasSnap.val()
      salasVR.value = Object.keys(todasSalas)
        .map(key => ({ id: key, ...todasSalas[key] }))
        .filter(s => {
          return String(s.instituicaoId) === String(props.userData.id) || 
                 String(s.instituicaoId) === String(props.userData.instituicaoId)
        })
    }
  } catch (error) {
    console.error("Erro ao buscar salas VR:", error)
  }
}

onMounted(async () => {
  try {
    const usersRef = dbRef(database, 'usuarios')
    const snapshot = await get(usersRef)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      membros.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.instituicaoId === props.userData.id && 
          (u.tipoCadastro === 'Facilitador' || u.tipoCadastro === 'Usuario' || 
           u.tipo === 'Facilitador' || u.tipo === 'Usuario')
        )
    }
    
    await fetchSalas()
  } catch (error) {
    console.error("Erro ao buscar dados da instituição:", error)
  } finally {
    loadingMembros.value = false
    loadingSalas.value = false
  }
})
</script>

<style scoped>
.role-view {
  width: 100%;
  animation: glassFadeUp 0.5s ease both;
}

/* Hero Header Glass */
.profile-hero-glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
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
  font-size: 1.8rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
  flex-shrink: 0;
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

.highlight-gradient {
  background: linear-gradient(135deg, #0071e3 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

/* Quick Actions Bar */
.quick-actions-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.7);
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.95);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 113, 227, 0.12);
}

.quick-btn.primary:hover { border-color: rgba(0, 113, 227, 0.4); background: #eff6ff; }
.quick-btn.secondary:hover { border-color: rgba(16, 185, 129, 0.4); background: #ecfdf5; }
.quick-btn.tertiary:hover { border-color: rgba(139, 92, 246, 0.4); background: #f5f3ff; }

.q-icon { font-size: 1.5rem; }
.q-text { display: flex; flex-direction: column; text-align: left; }
.q-title { font-size: 0.92rem; font-weight: 700; color: #0f172a; }
.q-desc { font-size: 0.76rem; color: #64748b; }

/* Stats Row */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 32px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  padding: 10px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.stat-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0071e3;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

/* Content Sections */
.content-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
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
  letter-spacing: -0.3px;
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

.section-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  background: rgba(241, 245, 249, 0.8);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  gap: 4px;
}

.filter-tab {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Cards Grid Glass */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

.clickable-card {
  cursor: pointer;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.role-pill {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 9999px;
}

.pill-facilitador { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.pill-usuario { background: #eff6ff; color: #0071e3; border: 1px solid #bfdbfe; }
.pill-vr { background: linear-gradient(135deg, #eff6ff, #f0fdf4); color: #0071e3; border: 1px solid #bfdbfe; }

.membro-avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.membro-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.membro-email {
  font-size: 0.84rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.target-tag {
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
  background: rgba(241, 245, 249, 0.8);
  padding: 3px 8px;
  border-radius: 6px;
}

.sala-name {
  font-size: 1.18rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.sala-chips-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.chip-info {
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
  background: rgba(241, 245, 249, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
}

.sala-footer-status {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 3px 8px;
}

.status-badge.active-vr { background: #ecfdf5; color: #059669; }
.status-badge.pending-vr { background: #fffbeb; color: #d97706; }

.action-arrow {
  font-size: 1.2rem;
  color: #0071e3;
  transition: transform 0.2s ease;
}

.sala-card:hover .action-arrow {
  transform: translateX(4px);
}

/* Loading & Empty States Glass */
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
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 2px dashed rgba(203, 213, 225, 0.8);
  border-radius: 20px;
  color: #64748b;
}

.empty-emoji { font-size: 2.4rem; display: block; margin-bottom: 8px; }

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
  max-width: 540px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
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

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.8px;
}

.modal-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
}

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

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
}

.vr-specs-glass {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: rgba(248, 250, 252, 0.8);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
}

.spec-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
}

.code-font {
  font-family: monospace;
  font-size: 0.8rem;
  color: #0071e3;
}

.divider-subtle {
  height: 1px;
  background: rgba(226, 232, 240, 0.8);
  margin: 20px 0;
}

.section-subtitle {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.subtitle-hint {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 18px 0;
}

.active-config-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group-glass {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.label-icon { font-size: 1.1rem; }

.glass-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid rgba(203, 213, 225, 0.8);
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.glass-select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12);
}

.participants-scroll-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.participant-card-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.participant-card-option:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.participant-card-option.is-selected {
  background: #eff6ff;
  border-color: #0071e3;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.1);
}

.participant-card-option input[type="radio"] {
  accent-color: #0071e3;
  width: 16px;
  height: 16px;
}

.p-option-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.p-option-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.p-option-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.p-option-email {
  font-size: 0.76rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-option-tag {
  font-size: 0.68rem;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  padding: 3px 8px;
  border-radius: 6px;
}

.empty-hint {
  font-size: 0.8rem;
  color: #ef4444;
  font-style: italic;
  margin: 4px 0 0 0;
}

.btn-save-session {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 113, 227, 0.25);
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-save-session:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 113, 227, 0.35);
}

.btn-save-session:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.feedback-toast {
  margin-top: 4px;
}

.feedback-text {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  text-align: center;
}

.feedback-text.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-text.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* Modal Transitions */
.glass-modal-enter-active, .glass-modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-modal-enter-from, .glass-modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(10px);
}
</style>