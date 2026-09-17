<template>
  <div class="role-view">
    
    <!-- Hero Profile Header com Glassmorphism -->
    <div :class="['profile-hero-glass', { 'plus-hero': userData?.FacilitadorPlus }]">
      <div class="profile-header-content">
        <div :class="['user-avatar-glass notranslate', { 'plus-avatar': userData?.FacilitadorPlus }]" translate="no">
          {{ initials }}
        </div>
        <div class="welcome-texts">
          <div class="badge-row">
            <div :class="['badge-role-tag', { 'badge-plus': userData?.FacilitadorPlus }]">
              <span class="pulse-dot"></span>
              <span>{{ userData?.FacilitadorPlus ? 'Facilitador Plus VIP' : 'Facilitador de Grupos' }}</span>
            </div>
            <div class="inst-pill notranslate" translate="no" v-if="nomeInstituicao">
              <span class="inst-icon">🏛️</span>
              <span>{{ nomeInstituicao }}</span>
            </div>
          </div>
          <h1 class="welcome-title">
            Bem-vindo(a), <span :class="['highlight-gradient notranslate', { 'plus-gradient': userData?.FacilitadorPlus }]" translate="no">{{ userData.nome }}</span>!
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

          <h4 class="grupo-title notranslate" translate="no">{{ grupo.nome }}</h4>
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
            <div class="tags-left-wrap">
              <span class="role-pill pill-vr">SALA VR</span>
              <span :class="['situacao-badge', isSalaAtiva(sala) ? 'situacao-ativa' : 'situacao-inativa']">
                <span class="situacao-dot"></span>
                {{ isSalaAtiva(sala) ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
            <div class="card-top-actions">
              <span class="target-tag">
                {{ sala.targetType === 'grupo' ? '👥 Grupo' : '👤 Individual' }}
              </span>
              <button 
                class="btn-card-delete-sala" 
                :title="isSalaAtiva(sala) ? 'Sala ativa: exclusão bloqueada' : 'Excluir Sala VR'" 
                :aria-label="isSalaAtiva(sala) ? 'Sala ativa: exclusão bloqueada' : 'Excluir Sala VR'"
                @click.stop="confirmarExclusaoSala(sala)"
                :disabled="excluindoSala || isSalaAtiva(sala)"
                :class="{ 'btn-delete-disabled': isSalaAtiva(sala) }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="trash-icon-svg">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <h4 class="sala-name notranslate" translate="no">{{ sala.roomName || 'Sala sem nome' }}</h4>
          
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
                  <h2 class="panel-title-text notranslate" translate="no">{{ grupoSelecionado.nome }}</h2>
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
                      <div class="user-avatar-sm notranslate" translate="no">{{ (user.nome || 'U').charAt(0).toUpperCase() }}</div>
                      <div class="user-meta-info">
                        <span class="u-name notranslate" translate="no">{{ user.nome }}</span>
                        <span class="u-mail notranslate" translate="no">{{ user.email }}</span>
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
                  <div class="member-avatar notranslate" translate="no">{{ (part.nome || 'U').charAt(0).toUpperCase() }}</div>
                  <div class="member-info">
                    <span class="member-name notranslate" translate="no">{{ part.nome }}</span>
                    <span class="member-email notranslate" translate="no">{{ part.email }}</span>
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

    <!-- Modal Elegante de Confirmação de Exclusão de Sala VR (Substitui Alert Feio) -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="salaParaExcluir" class="delete-modal-overlay" @click.self="cancelarExclusao">
          <div class="delete-modal-box" @click.stop>
            
            <!-- Ícone de Alerta com Glow -->
            <div class="delete-icon-wrapper">
              <div class="delete-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="delete-warn-svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>

            <!-- Caso Sem Permissão -->
            <template v-if="salaParaExcluir.semPermissao">
              <h3 class="delete-modal-title">Ação Não Permitida</h3>
              <p class="delete-modal-subdesc">
                Você só possui autorização para excluir as salas VR que você mesmo criou.
              </p>
              <div class="delete-modal-actions single-action">
                <button class="btn-cancel-delete" @click="cancelarExclusao">
                  Entendido
                </button>
              </div>
            </template>

            <!-- Caso Com Permissão: Confirmação Estilizada -->
            <template v-else>
              <h3 class="delete-modal-title">Excluir Sala VR?</h3>
              <div class="delete-modal-room-badge notranslate" translate="no">
                <span class="room-badge-icon">🥽</span>
                <span class="room-name-text">{{ salaParaExcluir.roomName || 'Sala VR' }}</span>
              </div>

              <div class="delete-modal-points">
                <div class="delete-point-row">
                  <span class="bullet-dot"></span>
                  <span>Todas as configurações desta sala serão apagadas do sistema.</span>
                </div>
                <div class="delete-point-row">
                  <span class="bullet-dot"></span>
                  <span>Histórico, sessões e telemetria gerados no VR serão excluídos permanentemente.</span>
                </div>
                <div class="delete-point-row alert">
                  <span class="bullet-dot red"></span>
                  <span>Esta operação é definitiva e irreversível.</span>
                </div>
              </div>

              <p v-if="mensagemPermissao" class="delete-error-note">
                ⚠️ {{ mensagemPermissao }}
              </p>

              <div class="delete-modal-actions">
                <button 
                  class="btn-cancel-delete" 
                  @click="cancelarExclusao" 
                  :disabled="excluindoSala"
                >
                  Cancelar
                </button>
                <button 
                  class="btn-confirm-delete" 
                  @click="executarExclusaoSala" 
                  :disabled="excluindoSala"
                >
                  <span v-if="excluindoSala" class="btn-spinner-delete"></span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="trash-action-svg">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>{{ excluindoSala ? 'Excluindo...' : 'Sim, Excluir Sala' }}</span>
                </button>
              </div>
            </template>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../../firebase' 
import { ref as dbRef, get, set, remove, update, query, orderByChild, equalTo, onValue } from 'firebase/database'
import { isSalaAtiva, getSituacaoLabel } from '../../utils/salaUtils'

const router = useRouter()

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
const filtroParticipante = ref('')
const menuOculosAberto = ref(false)
const dropdownOculosRef = ref(null)

const toggleMenuOculos = () => {
  if (salvandoAtivos.value || isSalaAtiva(salaSelecionada.value)) return
  menuOculosAberto.value = !menuOculosAberto.value
}

const selecionarOculos = (oculosId) => {
  if (salvandoAtivos.value || isSalaAtiva(salaSelecionada.value)) return
  if (oculosId && isOculosEmOutraSalaAtiva(oculosId)) return
  selectedActiveOculos.value = oculosId
  menuOculosAberto.value = false
}

const handleClickForaOculos = (e) => {
  if (dropdownOculosRef.value && !dropdownOculosRef.value.contains(e.target)) {
    menuOculosAberto.value = false
  }
}

const facilitadorNome = computed(() => props.userData?.nome || 'Facilitador')

const getShapeName = (shape) => {
  if (shape === 1) return 'Semicírculo'
  if (shape === 2) return 'Circular'
  return 'Retangular'
}

const participantesFiltrados = computed(() => {
  if (!filtroParticipante.value.trim()) return participantesSala.value
  const q = filtroParticipante.value.toLowerCase()
  return participantesSala.value.filter(p => 
    (p.nome && p.nome.toLowerCase().includes(q)) ||
    (p.email && p.email.toLowerCase().includes(q))
  )
})

const selectedOculosObj = computed(() => {
  if (!selectedActiveOculos.value) return null
  return oculosDisponiveis.value.find(o => o.id === selectedActiveOculos.value) || null
})

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
  const nomes = String(nome).trim().split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
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

let unsubSalasVR = null

const fetchSalasVR = () => {
  try {
    const qSalas = query(dbRef(database, 'classroom_configs'), orderByChild('facilitadorId'), equalTo(props.userData.id))
    
    if (unsubSalasVR) {
      unsubSalasVR()
      unsubSalasVR = null
    }

    unsubSalasVR = onValue(qSalas, (salasSnap) => {
      if (salasSnap.exists()) {
        const salasData = salasSnap.val()
        minhasSalas.value = Object.keys(salasData)
          .map(key => ({ id: key, ...salasData[key] }))
          .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))

        if (salaSelecionada.value) {
          const updated = minhasSalas.value.find(s => s.id === salaSelecionada.value.id)
          if (updated) {
            salaSelecionada.value = { ...updated }
          }
        }
      } else {
        minhasSalas.value = []
      }
      loadingSalas.value = false
    }, (error) => {
      console.error("Erro ao buscar salas VR:", error)
      loadingSalas.value = false
    })
  } catch (error) {
    console.error("Erro ao buscar salas VR:", error)
    loadingSalas.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickForaOculos)
  if (unsubSalasVR) {
    unsubSalasVR()
    unsubSalasVR = null
  }
})

onMounted(async () => {
  document.addEventListener('click', handleClickForaOculos)
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
const abrirDetalhesSala = (sala) => {
  if (sala && sala.id) {
    router.push(`/configurar-sala/${sala.id}`)
  }
}

// ----- Exclusão de Sala VR (Facilitador / Facilitador Plus) -----
const excluindoSala = ref(false)
const salaParaExcluir = ref(null)
const mensagemPermissao = ref('')

const confirmarExclusaoSala = (sala) => {
  if (!sala || !sala.id) return

  // Validação: não permitir excluir sala ativa
  if (isSalaAtiva(sala)) {
    mensagemPermissao.value = "Esta sala está com status \"Ativa\" no momento. Finalize a atividade VR antes de tentar excluí-la."
    salaParaExcluir.value = { ...sala, semPermissao: true }
    return
  }

  // Validação: apenas o facilitador que criou a sala pode excluí-la
  const idsAutorizados = [
    props.userData.id,
    props.userData.uid,
    props.userData.authUid,
    props.userData.idCurto
  ].filter(Boolean)

  if (sala.facilitadorId && !idsAutorizados.includes(sala.facilitadorId)) {
    mensagemPermissao.value = "Você só tem permissão para excluir as salas que você mesmo criou."
    salaParaExcluir.value = { ...sala, semPermissao: true }
    return
  }

  mensagemPermissao.value = ''
  salaParaExcluir.value = { ...sala, semPermissao: false }
}

const cancelarExclusao = () => {
  salaParaExcluir.value = null
  mensagemPermissao.value = ''
}

const executarExclusaoSala = async () => {
  if (!salaParaExcluir.value?.id) return
  const salaId = salaParaExcluir.value.id

  if (isSalaAtiva(salaParaExcluir.value)) {
    mensagemPermissao.value = "Esta sala está com status \"Ativa\" no momento e não pode ser excluída."
    return
  }

  excluindoSala.value = true
  try {
    // Verificação de última hora no banco
    const freshSnap = await get(dbRef(database, `classroom_configs/${salaId}`))
    if (freshSnap.exists() && isSalaAtiva(freshSnap.val())) {
      mensagemPermissao.value = "Esta sala acabou de ser ativada e não pode ser excluída."
      return
    }

    const salaRef = dbRef(database, `classroom_configs/${salaId}`)
    await remove(salaRef)

    if (salaSelecionada.value?.id === salaId) {
      fecharDetalhesSala()
    }

    minhasSalas.value = minhasSalas.value.filter(s => s.id !== salaId)
    cancelarExclusao()
  } catch (error) {
    console.error("Erro ao excluir sala VR:", error)
    mensagemPermissao.value = "Ocorreu um erro ao excluir a sala. Tente novamente."
  } finally {
    excluindoSala.value = false
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
    if (!props.userData.instituicaoId) return
    const qUsers = query(dbRef(database, 'usuarios'), orderByChild('instituicaoId'), equalTo(props.userData.instituicaoId))
    const snapshot = await get(qUsers)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      const participantesIds = (grupoSelecionado.value.participantes || []).map(p => p.id)
      
      membrosDisponiveis.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => !participantesIds.includes(u.id))
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    } else {
      membrosDisponiveis.value = []
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
  min-width: 72px;
  min-height: 72px;
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
  text-align: center;
  padding: 4px;
  letter-spacing: -0.5px;
  line-height: 1;
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
  min-width: 0;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 113, 227, 0.12);
}

.quick-btn.primary:hover { border-color: rgba(0, 113, 227, 0.4); background: #eff6ff; }
.quick-btn.secondary:hover { border-color: rgba(16, 185, 129, 0.4); background: #ecfdf5; }

.q-icon { font-size: 1.5rem; flex-shrink: 0; }
.q-text { display: flex; flex-direction: column; text-align: left; min-width: 0; overflow: hidden; }
.q-title { font-size: 0.92rem; font-weight: 700; color: #0f172a; word-break: break-word; line-height: 1.25; }
.q-desc { font-size: 0.76rem; color: #64748b; word-break: break-word; line-height: 1.25; }

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

.tags-left-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.situacao-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  letter-spacing: 0.2px;
  transition: all 0.2s ease;
}

.situacao-badge.situacao-ativa {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.situacao-badge.situacao-inativa {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.situacao-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.situacao-ativa .situacao-dot {
  background: #16a34a;
  box-shadow: 0 0 6px #16a34a;
  animation: pulseDot 1.8s infinite;
}

.situacao-inativa .situacao-dot {
  background: #94a3b8;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.btn-delete-disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  filter: grayscale(1);
}

.session-live-pulse-badge.badge-sala-ativa {
  background: rgba(220, 252, 231, 0.9);
  color: #15803d;
  border: 1px solid #86efac;
}

.session-live-pulse-badge.badge-sala-inativa {
  background: rgba(241, 245, 249, 0.9);
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.idle-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  display: inline-block;
}

.sala-ativa-lock-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #991b1b;
}

.lock-alert-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.lock-alert-text strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 2px;
  color: #991b1b;
}

.lock-alert-text p {
  font-size: 0.80rem;
  margin: 0;
  line-height: 1.4;
  color: #b91c1c;
}

.module-locked {
  opacity: 0.9;
}

.field-disabled-locked {
  background: #f1f5f9 !important;
  color: #64748b !important;
  cursor: not-allowed !important;
}

.card-disabled-locked {
  cursor: not-allowed !important;
  opacity: 0.65;
}

.btn-disabled-locked {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}

.card-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-card-delete-sala {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.85);
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.btn-card-delete-sala:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #ef4444;
  transform: scale(1.08);
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.2);
}

.btn-card-delete-sala:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trash-icon-svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
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

/* ============================================================ */
/* NOVO MODAL DE CONFIGURAÇÃO DE SESSÃO VR (HUD TECNOLÓGICO & ZERO CORTE) */
/* ============================================================ */
.session-modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 94vw;
  max-width: 680px;
  border-radius: 24px;
  border: 1px solid rgba(0, 113, 227, 0.2);
  box-shadow: 
    0 24px 60px -12px rgba(15, 23, 42, 0.25),
    0 0 0 1px rgba(0, 113, 227, 0.1),
    0 10px 30px -5px rgba(0, 113, 227, 0.15);
  overflow: hidden;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  animation: modalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.session-modal-header {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  padding: 24px 26px 20px 26px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header-top-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.header-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.session-kicker-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #0071e3;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  background: rgba(0, 113, 227, 0.08);
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 113, 227, 0.2);
}

.vr-tag-icon {
  font-size: 0.85rem;
}

.session-target-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #334155;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.session-live-pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 9999px;
}

.pulse-beacon {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: beaconPulse 2s infinite;
}

@keyframes beaconPulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.header-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.session-room-title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.btn-close-session {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.btn-close-session:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  transform: rotate(90deg);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-close-session svg {
  width: 18px;
  height: 18px;
}

/* HUD Telemetry Cards (Zero Truncamento!) */
.session-telemetry-hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.telemetry-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.telemetry-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.06);
  transform: translateY(-1px);
}

.telemetry-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  flex-shrink: 0;
  margin-top: 2px;
}

.telemetry-svg {
  width: 16px;
  height: 16px;
}

.telemetry-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.telemetry-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.telemetry-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: clip;
}

.telemetry-value.highlight {
  color: #0071e3;
  font-weight: 700;
}

/* Modal Body */
.session-modal-body {
  padding: 24px 26px 26px 26px;
  overflow-y: auto;
  max-height: calc(92vh - 180px);
}

.session-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 50px 20px;
  color: #64748b;
  font-weight: 600;
}

.session-form-flow {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Step Module */
.session-step-module {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
  transition: border-color 0.2s ease;
}

.session-step-module:focus-within {
  border-color: rgba(0, 113, 227, 0.35);
}

.module-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.module-number-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 113, 227, 0.3);
}

.module-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.module-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.module-heading {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.module-subheading {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.35;
}

.hardware-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.hardware-status-badge.connected {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.hardware-status-badge.pending {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: beaconPulse 2s infinite;
}

.idle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
}

.count-tech-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #eff6ff;
  color: #0071e3;
  border: 1px solid #bfdbfe;
  padding: 3px 10px;
  border-radius: 9999px;
  flex-shrink: 0;
}

/* Custom Óculos Dropdown */
.custom-oculos-dropdown-container {
  position: relative;
  width: 100%;
}

.custom-oculos-trigger {
  width: 100%;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 16px;
  padding: 10px 16px;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  text-align: left;
  user-select: none;
}

.custom-oculos-trigger:hover:not(.is-disabled) {
  border-color: #0071e3;
  background: #f8fafc;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
}

.custom-oculos-dropdown-container.is-open .custom-oculos-trigger {
  border-color: #0071e3;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.14);
}

.custom-oculos-trigger.is-disabled {
  background: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.65;
}

.trigger-left {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 12px !important;
  min-width: 0;
  flex: 1;
}

.headset-icon-box {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  border-radius: 12px;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.15);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #0071e3;
  font-size: 1.3rem;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  transition: all 0.2s ease;
}

.headset-icon-box.has-selection {
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.15), rgba(16, 185, 129, 0.15));
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.12);
}

.vr-headset-svg {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  max-width: 20px !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.trigger-label-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.selected-oculos-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-oculos-sub {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-oculos-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: #64748b;
}

.placeholder-oculos-sub {
  font-size: 0.76rem;
  color: #94a3b8;
}

.trigger-chevron {
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  max-width: 22px !important;
  color: #64748b;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0 !important;
}

.trigger-chevron svg {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  max-width: 18px !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.trigger-chevron.is-flipped {
  transform: rotate(180deg);
  color: #0071e3;
}

/* Dropdown Menu Glass */
.custom-oculos-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1.5px solid rgba(0, 113, 227, 0.2);
  border-radius: 18px;
  padding: 10px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(0, 113, 227, 0.08);
}

.menu-header-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px 8px 10px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 6px;
}

.count-badge-sub {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 7px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.menu-items-scroll {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}

.menu-items-scroll::-webkit-scrollbar {
  width: 5px;
}

.menu-items-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

/* Oculos Menu Item */
.oculos-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
  gap: 12px;
}

.oculos-menu-item:hover:not(.is-blocked) {
  background: rgba(0, 113, 227, 0.05);
  border-color: rgba(0, 113, 227, 0.15);
  transform: translateX(2px);
}

.oculos-menu-item.is-active {
  background: rgba(0, 113, 227, 0.08);
  border-color: #93c5fd;
}

.oculos-menu-item.is-blocked {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f8fafc;
}

.item-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.item-icon-box.vr-icon.is-active {
  background: linear-gradient(135deg, #0071e3, #3b82f6);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
}

.item-icon-box.none-icon {
  color: #94a3b8;
}

.item-text-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.badge-numero-oculos {
  font-size: 0.74rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.item-desc {
  font-size: 0.76rem;
  color: #94a3b8;
}

.item-status-warning {
  font-size: 0.74rem;
  font-weight: 600;
  color: #dc2626;
}

.item-status-active {
  font-size: 0.74rem;
  font-weight: 600;
  color: #0071e3;
}

.item-status-avail {
  font-size: 0.74rem;
  color: #10b981;
  font-weight: 500;
}

.item-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0071e3;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-selected-pill {
  font-size: 0.74rem;
  font-weight: 700;
  background: #0071e3;
  color: white;
  padding: 3px 10px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.badge-locked-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 2px 8px;
  border-radius: 9999px;
}

.action-arrow-sub {
  font-size: 0.78rem;
  font-weight: 700;
  color: #0071e3;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.oculos-menu-item:hover:not(.is-blocked) .action-arrow-sub {
  opacity: 1;
  transform: translateX(0);
}

.empty-dropdown-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #64748b;
  font-size: 0.84rem;
  justify-content: center;
}

/* Dropdown Animation */
.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

/* Active Headset Preview */
.active-headset-preview {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.06) 0%, rgba(2, 132, 199, 0.04) 100%);
  border: 1.5px solid rgba(0, 113, 227, 0.25);
  border-radius: 14px;
  padding: 12px 16px;
  overflow: hidden;
  animation: modalPop 0.2s ease-out;
}

.preview-glow-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0071e3, #38bdf8);
}

.hw-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.preview-meta-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.preview-model {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0071e3;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

.preview-sub {
  font-size: 0.76rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

.preview-state-tag {
  flex-shrink: 0;
}

.tag-signal {
  font-size: 0.65rem;
  font-weight: 800;
  background: #059669;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
}

.empty-warn-tech {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #d97706;
  margin: 2px 0 0 0;
  font-weight: 500;
  line-height: 1.35;
}

.warn-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Digital Student VR Pass (Aluno Individual) */
.digital-student-pass {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border: 1.5px solid #bfdbfe;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
  overflow: hidden;
}

.pass-accent-light {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #0071e3, #60a5fa);
}

.pass-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.28);
  border: 2px solid #ffffff;
}

.pass-details-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.pass-identity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pass-role-micro {
  font-size: 0.65rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.pass-chip-verified {
  font-size: 0.68rem;
  font-weight: 700;
  background: #ecfdf5;
  color: #059669;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
}

.pass-name {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pass-email {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Group Selection Zone */
.group-selection-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  transition: all 0.2s ease;
}

.tech-search-bar:focus-within {
  background: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

.search-svg {
  width: 17px;
  height: 17px;
  color: #64748b;
  flex-shrink: 0;
}

.tech-search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.88rem;
  color: #0f172a;
}

.clear-search-btn {
  font-size: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 6px;
}

.clear-search-btn:hover {
  color: #ef4444;
}

.student-cards-scrollable {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

.student-cards-scrollable::-webkit-scrollbar {
  width: 5px;
}

.student-cards-scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.student-cards-scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.student-hud-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.student-hud-card:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateX(3px);
}

.student-hud-card.selected-active {
  background: #eff6ff;
  border-color: #0071e3;
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.14);
  transform: translateX(3px);
}

.st-card-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.st-hud-avatar {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(135deg, #0071e3 0%, #10b981 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-hud-card.selected-active .st-hud-avatar {
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.35);
}

.st-hud-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.st-hud-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

.st-hud-email {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

.st-hud-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.inactive-radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  display: block;
}

.check-mark-tech {
  font-size: 0.74rem;
  font-weight: 800;
  background: #0071e3;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.empty-search-alert {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px;
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
}

.empty-search-svg {
  width: 28px;
  height: 28px;
  stroke: #cbd5e1;
}

/* Feedback Box */
.feedback-toast-box {
  margin-top: 2px;
}

.feedback-toast-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
}

.feedback-toast-card.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.feedback-toast-card.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

/* Confirm Button (Tecnológico & Institucional) */
.btn-confirm-session-tech {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 15px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 10px 28px -4px rgba(0, 113, 227, 0.42);
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-confirm-session-tech:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 14px 34px -4px rgba(0, 113, 227, 0.52);
}

.btn-confirm-session-tech:active:not(:disabled) {
  transform: translateY(0);
}

.btn-confirm-session-tech:disabled {
  background: #94a3b8;
  color: #ffffff !important;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-confirm-session-tech .btn-confirm-text {
  color: #ffffff !important;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.btn-confirm-session-tech .btn-action-svg {
  width: 20px;
  height: 20px;
  stroke: #ffffff !important;
  color: #ffffff !important;
  flex-shrink: 0;
}

.btn-spinner-tech {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Zona de Perigo Tecnológica */
.danger-zone-box {
  margin-top: 14px;
  padding: 16px 18px;
  background: #fff5f5;
  border: 1.5px dashed #fca5a5;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.danger-zone-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  flex: 1;
  min-width: 200px;
}

.danger-zone-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #b91c1c;
  display: flex;
  align-items: center;
  gap: 6px;
}

.danger-zone-desc {
  font-size: 0.78rem;
  color: #7f1d1d;
  line-height: 1.35;
}

.btn-delete-room-full {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.25);
}

.btn-delete-room-full:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);
}

.btn-delete-room-full:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-room-full svg {
  width: 16px;
  height: 16px;
}

/* Modal de Confirmação de Exclusão Elegante (Substitui Alert Feio) */
.delete-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200000 !important;
  padding: 20px;
}

.delete-modal-box {
  background: #ffffff;
  border-radius: 22px;
  max-width: 440px;
  width: 100%;
  padding: 28px 24px 24px 24px;
  box-shadow: 
    0 25px 60px -15px rgba(220, 38, 38, 0.25),
    0 0 0 1px rgba(239, 68, 68, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.delete-icon-wrapper {
  margin-bottom: 2px;
}

.delete-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fee2e2;
  border: 2px solid #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.delete-warn-svg {
  width: 28px;
  height: 28px;
}

.delete-modal-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.delete-modal-subdesc {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.4;
}

.delete-modal-room-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  padding: 8px 16px;
  border-radius: 12px;
  max-width: 100%;
}

.room-badge-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.room-name-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #b91c1c;
  word-break: break-word;
  line-height: 1.3;
}

.delete-modal-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: left;
  width: 100%;
}

.delete-point-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.4;
}

.bullet-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
  margin-top: 6px;
}

.bullet-dot.red {
  background: #ef4444;
}

.delete-point-row.alert {
  color: #b91c1c;
  font-weight: 600;
}

.delete-error-note {
  margin: 0;
  font-size: 0.84rem;
  color: #dc2626;
  font-weight: 600;
}

.delete-modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.delete-modal-actions.single-action {
  justify-content: center;
}

.btn-cancel-delete {
  flex: 1;
  padding: 12px 18px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-delete:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-confirm-delete {
  flex: 1.3;
  padding: 12px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-confirm-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.45);
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trash-action-svg {
  width: 16px;
  height: 16px;
}

.btn-spinner-delete {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Transitions */
.glass-slide-enter-active, .glass-slide-leave-active { transition: opacity 0.3s ease; }
.glass-slide-enter-active :deep(.side-panel-glass), .glass-slide-leave-active :deep(.side-panel-glass) { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-slide-enter-from { opacity: 0; }
.glass-slide-leave-to { opacity: 0; }
.glass-slide-enter-from :deep(.side-panel-glass) { transform: translateX(100%); }
.glass-slide-leave-to :deep(.side-panel-glass) { transform: translateX(100%); }

.glass-modal-enter-active, .glass-modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-modal-enter-from, .glass-modal-leave-to { opacity: 0; transform: scale(0.96) translateY(12px); }
</style>

<style>
/* Global safety rules for teleported VR dropdown elements */
.custom-oculos-trigger .vr-headset-svg {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  max-width: 20px !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.custom-oculos-trigger .trigger-chevron svg {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  max-width: 18px !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.custom-oculos-trigger .headset-icon-box {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  flex-shrink: 0 !important;
}
</style>