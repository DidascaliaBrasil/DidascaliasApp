<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nome }}</span>!</h1>
        <p class="welcome-subtitle">Painel do Professor.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Meus Grupos</h3>
    <div v-if="loadingGrupos" class="sub-loading">Carregando seus grupos...</div>
    <div v-else class="cards-grid">
      <div v-for="grupo in grupos" :key="grupo.id" class="info-box clickable" @click="abrirModal(grupo)">
        <div class="box-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="box-content">
          <span class="label">Grupo</span>
          <span class="value">{{ grupo.nome }}</span>
          <span class="sub-value">Facilitador: <strong>{{ grupo.facilitadorNome }}</strong></span>
        </div>
      </div>
      <p v-if="grupos.length === 0" class="empty-state">Você ainda não está vinculado a nenhum grupo.</p>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Salas VR Disponíveis</h3>
    <div v-if="loadingSalas" class="sub-loading">Carregando salas VR...</div>
    <div v-else class="cards-grid">
      <div v-for="sala in salasVR" :key="sala.id" class="info-box sala-card clickable" @click="abrirModalSala(sala)">
        <div class="box-icon sala-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12h4l3-9 5 18 3-9h5"></path>
          </svg>
        </div>
        <div class="box-content">
          <span class="label">Ambiente VR</span>
          <span class="value">{{ sala.roomName || 'Sala sem nome' }}</span>
          <span class="sub-value">Criado por facilitador</span>
        </div>
      </div>
      <p v-if="salasVR.length === 0" class="empty-state">Você ainda não tem nenhuma Sala VR agendada.</p>
    </div>

    <!-- Modal de Detalhes do Grupo -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalAberto" class="modal-overlay" @click="fecharModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">{{ grupoSelecionado?.nome }}</h3>
              <button class="btn-close" @click="fecharModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-info"><strong>Facilitador:</strong> {{ grupoSelecionado?.facilitadorNome }}</p>
              
              <h4 class="participantes-title">Participantes ({{ grupoSelecionado?.participantes?.length || 0 }})</h4>
              <div class="participantes-list">
                <div v-for="p in grupoSelecionado?.participantes" :key="p.id" class="participante-item">
                  <div class="p-avatar">{{ p.nome ? p.nome.charAt(0).toUpperCase() : 'U' }}</div>
                  <div class="p-info">
                    <span class="p-nome">{{ p.nome }}</span>
                    <span class="p-email">{{ p.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de Detalhes da Sala VR -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="salaSelecionada" class="modal-overlay" @click="fecharModalSala">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">{{ salaSelecionada.roomName || 'Sala VR' }}</h3>
              <button class="btn-close" @click="fecharModalSala">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="modal-body vr-details-body">
              <div class="vr-info-grid">
                <div class="vr-info-item"><strong>Meninos:</strong> {{ salaSelecionada.numBoys }}</div>
                <div class="vr-info-item"><strong>Meninas:</strong> {{ salaSelecionada.numGirls }}</div>
                <div class="vr-info-item"><strong>Mesas:</strong> {{ salaSelecionada.numDesks }}</div>
                <div class="vr-info-item"><strong>Formato (Shape):</strong> {{ salaSelecionada.shape }}</div>
                <div class="vr-info-item"><strong>Fileiras:</strong> {{ salaSelecionada.rows }}</div>
                <div class="vr-info-item"><strong>Colunas:</strong> {{ salaSelecionada.cols }}</div>
                <div class="vr-info-item"><strong>Raio:</strong> {{ salaSelecionada.radius }}</div>
                <div class="vr-info-item"><strong>Máx. Mesas Semicírculo:</strong> {{ salaSelecionada.maxDesksInSemiCircle }}</div>
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
import { ref as dbRef, get } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

const grupos = ref([])
const loadingGrupos = ref(true)

const salasVR = ref([])
const loadingSalas = ref(true)
const salaSelecionada = ref(null)

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

const abrirModalSala = (sala) => {
  salaSelecionada.value = sala
}

const fecharModalSala = () => {
  salaSelecionada.value = null
}

const initials = computed(() => {
  const nome = props.userData.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  try {
    let todosGrupos = {}

    // Verifica se o usuário tem instituição vinculada
    if (props.userData.instituicaoId) {
      const gruposRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos`)
      const snapshot = await get(gruposRef)
      if (snapshot.exists()) {
        todosGrupos = snapshot.val()
      }
    } else {
      // Fallback para caso antigo ou sem instituição definida
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
          // Checa o formato novo (array de participantes)
          if (g.participantes && Array.isArray(g.participantes)) {
            return g.participantes.some(p => p.id === props.userData.id)
          }
          // Checa o formato antigo (objeto membros)
          if (g.membros) {
            return g.membros[props.userData.id]
          }
          return false
        })
    }
    
    // Fetch Salas VR
    const salasRef = dbRef(database, 'classroom_configs')
    const salasSnap = await get(salasRef)
    if (salasSnap.exists()) {
      const todasSalas = salasSnap.val()
      salasVR.value = Object.keys(todasSalas)
        .map(key => ({ id: key, ...todasSalas[key] }))
        .filter(s => {
          if (s.instituicaoId !== props.userData.instituicaoId) return false
          
          if (s.targetType === 'aluno' && s.targetId === props.userData.id) {
            return true
          }
          if (s.targetType === 'grupo' && grupos.value.some(g => g.id === s.targetId)) {
            return true
          }
          return false
        })
    }

  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
  } finally {
    loadingGrupos.value = false
    loadingSalas.value = false
  }
})
</script>

<style scoped>
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.user-avatar { width: 65px; height: 65px; background: linear-gradient(135deg, #0066FF, #10b981); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2); }
.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 20px; 
}

/* Cartões com layout de Ícone + Texto */
.info-box { 
  display: flex; 
  align-items: center;
  gap: 16px;
  padding: 20px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.info-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.08);
  border-color: #bfdbfe;
}

.box-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #0066FF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.box-icon svg { width: 24px; height: 24px; }

.sala-icon {
  background: #ecfdf5;
  color: #10b981;
}
.sala-card:hover {
  border-color: #a7f3d0;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.08);
}
.sala-card .label { color: #10b981; }

.box-content { display: flex; flex-direction: column; }

.label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #0066FF; letter-spacing: 0.5px; margin-bottom: 4px; }
.value { font-size: 1.15rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sub-value { font-size: 0.85rem; color: #64748b; }
.sub-value strong { color: #0f172a; font-weight: 500; }

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.clickable { cursor: pointer; }

/* Modal Styles */
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

.btn-close {
  background: none; border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.btn-close:hover { background: #f1f5f9; color: #ef4444; }
.btn-close svg { width: 20px; height: 20px; }

.modal-body { padding: 24px; }
.modal-info { margin: 0 0 20px 0; font-size: 0.95rem; color: #64748b; }
.modal-info strong { color: #0f172a; }

.participantes-title { margin: 0 0 12px 0; font-size: 1rem; font-weight: 600; color: #0f172a; }
.participantes-list {
  display: flex; flex-direction: column; gap: 12px;
  max-height: 300px; overflow-y: auto;
  padding-right: 8px;
}
.participantes-list::-webkit-scrollbar { width: 6px; }
.participantes-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.participante-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 12px;
}
.p-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #0066FF, #10b981);
  color: white; font-weight: 600; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
}
.p-info { display: flex; flex-direction: column; }
.p-nome { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
.p-email { font-size: 0.8rem; color: #64748b; }

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


.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>