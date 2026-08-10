<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nome }}</span>!</h1>
        <p class="welcome-subtitle">Painel do Facilitador de Grupos.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Instituição Vinculada: <span class="highlight-inst">{{ nomeInstituicao }}</span></h3>

    <div class="divider"></div>
    <h3 class="section-title">Meus Grupos</h3>
    
    <div v-if="loadingGrupos" class="sub-loading">Carregando grupos...</div>
    <div v-else class="cards-grid">
      <div 
        v-for="grupo in meusGrupos" 
        :key="grupo.id" 
        class="grupo-card"
        @click="abrirDetalhes(grupo)"
      >
        <h4 class="grupo-nome">{{ grupo.nome }}</h4>
        <p class="grupo-info">{{ grupo.participantes ? grupo.participantes.length : 0 }} participante(s)</p>
        <span class="btn-ver-mais">Ver detalhes &rarr;</span>
      </div>
      <p v-if="meusGrupos.length === 0" class="empty-state">Você ainda não criou nenhum grupo.</p>
    </div>

    <div class="divider"></div>
    <h3 class="section-title">Minhas Salas VR</h3>
    
    <div v-if="loadingSalas" class="sub-loading">Carregando salas configuradas...</div>
    <div v-else class="cards-grid">
      <div 
        v-for="sala in minhasSalas" 
        :key="sala.id" 
        class="grupo-card"
        @click="abrirDetalhesSala(sala)"
      >
        <h4 class="grupo-nome">{{ sala.roomName || 'Sala sem nome' }}</h4>
        <p class="grupo-info">Público: {{ sala.targetType === 'grupo' ? 'Grupo' : 'Aluno' }}</p>
        <span class="btn-ver-mais">Ver detalhes &rarr;</span>
      </div>
      <p v-if="minhasSalas.length === 0" class="empty-state">Nenhuma sala VR configurada.</p>
    </div>

    <!-- Side Panel de Detalhes do Grupo -->
    <Teleport to="body">
      <Transition name="slide-panel">
        <div v-if="grupoSelecionado" class="side-panel-overlay" @click.self="fecharDetalhes">
          <div class="side-panel-content">
            <div class="panel-header">
              <div class="header-left">
                <div v-if="editandoNome" class="edit-name-container">
                  <input type="text" v-model="novoNomeGrupo" class="input-edit" placeholder="Nome do grupo" />
                  <button class="btn-icon save-icon" @click="salvarNomeGrupo" :disabled="loadingAction">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button class="btn-icon cancel-icon" @click="cancelarEdicaoNome" :disabled="loadingAction">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <div v-else class="title-container">
                  <h2 class="panel-title">{{ grupoSelecionado.nome }}</h2>
                  <button class="btn-icon edit-icon" title="Renomear Grupo" @click="iniciarEdicaoNome">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </div>
                <p class="data-criacao">Criado em: {{ formatData(grupoSelecionado.criadoEm) }}</p>
              </div>
              <button class="close-btn" @click="fecharDetalhes">&times;</button>
            </div>
            
            <div class="panel-body">
              <div class="participantes-header">
                <h4 class="participantes-title">
                  Participantes ({{ grupoSelecionado.participantes ? grupoSelecionado.participantes.length : 0 }})
                </h4>
                <button class="btn-add-member" @click="toggleAddMember" :disabled="loadingAction">
                  {{ adicionandoMembros ? 'Ocultar Pesquisa' : '+ Adicionar Membros' }}
                </button>
              </div>

              <!-- Add Members Area -->
              <div v-if="adicionandoMembros" class="add-members-section">
                <input type="text" v-model="searchQuery" class="input-search" placeholder="Pesquisar novos membros (nome ou email)..." />
                <div v-if="loadingMembros" class="sub-loading">Buscando membros...</div>
                <div v-else class="available-members-list">
                  <div v-for="user in membrosDisponiveisFiltrados" :key="user.id" class="available-member-item">
                    <div class="user-info">
                      <span class="u-nome">{{ user.nome }}</span>
                      <span class="u-email">{{ user.email }}</span>
                    </div>
                    <button class="btn-icon add-icon" title="Adicionar" @click="adicionarParticipante(user)" :disabled="loadingAction">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                  <p v-if="membrosDisponiveisFiltrados.length === 0" class="empty-state-small">Nenhum membro disponível para adicionar.</p>
                </div>
              </div>
              
              <ul class="participantes-list" v-if="grupoSelecionado.participantes && grupoSelecionado.participantes.length > 0">
                <li v-for="part in grupoSelecionado.participantes" :key="part.id" class="participante-item">
                  <div class="part-avatar">{{ part.nome ? part.nome.charAt(0).toUpperCase() : 'U' }}</div>
                  <div class="part-info">
                    <span class="part-nome">{{ part.nome }}</span>
                    <span class="part-email">{{ part.email }}</span>
                    <span class="part-tipo">{{ part.tipo }}</span>
                  </div>
                  <button class="btn-icon remove-icon" title="Remover participante" @click="removerParticipante(part)" :disabled="loadingAction">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </li>
              </ul>
              <div v-else class="empty-state">
                Este grupo não possui participantes.
              </div>
            </div>
            
            <div class="panel-footer">
              <button class="btn-excluir-grupo" @click="confirmarExclusaoGrupo" :disabled="loadingAction">
                Excluir Grupo
              </button>
              <button class="btn-fechar-painel" @click="fecharDetalhes">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de Detalhes da Sala VR -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="salaSelecionada" class="modal-overlay" @click.self="fecharDetalhesSala">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">{{ salaSelecionada.roomName || 'Sala VR' }}</h3>
              <button class="close-btn" @click="fecharDetalhesSala">&times;</button>
            </div>
            <div class="modal-body vr-details-body">
              <div class="vr-info-grid">
                <div class="vr-info-item"><strong>Público:</strong> {{ salaSelecionada.targetType === 'grupo' ? 'Grupo' : 'Aluno' }}</div>
                <div class="vr-info-item"><strong>Meninos:</strong> {{ salaSelecionada.numBoys }}</div>
                <div class="vr-info-item"><strong>Meninas:</strong> {{ salaSelecionada.numGirls }}</div>
                <div class="vr-info-item"><strong>Mesas:</strong> {{ salaSelecionada.numDesks }}</div>
                <div class="vr-info-item"><strong>Formato (Shape):</strong> {{ salaSelecionada.shape }}</div>
                <div class="vr-info-item"><strong>Fileiras:</strong> {{ salaSelecionada.rows }}</div>
                <div class="vr-info-item"><strong>Colunas:</strong> {{ salaSelecionada.cols }}</div>
                <div class="vr-info-item"><strong>Raio:</strong> {{ salaSelecionada.radius }}</div>
                <div class="vr-info-item"><strong>Máx. Mesas Semicírculo:</strong> {{ salaSelecionada.maxDesksInSemiCircle }}</div>
              </div>

              <div class="divider"></div>
              
              <h4 class="section-subtitle">Configuração da Sessão Ativa</h4>
              <div v-if="loadingDetalhes" class="sub-loading">Carregando dispositivos e participantes...</div>
              <div v-else class="active-config-section">
                
                <!-- Óculos -->
                <div class="config-block">
                  <label class="input-label">Óculos VR Vinculado</label>
                  <select v-model="selectedActiveOculos" class="input-field-modal" :disabled="salvandoAtivos">
                    <option :value="null">Nenhum (Selecione um dispositivo)</option>
                    <option v-for="oculos in oculosDisponiveis" :key="oculos.id" :value="oculos.id">
                      Óculos N° {{ oculos.numero_oculos || 'Sem Número' }} ({{ oculos.id.substring(0,6) }})
                    </option>
                  </select>
                  <p v-if="oculosDisponiveis.length === 0" class="empty-state-small">Nenhum óculos cadastrado na instituição.</p>
                </div>
                
                <!-- Participante -->
                <div class="config-block">
                  <label class="input-label">Participante no Jogo (Ativo)</label>
                  <div class="participants-radio-list">
                    <label 
                      v-for="p in participantesSala" 
                      :key="p.id" 
                      :class="['participant-radio', { 'is-active': selectedActiveParticipant === p.id }]"
                    >
                      <input 
                        type="radio" 
                        name="activeParticipant" 
                        :value="p.id" 
                        v-model="selectedActiveParticipant" 
                        :disabled="salaSelecionada.targetType === 'aluno' || salvandoAtivos"
                      />
                      <div class="p-radio-info">
                        <span class="p-radio-nome">{{ p.nome }}</span>
                        <span class="p-radio-email">{{ p.email }}</span>
                        <span v-if="salaSelecionada.targetType === 'aluno'" class="p-radio-badge">ALUNO FIXO</span>
                      </div>
                    </label>
                    <p v-if="participantesSala.length === 0" class="empty-state-small">Nenhum participante encontrado neste grupo.</p>
                  </div>
                </div>

                <div class="feedback-area" v-if="mensagemAtivos">
                  <p :class="['feedback-msg', tipoMensagem]">{{ mensagemAtivos }}</p>
                </div>

                <button class="btn-primary btn-salvar-ativos" @click="salvarConfiguracoesAtivas" :disabled="salvandoAtivos">
                  {{ salvandoAtivos ? 'Salvando...' : 'Salvar Sessão' }}
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
        nomeInstituicao.value = data.nomeFaculdade || data.nomeInstituicao || 'Instituição'
      } else {
        nomeInstituicao.value = 'Instituição não encontrada'
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
        selectedActiveParticipant.value = sala.targetId // Trava sempre no aluno
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
            mensagemExtra = ` (Óculos movido de outra sala automaticamente)`
          }
        }
      }
    }

    updates[`classroom_configs/${salaSelecionada.value.id}/activeParticipantId`] = selectedActiveParticipant.value
    updates[`classroom_configs/${salaSelecionada.value.id}/activeHeadsetId`] = selectedActiveOculos.value || null

    await update(dbRef(database), updates)

    tipoMensagem.value = 'success'
    mensagemAtivos.value = 'Configuração da sessão salva!' + mensagemExtra
    
    await fetchSalasVR()
  } catch (error) {
    console.error("Erro ao salvar configurações ativas:", error)
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => { mensagemAtivos.value = '' }, 6000)
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
    await fetchGrupos() // Atualiza os cartões
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
        .filter(u => u.instituicaoId === props.userData.instituicaoId) // Da mesma inst
        .filter(u => !participantesIds.includes(u.id)) // Que já não estejam no grupo
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
    // Remove the user from the available list locally to update UI immediately
    membrosDisponiveis.value = membrosDisponiveis.value.filter(m => m.id !== userToAdd.id)
    
    await fetchGrupos() // Atualiza os cartões (contagem)
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
    
    // If the add member section is open, we should fetch available members again so the removed one shows up there
    if (adicionandoMembros.value) {
      fetchMembrosDisponiveis()
    }
    
    await fetchGrupos() // Atualiza contagem nos cartões
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
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.user-avatar { width: 65px; height: 65px; background: linear-gradient(135deg, #0066FF, #10b981); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2); }
.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.highlight-inst { color: #10b981; font-weight: 700; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 24px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.grupo-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.grupo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 102, 255, 0.1);
  border-color: #bfdbfe;
}

.grupo-nome {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.grupo-info {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 16px;
  flex-grow: 1;
}

.btn-ver-mais {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0066FF;
  align-self: flex-start;
  transition: color 0.2s;
}
.grupo-card:hover .btn-ver-mais {
  color: #0052cc;
}

/* Side Panel Styles */
.side-panel-overlay {
  position: fixed;
  top: 0; left: 0; 
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

.side-panel-content {
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  height: 100%;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8fafc;
}

.header-left { flex-grow: 1; padding-right: 12px; }

.title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.panel-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.edit-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.input-edit {
  flex: 1;
  padding: 6px 12px;
  border: 1.5px solid #0066FF;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
}

.btn-icon {
  background: none; border: none; padding: 4px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #64748b; transition: all 0.2s;
}
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-icon svg { width: 20px; height: 20px; }

.edit-icon:hover { background: #e0e7ff; color: #0066FF; }
.save-icon { background: #10b981; color: white; }
.save-icon:hover { background: #059669; }
.cancel-icon { background: #e2e8f0; color: #475569; }
.cancel-icon:hover { background: #cbd5e1; }
.add-icon { background: #dbeafe; color: #0066FF; }
.add-icon:hover { background: #bfdbfe; }
.remove-icon:hover { background: #fee2e2; color: #ef4444; }

.data-criacao {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.panel-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.participantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.participantes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.btn-add-member {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add-member:hover {
  background: #e0e7ff;
  border-color: #0066FF;
  color: #0066FF;
}

.add-members-section {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}
.input-search {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 12px;
  outline: none;
}
.input-search:focus { border-color: #0066FF; }

.available-members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar para listinha de membros disponiveis */
.available-members-list::-webkit-scrollbar { width: 4px; }
.available-members-list::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }

.available-member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.user-info { display: flex; flex-direction: column; }
.u-nome { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
.u-email { font-size: 0.8rem; color: #64748b; }
.empty-state-small { font-size: 0.85rem; color: #64748b; text-align: center; margin: 8px 0; }

.participantes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participante-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  transition: all 0.2s;
}

.participante-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.part-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066FF, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.part-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
}

.part-nome {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.part-email {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 2px;
}

.part-tipo {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #10b981;
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.panel-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-fechar-painel {
  width: 100%;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-fechar-painel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-excluir-grupo {
  width: 100%;
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-excluir-grupo:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}
.btn-excluir-grupo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.3s ease;
}

.slide-panel-enter-active .side-panel-content,
.slide-panel-leave-active .side-panel-content {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
}

.slide-panel-enter-from .side-panel-content,
.slide-panel-leave-to .side-panel-content {
  transform: translateX(100%);
}

/* Modal extra styles para a Sala VR */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: fadeUp 0.3s ease;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }

.modal-body { padding: 24px; }

.vr-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.vr-info-item {
  font-size: 0.95rem;
  color: #475569;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.vr-info-item strong { color: #0f172a; display: block; margin-bottom: 4px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }

/* Active Session Section */
.section-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.active-config-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.input-field-modal {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #0f172a;
  outline: none;
}
.input-field-modal:focus {
  border-color: #0066FF;
}

.participants-radio-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}
.participants-radio-list::-webkit-scrollbar { width: 4px; }
.participants-radio-list::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }

.participant-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}
.participant-radio:hover {
  background: #f1f5f9;
}
.participant-radio.is-active {
  border-color: #0066FF;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.1);
}
.participant-radio input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #0066FF;
}

.p-radio-info { display: flex; flex-direction: column; flex-grow: 1;}
.p-radio-nome { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
.p-radio-email { font-size: 0.8rem; color: #64748b; }
.p-radio-badge { font-size: 0.7rem; font-weight: 700; color: #10b981; margin-top: 4px; letter-spacing: 0.5px;}

.btn-salvar-ativos {
  padding: 14px;
  background-color: #0066FF;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}
.btn-salvar-ativos:hover:not(:disabled) {
  background-color: #0052cc;
  transform: translateY(-2px);
}
.btn-salvar-ativos:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.feedback-msg {
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}
.feedback-msg.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>