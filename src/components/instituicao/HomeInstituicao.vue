<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nomeFaculdade || userData.nomeInstituicao || 'Gestor' }}</span>!</h1>
        <p class="welcome-subtitle">Painel de Administração da Instituição.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Membros da Instituição</h3>
    <div v-if="loadingMembros" class="sub-loading">Carregando membros...</div>
    <div v-else class="cards-grid">
      <div v-for="membro in membros" :key="membro.id" class="info-box membro-card">
        <span class="label">{{ membro.tipoCadastro || membro.tipo }}</span>
        <span class="value">{{ membro.nome }}</span>
        <span class="sub-value">{{ membro.email }}</span>
      </div>
      <p v-if="membros.length === 0" class="empty-state">Nenhum membro vinculado encontrado.</p>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Salas VR da Instituição</h3>
    <div v-if="loadingSalas" class="sub-loading">Carregando salas VR...</div>
    <div v-else class="cards-grid">
      <div v-for="sala in salasVR" :key="sala.id" class="info-box sala-card" @click="abrirDetalhesSala(sala)">
        <span class="label">SALA VR</span>
        <span class="value">{{ sala.roomName || 'Sala sem nome' }}</span>
        <span class="sub-value">Público: {{ sala.targetType === 'grupo' ? 'Grupo' : 'Aluno' }}</span>
      </div>
      <p v-if="salasVR.length === 0" class="empty-state">Nenhuma sala VR configurada nesta instituição.</p>
    </div>

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
                <div class="vr-info-item"><strong>Criada por (Facilitador ID):</strong> <span class="text-sm">{{ salaSelecionada.facilitadorId }}</span></div>
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
import { ref as dbRef, get, update } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

const membros = ref([])
const loadingMembros = ref(true)

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
    
    await fetchSalas()
  } catch (error) {
    console.error("Erro ao salvar configurações ativas:", error)
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => { mensagemAtivos.value = '' }, 6000)
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
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #0066FF, #10b981);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2);
}

.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }

.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 20px; 
}

.membro-card, .sala-card { 
  display: flex; 
  flex-direction: column; 
  padding: 20px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.membro-card:hover, .sala-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.08);
  border-color: #bfdbfe;
}

.sala-card { cursor: pointer; }

.label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #10b981; letter-spacing: 0.5px; margin-bottom: 8px; }
.sala-card .label { color: #0066FF; }
.value { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sub-value { font-size: 0.85rem; color: #64748b; }

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Active Session Section styles */
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

@media (max-width: 600px) {
  .modal-content {
    margin: 20px;
    width: auto;
  }
}

/* Modal styles para a Sala VR */
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
.text-sm { font-size: 0.75rem; word-break: break-all; display: block; margin-top: 2px;}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>