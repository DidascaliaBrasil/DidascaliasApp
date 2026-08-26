<template>
  <div class="role-view">
    
    <!-- Hero Profile Header com Glassmorphism -->
    <div :class="['profile-hero-glass', { 'plus-hero': userData?.FacilitadorPlus }]">
      <div class="profile-header-content">
        <div :class="['user-avatar-glass', { 'plus-avatar': userData?.FacilitadorPlus }]">
          {{ initials }}
        </div>
        <div class="welcome-texts">
          <div class="badge-row">
            <div :class="['badge-role-tag', { 'badge-plus': userData?.FacilitadorPlus }]">
              <span class="pulse-dot"></span>
              <span>{{ userData?.FacilitadorPlus ? 'Facilitador Plus VIP' : 'Facilitador de Grupos' }}</span>
            </div>
            <div class="inst-pill" v-if="nomeInstituicao">
              <span class="inst-icon">🏛️</span>
              <span>{{ nomeInstituicao }}</span>
            </div>
          </div>
          <h1 class="welcome-title">
            Bem-vindo(a), <span :class="['highlight-gradient', { 'plus-gradient': userData?.FacilitadorPlus }]">{{ userData.nome }}</span>!
          </h1>
          <p class="welcome-subtitle">Gerencie suas turmas, crie ambientes virtuais e configure sessões imersivas.</p>
        </div>
      </div>

      <!-- Quick Action Buttons no Topo -->
      <div class="quick-actions-bar">
        <router-link to="/resultados-facilitador" class="quick-btn primary" title="Ver resultados e desempenho das salas VR">
          <span class="q-icon">📊</span>
          <div class="q-text">
            <span class="q-title">Resultados das Salas</span>
            <span class="q-desc">Métricas e sessões de alunos</span>
          </div>
        </router-link>
        <router-link to="/criar-sala" class="quick-btn secondary" title="Criar novo ambiente VR">
          <span class="q-icon">🥽</span>
          <div class="q-text">
            <span class="q-title">Criar Sala VR</span>
            <span class="q-desc">Configurar ambiente 3D</span>
          </div>
        </router-link>
        <router-link to="/meus-grupos-facilitador" class="quick-btn tertiary" title="Criar novo grupo">
          <span class="q-icon">➕</span>
          <div class="q-text">
            <span class="q-title">Criar Novo Grupo</span>
            <span class="q-desc">Vincular participantes</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="stats-row">
      <div class="stat-pill">
        <span class="stat-num">{{ meusGrupos.length }}</span>
        <span class="stat-label">Meus Grupos Criados</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ minhasSalas.length }}</span>
        <span class="stat-label">Salas VR Ativas</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ totalAlunosAlcancados }}</span>
        <span class="stat-label">Alunos em Grupos</span>
      </div>
    </div>

    <!-- Seção de Meus Grupos -->
    <section class="content-section">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Meus Grupos</h3>
          <span class="count-badge">{{ meusGrupos.length }}</span>
        </div>
        <router-link to="/meus-grupos-facilitador" class="btn-create-pill">
          + Criar Grupo
        </router-link>
      </div>
      
      <div v-if="loadingGrupos" class="sub-loading-glass">
        <div class="mini-spinner"></div>
        <span>Carregando seus grupos...</span>
      </div>

      <div v-else class="cards-grid">
        <div 
          v-for="grupo in meusGrupos" 
          :key="grupo.id" 
          class="glass-card grupo-card clickable-card"
          @click="abrirDetalhes(grupo)"
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

          <h4 class="grupo-title">{{ grupo.nome }}</h4>
          <span class="date-created">Criado em: {{ formatDataCurta(grupo.criadoEm) }}</span>

          <div class="card-footer-action">
            <span class="btn-action-text">Gerenciar Grupo &rarr;</span>
          </div>
        </div>

        <div v-if="meusGrupos.length === 0" class="empty-state-glass">
          <span class="empty-emoji">👥</span>
          <h3>Você ainda não criou nenhum grupo</h3>
          <p>Crie um grupo para vincular alunos da instituição e associar a salas VR.</p>
          <router-link to="/meus-grupos-facilitador" class="btn-empty-action">
            Criar Primeiro Grupo
          </router-link>
        </div>
      </div>
    </section>

    <!-- Seção de Minhas Salas VR -->
    <section class="content-section" style="margin-top: 36px;">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Minhas Salas VR</h3>
          <span class="count-badge">{{ minhasSalas.length }}</span>
        </div>
        <router-link to="/criar-sala" class="btn-create-pill">
          + Nova Sala VR
        </router-link>
      </div>
      
      <div v-if="loadingSalas" class="sub-loading-glass">
        <div class="mini-spinner"></div>
        <span>Carregando salas configuradas...</span>
      </div>

      <div v-else class="cards-grid">
        <div 
          v-for="sala in minhasSalas" 
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

        <div v-if="minhasSalas.length === 0" class="empty-state-glass">
          <span class="empty-emoji">🥽</span>
          <h3>Nenhuma sala VR configurada</h3>
          <p>Crie um ambiente virtual para que os alunos possam participar com o óculos VR.</p>
          <router-link to="/criar-sala" class="btn-empty-action">
            Criar Minha Primeira Sala VR
          </router-link>
        </div>
      </div>
    </section>

    <!-- Side Panel Apple Glass de Detalhes e Gestão do Grupo -->
    <Teleport to="body">
      <Transition name="glass-slide">
        <div v-if="grupoSelecionado" class="side-panel-overlay" @click.self="fecharDetalhes">
          <div class="side-panel-glass">
            
            <!-- Header do Painel -->
            <div class="panel-header-glass">
              <div class="header-left">
                <span class="panel-kicker">GERENCIAR GRUPO</span>
                
                <!-- Edição inline de nome -->
                <div v-if="editandoNome" class="edit-name-group">
                  <input type="text" v-model="novoNomeGrupo" class="input-edit-name" placeholder="Nome do grupo" />
                  <div class="name-actions">
                    <button class="btn-name-save" @click="salvarNomeGrupo" :disabled="loadingAction" title="Salvar nome">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="btn-name-cancel" @click="cancelarEdicaoNome" :disabled="loadingAction" title="Cancelar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>

                <div v-else class="title-with-edit">
                  <h2 class="panel-title-text">{{ grupoSelecionado.nome }}</h2>
                  <button class="btn-icon-rename" title="Renomear Grupo" @click="iniciarEdicaoNome">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </div>
                
                <p class="data-badge">Criado em: {{ formatData(grupoSelecionado.criadoEm) }}</p>
              </div>

              <button class="btn-close-drawer" @click="fecharDetalhes" aria-label="Fechar painel">&times;</button>
            </div>
            
            <!-- Corpo do Painel -->
            <div class="panel-body-glass">
              <div class="members-header-row">
                <div class="members-title-group">
                  <h4 class="members-title">Participantes</h4>
                  <span class="count-badge">{{ grupoSelecionado.participantes ? grupoSelecionado.participantes.length : 0 }}</span>
                </div>
                <button class="btn-toggle-add" @click="toggleAddMember" :disabled="loadingAction">
                  {{ adicionandoMembros ? 'Fechar Busca' : '+ Adicionar Membros' }}
                </button>
              </div>

              <!-- Seção de Adicionar Membros com Busca -->
              <Transition name="expand">
                <div v-if="adicionandoMembros" class="add-members-glass-box">
                  <div class="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      class="glass-search-input" 
                      placeholder="Pesquisar por nome ou e-mail..." 
                    />
                  </div>

                  <div v-if="loadingMembros" class="sub-loading-glass" style="padding: 16px;">
                    <div class="mini-spinner"></div>
                    <span>Buscando membros disponíveis...</span>
                  </div>

                  <div v-else class="available-members-scroll">
                    <div v-for="user in membrosDisponiveisFiltrados" :key="user.id" class="available-member-chip">
                      <div class="user-avatar-sm">{{ (user.nome || 'U').charAt(0).toUpperCase() }}</div>
                      <div class="user-meta-info">
                        <span class="u-name">{{ user.nome }}</span>
                        <span class="u-mail">{{ user.email }}</span>
                      </div>
                      <button class="btn-add-chip" title="Adicionar ao grupo" @click="adicionarParticipante(user)" :disabled="loadingAction">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Adicionar</span>
                      </button>
                    </div>
                    <p v-if="membrosDisponiveisFiltrados.length === 0" class="empty-hint-box">Nenhum novo membro disponível para adicionar.</p>
                  </div>
                </div>
              </Transition>
              
              <!-- Lista de Participantes Atuais -->
              <div class="current-members-list" v-if="grupoSelecionado.participantes && grupoSelecionado.participantes.length > 0">
                <div v-for="part in grupoSelecionado.participantes" :key="part.id" class="member-row-glass">
                  <div class="member-avatar">{{ (part.nome || 'U').charAt(0).toUpperCase() }}</div>
                  <div class="member-info">
                    <span class="member-name">{{ part.nome }}</span>
                    <span class="member-email">{{ part.email }}</span>
                  </div>
                  <span class="member-role-tag">{{ part.tipo || 'Aluno' }}</span>
                  <button class="btn-remove-member" title="Remover do grupo" @click="removerParticipante(part)" :disabled="loadingAction">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>

              <div v-else class="empty-state-glass" style="margin-top: 16px;">
                <p>Este grupo ainda não possui nenhum participante vinculado.</p>
              </div>
            </div>
            
            <!-- Rodapé do Painel -->
            <div class="panel-footer-glass">
              <button class="btn-delete-group" @click="confirmarExclusaoGrupo" :disabled="loadingAction">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Excluir Grupo
              </button>
              <button class="btn-close-drawer-bottom" @click="fecharDetalhes">Concluir</button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Apple Glass de Configuração da Sessão Ativa da Sala VR -->
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
                  <span class="spec-label">Público-Alvo</span>
                  <span class="spec-value">{{ salaSelecionada.targetType === 'grupo' ? 'Grupo / Turma' : 'Aluno Individual' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Meninos / Meninas</span>
                  <span class="spec-value">{{ salaSelecionada.numBoys }} 👦 / {{ salaSelecionada.numGirls }} 👧</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Mesas / Formato</span>
                  <span class="spec-value">{{ salaSelecionada.numDesks }} mesas (Shape {{ salaSelecionada.shape }})</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Fileiras / Raio</span>
                  <span class="spec-value">{{ salaSelecionada.rows }} fileiras (Raio {{ salaSelecionada.radius }})</span>
                </div>
              </div>

              <div class="divider-subtle"></div>
              
              <!-- Seção de Sessão Ativa -->
              <h4 class="section-subtitle">Dispositivo VR e Participante Ativo</h4>
              <p class="subtitle-hint">Selecione o óculos físico e o estudante que estará jogando nesta sessão.</p>

              <div v-if="loadingDetalhes" class="sub-loading-glass">
                <div class="mini-spinner"></div>
                <span>Carregando dispositivos e participantes...</span>
              </div>
              
              <div v-else class="active-config-form">
                
                <!-- Seleção do Óculos -->
                <div class="form-group-glass">
                  <label class="form-label">
                    <span class="label-icon">🥽</span>
                    Óculos VR Vinculado
                  </label>
                  <select v-model="selectedActiveOculos" class="glass-select" :disabled="salvandoAtivos">
                    <option :value="null">Nenhum (Selecione um dispositivo)</option>
                    <option v-for="oculos in oculosDisponiveis" :key="oculos.id" :value="oculos.id">
                      {{ oculos.modelo || 'Óculos VR' }} - N° {{ oculos.numero_oculos || oculos.id.substring(0, 6) }}
                    </option>
                  </select>
                  <p v-if="oculosDisponiveis.length === 0" class="empty-hint">Nenhum óculos cadastrado na instituição.</p>
                </div>
                
                <!-- Seleção de Participante Ativo -->
                <div class="form-group-glass">
                  <label class="form-label">
                    <span class="label-icon">👤</span>
                    Participante Ativo na Sala
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
                    <p v-if="participantesSala.length === 0" class="empty-hint">Nenhum participante disponível neste grupo.</p>
                  </div>
                </div>

                <!-- Feedback Toast -->
                <div class="feedback-toast" v-if="mensagemAtivos">
                  <p :class="['feedback-text', tipoMensagem]">{{ mensagemAtivos }}</p>
                </div>

                <!-- Botão de Salvar -->
                <button class="btn-save-session" @click="salvarConfiguracoesAtivas" :disabled="salvandoAtivos">
                  <span v-if="salvandoAtivos" class="btn-spinner"></span>
                  <span>{{ salvandoAtivos ? 'Salvando Configuração...' : 'Salvar Configurações da Sessão' }}</span>
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
import { ref as dbRef, get, set, remove, update } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

const nomeInstituicao = ref('Carregando...')
const meusGrupos = ref([])
const loadingGrupos = ref(true)
const grupoSelecionado = ref(null)

const minhasSalas = ref([])
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

// Edit state
const editandoNome = ref(false)
const novoNomeGrupo = ref('')
const adicionandoMembros = ref(false)
const loadingMembros = ref(false)
const membrosDisponiveis = ref([])
const searchQuery = ref('')
const loadingAction = ref(false)

const initials = computed(() => {
  const nome = props.userData.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const totalAlunosAlcancados = computed(() => {
  return meusGrupos.value.reduce((acc, g) => acc + (g.participantes ? g.participantes.length : 0), 0)
})

const fetchGrupos = async () => {
  try {
    const gruposRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos`)
    const gruposSnap = await get(gruposRef)
    if (gruposSnap.exists()) {
      const gruposData = gruposSnap.val()
      meusGrupos.value = Object.keys(gruposData)
        .map(key => ({ id: key, ...gruposData[key] }))
        .filter(g => g.facilitadorId === props.userData.id)
        .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))
    } else {
      meusGrupos.value = []
    }
  } catch (error) {
    console.error("Erro ao buscar grupos:", error)
  }
}

const fetchSalasVR = async () => {
  try {
    const salasRef = dbRef(database, 'classroom_configs')
    const salasSnap = await get(salasRef)
    if (salasSnap.exists()) {
      const salasData = salasSnap.val()
      minhasSalas.value = Object.keys(salasData)
        .map(key => ({ id: key, ...salasData[key] }))
        .filter(s => s.facilitadorId === props.userData.id)
        .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))
    } else {
      minhasSalas.value = []
    }
  } catch (error) {
    console.error("Erro ao buscar salas VR:", error)
  } finally {
    loadingSalas.value = false
  }
}

onMounted(async () => {
  if (props.userData.instituicaoId) {
    try {
      const instRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}`)
      const snapshot = await get(instRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        nomeInstituicao.value = data.nomeFaculdade || data.nomeInstituicao || 'Instituição Vinculada'
      } else {
        nomeInstituicao.value = 'Instituição Vinculada'
      }
      
      await fetchGrupos()
      await fetchSalasVR()
    } catch (error) {
      console.error("Erro ao inicializar facilitador:", error)
    } finally {
      loadingGrupos.value = false
    }
  } else {
    loadingGrupos.value = false
    loadingSalas.value = false
  }
})

// ----- Detalhes do Grupo -----
const abrirDetalhes = (grupo) => {
  grupoSelecionado.value = { ...grupo }
  if (!grupoSelecionado.value.participantes) {
    grupoSelecionado.value.participantes = []
  }
  editandoNome.value = false
  adicionandoMembros.value = false
}

const fecharDetalhes = () => {
  grupoSelecionado.value = null
  editandoNome.value = false
  adicionandoMembros.value = false
  searchQuery.value = ''
}

const formatData = (isoString) => {
  if (!isoString) return 'Desconhecido'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatDataCurta = (isoString) => {
  if (!isoString) return 'Recentemente'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ----- Detalhes da Sala VR -----
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
    const oculosRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}/oculos`)
    const oculosSnap = await get(oculosRef)
    if (oculosSnap.exists()) {
      const dataO = oculosSnap.val()
      oculosDisponiveis.value = Object.keys(dataO).map(k => ({ id: k, ...dataO[k] }))
    }

    // 2. Buscar Participantes/Aluno
    if (sala.targetType === 'grupo') {
      const grupoRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos/${sala.targetId}/participantes`)
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
        selectedActiveParticipant.value = sala.targetId
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
    mensagemAtivos.value = 'Selecione o participante que estará ativo.'
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
            mensagemExtra = ` (Óculos movido de outra sala)`
          }
        }
      }
    }

    updates[`classroom_configs/${salaSelecionada.value.id}/activeParticipantId`] = selectedActiveParticipant.value
    updates[`classroom_configs/${salaSelecionada.value.id}/activeHeadsetId`] = selectedActiveOculos.value || null

    await update(dbRef(database), updates)

    tipoMensagem.value = 'success'
    mensagemAtivos.value = 'Configuração da sessão salva com sucesso!' + mensagemExtra
    
    await fetchSalasVR()
  } catch (error) {
    console.error("Erro ao salvar configurações ativas:", error)
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => { mensagemAtivos.value = '' }, 5000)
  }
}

// ----- Edição de Nome -----
const iniciarEdicaoNome = () => {
  novoNomeGrupo.value = grupoSelecionado.value.nome
  editandoNome.value = true
}

const cancelarEdicaoNome = () => {
  editandoNome.value = false
  novoNomeGrupo.value = ''
}

const salvarNomeGrupo = async () => {
  if (!novoNomeGrupo.value.trim()) return
  loadingAction.value = true
  try {
    const nomePath = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos/${grupoSelecionado.value.id}/nome`)
    await set(nomePath, novoNomeGrupo.value)
    grupoSelecionado.value.nome = novoNomeGrupo.value
    editandoNome.value = false
    await fetchGrupos()
  } catch (error) {
    console.error("Erro ao renomear:", error)
    alert("Não foi possível renomear o grupo.")
  } finally {
    loadingAction.value = false
  }
}

// ----- Adicionar Membros -----
const fetchMembrosDisponiveis = async () => {
  loadingMembros.value = true
  try {
    const usersRef = dbRef(database, 'usuarios')
    const snapshot = await get(usersRef)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      const participantesIds = grupoSelecionado.value.participantes.map(p => p.id)
      
      membrosDisponiveis.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.instituicaoId === props.userData.instituicaoId)
        .filter(u => !participantesIds.includes(u.id))
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    }
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
  } finally {
    loadingMembros.value = false
  }
}

const toggleAddMember = () => {
  adicionandoMembros.value = !adicionandoMembros.value
  if (adicionandoMembros.value) {
    searchQuery.value = ''
    fetchMembrosDisponiveis()
  }
}

const membrosDisponiveisFiltrados = computed(() => {
  if (!searchQuery.value) return membrosDisponiveis.value
  const query = searchQuery.value.toLowerCase()
  return membrosDisponiveis.value.filter(m => 
    (m.nome && m.nome.toLowerCase().includes(query)) || 
    (m.email && m.email.toLowerCase().includes(query))
  )
})

const adicionarParticipante = async (userToAdd) => {
  loadingAction.value = true
  try {
    const novoParticipante = {
      id: userToAdd.id,
      nome: userToAdd.nome,
      email: userToAdd.email,
      tipo: userToAdd.tipoCadastro || userToAdd.tipo || 'Usuário'
    }
    const novaLista = [...(grupoSelecionado.value.participantes || []), novoParticipante]
    
    const participantesPath = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos/${grupoSelecionado.value.id}/participantes`)
    await set(participantesPath, novaLista)
    
    grupoSelecionado.value.participantes = novaLista
    membrosDisponiveis.value = membrosDisponiveis.value.filter(m => m.id !== userToAdd.id)
    
    await fetchGrupos()
  } catch (error) {
    console.error("Erro ao adicionar participante:", error)
    alert("Não foi possível adicionar o participante.")
  } finally {
    loadingAction.value = false
  }
}

// ----- Remover Membros -----
const removerParticipante = async (partToRemove) => {
  if (!confirm(`Tem certeza que deseja remover ${partToRemove.nome} do grupo?`)) return
  
  loadingAction.value = true
  try {
    const novaLista = (grupoSelecionado.value.participantes || []).filter(p => p.id !== partToRemove.id)
    
    const participantesPath = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos/${grupoSelecionado.value.id}/participantes`)
    await set(participantesPath, novaLista)
    
    grupoSelecionado.value.participantes = novaLista
    
    if (adicionandoMembros.value) {
      fetchMembrosDisponiveis()
    }
    
    await fetchGrupos()
  } catch (error) {
    console.error("Erro ao remover participante:", error)
    alert("Não foi possível remover o participante.")
  } finally {
    loadingAction.value = false
  }
}

// ----- Excluir Grupo -----
const confirmarExclusaoGrupo = async () => {
  if (!confirm(`TEM CERTEZA ABSOLUTA que deseja EXCLUIR DEFINITIVAMENTE o grupo "${grupoSelecionado.value.nome}"? Esta ação não pode ser desfeita.`)) {
    return
  }
  
  loadingAction.value = true
  try {
    const grupoPath = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos/${grupoSelecionado.value.id}`)
    await remove(grupoPath)
    
    fecharDetalhes()
    await fetchGrupos()
  } catch (error) {
    console.error("Erro ao excluir grupo:", error)
    alert("Ocorreu um erro ao excluir o grupo.")
  } finally {
    loadingAction.value = false
  }
}
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

.profile-hero-glass.plus-hero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(245, 243, 255, 0.8));
  border-color: rgba(221, 214, 254, 0.9);
  box-shadow: 0 16px 40px rgba(139, 92, 246, 0.08);
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
  font-size: 1.8rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.user-avatar-glass.plus-avatar {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
}

.welcome-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
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
}

.badge-role-tag.badge-plus {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border-color: #ddd6fe;
  color: #7c3aed;
}

.inst-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(241, 245, 249, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #475569;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.badge-plus .pulse-dot {
  background: #8b5cf6;
  box-shadow: 0 0 8px #8b5cf6;
}

.welcome-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.highlight-gradient {
  background: linear-gradient(135deg, #059669 0%, #0071e3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.highlight-gradient.plus-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
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
  color: #059669;
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
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 2px 8px;
  border-radius: 9999px;
}

.btn-create-pill {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(203, 213, 225, 0.9);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0071e3;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.btn-create-pill:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: translateY(-1px);
}

/* Cards Grid Glass */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
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
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.group-icon-pill svg { width: 20px; height: 20px; }

.member-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #a7f3d0;
}

.grupo-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.date-created {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-bottom: 16px;
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

.role-pill.pill-vr {
  font-size: 0.72rem;
  font-weight: 700;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  color: #0071e3;
  border: 1px solid #bfdbfe;
  padding: 4px 10px;
  border-radius: 9999px;
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

.sala-card:hover .action-arrow { transform: translateX(4px); }

/* Loading & Empty States */
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

.empty-emoji { font-size: 2.5rem; display: block; margin-bottom: 10px; }
.empty-state-glass h3 { font-size: 1.2rem; color: #0f172a; margin: 0 0 6px 0; }
.empty-state-glass p { font-size: 0.9rem; margin: 0 0 16px 0; }

.btn-empty-action {
  display: inline-block;
  background: #0071e3;
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
}

/* Side Panel Drawer Glass */
.side-panel-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

.side-panel-glass {
  width: 520px;
  max-width: 100vw;
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
  border-left: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: -20px 0 60px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
}

.panel-header-glass {
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left { flex: 1; padding-right: 12px; }

.panel-kicker {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.8px;
  display: block;
  margin-bottom: 2px;
}

.title-with-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.panel-title-text {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.4px;
}

.btn-icon-rename {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon-rename:hover { background: #eff6ff; color: #0071e3; }
.btn-icon-rename svg { width: 18px; height: 18px; }

.data-badge {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.btn-close-drawer {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.4rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-drawer:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

/* Edit Name inline */
.edit-name-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.input-edit-name {
  flex: 1;
  padding: 6px 12px;
  border: 1.5px solid #0071e3;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  outline: none;
}

.name-actions { display: flex; gap: 4px; }

.btn-name-save, .btn-name-cancel {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-name-save { background: #10b981; color: white; }
.btn-name-cancel { background: #e2e8f0; color: #475569; }
.btn-name-save svg, .btn-name-cancel svg { width: 16px; height: 16px; }

/* Panel Body */
.panel-body-glass {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.members-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.members-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.members-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-toggle-add {
  background: rgba(239, 246, 255, 0.9);
  border: 1px solid rgba(191, 219, 254, 0.9);
  color: #0071e3;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-add:hover {
  background: #dbeafe;
}

/* Add Members Area */
.add-members-glass-box {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.glass-search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: 10px;
  border: 1.5px solid rgba(203, 213, 225, 0.9);
  background: #ffffff;
  font-size: 0.88rem;
  outline: none;
}

.glass-search-input:focus {
  border-color: #0071e3;
}

.available-members-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.available-member-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
}

.user-meta-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.u-name { font-size: 0.86rem; font-weight: 700; color: #0f172a; }
.u-mail { font-size: 0.74rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-add-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #0071e3;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-chip:hover { background: #0071e3; color: white; }
.btn-add-chip svg { width: 14px; height: 14px; }

.empty-hint-box { font-size: 0.8rem; color: #64748b; text-align: center; margin: 8px 0; }

/* Current Members List */
.current-members-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-row-glass {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.member-row-glass:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.member-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.member-name { font-size: 0.92rem; font-weight: 700; color: #0f172a; }
.member-email { font-size: 0.78rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.member-role-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

.btn-remove-member {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  transition: all 0.2s;
}

.btn-remove-member:hover {
  background: #fee2e2;
  color: #ef4444;
}

.btn-remove-member svg { width: 16px; height: 16px; }

/* Panel Footer */
.panel-footer-glass {
  padding: 20px 28px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-delete-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(254, 242, 242, 0.85);
  border: 1px solid rgba(254, 202, 202, 0.9);
  color: #ef4444;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-group:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.btn-close-drawer-bottom {
  background: #0071e3;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-drawer-bottom:hover {
  background: #0056b3;
}

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

.vr-specs-glass {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: rgba(248, 250, 252, 0.8);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.spec-item { display: flex; flex-direction: column; gap: 2px; }
.spec-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
.spec-value { font-size: 0.88rem; font-weight: 600; color: #0f172a; }

.divider-subtle { height: 1px; background: rgba(226, 232, 240, 0.8); margin: 20px 0; }
.section-subtitle { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; }
.subtitle-hint { font-size: 0.82rem; color: #64748b; margin: 0 0 18px 0; }

.active-config-form { display: flex; flex-direction: column; gap: 18px; }
.form-group-glass { display: flex; flex-direction: column; gap: 8px; }
.form-label { display: flex; align-items: center; gap: 6px; font-size: 0.88rem; font-weight: 700; color: #334155; }
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

.participant-card-option:hover { background: #f8fafc; border-color: #cbd5e1; }
.participant-card-option.is-selected { background: #eff6ff; border-color: #0071e3; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.1); }
.participant-card-option input[type="radio"] { accent-color: #0071e3; width: 16px; height: 16px; }

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

.p-option-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.p-option-name { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.p-option-email { font-size: 0.76rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-option-tag { font-size: 0.68rem; font-weight: 800; color: #059669; background: #ecfdf5; padding: 3px 8px; border-radius: 6px; }

.empty-hint { font-size: 0.8rem; color: #ef4444; font-style: italic; margin: 4px 0 0 0; }

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

.btn-save-session:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0, 113, 227, 0.35); }
.btn-save-session:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.feedback-toast { margin-top: 4px; }
.feedback-text { padding: 10px 14px; border-radius: 10px; font-size: 0.86rem; font-weight: 600; text-align: center; }
.feedback-text.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-text.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* Transitions */
.glass-slide-enter-active, .glass-slide-leave-active { transition: opacity 0.3s ease; }
.glass-slide-enter-active :deep(.side-panel-glass), .glass-slide-leave-active :deep(.side-panel-glass) { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-slide-enter-from { opacity: 0; }
.glass-slide-leave-to { opacity: 0; }
.glass-slide-enter-from :deep(.side-panel-glass) { transform: translateX(100%); }
.glass-slide-leave-to :deep(.side-panel-glass) { transform: translateX(100%); }

.glass-modal-enter-active, .glass-modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-modal-enter-from, .glass-modal-leave-to { opacity: 0; transform: scale(0.96) translateY(10px); }
</style>