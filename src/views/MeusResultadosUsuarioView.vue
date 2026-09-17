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
        <p>A carregar seus resultados das sessões VR...</p>
      </div>

      <div v-else class="relatorios-container stagger-in-2">
        
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Meu Desempenho VR</span>
              </div>
              <h1 class="welcome-title">Minhas Sessões e Resultados</h1>
              <p class="welcome-subtitle">
                Acompanhe o seu histórico de simulações em Realidade Virtual, tempo imersivo e ações registradas.
              </p>
            </div>
          </div>

          <!-- Estatísticas Pessoais Rápidas -->
          <div class="personal-kpis-grid">
            <div class="personal-kpi-card">
              <div class="pkpi-icon icon-blue">🎮</div>
              <div class="pkpi-info">
                <span class="pkpi-val">{{ minhasSessoes.length }}</span>
                <span class="pkpi-lbl">Sessões Concluídas</span>
              </div>
            </div>

            <div class="personal-kpi-card">
              <div class="pkpi-icon icon-purple">⏱️</div>
              <div class="pkpi-info">
                <span class="pkpi-val">{{ tempoTotalFormatado }}</span>
                <span class="pkpi-lbl">Tempo Total em VR</span>
              </div>
            </div>

            <div class="personal-kpi-card">
              <div class="pkpi-icon icon-green">⏳</div>
              <div class="pkpi-info">
                <span class="pkpi-val">{{ tempoMedioFormatado }}</span>
                <span class="pkpi-lbl">Média por Sessão</span>
              </div>
            </div>

            <div class="personal-kpi-card">
              <div class="pkpi-icon icon-amber">⚡</div>
              <div class="pkpi-info">
                <span class="pkpi-val">{{ totalIntents }}</span>
                <span class="pkpi-lbl">Ações Executadas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção de Salas VR Realizadas pelo Usuário -->
        <div class="glass-dashboard-card" style="margin-bottom: 24px;">
          <div class="card-header-flex">
            <div>
              <h3 class="card-header-title">Salas Virtuais que Você Realizou</h3>
              <p class="card-header-subtitle">Ambientes 3D completados e frequência de repetição das suas simulações.</p>
            </div>
            <span class="total-pill">{{ minhasSalasRealizadas.length }} sala(s) completada(s)</span>
          </div>

          <div v-if="minhasSalasRealizadas.length > 0" class="user-rooms-completed-grid">
            <div 
              v-for="room in minhasSalasRealizadas" 
              :key="room.salaId" 
              class="user-room-completed-card"
            >
              <div class="urc-top">
                <span class="role-pill pill-vr">SALA VR</span>
                <span class="room-play-count-badge">
                  ✓ {{ room.count }}x realizada{{ room.count > 1 ? 's' : '' }}
                </span>
              </div>

              <h4 class="urc-title notranslate" translate="no">{{ room.salaNome }}</h4>

              <div class="urc-stats-row">
                <div class="urc-stat">
                  <span class="urc-lbl">Tempo Total</span>
                  <span class="urc-val">{{ room.tempoFormatado }}</span>
                </div>
                <div class="urc-stat">
                  <span class="urc-lbl">Ações Totais</span>
                  <span class="urc-val">{{ room.totalIntents }}</span>
                </div>
                <div class="urc-stat">
                  <span class="urc-lbl">Última Tentativa</span>
                  <span class="urc-val">{{ formatarData(room.ultimaData, 'data') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-glass" style="margin-top: 16px;">
            <span class="empty-emoji">🥽</span>
            <p>Você ainda não concluiu nenhuma sala VR. Quando realizar simulações no headset, a contagem e as métricas de cada sala aparecerão aqui.</p>
          </div>
        </div>

        <!-- Seção de Ações / Comportamentos do Estudante -->
        <div class="glass-dashboard-card" style="margin-bottom: 24px;">
          <div class="card-header-flex">
            <div>
              <h3 class="card-header-title">Meu Perfil de Ações no Ambiente Virtual</h3>
              <p class="card-header-subtitle">Distribuição e frequência dos seus comportamentos registrados durante as simulações.</p>
            </div>
            <span class="total-pill">{{ totalIntents }} ações no total</span>
          </div>

          <div v-if="minhasIntentsList.length > 0" class="intents-distribution-grid">
            <div 
              v-for="intent in minhasIntentsList" 
              :key="intent.label" 
              class="intent-metric-card"
              :style="{ borderLeftColor: intent.color }"
            >
              <div class="intent-card-header">
                <div class="intent-label-group">
                  <span class="intent-emoji">{{ intent.icon }}</span>
                  <span class="intent-name">{{ intent.label }}</span>
                </div>
                <span class="intent-count" :style="{ color: intent.color }">{{ intent.quantidade }}x</span>
              </div>
              
              <div class="progress-bar-container">
                <div 
                  class="progress-bar-fill" 
                  :style="{ 
                    width: `${totalIntents > 0 ? (intent.quantidade / totalIntents * 100).toFixed(1) : 0}%`,
                    backgroundColor: intent.color
                  }"
                ></div>
              </div>
              
              <span class="percent-label">
                {{ totalIntents > 0 ? (intent.quantidade / totalIntents * 100).toFixed(1) : 0 }}% das suas ações
              </span>
            </div>
          </div>

          <div v-else class="empty-state-glass" style="margin-top: 16px;">
            <span class="empty-emoji">🎮</span>
            <p>Você ainda não concluiu nenhuma sessão nos óculos para gerar seu perfil de ações.</p>
          </div>
        </div>

        <!-- Histórico Cronológico de Sessões do Usuário -->
        <section class="content-section">
          <div class="section-top-bar">
            <div class="section-title-group">
              <h3 class="section-title">Histórico das Minhas Simulações VR</h3>
              <span class="count-badge">{{ minhasSessoes.length }}</span>
            </div>
          </div>

          <div v-if="minhasSessoes.length > 0" class="sessions-history-timeline">
            <div 
              v-for="sessao in minhasSessoes" 
              :key="sessao.id" 
              class="session-timeline-card clickable-session"
              @click="abrirModalSessao(sessao)"
            >
              <div class="timeline-card-header">
                <div class="t-room-group">
                  <span class="role-pill pill-vr">VR COMPLETO</span>
                  <h4 class="t-room-name notranslate" translate="no">{{ sessao.salaNome }}</h4>
                </div>
                <div class="t-badges-group">
                  <span class="time-badge">⏱️ {{ sessao.duracaoFormatada }}</span>
                  <span class="date-badge-pill">📅 {{ formatarData(sessao.dataInicio) }}</span>
                </div>
              </div>

              <!-- Detalhamento de Intents da Sessão -->
              <div class="t-intents-box">
                <span class="t-intents-label">Ações registradas nesta simulação:</span>
                <div class="t-chips-list" v-if="sessao.intentsArray.length > 0">
                  <span 
                    v-for="intent in sessao.intentsArray" 
                    :key="intent.label" 
                    class="intent-badge-pill"
                    :style="{ backgroundColor: intent.bg, color: intent.color }"
                  >
                    {{ intent.icon }} {{ intent.label }}: <strong>{{ intent.quantidade }}x</strong>
                  </span>
                </div>
                <span v-else class="empty-intents-text">Sem ações específicas nesta sessão</span>
              </div>

              <div class="t-card-footer">
                <span class="t-action-link">Ver Análise Detalhada da Sessão &rarr;</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-glass">
            <span class="empty-emoji">🥽</span>
            <h3>Nenhuma sessão VR encontrada para sua conta</h3>
            <p>Quando você participar de uma simulação no óculos de realidade virtual com o seu usuário ativo, seus resultados aparecerão aqui automaticamente.</p>
          </div>
        </section>

      </div>
    </main>

    <!-- Modal Apple Glass: Detalhes da Sessão -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="sessaoModal" class="modal-overlay" @click.self="fecharModalSessao">
          <div class="modal-glass-container" @click.stop>
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">DETALHES DA MINHA SESSÃO</span>
                <h3 class="modal-title notranslate" translate="no">{{ sessaoModal.salaNome }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalSessao">&times;</button>
            </div>

            <div class="modal-body">
              <div class="session-meta-grid">
                <div class="meta-box">
                  <span class="meta-lbl">Data e Hora</span>
                  <span class="meta-val">{{ formatarData(sessaoModal.dataInicio) }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Tempo de Imersão</span>
                  <span class="meta-val">{{ sessaoModal.duracaoFormatada }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Total de Ações</span>
                  <span class="meta-val">{{ sessaoModal.totalIntents }}</span>
                </div>
              </div>

              <h4 class="section-subtitle" style="margin-top: 20px;">Ações e Respostas Registradas</h4>
              <div class="intents-modal-list">
                <div 
                  v-for="item in sessaoModal.intentsArray" 
                  :key="item.label" 
                  class="intent-modal-row"
                  :style="{ borderLeftColor: item.color }"
                >
                  <div class="intent-row-left">
                    <span class="intent-modal-icon">{{ item.icon }}</span>
                    <span class="intent-modal-label">{{ item.label }}</span>
                  </div>
                  <span class="intent-modal-qty" :style="{ color: item.color }">{{ item.quantidade }} vez(es)</span>
                </div>
                <p v-if="sessaoModal.intentsArray.length === 0" class="empty-hint-text">Nenhuma ação específica registrada nesta simulação.</p>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import MenuLateral from '../components/generic/MenuLateral.vue'
import { 
  carregarDadosCompletosInstituicao, 
  isParticipantUser, 
  formatarData, 
  formatarDuracao 
} from '../services/resultadosService'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const userData = ref({})

const minhasSessoes = ref([])
const sessaoModal = ref(null)

const initials = computed(() => {
  const nome = (userData.value.nome || '?').trim()
  const nomes = nome.split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const tempoTotalSegundos = computed(() => {
  return minhasSessoes.value.reduce((acc, s) => acc + s.duracaoSegundos, 0)
})

const tempoTotalFormatado = computed(() => {
  return formatarDuracao(tempoTotalSegundos.value)
})

const tempoMedioFormatado = computed(() => {
  if (minhasSessoes.value.length === 0) return '0s'
  return formatarDuracao(tempoTotalSegundos.value / minhasSessoes.value.length)
})

const totalIntents = computed(() => {
  return minhasSessoes.value.reduce((acc, s) => acc + s.totalIntents, 0)
})

const minhasSalasRealizadas = computed(() => {
  const map = {}
  for (const s of minhasSessoes.value) {
    const sId = s.salaId || s.salaNome || 'default'
    if (!map[sId]) {
      map[sId] = {
        salaId: sId,
        salaNome: s.salaNome || 'Sala sem nome',
        count: 0,
        tempoSegundos: 0,
        totalIntents: 0,
        ultimaData: s.dataInicio
      }
    }
    map[sId].count++
    map[sId].tempoSegundos += (s.duracaoSegundos || 0)
    map[sId].totalIntents += (s.totalIntents || 0)
    if (new Date(s.dataInicio) > new Date(map[sId].ultimaData)) {
      map[sId].ultimaData = s.dataInicio
    }
  }
  return Object.values(map).map(r => ({
    ...r,
    tempoFormatado: formatarDuracao(r.tempoSegundos)
  }))
})

const minhasIntentsList = computed(() => {
  const map = {}
  for (const s of minhasSessoes.value) {
    for (const item of s.intentsArray) {
      if (!map[item.label]) {
        map[item.label] = { ...item, quantidade: 0 }
      }
      map[item.label].quantidade += item.quantidade
    }
  }
  return Object.values(map).sort((a, b) => b.quantidade - a.quantidade)
})

const abrirModalSessao = (sessao) => {
  sessaoModal.value = sessao
}
const fecharModalSessao = () => {
  sessaoModal.value = null
}

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      const instId = profile.instituicaoId
      if (instId) {
        const raw = await carregarDadosCompletosInstituicao(instId)
        // Filtro estrito: APENAS sessões do próprio usuário logado!
        minhasSessoes.value = raw.sessoesTodas.filter(s => isParticipantUser(s.activeParticipantId, userData.value))
      }
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao carregar resultados do usuário:", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.relatorios-container {
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
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* Personal KPIs Grid */
.personal-kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.personal-kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.pkpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.icon-blue { background: #eff6ff; }
.icon-purple { background: #f5f3ff; }
.icon-green { background: #ecfdf5; }
.icon-amber { background: #fffbeb; }

.pkpi-info { display: flex; flex-direction: column; }
.pkpi-val { font-size: 1.4rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
.pkpi-lbl { font-size: 0.74rem; font-weight: 600; color: #64748b; }

/* Dashboard Card */
.glass-dashboard-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
.card-header-subtitle { font-size: 0.86rem; color: #64748b; margin: 4px 0 0 0; }

.total-pill {
  background: #eff6ff;
  color: #0071e3;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
}

/* User Completed Rooms Grid */
.user-rooms-completed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.user-room-completed-card {
  background: rgba(248, 250, 252, 0.9);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
}

.user-room-completed-card:hover {
  transform: translateY(-2px);
  border-color: #a7f3d0;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.1);
}

.urc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-play-count-badge {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.12);
}

.urc-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.urc-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.urc-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.urc-lbl {
  font-size: 0.66rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.urc-val {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
}

/* Intents Grid */
.intents-distribution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.intent-metric-card {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-left: 5px solid #0071e3;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intent-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.intent-label-group { display: flex; align-items: center; gap: 8px; }
.intent-emoji { font-size: 1.3rem; }
.intent-name { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.intent-count { font-size: 1.15rem; font-weight: 800; }

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s ease;
}

.percent-label { font-size: 0.74rem; font-weight: 600; color: #64748b; }

/* Timeline History */
.section-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-group { display: flex; align-items: center; gap: 10px; }
.section-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
.count-badge { font-size: 0.8rem; font-weight: 700; background: rgba(0, 113, 227, 0.1); color: #0071e3; padding: 2px 8px; border-radius: 9999px; }

.sessions-history-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-timeline-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 22px;
  padding: 22px 26px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.session-timeline-card:hover {
  transform: translateY(-3px);
  border-color: #93c5fd;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 113, 227, 0.12);
}

.timeline-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.t-room-group { display: flex; align-items: center; gap: 10px; }

.role-pill.pill-vr {
  font-size: 0.7rem;
  font-weight: 700;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  color: #0071e3;
  border: 1px solid #bfdbfe;
  padding: 3px 8px;
  border-radius: 9999px;
}

.t-room-name { 
  font-size: 1.15rem; 
  font-weight: 800; 
  color: #0f172a; 
  margin: 0; 
  word-break: break-word;
  overflow-wrap: break-word;
}

.t-badges-group { display: flex; align-items: center; gap: 8px; }

.time-badge {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
}

.date-badge-pill {
  background: rgba(241, 245, 249, 0.9);
  color: #64748b;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.t-intents-box {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.t-intents-label { font-size: 0.76rem; font-weight: 700; color: #64748b; }

.t-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.intent-badge-pill {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
}

.empty-intents-text { font-size: 0.78rem; color: #94a3b8; font-style: italic; }

.t-card-footer {
  margin-top: 2px;
  display: flex;
  justify-content: flex-end;
}

.t-action-link {
  font-size: 0.84rem;
  font-weight: 700;
  color: #0071e3;
  transition: transform 0.2s ease;
}

.session-timeline-card:hover .t-action-link {
  transform: translateX(3px);
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-glass-container {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(36px);
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
.modal-title { margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; }

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
}

.modal-body { padding: 24px 28px; overflow-y: auto; }

.session-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  text-align: center;
}

.meta-box {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 10px;
}

.meta-lbl { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; display: block; }
.meta-val { font-size: 0.95rem; font-weight: 800; color: #0f172a; }

.intents-modal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.intent-modal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-left: 4px solid #0071e3;
  padding: 10px 14px;
  border-radius: 10px;
}

.intent-row-left { display: flex; align-items: center; gap: 8px; }
.intent-modal-icon { font-size: 1.2rem; }
.intent-modal-label { font-size: 0.92rem; font-weight: 700; color: #0f172a; }
.intent-modal-qty { font-size: 0.92rem; font-weight: 800; }

.glass-modal-enter-active, .glass-modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-modal-enter-from, .glass-modal-leave-to { opacity: 0; transform: scale(0.96) translateY(10px); }

@media (max-width: 680px) {
  .personal-kpis-grid { grid-template-columns: 1fr 1fr; }
  .timeline-card-header { flex-direction: column; align-items: flex-start; }
}
</style>
