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
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state stagger-in">
        <div class="spinner"></div>
        <p>A carregar relatórios e desempenho VR da instituição...</p>
      </div>

      <div v-else class="relatorios-container stagger-in-2">
        
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Relatórios Institucionais & Analytics VR</span>
              </div>
              <h1 class="welcome-title">Desempenho Geral da Instituição</h1>
              <p class="welcome-subtitle">
                {{ userData.nomeInstituicao || userData.nomeFaculdade || 'Instituição' }} &bull; Gestão unificada de facilitadores, salas de aula VR e estudantes.
              </p>
            </div>
          </div>

          <!-- Hierarchical Breadcrumb Navigation -->
          <div class="hierarchy-breadcrumb-bar" v-if="facilitadorFiltroSelecionado || salaFiltroSelecionada">
            <span class="crumb-label">Filtro Ativo:</span>
            <button class="crumb-pill" @click="resetarFiltrosHierarquia">
              🏛️ {{ userData.nomeInstituicao || userData.nomeFaculdade || 'Instituição' }}
            </button>
            <span class="crumb-sep" v-if="facilitadorFiltroSelecionado">&rsaquo;</span>
            <button 
              v-if="facilitadorFiltroSelecionado" 
              class="crumb-pill active"
              @click="salaFiltroSelecionada = null"
            >
              👨‍🏫 {{ facilitadorFiltroSelecionado.nome }}
            </button>
            <span class="crumb-sep" v-if="salaFiltroSelecionada">&rsaquo;</span>
            <button v-if="salaFiltroSelecionada" class="crumb-pill active">
              🥽 {{ salaFiltroSelecionada.roomName }}
            </button>
            <button class="btn-clear-crumb" @click="resetarFiltrosHierarquia">
              Limpar Filtro &times;
            </button>
          </div>

          <!-- Abas de Navegação Analítica -->
          <div class="analytics-tabs-bar">
            <button 
              :class="['analytics-tab-btn', { active: activeTab === 'geral' }]"
              @click="activeTab = 'geral'"
            >
              <span class="tab-icon">📊</span>
              <span>1. Visão Geral da Instituição</span>
            </button>
            <button 
              :class="['analytics-tab-btn', { active: activeTab === 'facilitadores' }]"
              @click="activeTab = 'facilitadores'"
            >
              <span class="tab-icon">👨‍🏫</span>
              <span>2. Facilitadores ({{ metricas.facilitadoresList.length }})</span>
            </button>
            <button 
              :class="['analytics-tab-btn', { active: activeTab === 'salas' }]"
              @click="activeTab = 'salas'"
            >
              <span class="tab-icon">🥽</span>
              <span>3. Salas & Turmas VR ({{ metricas.salas.length }})</span>
            </button>
            <button 
              :class="['analytics-tab-btn', { active: activeTab === 'alunos' }]"
              @click="activeTab = 'alunos'"
            >
              <span class="tab-icon">🎓</span>
              <span>4. Desempenho dos Alunos ({{ metricas.alunosList.length }})</span>
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- ABA 1: VISÃO GERAL MACRO DA INSTITUIÇÃO (EXECUTIVE)         -->
        <!-- ============================================================ -->
        <section v-if="activeTab === 'geral'" class="tab-section-fade">
          
          <!-- KPI Cards Grid -->
          <div class="kpi-cards-grid">
            <div class="kpi-card glass-card">
              <div class="kpi-top">
                <span class="kpi-icon-pill icon-blue">🥽</span>
                <span class="kpi-badge">Salas</span>
              </div>
              <span class="kpi-value">{{ metricas.kpis.totalSalas }}</span>
              <span class="kpi-title">Salas VR Criadas</span>
              <span class="kpi-desc">Por {{ metricas.kpis.totalFacilitadores }} facilitador(es) em {{ metricas.kpis.totalGrupos }} turmas</span>
            </div>

            <div class="kpi-card glass-card">
              <div class="kpi-top">
                <span class="kpi-icon-pill icon-green">🎮</span>
                <span class="kpi-badge">Sessões</span>
              </div>
              <span class="kpi-value">{{ metricas.kpis.totalSessoes }}</span>
              <span class="kpi-title">Sessões Executadas</span>
              <span class="kpi-desc">{{ metricas.kpis.totalAlunosParticipantes }} aluno(s) únicos concluíram no VR</span>
            </div>

            <div class="kpi-card glass-card">
              <div class="kpi-top">
                <span class="kpi-icon-pill icon-purple">⏱️</span>
                <span class="kpi-badge">Imersão</span>
              </div>
              <span class="kpi-value">{{ metricas.kpis.tempoTotalFormatado }}</span>
              <span class="kpi-title">Tempo Total no VR</span>
              <span class="kpi-desc">Média de {{ metricas.kpis.tempoMedioFormatado }} por sessão</span>
            </div>

            <div class="kpi-card glass-card">
              <div class="kpi-top">
                <span class="kpi-icon-pill icon-amber">⚡</span>
                <span class="kpi-badge">Interações</span>
              </div>
              <span class="kpi-value">{{ metricas.kpis.totalIntentsGeral }}</span>
              <span class="kpi-title">Ações / Intents VR</span>
              <span class="kpi-desc">Registradas nos óculos de Realidade Virtual</span>
            </div>
          </div>

          <!-- GRÁFICOS VISUAIS - GRID 2x2 -->
          <div class="charts-dashboard-grid" style="margin-top: 24px;">
            
            <!-- Gráfico 1: Donut de Ações / Intents VR -->
            <div class="glass-dashboard-card chart-sub-card">
              <div class="card-header-flex">
                <div>
                  <h3 class="card-header-title">Distribuição de Ações (Intents VR)</h3>
                  <p class="card-header-subtitle">Frequência e percentual dos comportamentos disparados nas simulações.</p>
                </div>
                <span class="total-pill">{{ metricas.kpis.totalIntentsGeral }} ações totais</span>
              </div>

              <IntentsDonutChart 
                :items="metricas.intentsGlobaisList" 
                :total="metricas.kpis.totalIntentsGeral"
              />
            </div>

            <!-- Gráfico 2: Comparativo de Facilitadores -->
            <div class="glass-dashboard-card chart-sub-card">
              <div class="card-header-flex">
                <div>
                  <h3 class="card-header-title">Desempenho por Facilitador</h3>
                  <p class="card-header-subtitle">Comparativo de sessões, salas e tempo conduzido por cada orientador.</p>
                </div>
                <span class="total-pill">{{ metricas.facilitadoresList.length }} facilitadores</span>
              </div>

              <FacilitatorsBarChart 
                :facilitadores="metricas.facilitadoresList"
                @select-facilitador="explorarFacilitador"
              />
            </div>

            <!-- Gráfico 3: Linha do Tempo / Atividade Temporal -->
            <div class="glass-dashboard-card chart-sub-card">
              <div class="card-header-flex">
                <div>
                  <h3 class="card-header-title">Volume de Simulações no Tempo</h3>
                  <p class="card-header-subtitle">Histórico e frequência temporal de sessões executadas na instituição.</p>
                </div>
                <span class="total-pill">{{ metricas.kpis.totalSessoes }} sessões</span>
              </div>

              <TimelineActivityChart 
                :series="metricas.timelineSeries"
              />
            </div>

            <!-- Gráfico 4: Taxa de Engajamento e Conclusão das Turmas -->
            <div class="glass-dashboard-card chart-sub-card">
              <div class="card-header-flex">
                <div>
                  <h3 class="card-header-title">Taxa de Conclusão por Sala VR</h3>
                  <p class="card-header-subtitle">Percentual de alunos vinculados que já finalizaram a simulação.</p>
                </div>
                <span class="total-pill">{{ metricas.salas.length }} salas</span>
              </div>

              <RoomEngagementProgress 
                :salas="metricas.salas"
                @select-sala="abrirModalSala"
              />
            </div>

          </div>

          <!-- Histórico Geral de Sessões VR Realizadas (Formato Cards Feed Responsivo) -->
          <div class="glass-dashboard-card" style="margin-top: 24px;">
            <div class="card-header-flex">
              <div>
                <h3 class="card-header-title">Histórico Geral de Sessões VR Realizadas</h3>
                <p class="card-header-subtitle">Registro cronológico de todas as simulações executadas pelos estudantes nos óculos.</p>
              </div>
              <div class="table-search-inline">
                <input 
                  type="text" 
                  v-model="filtroSessoesTexto" 
                  placeholder="Pesquisar por aluno, sala ou facilitador..." 
                  class="table-search-input"
                />
              </div>
            </div>

            <!-- Grid de Cards de Sessões VR (Zero Scroll Horizontal, 100% Responsivo) -->
            <div v-if="sessoesFiltradasGeral.length > 0" class="sessions-feed-container">
              <div class="sessions-cards-grid">
                <div 
                  v-for="sessao in sessoesFiltradasGeral.slice(0, limiteSessoes)" 
                  :key="sessao.id"
                  class="session-feed-card"
                  @click="abrirModalSessao(sessao)"
                >
                  <!-- Card Header: Aluno + Tempo -->
                  <div class="s-card-header">
                    <div class="s-card-user">
                      <div class="s-card-avatar">{{ sessao.alunoAvatar }}</div>
                      <div class="s-card-user-info">
                        <span class="s-card-name" :title="sessao.alunoNome">{{ sessao.alunoNome }}</span>
                        <span class="s-card-email" v-if="sessao.alunoEmail">{{ sessao.alunoEmail }}</span>
                      </div>
                    </div>
                    <span class="s-card-duration">⏱️ {{ sessao.duracaoFormatada }}</span>
                  </div>

                  <!-- Card Context: Sala & Orientador -->
                  <div class="s-card-meta">
                    <div class="s-meta-item">
                      <span class="s-meta-icon">🥽</span>
                      <span class="s-meta-label">Sala:</span>
                      <span class="s-meta-val" :title="sessao.salaNome">{{ sessao.salaNome }}</span>
                    </div>
                    <div class="s-meta-item">
                      <span class="s-meta-icon">👨‍🏫</span>
                      <span class="s-meta-label">Orientador:</span>
                      <span class="s-meta-val" :title="sessao.facilitadorNome">{{ sessao.facilitadorNome }}</span>
                    </div>
                    <div class="s-meta-item">
                      <span class="s-meta-icon">📅</span>
                      <span class="s-meta-val date-highlight">{{ formatarData(sessao.dataInicio) }}</span>
                    </div>
                  </div>

                  <!-- Card Action Badges (Intents) -->
                  <div class="s-card-intents">
                    <div v-if="sessao.intentsArray.length > 0" class="s-intents-wrap">
                      <span 
                        v-for="int in sessao.intentsArray.slice(0, 3)" 
                        :key="int.label" 
                        class="s-intent-pill"
                        :style="{ backgroundColor: int.bg, color: int.color, borderColor: int.color + '40' }"
                      >
                        {{ int.icon }} {{ int.label }}: <strong>{{ int.quantidade }}x</strong>
                      </span>
                      <span v-if="sessao.intentsArray.length > 3" class="s-more-intents">
                        +{{ sessao.intentsArray.length - 3 }}
                      </span>
                    </div>
                    <span v-else class="s-no-intents">🎮 Simulação concluída sem ações registradas</span>
                  </div>

                  <!-- Card Footer Button -->
                  <div class="s-card-footer">
                    <button class="btn-s-details">
                      <span>Ver Detalhes da Simulação</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pagination / Load more -->
              <div v-if="sessoesFiltradasGeral.length > limiteSessoes" class="load-more-sessoes-wrap">
                <button class="btn-load-more" @click="limiteSessoes += 9">
                  <span>Carregar Mais Sessões (+9)</span>
                  <span class="load-more-badge">{{ sessoesFiltradasGeral.length - limiteSessoes }} restantes</span>
                </button>
              </div>
            </div>

            <div v-else class="empty-state-glass">
              <span class="empty-emoji">🎮</span>
              <p>Nenhuma sessão encontrada com os critérios de busca atuais.</p>
            </div>
          </div>

        </section>

        <!-- ============================================================ -->
        <!-- ABA 2: DESEMPENHO POR FACILITADOR                           -->
        <!-- ============================================================ -->
        <section v-if="activeTab === 'facilitadores'" class="tab-section-fade">
          
          <div class="section-top-bar">
            <div class="section-title-group">
              <h3 class="section-title">Facilitadores da Instituição</h3>
              <p class="section-hint">Selecione um facilitador para explorar suas turmas, salas configuradas e métricas comportamentais.</p>
            </div>
            <div class="search-box-glass">
              <span class="search-icon-glass">🔍</span>
              <input 
                type="text" 
                v-model="filtroFacilitador" 
                placeholder="Pesquisar facilitador por nome ou e-mail..." 
                class="search-input-field" 
              />
            </div>
          </div>

          <!-- Facilitador Selecionado Focado (se houver) -->
          <div v-if="facilitadorFiltroSelecionado" class="focused-facilitator-banner glass-card">
            <div class="focused-fac-header">
              <div class="focused-fac-left">
                <div class="focused-avatar">
                  {{ (facilitadorFiltroSelecionado.nome || 'F').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="fac-tag-badge">FACILITADOR SELECIONADO</span>
                  <h3 class="focused-fac-name">{{ facilitadorFiltroSelecionado.nome }}</h3>
                  <span class="focused-fac-email">{{ facilitadorFiltroSelecionado.email }}</span>
                </div>
              </div>
              <button class="btn-clear-selection" @click="facilitadorFiltroSelecionado = null">
                Ver Todos os Facilitadores &times;
              </button>
            </div>

            <div class="focused-fac-kpis-grid">
              <div class="f-kpi-item">
                <span class="f-kpi-val">{{ facilitadorFiltroSelecionado.salasCriadas }}</span>
                <span class="f-kpi-lbl">Salas VR</span>
              </div>
              <div class="f-kpi-item">
                <span class="f-kpi-val">{{ facilitadorFiltroSelecionado.sessoesExecutadas }}</span>
                <span class="f-kpi-lbl">Sessões Concluídas</span>
              </div>
              <div class="f-kpi-item">
                <span class="f-kpi-val">{{ facilitadorFiltroSelecionado.tempoTotalFormatado }}</span>
                <span class="f-kpi-lbl">Tempo Total em VR</span>
              </div>
              <div class="f-kpi-item">
                <span class="f-kpi-val">{{ facilitadorFiltroSelecionado.totalIntents }}</span>
                <span class="f-kpi-lbl">Ações Totais</span>
              </div>
            </div>
          </div>

          <!-- Grid de Facilitadores -->
          <div class="facilitadores-grid">
            <div 
              v-for="fac in facilitadoresFiltrados" 
              :key="fac.id" 
              :class="['glass-card', 'facilitador-stat-card', { 'is-active-card': facilitadorFiltroSelecionado?.id === fac.id }]"
            >
              <div class="fac-card-header">
                <div class="fac-avatar">
                  {{ (fac.nome || 'F').charAt(0).toUpperCase() }}
                </div>
                <div class="fac-meta">
                  <h4 class="fac-name">{{ fac.nome }}</h4>
                  <span class="fac-email" v-if="fac.email">{{ fac.email }}</span>
                  <span class="fac-id-badge">ID: {{ (fac.id || '').substring(0, 8) }}</span>
                </div>
              </div>

              <div class="fac-metrics-row">
                <div class="fac-metric-box">
                  <span class="f-val">{{ fac.salasCriadas }}</span>
                  <span class="f-lbl">Salas</span>
                </div>
                <div class="fac-metric-box">
                  <span class="f-val">{{ fac.sessoesExecutadas }}</span>
                  <span class="f-lbl">Sessões</span>
                </div>
                <div class="fac-metric-box">
                  <span class="f-val">{{ fac.tempoTotalFormatado }}</span>
                  <span class="f-lbl">Tempo VR</span>
                </div>
                <div class="fac-metric-box">
                  <span class="f-val">{{ fac.totalIntents }}</span>
                  <span class="f-lbl">Ações</span>
                </div>
              </div>

              <!-- Lista de Salas do Facilitador -->
              <div class="fac-rooms-list" v-if="fac.salas.length > 0">
                <span class="fac-rooms-title">Salas Criadas ({{ fac.salas.length }}):</span>
                <div class="rooms-chips-wrap">
                  <button 
                    v-for="s in fac.salas" 
                    :key="s.id" 
                    class="room-chip-btn"
                    @click="abrirModalSala(s)"
                  >
                    🥽 {{ s.roomName }} ({{ s.totalSessoes }} sessões)
                  </button>
                </div>
              </div>
              <div v-else class="fac-no-rooms">
                <span>Nenhuma sala configurada por este facilitador ainda.</span>
              </div>

              <!-- Ação de Filtragem / Foco -->
              <div class="fac-card-footer">
                <button 
                  class="btn-fac-drill" 
                  @click="explorarFacilitador(fac)"
                >
                  <span>Explorar Salas e Turmas deste Facilitador</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            <div v-if="facilitadoresFiltrados.length === 0" class="empty-state-glass" style="grid-column: 1 / -1;">
              <span class="empty-emoji">🔍</span>
              <p>Nenhum facilitador encontrado com o filtro pesquisado.</p>
            </div>
          </div>

        </section>

        <!-- ============================================================ -->
        <!-- ABA 3: DESEMPENHO POR SALA DE AULA VR & TURMAS              -->
        <!-- ============================================================ -->
        <section v-if="activeTab === 'salas'" class="tab-section-fade">
          
          <div class="section-top-bar">
            <div class="section-title-group">
              <h3 class="section-title">Salas de Aula Virtuais & Turmas</h3>
              <p class="section-hint">Configurações geométricas 3D, alunos matriculados e desempenho de cada ambiente VR.</p>
            </div>
            <div class="search-box-glass">
              <span class="search-icon-glass">🔍</span>
              <input 
                type="text" 
                v-model="filtroSala" 
                placeholder="Pesquisar por nome da sala, turma ou facilitador..." 
                class="search-input-field" 
              />
            </div>
          </div>

          <div class="salas-detailed-grid">
            <div 
              v-for="sala in salasFiltradas" 
              :key="sala.id" 
              class="glass-card sala-detailed-card"
            >
              <!-- Topo do Card da Sala -->
              <div class="sala-det-header">
                <div class="sala-det-info">
                  <div class="sala-tag-row">
                    <span class="premium-badge-vr">🥽 SALA VR</span>
                    <span class="premium-badge-target">
                      {{ sala.targetType === 'grupo' ? '👥 Turma: ' + sala.nomeAlvo : '👤 Aluno: ' + sala.nomeAlvo }}
                    </span>
                    <span class="premium-badge-fac">👨‍🏫 Orientador: {{ sala.facilitadorNome }}</span>
                  </div>
                  <h4 class="sala-det-title">{{ sala.roomName }}</h4>
                  <span class="sala-date">📅 Criada em: {{ formatarData(sala.criadoEm, 'data') }}</span>
                </div>

                <div class="sala-quick-kpi">
                  <span class="kpi-num">{{ sala.totalSessoes }}</span>
                  <span class="kpi-lbl">Sessões</span>
                </div>
              </div>

              <!-- Configuração Geometria 3D da Sala -->
              <div class="room-geometry-preview">
                <div class="geo-item">
                  <span class="geo-icon">📐</span>
                  <span class="geo-label">Formato:</span>
                  <span class="geo-val">{{ getShapeName(sala.shape) }}</span>
                </div>
                <div class="geo-item">
                  <span class="geo-icon">🪑</span>
                  <span class="geo-label">Mesas:</span>
                  <span class="geo-val">{{ sala.numDesks || 0 }}</span>
                </div>
                <div class="geo-item">
                  <span class="geo-icon">👦👧</span>
                  <span class="geo-label">Alunos Virtuais:</span>
                  <span class="geo-val">{{ (sala.numBoys || 0) + (sala.numGirls || 0) }} ({{ sala.numBoys || 0 }}M / {{ sala.numGirls || 0 }}F)</span>
                </div>
                <div class="geo-item">
                  <span class="geo-icon">↔️</span>
                  <span class="geo-label">Fileiras x Colunas:</span>
                  <span class="geo-val">{{ sala.rows || 0 }} x {{ sala.cols || 0 }}</span>
                </div>
                <div class="geo-item">
                  <span class="geo-icon">⭕</span>
                  <span class="geo-label">Raio:</span>
                  <span class="geo-val">{{ sala.radius || 10 }}m</span>
                </div>
                <div class="geo-item">
                  <span class="geo-icon">🎯</span>
                  <span class="geo-label">Taxa Conclusão:</span>
                  <span class="geo-val" :style="{ color: sala.taxaConclusao >= 50 ? '#059669' : '#d97706' }">{{ sala.taxaConclusao || 0 }}%</span>
                </div>
              </div>

              <!-- Métricas Gerais de Desempenho da Sala -->
              <div class="room-performance-summary">
                <div class="perf-stat">
                  <span class="perf-val">{{ sala.tempoTotalFormatado }}</span>
                  <span class="perf-lbl">Tempo Total</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ sala.tempoMedioFormatado }}</span>
                  <span class="perf-lbl">Média/Sessão</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ sala.totalIntentsSala }}</span>
                  <span class="perf-lbl">Total Ações</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ sala.participantesUnicosIds.length }} / {{ sala.alunosVinculados.length }}</span>
                  <span class="perf-lbl">Alunos Jogaram</span>
                </div>
              </div>

              <!-- Lista de Alunos Pertencentes a esta Sala -->
              <div class="room-students-section">
                <div class="room-students-header">
                  <span class="r-stud-title">Alunos Pertencentes a esta Turma ({{ sala.alunosVinculados.length }}):</span>
                </div>
                
                <div class="students-chips-list" v-if="sala.alunosVinculados.length > 0">
                  <div 
                    v-for="aluno in sala.alunosVinculados" 
                    :key="aluno.id" 
                    :class="['student-enrolled-pill', { 'has-played': sala.participantesUnicosIds.includes(normalizarId(aluno.id)) }]"
                  >
                    <span class="st-dot"></span>
                    <span class="st-name">{{ aluno.nome }}</span>
                    <span class="st-status">{{ sala.participantesUnicosIds.includes(normalizarId(aluno.id)) ? '✓ Concluiu' : 'Pendente' }}</span>
                  </div>
                </div>
                <p v-else class="empty-hint-text">Nenhum participante vinculado a este grupo.</p>
              </div>

              <!-- Botão de Ver Sessões da Sala -->
              <div class="card-footer-flex">
                <button class="btn-view-room-sessions" @click="abrirModalSala(sala)">
                  <span>Ver {{ sala.totalSessoes }} Sessão(ões) Desta Sala</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            <div v-if="salasFiltradas.length === 0" class="empty-state-glass" style="grid-column: 1 / -1;">
              <span class="empty-emoji">🥽</span>
              <p>Nenhuma sala encontrada com o filtro pesquisado.</p>
            </div>
          </div>

        </section>

        <!-- ============================================================ -->
        <!-- ABA 4: DESEMPENHO DOS ALUNOS / ESTUDANTES                    -->
        <!-- ============================================================ -->
        <section v-if="activeTab === 'alunos'" class="tab-section-fade">
          
          <div class="section-top-bar">
            <div class="section-title-group">
              <h3 class="section-title">Desempenho Individual de Cada Estudante</h3>
              <p class="section-hint">Acompanhe as métricas consolidadas, perfil de comportamento e histórico de simulações.</p>
            </div>
            <div class="search-box-glass">
              <span class="search-icon-glass">🔍</span>
              <input 
                type="text" 
                v-model="filtroAluno" 
                placeholder="Pesquisar aluno por nome ou e-mail..." 
                class="search-input-field" 
              />
            </div>
          </div>

          <div class="alunos-cards-grid">
            <div 
              v-for="aluno in alunosFiltrados" 
              :key="aluno.id" 
              class="glass-card aluno-stat-card"
            >
              <div class="aluno-card-top">
                <div class="aluno-avatar-lg">
                  {{ (aluno.nome || 'A').charAt(0).toUpperCase() }}
                </div>
                <div class="aluno-info-box">
                  <h4 class="aluno-name">{{ aluno.nome }}</h4>
                  <span class="aluno-email" v-if="aluno.email">{{ aluno.email }}</span>
                  <span class="aluno-id-tag">ID: {{ (aluno.id || '').substring(0, 8) }}</span>
                </div>
              </div>

              <!-- Métricas Gerais do Aluno -->
              <div class="aluno-kpis-row">
                <div class="aluno-kpi">
                  <span class="a-val">{{ aluno.totalSessoes }}</span>
                  <span class="a-lbl">Sessões</span>
                </div>
                <div class="aluno-kpi">
                  <span class="a-val">{{ aluno.tempoTotalFormatado }}</span>
                  <span class="a-lbl">Tempo VR</span>
                </div>
                <div class="aluno-kpi">
                  <span class="a-val">{{ aluno.tempoMedioFormatado }}</span>
                  <span class="a-lbl">Média/Sessão</span>
                </div>
                <div class="aluno-kpi">
                  <span class="a-val">{{ aluno.totalIntents }}</span>
                  <span class="a-lbl">Ações</span>
                </div>
              </div>

              <!-- Distribuição de Ações do Aluno -->
              <div class="aluno-intents-breakdown">
                <span class="intents-header-label">Perfil de Ações no VR:</span>
                <div v-if="aluno.intentsList.length > 0" class="aluno-intents-chips">
                  <span 
                    v-for="intent in aluno.intentsList" 
                    :key="intent.label" 
                    class="aluno-intent-pill"
                    :style="{ backgroundColor: intent.bg, color: intent.color, borderColor: intent.color + '40' }"
                  >
                    {{ intent.icon }} {{ intent.label }}: <strong>{{ intent.quantidade }}x</strong>
                  </span>
                </div>
                <span v-else class="no-intents-text">Sem ações registradas</span>
              </div>

              <!-- Salas em que o aluno participou -->
              <div class="aluno-rooms-visited">
                <span class="rooms-visited-label">Salas Frequentadas ({{ aluno.salasParticipadas.length }}):</span>
                <div class="rooms-visited-tags">
                  <span v-for="rNome in aluno.salasParticipadas" :key="rNome" class="r-visited-pill">
                    🥽 {{ rNome }}
                  </span>
                  <span v-if="aluno.salasParticipadas.length === 0" class="no-rooms-visited">Ainda não realizou simulações VR</span>
                </div>
              </div>

              <!-- Ação de Detalhes -->
              <div class="card-footer-flex" v-if="aluno.sessoes.length > 0">
                <button class="btn-view-aluno-sessions" @click="abrirModalAluno(aluno)">
                  <span>Ver Histórico de {{ aluno.sessoes.length }} Sessão(ões)</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            <div v-if="alunosFiltrados.length === 0" class="empty-state-glass" style="grid-column: 1 / -1;">
              <span class="empty-emoji">🎓</span>
              <p>Nenhum aluno encontrado com os filtros informados.</p>
            </div>
          </div>

        </section>

      </div>
    </main>

    <!-- ============================================================ -->
    <!-- MODAL 1: HISTÓRICO DO ESTUDANTE SELECIONADO                   -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="alunoModal" class="modal-overlay" @click.self="fecharModalAluno">
          <div class="modal-glass-container" @click.stop style="max-width: 680px;">
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">HISTÓRICO DO ESTUDANTE</span>
                <h3 class="modal-title">{{ alunoModal.nome }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalAluno">&times;</button>
            </div>

            <div class="modal-body">
              <div class="aluno-kpis-row" style="margin-bottom: 20px;">
                <div class="aluno-kpi">
                  <span class="a-val">{{ alunoModal.totalSessoes }}</span>
                  <span class="a-lbl">Sessões</span>
                </div>
                <div class="aluno-kpi">
                  <span class="a-val">{{ alunoModal.tempoTotalFormatado }}</span>
                  <span class="a-lbl">Tempo Total</span>
                </div>
                <div class="aluno-kpi">
                  <span class="a-val">{{ alunoModal.totalIntents }}</span>
                  <span class="a-lbl">Ações Totais</span>
                </div>
              </div>

              <h4 class="section-subtitle">Sessões VR Executadas ({{ alunoModal.sessoes.length }})</h4>
              <div class="modal-sessions-scroll-list" v-if="alunoModal.sessoes.length > 0">
                <div 
                  v-for="s in alunoModal.sessoes" 
                  :key="s.id" 
                  class="modal-session-card-glass"
                  @click="abrirModalSessao(s)"
                >
                  <div class="m-sess-header">
                    <div class="m-sess-user">
                      <div class="m-sess-avatar-room">🥽</div>
                      <div class="m-sess-user-text">
                        <span class="m-sess-name">{{ s.salaNome }}</span>
                        <span class="m-sess-date">📅 {{ formatarData(s.dataInicio) }}</span>
                      </div>
                    </div>
                    <span class="m-sess-time-badge">⏱️ {{ s.duracaoFormatada }}</span>
                  </div>

                  <div class="m-sess-intents" v-if="s.intentsArray && s.intentsArray.length > 0">
                    <span 
                      v-for="int in s.intentsArray" 
                      :key="int.label" 
                      class="m-intent-chip"
                      :style="{ backgroundColor: int.bg, color: int.color, borderColor: int.color + '40' }"
                    >
                      {{ int.icon }} {{ int.label }}: <strong>{{ int.quantidade }}x</strong>
                    </span>
                  </div>
                  <div v-else class="m-no-intents">
                    <span>🎮 Simulação concluída sem ocorrências especiais</span>
                  </div>

                  <div class="m-sess-footer">
                    <span class="m-sess-action-hint">Ver Detalhes desta Sessão &rarr;</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-glass">
                <span class="empty-emoji">🎓</span>
                <p>Nenhuma sessão registrada para este aluno ainda.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================ -->
    <!-- MODAL 2: SESSÕES DA SALA VR SELECIONADA                       -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="salaModal" class="modal-overlay" @click.self="fecharModalSala">
          <div class="modal-glass-container" @click.stop style="max-width: 760px;">
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">SESSÕES DA SALA VR</span>
                <h3 class="modal-title">{{ salaModal.roomName }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalSala">&times;</button>
            </div>

            <div class="modal-body">
              <div class="room-performance-summary" style="margin-bottom: 20px;">
                <div class="perf-stat">
                  <span class="perf-val">{{ salaModal.totalSessoes }}</span>
                  <span class="perf-lbl">Sessões</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ salaModal.tempoTotalFormatado }}</span>
                  <span class="perf-lbl">Tempo Total</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ salaModal.totalIntentsSala }}</span>
                  <span class="perf-lbl">Ações Totais</span>
                </div>
                <div class="perf-stat">
                  <span class="perf-val">{{ salaModal.participantesUnicosIds.length }} / {{ salaModal.alunosVinculados.length }}</span>
                  <span class="perf-lbl">Alunos Jogaram</span>
                </div>
              </div>

              <h4 class="section-subtitle">Sessões Realizadas nesta Sala ({{ salaModal.sessoes.length }})</h4>
              <div class="modal-sessions-scroll-list" v-if="salaModal.sessoes.length > 0">
                <div 
                  v-for="sessao in salaModal.sessoes" 
                  :key="sessao.id" 
                  class="modal-session-card-glass"
                  @click="abrirModalSessao(sessao)"
                >
                  <div class="m-sess-header">
                    <div class="m-sess-user">
                      <div class="m-sess-avatar">{{ sessao.alunoAvatar }}</div>
                      <div class="m-sess-user-text">
                        <span class="m-sess-name">{{ sessao.alunoNome }}</span>
                        <span class="m-sess-date">📅 {{ formatarData(sessao.dataInicio) }}</span>
                      </div>
                    </div>
                    <span class="m-sess-time-badge">⏱️ {{ sessao.duracaoFormatada }}</span>
                  </div>

                  <div class="m-sess-intents" v-if="sessao.intentsArray && sessao.intentsArray.length > 0">
                    <span 
                      v-for="int in sessao.intentsArray" 
                      :key="int.label" 
                      class="m-intent-chip"
                      :style="{ backgroundColor: int.bg, color: int.color, borderColor: int.color + '40' }"
                    >
                      {{ int.icon }} {{ int.label }}: <strong>{{ int.quantidade }}x</strong>
                    </span>
                  </div>
                  <div v-else class="m-no-intents">
                    <span>🎮 Simulação concluída sem ocorrências especiais</span>
                  </div>

                  <div class="m-sess-footer">
                    <span class="m-sess-action-hint">Ver Detalhes desta Sessão &rarr;</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-glass">
                <span class="empty-emoji">🥽</span>
                <p>Nenhuma sessão VR foi executada nesta sala ainda.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================ -->
    <!-- MODAL 3: DETALHAMENTO COMPLETO DA SESSÃO VR (TOPMOST MODAL)   -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="sessaoSelecionada" class="modal-overlay modal-overlay-detail" @click.self="fecharModalSessao">
          <div class="modal-glass-container" @click.stop>
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">DETALHAMENTO DA SESSÃO VR</span>
                <h3 class="modal-title">{{ sessaoSelecionada.sessaoKey }}</h3>
              </div>
              <button class="close-btn" @click="fecharModalSessao">&times;</button>
            </div>

            <div class="modal-body">
              <div class="session-modal-hero">
                <div class="hero-avatar">{{ sessaoSelecionada.alunoAvatar }}</div>
                <div class="hero-info">
                  <span class="hero-name">{{ sessaoSelecionada.alunoNome }}</span>
                  <span class="hero-email" v-if="sessaoSelecionada.alunoEmail">{{ sessaoSelecionada.alunoEmail }}</span>
                  <span class="hero-room">Sala: <strong>{{ sessaoSelecionada.salaNome }}</strong> &bull; Orientador: <strong>{{ sessaoSelecionada.facilitadorNome }}</strong></span>
                </div>
              </div>

              <div class="session-meta-grid">
                <div class="meta-box">
                  <span class="meta-lbl">Data de Início</span>
                  <span class="meta-val">{{ formatarData(sessaoSelecionada.dataInicio) }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Duração da Sessão</span>
                  <span class="meta-val">{{ sessaoSelecionada.duracaoFormatada }}</span>
                </div>
                <div class="meta-box">
                  <span class="meta-lbl">Total de Ações</span>
                  <span class="meta-val">{{ sessaoSelecionada.totalIntents }}</span>
                </div>
              </div>

              <h4 class="section-subtitle" style="margin-top: 22px;">Ações & Comportamentos Registrados</h4>
              <div class="intents-modal-list">
                <div 
                  v-for="item in sessaoSelecionada.intentsArray" 
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
                <p v-if="sessaoSelecionada.intentsArray.length === 0" class="empty-hint-text">Nenhuma ação específica registrada nesta sessão.</p>
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
import { auth, database } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, get } from 'firebase/database'

import MenuLateral from '../components/generic/MenuLateral.vue'
import IntentsDonutChart from '../components/instituicao/charts/IntentsDonutChart.vue'
import FacilitatorsBarChart from '../components/instituicao/charts/FacilitatorsBarChart.vue'
import TimelineActivityChart from '../components/instituicao/charts/TimelineActivityChart.vue'
import RoomEngagementProgress from '../components/instituicao/charts/RoomEngagementProgress.vue'

import { 
  carregarDadosCompletosInstituicao, 
  processarMetricasInstituicao, 
  formatarData,
  normalizarId
} from '../services/resultadosService'

const router = useRouter()
const isLoading = ref(true)
const isReloading = ref(false)
const userData = ref({})

const activeTab = ref('geral') // 'geral' | 'facilitadores' | 'salas' | 'alunos'

// Filtros de busca e hierarquia
const filtroFacilitador = ref('')
const filtroSala = ref('')
const filtroAluno = ref('')
const filtroSessoesTexto = ref('')
const limiteSessoes = ref(9)

const facilitadorFiltroSelecionado = ref(null)
const salaFiltroSelecionada = ref(null)

const rawData = ref({ salas: [], usuarios: [], grupos: [], sessoesTodas: [] })
const metricas = ref({
  kpis: {
    totalSalas: 0,
    totalSessoes: 0,
    tempoTotalSegundos: 0,
    tempoTotalFormatado: '0s',
    tempoMedioSegundos: 0,
    tempoMedioFormatado: '0s',
    totalIntentsGeral: 0,
    totalFacilitadores: 0,
    totalAlunosCadastrados: 0,
    totalAlunosParticipantes: 0,
    totalGrupos: 0
  },
  intentsGlobaisList: [],
  facilitadoresList: [],
  alunosList: [],
  salas: [],
  grupos: [],
  sessoesTodas: [],
  timelineSeries: []
})

// Modais
const sessaoSelecionada = ref(null)
const alunoModal = ref(null)
const salaModal = ref(null)

const initials = computed(() => {
  const nome = userData.value.nomeFaculdade || userData.value.nomeInstituicao || userData.value.nome || '?'
  const nomes = String(nome).trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const facilitadoresFiltrados = computed(() => {
  if (!filtroFacilitador.value) return metricas.value.facilitadoresList
  const q = filtroFacilitador.value.toLowerCase()
  return metricas.value.facilitadoresList.filter(f =>
    (f.nome && f.nome.toLowerCase().includes(q)) ||
    (f.email && f.email.toLowerCase().includes(q))
  )
})

const salasFiltradas = computed(() => {
  let list = metricas.value.salas
  if (facilitadorFiltroSelecionado.value) {
    const fId = facilitadorFiltroSelecionado.value.id
    list = list.filter(s => s.facilitadorId === fId || normalizarId(s.facilitadorId) === normalizarId(fId))
  }
  if (!filtroSala.value) return list
  const q = filtroSala.value.toLowerCase()
  return list.filter(s =>
    (s.roomName && s.roomName.toLowerCase().includes(q)) ||
    (s.facilitadorNome && s.facilitadorNome.toLowerCase().includes(q)) ||
    (s.nomeAlvo && s.nomeAlvo.toLowerCase().includes(q))
  )
})

const alunosFiltrados = computed(() => {
  if (!filtroAluno.value) return metricas.value.alunosList
  const q = filtroAluno.value.toLowerCase()
  return metricas.value.alunosList.filter(a =>
    (a.nome && a.nome.toLowerCase().includes(q)) ||
    (a.email && a.email.toLowerCase().includes(q))
  )
})

const sessoesFiltradasGeral = computed(() => {
  let list = metricas.value.sessoesTodas
  if (facilitadorFiltroSelecionado.value) {
    const fId = facilitadorFiltroSelecionado.value.id
    list = list.filter(s => s.facilitadorId === fId || normalizarId(s.facilitadorId) === normalizarId(fId))
  }
  if (!filtroSessoesTexto.value) return list
  const q = filtroSessoesTexto.value.toLowerCase()
  return list.filter(s =>
    (s.alunoNome && s.alunoNome.toLowerCase().includes(q)) ||
    (s.salaNome && s.salaNome.toLowerCase().includes(q)) ||
    (s.facilitadorNome && s.facilitadorNome.toLowerCase().includes(q)) ||
    (s.alunoEmail && s.alunoEmail.toLowerCase().includes(q))
  )
})

const getShapeName = (shape) => {
  if (shape === 1) return 'Semicírculo'
  if (shape === 2) return 'Circular'
  return 'Retangular / Padrão'
}

const explorarFacilitador = (fac) => {
  facilitadorFiltroSelecionado.value = fac
  activeTab.value = 'salas'
}

const resetarFiltrosHierarquia = () => {
  facilitadorFiltroSelecionado.value = null
  salaFiltroSelecionada.value = null
}

const abrirModalSessao = (sessao) => {
  sessaoSelecionada.value = sessao
}
const fecharModalSessao = () => {
  sessaoSelecionada.value = null
}

const abrirModalAluno = (aluno) => {
  alunoModal.value = aluno
}
const fecharModalAluno = () => {
  alunoModal.value = null
}

const abrirModalSala = (sala) => {
  salaModal.value = sala
}
const fecharModalSala = () => {
  salaModal.value = null
}

const buscarDados = async (user) => {
  const shortId = user.uid.substring(0, 8).toUpperCase()
  const fullId = user.uid
  
  let dataEncontrada = null
  let idUsado = null
  let tipoConta = null

  // 1. Busca direta por nós
  const paths = [
    { ref: `instituicoes/${shortId}`, typeFallback: 'Instituicao' },
    { ref: `instituicoes/${fullId}`, typeFallback: 'Instituicao' },
    { ref: `usuarios/${shortId}`, typeFallback: null },
    { ref: `usuarios/${fullId}`, typeFallback: null }
  ]

  for (const path of paths) {
    const snap = await get(dbRef(database, path.ref))
    if (snap.exists()) {
      dataEncontrada = snap.val()
      idUsado = path.ref.split('/')[1] 
      tipoConta = dataEncontrada.tipoCadastro || dataEncontrada.tipo || path.typeFallback
      break
    }
  }

  // 2. Fallback por E-mail em 'instituicoes'
  if (!dataEncontrada) {
    const instSnap = await get(dbRef(database, 'instituicoes'))
    if (instSnap.exists()) {
      const instituicoes = instSnap.val()
      for (const key in instituicoes) {
        if (instituicoes[key]?.email?.toLowerCase() === user.email?.toLowerCase()) {
          dataEncontrada = instituicoes[key]
          idUsado = key
          tipoConta = 'Instituicao'
          break
        }
      }
    }
  }

  // 3. Fallback por E-mail em 'usuarios'
  if (!dataEncontrada) {
    const usersSnap = await get(dbRef(database, 'usuarios'))
    if (usersSnap.exists()) {
      const usuarios = usersSnap.val()
      for (const key in usuarios) {
        if (usuarios[key]?.email?.toLowerCase() === user.email?.toLowerCase()) {
          dataEncontrada = usuarios[key]
          idUsado = key
          tipoConta = usuarios[key].tipoCadastro || usuarios[key].tipo
          break
        }
      }
    }
  }

  if (dataEncontrada) {
    userData.value = {
      email: user.email, 
      ...dataEncontrada,
      id: idUsado,
      tipo: tipoConta
    }

    const idsIdentificadores = [
      idUsado,
      shortId,
      fullId,
      dataEncontrada.instituicaoId,
      dataEncontrada.idCurto,
      dataEncontrada.authUid
    ].filter(Boolean)

    rawData.value = await carregarDadosCompletosInstituicao(idUsado, idsIdentificadores)
    metricas.value = processarMetricasInstituicao(rawData.value)
  } else {
    router.push('/home')
  }
}

const recarregarDados = async () => {
  if (isReloading.value) return
  isReloading.value = true
  const user = auth.currentUser
  if (user) {
    try {
      await buscarDados(user)
    } catch (e) {
      console.error("Erro ao recarregar relatórios:", e)
    } finally {
      isReloading.value = false
    }
  } else {
    isReloading.value = false
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await buscarDados(user)
      } catch (error) {
        console.error("Erro ao carregar relatórios institucionais:", error)
      } finally {
        isLoading.value = false
      }
    } else {
      router.push('/')
    }
  })
})
</script>

<style scoped>
.relatorios-container {
  width: 100%;
  animation: glassFadeUp 0.5s ease both;
}

/* Navbar action */
.nav-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-refresh-glass {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 12px;
  color: #0071e3;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.08);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-refresh-glass:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 113, 227, 0.18);
}

.refresh-icon { font-size: 0.95rem; }
.refresh-icon.is-spinning {
  animation: spin 0.8s linear infinite;
}

/* Profile Hero Glass */
.profile-hero-glass {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 28px 32px 18px 32px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-glass {
  width: 72px;
  height: 72px;
  border-radius: 22px;
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
  background: rgba(239, 246, 255, 0.95);
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

/* Hierarchy Breadcrumb */
.hierarchy-breadcrumb-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.9), rgba(240, 253, 244, 0.85));
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 14px;
  font-size: 0.84rem;
}

.crumb-label {
  font-weight: 700;
  color: #64748b;
  font-size: 0.76rem;
  text-transform: uppercase;
}

.crumb-pill {
  background: #ffffff;
  border: 1px solid #bfdbfe;
  color: #0071e3;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.crumb-pill.active {
  background: #0071e3;
  color: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);
}

.crumb-sep {
  color: #94a3b8;
  font-weight: 800;
}

.btn-clear-crumb {
  margin-left: auto;
  background: rgba(254, 242, 242, 0.85);
  border: 1px solid rgba(254, 202, 202, 0.9);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-clear-crumb:hover {
  background: #fee2e2;
}

/* Analytics Tabs Bar */
.analytics-tabs-bar {
  display: flex;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.analytics-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.75);
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 0.88rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.analytics-tab-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #0071e3;
  border-color: rgba(191, 219, 254, 0.9);
}

.analytics-tab-btn.active {
  background: #0071e3;
  color: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 6px 20px rgba(0, 113, 227, 0.25);
}

.tab-icon { font-size: 1.1rem; }

.tab-section-fade {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* KPI Cards */
.kpi-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-icon-pill {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.icon-blue { background: #eff6ff; }
.icon-green { background: #ecfdf5; }
.icon-purple { background: #f5f3ff; }
.icon-amber { background: #fffbeb; }

.kpi-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.8px;
  line-height: 1.1;
  margin-bottom: 4px;
}

.kpi-title {
  font-size: 0.94rem;
  font-weight: 700;
  color: #334155;
}

.kpi-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

/* Charts Grid 2x2 */
.charts-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.glass-dashboard-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
  overflow-x: hidden;
}

.chart-sub-card {
  display: flex;
  flex-direction: column;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.card-header-subtitle {
  font-size: 0.84rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

.total-pill {
  background: #eff6ff;
  color: #0071e3;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
  white-space: nowrap;
}

/* Search Box Styling */
.section-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}

.section-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.section-hint {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
}

.search-box-glass {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 320px;
  max-width: 440px;
  width: 100%;
}

.search-icon-glass {
  position: absolute;
  left: 14px;
  font-size: 0.95rem;
  color: #64748b;
  pointer-events: none;
}

.search-input-field {
  width: 100%;
  padding: 11px 16px 11px 40px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input-field:focus {
  background: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 0 0 3.5px rgba(0, 113, 227, 0.15), 0 4px 16px rgba(0, 113, 227, 0.08);
}

.search-input-field::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.table-search-inline {
  width: 300px;
}

.table-search-input {
  width: 100%;
  padding: 9px 16px;
  background: rgba(248, 250, 252, 0.9);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.table-search-input:focus {
  background: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

/* ============================================================ */
/* SESSIONS FEED CARDS GRID (NO HORIZONTAL SCROLLBAR)           */
/* ============================================================ */
.sessions-feed-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
}

.sessions-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 18px;
}

.session-feed-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.session-feed-card:hover {
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(0, 113, 227, 0.12);
}

.s-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.s-card-user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.s-card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0071e3 0%, #10b981 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.15rem;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
  flex-shrink: 0;
}

.s-card-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.s-card-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-card-email {
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-card-duration {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.78rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.s-card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 10px 12px;
}

.s-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  min-width: 0;
}

.s-meta-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
}

.s-meta-label {
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}

.s-meta-val {
  color: #1e293b;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-meta-val.date-highlight {
  color: #0071e3;
}

.s-card-intents {
  min-height: 28px;
  display: flex;
  align-items: center;
}

.s-intents-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.s-intent-pill {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
}

.s-more-intents {
  background: #f1f5f9;
  color: #64748b;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.s-no-intents {
  font-size: 0.76rem;
  color: #94a3b8;
  font-style: italic;
}

.s-card-footer {
  margin-top: auto;
}

.btn-s-details {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  color: #0071e3;
  font-weight: 800;
  font-size: 0.82rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.session-feed-card:hover .btn-s-details {
  background: #0071e3;
  color: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.25);
}

.load-more-sessoes-wrap {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.btn-load-more {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid #bfdbfe;
  color: #0071e3;
  padding: 10px 22px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
  transition: all 0.22s ease;
}

.btn-load-more:hover {
  background: #eff6ff;
  border-color: #0071e3;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 113, 227, 0.16);
}

.load-more-badge {
  background: #eff6ff;
  color: #0071e3;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
}

/* Facilitadores Grid & Focused Banner */
.focused-facilitator-banner {
  margin-bottom: 24px;
  border: 1.5px solid #bfdbfe;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(240, 253, 244, 0.9));
  box-shadow: 0 12px 32px rgba(0, 113, 227, 0.08);
}

.focused-fac-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}

.focused-fac-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.focused-avatar {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}

.fac-tag-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.5px;
}

.focused-fac-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0 0;
}

.focused-fac-email {
  font-size: 0.85rem;
  color: #64748b;
}

.btn-clear-selection {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-selection:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.focused-fac-kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  text-align: center;
}

.f-kpi-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0071e3;
  display: block;
}

.f-kpi-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.facilitadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.facilitador-stat-card {
  padding: 24px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.facilitador-stat-card.is-active-card {
  border: 2px solid #0071e3;
  box-shadow: 0 12px 32px rgba(0, 113, 227, 0.15);
}

.fac-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.fac-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.3rem;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.fac-meta {
  display: flex;
  flex-direction: column;
}

.fac-name { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
.fac-email { font-size: 0.82rem; color: #64748b; }
.fac-id-badge { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }

.fac-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
}

.f-val { font-size: 1.1rem; font-weight: 800; color: #0071e3; display: block; }
.f-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

.fac-rooms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fac-rooms-title { font-size: 0.8rem; font-weight: 700; color: #475569; }

.rooms-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.room-chip-btn {
  background: rgba(239, 246, 255, 0.95);
  border: 1px solid rgba(191, 219, 254, 0.9);
  color: #0071e3;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-chip-btn:hover {
  background: #0071e3;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
}

.fac-no-rooms { font-size: 0.82rem; color: #94a3b8; font-style: italic; }

.fac-card-footer {
  margin-top: auto;
  padding-top: 8px;
}

.btn-fac-drill {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  color: #0071e3;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-fac-drill:hover {
  background: #0071e3;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.25);
}

/* ============================================================ */
/* ABA 3: SALAS & TURMAS VR - DESIGN EXTREMAMENTE REFINADO      */
/* ============================================================ */
.salas-detailed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
}

.sala-detailed-card {
  padding: 26px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.sala-detailed-card:hover {
  transform: translateY(-4px);
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 20px 45px rgba(0, 113, 227, 0.12);
}

.sala-det-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.sala-det-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.sala-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.premium-badge-vr {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #0071e3;
  border: 1px solid #bfdbfe;
  white-space: nowrap;
}

.premium-badge-target {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

.premium-badge-fac {
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
  white-space: nowrap;
}

.sala-det-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0 0;
  letter-spacing: -0.4px;
}

.sala-date { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }

.sala-quick-kpi {
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1.5px solid #bfdbfe;
  padding: 10px 18px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
  flex-shrink: 0;
}

.kpi-num { font-size: 1.45rem; font-weight: 800; color: #0071e3; display: block; line-height: 1.1; }
.kpi-lbl { font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

/* 3D Geometry Matrix */
.room-geometry-preview {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9));
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.geo-item { display: flex; align-items: center; gap: 8px; font-size: 0.84rem; }
.geo-icon { font-size: 1.1rem; }
.geo-label { color: #64748b; font-weight: 600; }
.geo-val { color: #0f172a; font-weight: 800; }

/* Room Performance Summary */
.room-performance-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 14px 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.perf-val { font-size: 1.08rem; font-weight: 800; color: #0f172a; display: block; }
.perf-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px; }

.room-students-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.r-stud-title { font-size: 0.82rem; font-weight: 800; color: #334155; }

.students-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 130px;
  overflow-y: auto;
  padding: 2px;
}

.student-enrolled-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.student-enrolled-pill.has-played {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.st-dot { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; }
.student-enrolled-pill.has-played .st-dot { background: #10b981; box-shadow: 0 0 6px #10b981; }
.st-status { font-size: 0.7rem; font-weight: 800; opacity: 0.9; }

.btn-view-room-sessions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1.5px solid #bfdbfe;
  color: #0071e3;
  font-weight: 800;
  font-size: 0.9rem;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.1);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-view-room-sessions:hover {
  background: #0071e3;
  color: #ffffff;
  border-color: #0071e3;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.25);
}

/* ============================================================ */
/* ABA 4: DESEMPENHO DOS ALUNOS - DESIGN PREMIUM GLASSMORPHIC   */
/* ============================================================ */
.alunos-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
}

.aluno-stat-card {
  padding: 26px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.aluno-stat-card:hover {
  transform: translateY(-4px);
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 20px 45px rgba(0, 113, 227, 0.12);
}

.aluno-card-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aluno-avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0071e3 0%, #3b82f6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.4rem;
  box-shadow: 0 6px 18px rgba(0, 113, 227, 0.28);
  flex-shrink: 0;
}

.aluno-info-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.aluno-name { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: #0f172a; 
  margin: 0; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.4px;
}

.aluno-email { 
  font-size: 0.84rem; 
  color: #64748b; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aluno-id-tag { 
  font-size: 0.72rem; 
  color: #94a3b8; 
  font-weight: 700; 
  margin-top: 2px;
}

.aluno-kpis-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.a-val { font-size: 1.1rem; font-weight: 800; color: #0071e3; display: block; }
.a-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px; }

.aluno-intents-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intents-header-label { font-size: 0.8rem; font-weight: 800; color: #334155; }

.aluno-intents-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.aluno-intent-pill {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  white-space: nowrap;
}

.no-intents-text { font-size: 0.78rem; color: #94a3b8; font-style: italic; }

.aluno-rooms-visited {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rooms-visited-label { font-size: 0.8rem; font-weight: 800; color: #334155; }

.rooms-visited-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.r-visited-pill {
  background: #f1f5f9;
  color: #1e293b;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  white-space: nowrap;
}

.no-rooms-visited { font-size: 0.78rem; color: #94a3b8; font-style: italic; }

.btn-view-aluno-sessions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1.5px solid #bfdbfe;
  color: #0071e3;
  font-weight: 800;
  font-size: 0.88rem;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.1);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-view-aluno-sessions:hover {
  background: #0071e3;
  color: white;
  border-color: #0071e3;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.25);
}

/* ============================================================ */
/* MODALS APPLE GLASS & MODAL SESSIONS LIST (ZERO JITTER)       */
/* ============================================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay.modal-overlay-detail {
  z-index: 20100;
  background: rgba(15, 23, 42, 0.6);
}

.modal-glass-container {
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(36px);
  border: 1.5px solid rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.6px;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 1.3rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-modal-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(241, 245, 249, 0.85);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.hero-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.25);
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-name { font-size: 1.15rem; font-weight: 800; color: #0f172a; }
.hero-email { font-size: 0.82rem; color: #64748b; }
.hero-room { font-size: 0.82rem; color: #475569; margin-top: 2px; }

.session-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.meta-box {
  background: #ffffff;
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.meta-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; }
.meta-val { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-top: 2px; display: block; }

.section-subtitle {
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.intents-modal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.intent-modal-icon { font-size: 1.1rem; }
.intent-modal-label { font-size: 0.88rem; font-weight: 700; color: #0f172a; }
.intent-modal-qty { font-size: 0.95rem; font-weight: 800; }

/* Modal Sessions Scroll List & Cards (Zero Transform Jitter) */
.modal-sessions-scroll-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 2px;
}

.modal-session-card-glass {
  background: rgba(248, 250, 252, 0.9);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.modal-session-card-glass:hover {
  background: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 4px 18px rgba(0, 113, 227, 0.1);
}

.m-sess-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.m-sess-user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.m-sess-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.2);
}

.m-sess-avatar-room {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  color: #0071e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.m-sess-user-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.m-sess-name {
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-sess-date {
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 500;
}

.m-sess-time-badge {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.78rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.m-sess-intents {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.m-intent-chip {
  font-size: 0.74rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
}

.m-no-intents {
  font-size: 0.76rem;
  color: #94a3b8;
  font-style: italic;
}

.m-sess-footer {
  margin-top: 2px;
}

.m-sess-action-hint {
  font-size: 0.78rem;
  color: #0071e3;
  font-weight: 700;
  transition: all 0.2s ease;
}

.modal-session-card-glass:hover .m-sess-action-hint {
  text-decoration: underline;
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.glass-modal-enter-active, .glass-modal-leave-active {
  transition: opacity 0.25s ease;
}
.glass-modal-enter-from, .glass-modal-leave-to {
  opacity: 0;
}

/* ============================================================ */
/* MEDIA QUERIES FOR FULL MOBILE RESPONSIVENESS                 */
/* ============================================================ */
@media (max-width: 1024px) {
  .charts-dashboard-grid {
    grid-template-columns: 1fr;
  }
  .salas-detailed-grid, .alunos-cards-grid {
    grid-template-columns: 1fr;
  }
  .sessions-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-hero-glass {
    padding: 20px 16px;
    border-radius: 18px;
  }
  .profile-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .user-avatar-glass {
    width: 56px;
    height: 56px;
    font-size: 1.4rem;
    border-radius: 16px;
  }
  .welcome-title {
    font-size: 1.35rem;
  }
  .welcome-subtitle {
    font-size: 0.82rem;
  }
  .analytics-tabs-bar {
    gap: 6px;
  }
  .analytics-tab-btn {
    padding: 8px 12px;
    font-size: 0.78rem;
  }
  .kpi-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .glass-dashboard-card {
    padding: 18px 14px;
    border-radius: 18px;
  }
  .search-box-glass {
    min-width: 100%;
    max-width: 100%;
  }
  .table-search-inline {
    width: 100%;
  }
  .section-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .focused-fac-kpis-grid, .room-performance-summary, .aluno-kpis-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .room-geometry-preview {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .sessions-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .session-feed-card {
    padding: 16px;
  }
  .modal-glass-container {
    max-width: 95vw;
    border-radius: 18px;
  }
  .modal-header {
    padding: 16px;
  }
  .modal-body {
    padding: 16px;
  }
  .session-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
