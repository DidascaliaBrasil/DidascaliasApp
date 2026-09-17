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
        <p>A carregar resultados das suas salas VR...</p>
      </div>

      <div v-else class="facilitador-relatorios-wrapper stagger-in-2">
        
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Painel do Facilitador</span>
              </div>
              <h1 class="welcome-title">Resultados das Minhas Salas VR</h1>
              <p class="welcome-subtitle">
                Selecione uma sala abaixo para visualizar suas especificações, alunos matriculados e sessões de Realidade Virtual.
              </p>
            </div>
          </div>

          <!-- Quick Stats Row -->
          <div class="stats-row" style="margin-bottom: 0; padding-top: 16px; border-top: 1px solid rgba(226, 232, 240, 0.8);">
            <div class="stat-pill">
              <span class="stat-num">{{ minhasSalas.length }}</span>
              <span class="stat-label">Salas Criadas</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ totalSessoesGeral }}</span>
              <span class="stat-label">Sessões VR Executadas</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ tempoTotalGeralFormatado }}</span>
              <span class="stat-label">Tempo Total em VR</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ totalIntentsGeral }}</span>
              <span class="stat-label">Ações Registradas</span>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- SELEÇÃO DE SALAS (GRID DE CARDS INTERATIVOS E SELETORES)   -->
        <!-- ============================================================ -->
        <section class="rooms-selection-section">
          
          <div class="selection-bar-header">
            <div class="section-title-group">
              <h3 class="section-title">1. Escolha a Sala de Aula VR</h3>
              <span class="count-badge">{{ minhasSalasFiltradas.length }}</span>
            </div>

            <!-- Filtros e Busca Rápida -->
            <div class="filter-controls-row">
              <div class="filter-pills-group">
                <button 
                  :class="['filter-btn-pill', { active: filtroStatus === 'todas' }]"
                  @click="filtroStatus = 'todas'"
                >
                  Todas ({{ minhasSalas.length }})
                </button>
                <button 
                  :class="['filter-btn-pill', { active: filtroStatus === 'com_sessoes' }]"
                  @click="filtroStatus = 'com_sessoes'"
                >
                  Com Sessões ({{ salasComSessoesCount }})
                </button>
                <button 
                  :class="['filter-btn-pill', { active: filtroStatus === 'sem_sessoes' }]"
                  @click="filtroStatus = 'sem_sessoes'"
                >
                  Pendentes ({{ salasSemSessoesCount }})
                </button>
              </div>

              <div class="search-box-glass">
                <input 
                  type="text" 
                  v-model="filtroBusca" 
                  placeholder="Buscar sala ou turma..." 
                  class="search-input-field" 
                />
              </div>
            </div>
          </div>

          <!-- Cards Seletores de Salas em Grid Elegante -->
          <div class="room-selector-grid" v-if="minhasSalasFiltradas.length > 0">
            <div 
              v-for="sala in minhasSalasFiltradas" 
              :key="sala.id" 
              :class="['room-selector-card', { 'is-active-room': salaSelecionada?.id === sala.id }]"
              @click="selecionarSala(sala)"
            >
              <div class="room-card-top-row">
                <span class="target-badge-pill">
                  {{ sala.targetType === 'grupo' ? '👥 ' : '👤 ' }}<span class="notranslate" translate="no">{{ sala.nomeAlvo }}</span>
                </span>
                
                <div class="top-row-right-chips">
                  <span :class="['situacao-badge', isSalaAtiva(sala) ? 'situacao-ativa' : 'situacao-inativa']">
                    <span class="situacao-dot"></span>
                    {{ isSalaAtiva(sala) ? 'Ativa' : 'Inativa' }}
                  </span>
                  <span :class="['status-chip', sala.totalSessoes > 0 ? 'status-active' : 'status-pending']">
                    {{ sala.totalSessoes > 0 ? `🟢 ${sala.totalSessoes} Sessão(ões)` : '⚪ Sem Sessões' }}
                  </span>
                </div>
              </div>

              <h4 class="room-card-name notranslate" translate="no" :title="sala.roomName">{{ sala.roomName }}</h4>

              <div class="room-card-chips">
                <span class="room-chip">📐 {{ getShapeName(sala.shape) }}</span>
                <span class="room-chip">🪑 {{ sala.numDesks || 0 }} Mesas</span>
                <span class="room-chip">👥 {{ sala.alunosVinculados.length }} Alunos</span>
              </div>

              <div class="room-card-footer">
                <div class="progress-mini-info">
                  <span class="prog-text">
                    <strong>{{ sala.participantesUnicosIds.length }}</strong> de {{ sala.alunosVinculados.length }} alunos jogaram
                  </span>
                  <div class="progress-bar-thin">
                    <div 
                      class="progress-fill-thin" 
                      :style="{ 
                        width: `${sala.alunosVinculados.length > 0 ? (sala.participantesUnicosIds.length / sala.alunosVinculados.length * 100).toFixed(0) : 0}%` 
                      }"
                    ></div>
                  </div>
                </div>

                <div class="select-indicator">
                  <span v-if="salaSelecionada?.id === sala.id" class="selected-text">Visualizando ✓</span>
                  <span v-else class="click-select-text">Selecionar &rarr;</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-glass">
            <span class="empty-emoji">🥽</span>
            <h3>Nenhuma sala encontrada</h3>
            <p>Nenhuma sala virtual corresponde aos filtros informados.</p>
            <router-link to="/criar-sala" class="btn-primary-pill" style="margin-top: 12px; display: inline-block;">
              + Criar Nova Sala VR
            </router-link>
          </div>

        </section>

        <!-- ============================================================ -->
        <!-- WORKSPACE DA SALA SELECIONADA (DETALHES FOCADOS)            -->
        <!-- ============================================================ -->
        <section v-if="salaSelecionada" class="selected-room-workspace-fade">
          
          <!-- Header da Sala Selecionada -->
          <div class="workspace-header-card">
            <div class="w-header-left">
              <div class="w-tags-row">
                <span class="role-pill pill-vr">SALA VR</span>
                <span :class="['situacao-badge', isSalaAtiva(salaSelecionada) ? 'situacao-ativa' : 'situacao-inativa']">
                  <span class="situacao-dot"></span>
                  {{ isSalaAtiva(salaSelecionada) ? 'Sala Ativa' : 'Sala Inativa' }}
                </span>
                <span class="target-tag">
                  {{ salaSelecionada.targetType === 'grupo' ? '👥 Turma: ' : '👤 Aluno: ' }}<span class="notranslate" translate="no">{{ salaSelecionada.nomeAlvo }}</span>
                </span>
                <span class="date-tag">Criada em: {{ formatarData(salaSelecionada.criadoEm, 'data') }}</span>
              </div>
              <h2 class="w-room-title notranslate" translate="no">{{ salaSelecionada.roomName }}</h2>
            </div>

            <div class="w-header-right">
              <div class="big-session-counter">
                <span class="b-count">{{ salaSelecionada.totalSessoes }}</span>
                <span class="b-lbl">Sessões Realizadas</span>
              </div>
              <button 
                class="btn-delete-sala-results" 
                :title="isSalaAtiva(salaSelecionada) ? 'Sala ativa no momento (exclusão bloqueada)' : 'Excluir Sala VR e todos os seus dados'" 
                @click="confirmarExclusaoSala(salaSelecionada)"
                :disabled="excluindoSala || isSalaAtiva(salaSelecionada)"
                :class="{ 'btn-disabled-locked': isSalaAtiva(salaSelecionada) }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>{{ isSalaAtiva(salaSelecionada) ? 'Exclusão Bloqueada (Ativa)' : (excluindoSala ? 'Excluindo...' : 'Excluir Sala') }}</span>
              </button>
            </div>
          </div>

          <!-- Alerta Visual quando Sala está Ativa -->
          <div v-if="isSalaAtiva(salaSelecionada)" class="sala-ativa-banner-results">
            <span class="lock-icon">🔒</span>
            <div class="lock-text">
              <strong>Sessão VR Ativa no Momento</strong>
              <p>Esta sala está em andamento no óculos VR. A exclusão da sala fica bloqueada enquanto a situação for Ativa.</p>
            </div>
          </div>

          <!-- 3 Colunas de Métricas da Sala -->
          <div class="room-details-grid-3">
            
            <!-- Coluna 1: Cenário 3D & Geometria -->
            <div class="glass-card detail-sub-card">
              <div class="sub-card-header">
                <span class="sub-card-icon">📐</span>
                <h4 class="sub-card-title">Cenário Virtual</h4>
              </div>

              <div class="specs-vertical-list">
                <div class="spec-row-item">
                  <span class="s-label">Formato da Sala:</span>
                  <span class="s-val">{{ getShapeName(salaSelecionada.shape) }}</span>
                </div>
                <div class="spec-row-item">
                  <span class="s-label">Quantidade de Mesas:</span>
                  <span class="s-val">{{ salaSelecionada.numDesks || 0 }} mesas</span>
                </div>
                <div class="spec-row-item">
                  <span class="s-label">Alunos Virtuais 3D:</span>
                  <span class="s-val">{{ (salaSelecionada.numBoys || 0) + (salaSelecionada.numGirls || 0) }} ({{ salaSelecionada.numBoys || 0 }}👦 / {{ salaSelecionada.numGirls || 0 }}👧)</span>
                </div>
                <div class="spec-row-item">
                  <span class="s-label">Fileiras x Colunas:</span>
                  <span class="s-val">{{ salaSelecionada.rows || 0 }} x {{ salaSelecionada.cols || 0 }}</span>
                </div>
                <div class="spec-row-item">
                  <span class="s-label">Raio do Cenário:</span>
                  <span class="s-val">{{ salaSelecionada.radius || 10 }}m</span>
                </div>
              </div>
            </div>

            <!-- Coluna 2: Desempenho e Métricas -->
            <div class="glass-card detail-sub-card">
              <div class="sub-card-header">
                <span class="sub-card-icon">⚡</span>
                <h4 class="sub-card-title">Desempenho da Sala</h4>
              </div>

              <div class="room-stats-tiles">
                <div class="stat-tile">
                  <span class="t-val">{{ salaSelecionada.tempoTotalFormatado }}</span>
                  <span class="t-lbl">Tempo Total</span>
                </div>
                <div class="stat-tile">
                  <span class="t-val">{{ salaSelecionada.tempoMedioFormatado }}</span>
                  <span class="t-lbl">Média / Sessão</span>
                </div>
                <div class="stat-tile">
                  <span class="t-val">{{ salaSelecionada.totalIntentsSala }}</span>
                  <span class="t-lbl">Ações Totais</span>
                </div>
                <div class="stat-tile">
                  <span class="t-val">{{ taxaConclusaoPercentual }}%</span>
                  <span class="t-lbl">Taxa de Conclusão</span>
                </div>
              </div>
            </div>

            <!-- Coluna 3: Alunos Vinculados e Status -->
            <div class="glass-card detail-sub-card">
              <div class="sub-card-header">
                <span class="sub-card-icon">👥</span>
                <div class="sub-card-title-group">
                  <h4 class="sub-card-title">Estudantes da Sala</h4>
                  <span class="sub-count">({{ salaSelecionada.alunosVinculados.length }})</span>
                </div>
              </div>

              <div class="students-scroll-panel" v-if="salaSelecionada.alunosVinculados.length > 0">
                <div 
                  v-for="aluno in salaSelecionada.alunosVinculados" 
                  :key="aluno.id"
                  :class="['student-row-tag', { 'is-played': salaSelecionada.participantesUnicosIds.includes(aluno.id) }]"
                >
                  <div class="s-row-avatar notranslate" translate="no">{{ (aluno.nome || 'A').charAt(0).toUpperCase() }}</div>
                  <div class="s-row-info">
                    <span class="s-row-name notranslate" translate="no">{{ aluno.nome }}</span>
                    <span class="s-row-sub notranslate" translate="no" v-if="aluno.email">{{ aluno.email }}</span>
                  </div>
                  <span :class="['s-status-badge', salaSelecionada.participantesUnicosIds.includes(aluno.id) ? 'badge-ok' : 'badge-pending']">
                    {{ salaSelecionada.participantesUnicosIds.includes(aluno.id) ? '✓ Concluiu' : 'Pendente' }}
                  </span>
                </div>
              </div>
              <p v-else class="empty-hint-text">Nenhum aluno vinculado a esta sala.</p>
            </div>

          </div>

          <!-- Seção de Sessões Realizadas na Sala Selecionada -->
          <div class="sessions-detail-section">
            <div class="sessions-section-header">
              <div class="section-title-group">
                <h3 class="section-title">2. Histórico de Sessões VR Executadas</h3>
                <span class="count-badge">{{ salaSelecionada.sessoes.length }}</span>
              </div>
              <p class="section-hint">Clique em uma sessão para ver a análise comportamental detalhada do aluno.</p>
            </div>

            <div v-if="salaSelecionada.sessoes.length > 0" class="sessions-grid-modern">
              <div 
                v-for="sessao in salaSelecionada.sessoes" 
                :key="sessao.id" 
                class="glass-card session-modern-card clickable-card"
                @click="abrirModalSessao(sessao)"
              >
                <div class="sess-card-header">
                  <div class="sess-user-group">
                    <div class="sess-avatar-circle">{{ sessao.alunoAvatar }}</div>
                    <div class="sess-user-text">
                      <span class="sess-name">{{ sessao.alunoNome }}</span>
                      <span class="sess-date">{{ formatarData(sessao.dataInicio) }}</span>
                    </div>
                  </div>

                  <div class="sess-right-badges">
                    <span class="time-pill">⏱️ {{ sessao.duracaoFormatada }}</span>
                    <span class="intents-pill">⚡ {{ sessao.totalIntents }} ações</span>
                  </div>
                </div>

                <div class="divider-subtle"></div>

                <!-- Detalhes de Ações da Sessão -->
                <div class="sess-intents-summary">
                  <span class="intents-label">Ações nesta sessão:</span>
                  <div class="intents-badges-wrap" v-if="sessao.intentsArray.length > 0">
                    <span 
                      v-for="intent in sessao.intentsArray" 
                      :key="intent.label" 
                      class="intent-badge-item"
                      :style="{ backgroundColor: intent.bg, color: intent.color }"
                    >
                      {{ intent.icon }} {{ intent.label }}: <strong>{{ intent.quantidade }}x</strong>
                    </span>
                  </div>
                  <span v-else class="empty-intents-hint">Nenhuma ação registrada nesta simulação</span>
                </div>

                <div class="sess-footer-link">
                  <span>Ver Detalhes da Sessão</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </div>

            <!-- Estado Vazio quando a sala não tem sessões -->
            <div v-else class="empty-room-sessions-card">
              <div class="empty-room-icon">🥽</div>
              <h4>Nenhuma sessão realizada nesta sala ainda</h4>
              <p>
                Os alunos vinculados à turma <strong class="notranslate" translate="no">{{ salaSelecionada.nomeAlvo }}</strong> ainda não iniciaram simulações nos óculos VR.
              </p>
              <div class="empty-tips-box">
                <span class="tip-title">💡 Como iniciar uma sessão VR:</span>
                <ol class="tips-list">
                  <li>Acesse o menu <strong>Visão Geral</strong> e vincule o óculos físico à sala.</li>
                  <li>Selecione o participante que colocará o headset.</li>
                  <li>Inicie o app Didascalias no dispositivo VR para sincronizar os dados.</li>
                </ol>
              </div>
            </div>

          </div>

        </section>

      </div>
    </main>

    <!-- Modal Apple Glass: Detalhes Completos da Sessão -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="sessaoModal" class="modal-overlay" @click.self="fecharModalSessao">
          <div class="modal-glass-container" @click.stop>
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">DETALHAMENTO DA SESSÃO VR</span>
                <h3 class="modal-title">{{ sessaoModal.sessaoKey }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalSessao">&times;</button>
            </div>

            <div class="modal-body">
              <div class="session-modal-hero">
                <div class="hero-avatar">{{ sessaoModal.alunoAvatar }}</div>
                <div class="hero-info">
                  <span class="hero-name">{{ sessaoModal.alunoNome }}</span>
                  <span class="hero-email" v-if="sessaoModal.alunoEmail">{{ sessaoModal.alunoEmail }}</span>
                  <span class="hero-room">Sala: <strong>{{ sessaoModal.salaNome }}</strong></span>
                </div>
              </div>

              <div class="session-meta-grid">
                <div class="meta-box">
                  <span class="meta-lbl">Data de Início</span>
                  <span class="meta-val">{{ formatarData(sessaoModal.dataInicio) }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Duração da Simulação</span>
                  <span class="meta-val">{{ sessaoModal.duracaoFormatada }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Total de Ações</span>
                  <span class="meta-val">{{ sessaoModal.totalIntents }}</span>
                </div>
              </div>

              <h4 class="section-subtitle" style="margin-top: 20px;">Ações & Comportamentos Registrados</h4>
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
                <p v-if="sessaoModal.intentsArray.length === 0" class="empty-hint-text">Nenhuma ação registrada nesta sessão.</p>
              </div>
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
                {{ mensagemPermissao || 'Você só possui autorização para excluir as salas VR que você mesmo criou.' }}
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
                  <span>Todos os resultados, métricas e telemetria gerados no VR serão excluídos permanentemente.</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, remove } from 'firebase/database'
import { useAuthStore } from '../stores/auth'
import { isSalaAtiva, getSituacaoLabel } from '../utils/salaUtils'

import MenuLateral from '../components/generic/MenuLateral.vue'
import { 
  carregarDadosCompletosInstituicao, 
  formatarData, 
  formatarDuracao 
} from '../services/resultadosService'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const userData = ref({})

const minhasSalas = ref([])
const salaSelecionada = ref(null)

const filtroBusca = ref('')
const filtroStatus = ref('todas') // 'todas' | 'com_sessoes' | 'sem_sessoes'
const sessaoModal = ref(null)

const initials = computed(() => {
  const nome = (userData.value.nome || '?').trim()
  const nomes = nome.split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const salasComSessoesCount = computed(() => {
  return minhasSalas.value.filter(s => s.totalSessoes > 0).length
})

const salasSemSessoesCount = computed(() => {
  return minhasSalas.value.filter(s => s.totalSessoes === 0).length
})

const minhasSalasFiltradas = computed(() => {
  let list = minhasSalas.value

  if (filtroStatus.value === 'com_sessoes') {
    list = list.filter(s => s.totalSessoes > 0)
  } else if (filtroStatus.value === 'sem_sessoes') {
    list = list.filter(s => s.totalSessoes === 0)
  }

  if (filtroBusca.value.trim()) {
    const q = filtroBusca.value.toLowerCase()
    list = list.filter(s =>
      (s.roomName && s.roomName.toLowerCase().includes(q)) ||
      (s.nomeAlvo && s.nomeAlvo.toLowerCase().includes(q))
    )
  }

  return list
})

const totalSessoesGeral = computed(() => {
  return minhasSalas.value.reduce((acc, s) => acc + s.totalSessoes, 0)
})

const tempoTotalGeralFormatado = computed(() => {
  const totalSec = minhasSalas.value.reduce((acc, s) => acc + s.tempoTotalSegundos, 0)
  return formatarDuracao(totalSec)
})

const totalIntentsGeral = computed(() => {
  return minhasSalas.value.reduce((acc, s) => acc + s.totalIntentsSala, 0)
})

const taxaConclusaoPercentual = computed(() => {
  if (!salaSelecionada.value || !salaSelecionada.value.alunosVinculados?.length) return 0
  const total = salaSelecionada.value.alunosVinculados.length
  const concluidos = salaSelecionada.value.participantesUnicosIds.length
  return Math.round((concluidos / total) * 100)
})

const getShapeName = (shape) => {
  if (shape === 1) return 'Semicírculo'
  if (shape === 2) return 'Circular'
  return 'Retangular / Padrão'
}

const selecionarSala = (sala) => {
  salaSelecionada.value = sala
}

const abrirModalSessao = (sessao) => {
  sessaoModal.value = sessao
}
const fecharModalSessao = () => {
  sessaoModal.value = null
}

const excluindoSala = ref(false)
const salaParaExcluir = ref(null)
const mensagemPermissao = ref('')

const confirmarExclusaoSala = (sala) => {
  if (!sala || !sala.id) return

  // Validação: não permitir exclusão se a sala estiver ativa
  if (isSalaAtiva(sala)) {
    mensagemPermissao.value = "Esta sala está com status \"Ativa\" no momento. Finalize a sessão antes de tentar excluí-la."
    salaParaExcluir.value = { ...sala, semPermissao: true }
    return
  }

  const idsAutorizados = [
    userData.value.id,
    userData.value.uid,
    userData.value.authUid,
    userData.value.idCurto
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
    mensagemPermissao.value = "Esta sala está ativa no momento e não pode ser excluída."
    return
  }

  excluindoSala.value = true
  try {
    const salaRef = dbRef(database, `classroom_configs/${salaId}`)
    await remove(salaRef)

    minhasSalas.value = minhasSalas.value.filter(s => s.id !== salaId)
    if (salaSelecionada.value?.id === salaId) {
      salaSelecionada.value = minhasSalas.value[0] || null
    }
    cancelarExclusao()
  } catch (error) {
    console.error("Erro ao excluir sala VR:", error)
    mensagemPermissao.value = "Ocorreu um erro ao tentar excluir a sala. Tente novamente."
  } finally {
    excluindoSala.value = false
  }
}

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      const instId = profile.instituicaoId
      if (instId) {
        const raw = await carregarDadosCompletosInstituicao(instId)
        minhasSalas.value = raw.salas.filter(s => 
          s.facilitadorId === profile.id || 
          s.facilitadorId === profile.shortId || 
          s.facilitadorId === profile.uid
        )
        
        if (minhasSalas.value.length > 0) {
          const salaComSessao = minhasSalas.value.find(s => s.totalSessoes > 0)
          salaSelecionada.value = salaComSessao || minhasSalas.value[0]
        }
      }
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao carregar resultados do facilitador:", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.facilitador-relatorios-wrapper {
  width: 100%;
  animation: glassFadeUp 0.5s ease both;
}

/* Profile Hero Glass */
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
  border-radius: 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0071e3 100%);
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

/* Stats Row */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  padding: 10px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.stat-num { font-size: 1.15rem; font-weight: 800; color: #0071e3; }
.stat-label { font-size: 0.85rem; font-weight: 600; color: #475569; }

/* Selection Section */
.rooms-selection-section {
  margin-bottom: 32px;
}

.selection-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
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

.filter-controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-pills-group {
  display: flex;
  background: rgba(241, 245, 249, 0.85);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  gap: 4px;
}

.filter-btn-pill {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn-pill.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box-glass {
  min-width: 240px;
}

.search-input-field {
  width: 100%;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(203, 213, 225, 0.8);
  background: rgba(255, 255, 255, 0.85);
  font-size: 0.88rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input-field:focus {
  border-color: #0071e3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

/* Room Selector Grid */
.room-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.room-selector-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
}

.room-selector-card:hover {
  transform: translateY(-3px);
  border-color: #93c5fd;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 28px rgba(0, 113, 227, 0.08);
}

.room-selector-card.is-active-room {
  border-color: #0071e3;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.98));
  box-shadow: 0 10px 30px rgba(0, 113, 227, 0.18);
}

.room-card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-row-right-chips {
  display: flex;
  align-items: center;
  gap: 6px;
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

.btn-delete-sala-results.btn-disabled-locked {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}

.sala-ativa-banner-results {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 20px;
  color: #991b1b;
}

.sala-ativa-banner-results .lock-icon {
  font-size: 1.4rem;
}

.sala-ativa-banner-results .lock-text strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.sala-ativa-banner-results .lock-text p {
  font-size: 0.80rem;
  margin: 0;
  color: #b91c1c;
}

.target-badge-pill {
  font-size: 0.74rem;
  font-weight: 700;
  color: #334155;
  background: rgba(241, 245, 249, 0.9);
  padding: 3px 8px;
  border-radius: 6px;
}

.status-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
}

.status-active { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.status-pending { background: #f8fafc; color: #94a3b8; border: 1px solid #e2e8f0; }

.room-card-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.room-chip {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: rgba(241, 245, 249, 0.8);
  padding: 2px 6px;
  border-radius: 6px;
}

.room-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.progress-mini-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  margin-right: 12px;
}

.prog-text { font-size: 0.72rem; color: #64748b; }
.prog-text strong { color: #0f172a; }

.progress-bar-thin {
  width: 100%;
  height: 4px;
  background: rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill-thin {
  height: 100%;
  background: #10b981;
  border-radius: 9999px;
}

.select-indicator {
  font-size: 0.78rem;
  font-weight: 700;
}

.selected-text { color: #0071e3; }
.click-select-text { color: #64748b; }

/* Selected Room Workspace */
.selected-room-workspace-fade {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.workspace-header-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 24px 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.w-header-left { display: flex; flex-direction: column; gap: 6px; }

.w-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.role-pill.pill-vr {
  font-size: 0.72rem;
  font-weight: 700;
  background: #eff6ff;
  color: #0071e3;
  border: 1px solid #bfdbfe;
  padding: 3px 8px;
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

.date-tag { font-size: 0.76rem; color: #94a3b8; }

.w-room-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.big-session-counter {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 10px 20px;
  border-radius: 16px;
  text-align: center;
}

.b-count { font-size: 1.8rem; font-weight: 800; color: #0071e3; display: block; line-height: 1; margin-bottom: 2px; }
.b-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

.w-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-delete-sala-results {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-sala-results:hover:not(:disabled) {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.btn-delete-sala-results:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-sala-results svg {
  width: 16px;
  height: 16px;
}

/* 3 Columns Grid */
.room-details-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.detail-sub-card {
  padding: 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-card-icon { font-size: 1.3rem; }

.sub-card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.sub-card-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-count { font-size: 0.85rem; font-weight: 700; color: #0071e3; }

.specs-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(248, 250, 252, 0.85);
  border-radius: 10px;
  font-size: 0.84rem;
}

.s-label { color: #64748b; font-weight: 600; }
.s-val { color: #0f172a; font-weight: 700; }

.room-stats-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-tile {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.t-val { font-size: 1.15rem; font-weight: 800; color: #0071e3; display: block; margin-bottom: 2px; }
.t-lbl { font-size: 0.68rem; font-weight: 600; color: #64748b; text-transform: uppercase; }

.students-scroll-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.student-row-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
}

.student-row-tag.is-played {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.s-row-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.74rem;
}

.s-row-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.s-row-name { font-size: 0.84rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-row-sub { font-size: 0.7rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.s-status-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.badge-ok { background: #d1fae5; color: #059669; }
.badge-pending { background: #f1f5f9; color: #94a3b8; }

/* Sessions Detail Section */
.sessions-detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.sessions-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.section-hint { font-size: 0.85rem; color: #64748b; margin: 0; }

.sessions-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}

.session-modern-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.session-modern-card:hover {
  transform: translateY(-3px);
  border-color: #0071e3;
  box-shadow: 0 10px 28px rgba(0, 113, 227, 0.12);
}

.sess-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sess-user-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sess-avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
}

.sess-user-text { display: flex; flex-direction: column; }
.sess-name { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.sess-date { font-size: 0.74rem; color: #64748b; }

.sess-right-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-pill {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.76rem;
}

.intents-pill {
  background: #eff6ff;
  color: #0071e3;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.76rem;
}

.divider-subtle {
  height: 1px;
  background: rgba(226, 232, 240, 0.8);
}

.sess-intents-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.intents-label { font-size: 0.74rem; font-weight: 700; color: #64748b; }

.intents-badges-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.intent-badge-item {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 600;
}

.empty-intents-hint { font-size: 0.74rem; color: #94a3b8; font-style: italic; }

.sess-footer-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0071e3;
  padding-top: 4px;
}

/* Empty Room Sessions Card */
.empty-room-sessions-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 2px dashed rgba(203, 213, 225, 0.9);
  border-radius: 24px;
  padding: 40px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-room-icon { font-size: 3rem; }
.empty-room-sessions-card h4 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
.empty-room-sessions-card p { font-size: 0.92rem; color: #64748b; margin: 0; max-width: 500px; }

.empty-tips-box {
  margin-top: 14px;
  background: rgba(239, 246, 255, 0.85);
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 16px;
  padding: 16px 20px;
  text-align: left;
  max-width: 480px;
}

.tip-title { font-size: 0.85rem; font-weight: 800; color: #0071e3; display: block; margin-bottom: 8px; }
.tips-list { font-size: 0.82rem; color: #334155; padding-left: 18px; line-height: 1.5; margin: 0; }

.btn-primary-pill {
  background: #0071e3;
  color: white;
  padding: 8px 18px;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
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

.session-modal-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(239, 246, 255, 0.85);
  border: 1px solid rgba(191, 219, 254, 0.9);
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 18px;
}

.hero-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.hero-info { display: flex; flex-direction: column; }
.hero-name { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.hero-email { font-size: 0.82rem; color: #64748b; }
.hero-room { font-size: 0.82rem; color: #0071e3; margin-top: 2px; }

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

@media (max-width: 768px) {
  .room-details-grid-3 { grid-template-columns: 1fr; }
  .sessions-grid-modern { grid-template-columns: 1fr; }
}
</style>
