<template>
  <div class="role-view">
    
    <!-- Hero Profile Header com Glassmorphism -->
    <div class="profile-hero-glass">
      <div class="profile-header-content">
        <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
        <div class="welcome-texts">
          <div class="badge-role-tag">
            <span class="pulse-dot"></span>
            <span>Painel do Professor / Estudante</span>
          </div>
          <h1 class="welcome-title">
            Bem-vindo(a), <span class="highlight-gradient notranslate" translate="no">{{ userData.nome }}</span>!
          </h1>
          <p class="welcome-subtitle">Acompanhe seus grupos de estudo, acesse os ambientes virtuais e veja seu desempenho em VR.</p>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="quick-actions-bar">
        <router-link to="/meus-resultados" class="quick-btn primary" title="Ver meus resultados e histórico VR">
          <span class="q-icon">📊</span>
          <div class="q-text">
            <span class="q-title">Meus Resultados VR</span>
            <span class="q-desc">Ações e tempo de simulação</span>
          </div>
        </router-link>
        <router-link to="/meus-grupos-usuario" class="quick-btn secondary" title="Ver minhas turmas">
          <span class="q-icon">👥</span>
          <div class="q-text">
            <span class="q-title">Meus Grupos</span>
            <span class="q-desc">Turmas de estudo</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="stats-row">
      <div class="stat-pill">
        <span class="stat-num">{{ minhasSessoesCount }}</span>
        <span class="stat-label">Sessões VR Concluídas</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ grupos.length }}</span>
        <span class="stat-label">Meus Grupos Vinculados</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{{ salasVR.length }}</span>
        <span class="stat-label">Salas VR Disponíveis</span>
      </div>
    </div>

    <!-- Seção de Meus Grupos -->
    <section class="content-section">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Meus Grupos de Aprendizagem</h3>
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
          <h3>Nenhum grupo vinculado</h3>
          <p>Você ainda não foi adicionado a nenhuma turma pelos facilitadores.</p>
        </div>
      </div>
    </section>

    <!-- Seção de Salas VR Disponíveis -->
    <section class="content-section" style="margin-top: 36px;">
      <div class="section-header">
        <div class="section-title-group">
          <h3 class="section-title">Salas Virtuais (Ambientes 3D)</h3>
          <span class="count-badge">{{ salasVR.length }}</span>
        </div>
      </div>

      <div v-if="loadingSalas" class="sub-loading-glass">
        <div class="mini-spinner"></div>
        <span>Carregando salas VR...</span>
      </div>

      <div v-else class="cards-grid">
        <div 
          v-for="sala in salasVR" 
          :key="sala.id" 
          :class="['glass-card sala-card clickable-card', { 'sala-completed-glow': sala.jaFez }]" 
          @click="abrirModalSala(sala)"
        >
          <div class="card-top">
            <div class="tags-left-wrap">
              <span class="role-pill pill-vr">AMBIENTE VR</span>
              <span :class="['situacao-badge', isSalaAtiva(sala) ? 'situacao-ativa' : 'situacao-inativa']">
                <span class="situacao-dot"></span>
                {{ isSalaAtiva(sala) ? 'Ativa' : 'Inativa' }}
              </span>
              <span class="target-tag">
                {{ sala.targetType === 'grupo' ? '👥 Grupo' : '👤 Individual' }}
              </span>
            </div>

            <!-- Indicador Visual: Já fez e quantas vezes -->
            <span v-if="sala.jaFez" class="completion-pill completed" title="Você já concluiu esta sala">
              <span class="check-icon">✓</span> Realizada ({{ sala.minhasSessoesCount }}x)
            </span>
            <span v-else class="completion-pill pending" title="Você ainda não realizou esta sala">
              ⏳ Pendente
            </span>
          </div>

          <h4 class="sala-name notranslate" translate="no">{{ sala.roomName || 'Sala sem nome' }}</h4>
          
          <div class="sala-chips-row">
            <span class="chip-info">Mesas: {{ sala.numDesks || 0 }}</span>
            <span class="chip-info">Formato: {{ sala.shape === 1 ? 'Semicírculo' : 'Padrão' }}</span>
          </div>

          <div class="sala-footer-status">
            <span v-if="sala.jaFez" class="status-badge user-done">
              🟢 Você já fez {{ sala.minhasSessoesCount }} vez(es)
            </span>
            <span v-else class="status-badge user-pending">
              ⚪ Não realizada ainda
            </span>
            <span class="action-arrow">&rarr;</span>
          </div>
        </div>

        <div v-if="salasVR.length === 0" class="empty-state-glass">
          <span class="empty-emoji">🥽</span>
          <h3>Nenhuma sala VR agendada</h3>
          <p>Não há sessões de realidade virtual configuradas para você ou para seu grupo no momento.</p>
        </div>
      </div>
    </section>

    <!-- Modal Apple Glass de Detalhes do Grupo -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="modalAberto" class="modal-overlay" @click="fecharModal">
          <div class="modal-glass-container" @click.stop>
            
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">DETALHES DO GRUPO</span>
                <h3 class="modal-title notranslate" translate="no">{{ grupoSelecionado?.nome }}</h3>
              </div>
              <button class="close-btn" @click="fecharModal" aria-label="Fechar modal">&times;</button>
            </div>

            <div class="modal-body">
              <div class="facilitador-hero-glass">
                <span class="f-label">Facilitador Responsável</span>
                <span class="f-hero-name notranslate" translate="no">{{ grupoSelecionado?.facilitadorNome || 'Não informado' }}</span>
              </div>
              
              <h4 class="section-subtitle" style="margin-top: 20px;">
                Colegas de Turma ({{ grupoSelecionado?.participantes?.length || 0 }})
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

    <!-- Modal Apple Glass de Detalhes da Sala VR com Histórico Pessoal -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="salaSelecionada" class="modal-overlay" @click="fecharModalSala">
          <div class="modal-glass-container" @click.stop style="max-width: 580px;">
            
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span class="modal-tag">ESPECIFICAÇÕES DO AMBIENTE VR</span>
                  <span :class="['situacao-badge', isSalaAtiva(salaSelecionada) ? 'situacao-ativa' : 'situacao-inativa']">
                    <span class="situacao-dot"></span>
                    {{ isSalaAtiva(salaSelecionada) ? 'Sala Ativa' : 'Sala Inativa' }}
                  </span>
                </div>
                <h3 class="modal-title notranslate" translate="no">{{ salaSelecionada.roomName || 'Sala VR' }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalSala" aria-label="Fechar modal">&times;</button>
            </div>

            <div class="modal-body">
              
              <!-- Bloco de Status Pessoal nesta Sala -->
              <div :class="['my-room-progress-box', { 'is-completed': salaSelecionada.jaFez }]">
                <div class="my-progress-header">
                  <span class="p-icon">{{ salaSelecionada.jaFez ? '🏆' : '⏳' }}</span>
                  <div class="p-texts">
                    <span class="p-title">
                      {{ salaSelecionada.jaFez 
                        ? `Você já realizou esta simulação ${salaSelecionada.minhasSessoesCount} vez(es)` 
                        : 'Você ainda não realizou esta simulação VR' }}
                    </span>
                    <span class="p-sub">
                      {{ salaSelecionada.jaFez 
                        ? 'Veja abaixo o tempo e as tentativas registradas com seu usuário.' 
                        : 'Quando o facilitador iniciar uma sessão com você no headset, seus resultados aparecerão aqui.' }}
                    </span>
                  </div>
                </div>

                <!-- Lista de Tentativas do Usuário nesta Sala -->
                <div v-if="salaSelecionada.jaFez && salaSelecionada.minhasSessoes?.length > 0" class="my-sessions-in-room-list">
                  <div v-for="(sess, idx) in salaSelecionada.minhasSessoes" :key="idx" class="my-mini-session-row">
                    <span class="attempt-badge">Tentativa #{{ idx + 1 }}</span>
                    <span class="attempt-date">{{ formatarData(sess.dataInicio) }}</span>
                    <span class="attempt-time">⏱️ {{ formatarDuracao(sess.duracaoSegundos) }}</span>
                    <span class="attempt-intents">⚡ {{ sess.totalIntents }} ações</span>
                  </div>
                  
                  <router-link to="/meus-resultados" class="btn-link-my-results">
                    Ver todos os meus relatórios completos &rarr;
                  </router-link>
                </div>
              </div>

              <!-- Grid de Configurações Técnicas da Sala -->
              <h4 class="section-subtitle" style="margin-top: 18px;">Parâmetros do Cenário Virtual</h4>
              <div class="vr-specs-glass">
                <div class="spec-item">
                  <span class="spec-label">Meninos / Meninas</span>
                  <span class="spec-value">{{ salaSelecionada.numBoys }} 👦 / {{ salaSelecionada.numGirls }} 👧</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Mesas / Formato</span>
                  <span class="spec-value">{{ salaSelecionada.numDesks }} mesas (Shape {{ salaSelecionada.shape }})</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Fileiras / Colunas</span>
                  <span class="spec-value">{{ salaSelecionada.rows }} fileiras x {{ salaSelecionada.cols }} colunas</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Raio do Cenário</span>
                  <span class="spec-value">{{ salaSelecionada.radius }}m</span>
                </div>
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
import { ref as dbRef, get, query, orderByChild, equalTo } from 'firebase/database'
import { formatarData, formatarDuracao } from '../../services/resultadosService'
import { isSalaAtiva, getSituacaoLabel } from '../../utils/salaUtils'

const props = defineProps({
  userData: { type: Object, required: true }
})

const grupos = ref([])
const loadingGrupos = ref(true)

const salasVR = ref([])
const loadingSalas = ref(true)
const salaSelecionada = ref(null)
const minhasSessoesCount = ref(0)

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
  const nomes = String(nome).trim().split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const normalizarId = (id) => {
  if (!id) return ''
  return String(id).trim().toUpperCase()
}

const isMinhaSessao = (pId, user) => {
  if (!pId || !user) return false
  const pNorm = normalizarId(pId)
  const uId = normalizarId(user.id)
  const uUid = normalizarId(user.uid)
  const uShort = uUid ? uUid.substring(0, 8) : ''
  return pNorm === uId || pNorm === uUid || (uShort && pNorm === uShort)
}

onMounted(async () => {
  try {
    let todosGrupos = {}

    if (props.userData.instituicaoId) {
      const gruposRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}/grupos`)
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
            return g.participantes.some(p => p.id === props.userData.id)
          }
          if (g.membros) {
            return g.membros[props.userData.id]
          }
          return false
        })
    }
    
    // Fetch Salas VR & Contagem de Sessões do Usuário via Query Indexada por instituicaoId
    let todasSalas = {}
    if (props.userData.instituicaoId) {
      const qSalas = query(dbRef(database, 'classroom_configs'), orderByChild('instituicaoId'), equalTo(props.userData.instituicaoId))
      const salasSnap = await get(qSalas)
      if (salasSnap.exists()) {
        todasSalas = salasSnap.val()
      }
    }

    if (Object.keys(todasSalas).length > 0) {
      salasVR.value = Object.keys(todasSalas)
        .map(key => {
          const raw = todasSalas[key]
          const minhasSessoes = []
          if (raw.Resultados) {
            for (const sKey in raw.Resultados) {
              const sess = raw.Resultados[sKey]
              const pId = sess?.activeParticipantId || sess?.participantId || ''
              if (isMinhaSessao(pId, props.userData)) {
                minhasSessoes.push({
                  id: sKey,
                  dataInicio: sess.dataInicio || sess.data || '',
                  duracaoSegundos: Number(sess.duracaoSegundos || sess.duracao || 0),
                  totalIntents: Number(sess.totalIntents || 0),
                  intentsDetalhada: sess.intentsDetalhada || sess.intents || {}
                })
              }
            }
          }
          return {
            id: key,
            ...raw,
            minhasSessoes,
            minhasSessoesCount: minhasSessoes.length,
            jaFez: minhasSessoes.length > 0
          }
        })
        .filter(s => {
          if (s.targetType === 'aluno' && s.targetId === props.userData.id) {
            return true
          }
          if (s.targetType === 'grupo' && grupos.value.some(g => g.id === s.targetId)) {
            return true
          }
          return false
        })

      minhasSessoesCount.value = salasVR.value.reduce((acc, s) => acc + s.minhasSessoesCount, 0)
    } else {
      salasVR.value = []
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
.role-view {
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
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
}

.f-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.f-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
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

.status-badge.user-done {
  background: #ecfdf5;
  color: #059669;
  font-weight: 700;
  border: 1px solid #a7f3d0;
}

.status-badge.user-pending {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.tags-left-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.completion-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.completion-pill.completed {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.completion-pill.pending {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}

.check-icon {
  font-weight: 900;
}

.sala-completed-glow {
  border-color: rgba(16, 185, 129, 0.4) !important;
}

/* Modal Personal Progress Box */
.my-room-progress-box {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.my-room-progress-box.is-completed {
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(240, 253, 250, 0.9));
  border-color: #a7f3d0;
}

.my-progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.p-icon { font-size: 1.6rem; }
.p-texts { display: flex; flex-direction: column; gap: 2px; }
.p-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; }
.p-sub { font-size: 0.78rem; color: #64748b; }

.my-sessions-in-room-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid rgba(167, 243, 208, 0.6);
}

.my-mini-session-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(209, 250, 229, 0.8);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.attempt-badge { color: #059669; font-weight: 800; }
.attempt-date { color: #64748b; }
.attempt-time { color: #0f172a; font-weight: 700; }
.attempt-intents { color: #0071e3; font-weight: 700; }

.btn-link-my-results {
  margin-top: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0071e3;
  text-decoration: none;
  align-self: flex-start;
  transition: transform 0.2s ease;
}

.btn-link-my-results:hover {
  text-decoration: underline;
  transform: translateX(3px);
}

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

.empty-emoji { font-size: 2.5rem; display: block; margin-bottom: 8px; }
.empty-state-glass h3 { font-size: 1.2rem; color: #0f172a; margin: 0 0 6px 0; }
.empty-state-glass p { font-size: 0.9rem; margin: 0; }

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

.glass-modal-enter-active, .glass-modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-modal-enter-from, .glass-modal-leave-to { opacity: 0; transform: scale(0.96) translateY(10px); }
</style>