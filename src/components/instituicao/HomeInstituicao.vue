<template>
  <div class="role-view">
    
    <!-- Hero Profile Header com Glassmorphism -->
    <div class="profile-hero-glass">
      <div class="profile-header-content">
        <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
        <div class="welcome-texts">
          <div class="badge-role-tag">
            <span class="pulse-dot"></span>
            <span>Painel Institucional</span>
          </div>
          <h1 class="welcome-title">
            Bem-vindo(a), <span class="highlight-gradient notranslate" translate="no">{{ userData.nomeFaculdade || userData.nomeInstituicao || 'Gestor' }}</span>!
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
            <div class="membro-avatar-mini notranslate" translate="no">
              {{ (membro.nome || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
          <span class="membro-name notranslate" translate="no">{{ membro.nome }}</span>
          <span class="membro-email notranslate" translate="no" :title="membro.email">{{ membro.email }}</span>
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
        <p class="section-hint">
          {{ userData?.FacilitadorPlus 
            ? 'Clique em uma sala para vincular óculos, aluno ativo e conduzir a sessão VR.' 
            : 'Clique em uma sala para acompanhar o status e configurações (Modo Somente Leitura).' }}
        </p>
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
            <div class="tags-left-wrap">
              <span class="role-pill pill-vr">SALA VR</span>
              <span :class="['situacao-badge', isSalaAtiva(sala) ? 'situacao-ativa' : 'situacao-inativa']">
                <span class="situacao-dot"></span>
                {{ isSalaAtiva(sala) ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
            <span class="target-tag">
              {{ sala.targetType === 'grupo' ? '👥 Grupo' : '👤 Individual' }}
            </span>
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

        <div v-if="salasVR.length === 0" class="empty-state-glass">
          <span class="empty-emoji">🥽</span>
          <p>Nenhuma sala VR configurada nesta instituição pelos facilitadores.</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../../firebase' 
import { ref as dbRef, get, update, query, orderByChild, equalTo, onValue } from 'firebase/database'
import { isSalaAtiva, getSituacaoLabel } from '../../utils/salaUtils'

const router = useRouter()

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
const facilitadorNome = ref('')
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

const initials = computed(() => {
  const nome = props.userData.nomeFaculdade || props.userData.nomeInstituicao || 'Gestor'
  const nomes = String(nome).trim().split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
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

const abrirDetalhesSala = (sala) => {
  if (sala && sala.id) {
    router.push(`/configurar-sala/${sala.id}`)
  }
}

let unsubSalasVR = null

const fetchSalas = () => {
  try {
    const instId = props.userData.id || props.userData.instituicaoId
    if (!instId) return
    const qSalas = query(dbRef(database, 'classroom_configs'), orderByChild('instituicaoId'), equalTo(instId))
    
    if (unsubSalasVR) {
      unsubSalasVR()
      unsubSalasVR = null
    }

    unsubSalasVR = onValue(qSalas, (salasSnap) => {
      if (salasSnap.exists()) {
        const todasSalas = salasSnap.val()
        salasVR.value = Object.keys(todasSalas)
          .map(key => ({ id: key, ...todasSalas[key] }))
          .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))

        if (salaSelecionada.value) {
          const updated = salasVR.value.find(s => s.id === salaSelecionada.value.id)
          if (updated) {
            salaSelecionada.value = { ...updated }
          }
        }
      } else {
        salasVR.value = []
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
  try {
    const instId = props.userData.id || props.userData.instituicaoId
    if (instId) {
      const qUsers = query(dbRef(database, 'usuarios'), orderByChild('instituicaoId'), equalTo(instId))
      const snapshot = await get(qUsers)
      if (snapshot.exists()) {
        const todosUsuarios = snapshot.val()
        membros.value = Object.keys(todosUsuarios)
          .map(key => ({ id: key, ...todosUsuarios[key] }))
          .filter(u => 
            u.tipoCadastro === 'Facilitador' || u.tipoCadastro === 'Usuario' || 
            u.tipo === 'Facilitador' || u.tipo === 'Usuario'
          )
      } else {
        membros.value = []
      }
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
  min-width: 72px;
  min-height: 72px;
  border-radius: 24px;
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
  text-align: center;
  padding: 4px;
  letter-spacing: -0.5px;
  line-height: 1;
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
  min-width: 0;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 113, 227, 0.12);
}

.quick-btn.primary:hover { border-color: rgba(0, 113, 227, 0.4); background: #eff6ff; }
.quick-btn.secondary:hover { border-color: rgba(16, 185, 129, 0.4); background: #ecfdf5; }
.quick-btn.tertiary:hover { border-color: rgba(139, 92, 246, 0.4); background: #f5f3ff; }

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
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
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

.oculos-menu-item:hover:not(.is-blocked) .action-arrow-sub {
  opacity: 1;
  transform: translateX(0);
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

/* Modal Transitions */
.glass-modal-enter-active, .glass-modal-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-modal-enter-from, .glass-modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}
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