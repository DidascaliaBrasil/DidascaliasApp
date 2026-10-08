<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout console-viewport-lock">
    <div class="animated-background"></div>

    <!-- Menu Lateral da Aplicação -->
    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
    />

    <!-- Header / Navbar Principal Didascalias (Altura normal com espaço seguro à direita para o tradutor) -->
    <nav class="navbar">
      <div class="logo-area stagger-in">
        <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
        <span class="brand-name notranslate" translate="no">Didascalias</span>
      </div>

      <!-- Zona do Status com margem de segurança à direita para a extensão/widget de tradução do navegador -->
      <div class="navbar-right-info safe-translate-space" v-if="sala">
        <span :class="['session-live-pulse-badge', isSalaAtiva(sala) ? 'badge-sala-ativa' : 'badge-sala-inativa']">
          <span class="pulse-beacon" v-if="isSalaAtiva(sala)"></span>
          <span class="idle-beacon" v-else></span>
          <span>{{ isSalaAtiva(sala) ? 'Sessão Ativa no VR' : 'Sessão Inativa' }}</span>
        </span>
      </div>
    </nav>

    <!-- Conteúdo Principal - Console Didascalias -->
    <main class="console-main-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>A carregar configuração e telemetria da sala VR...</p>
      </div>

      <!-- Erro ao Encontrar Sala -->
      <div v-else-if="!sala" class="error-box">
        <h3>Sala não encontrada</h3>
        <p>A sala solicitada não existe ou foi removida do sistema.</p>
        <button class="btn-back-link" @click="voltar">&larr; Voltar para a Home</button>
      </div>

      <!-- CONSOLE INTERATIVO DIDASCALIAS (SEM SCROLL GERAL) -->
      <div v-else class="console-wrapper">
        
        <!-- BARRA SUPERIOR DE CONTROLE DA SESSÃO (ESTILO DIDASCALIAS) -->
        <div class="console-session-toolbar">
          <div class="toolbar-left">
            <button class="btn-back-nav-compact" @click="voltar" title="Voltar para Salas">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="back-svg-mini">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Salas</span>
            </button>

            <div class="toolbar-room-badge">
              <span class="room-badge-icon">🥽</span>
              <span class="room-badge-name notranslate" translate="no">{{ sala.roomName || 'Sala VR' }}</span>
            </div>
          </div>

          <!-- AÇÕES DA SESSÃO VR (INICIAR, ENCERRAR, RESET TURMA) -->
          <div class="toolbar-center-actions">
            <!-- Iniciar Sala -->
            <button
              type="button"
              class="btn-didas-session btn-start"
              :disabled="isSalaAtiva(sala) || iniciandoSala || !podeModificarEControlar"
              @click="iniciarSalaVR"
              :title="isSalaAtiva(sala) ? 'A sala já está ativa' : 'Iniciar a simulação no óculos VR'"
            >
              <span v-if="iniciandoSala" class="btn-spinner-tech white"></span>
              <span v-else class="btn-action-icon">▶</span>
              <span>{{ iniciandoSala ? 'Iniciando...' : 'Iniciar a Sala' }}</span>
            </button>

            <!-- Encerrar Sala -->
            <button
              type="button"
              class="btn-didas-session btn-end"
              :disabled="!isSalaAtiva(sala) || encerrandoSala || !podeModificarEControlar"
              @click="encerrarSalaVR"
              :title="!isSalaAtiva(sala) ? 'A sala já está inativa' : 'Encerrar a simulação no óculos VR'"
            >
              <span v-if="encerrandoSala" class="btn-spinner-tech white"></span>
              <span v-else class="btn-action-icon">⏹</span>
              <span>{{ encerrandoSala ? 'Encerrando...' : 'Encerrar a Sala' }}</span>
            </button>

            <!-- Reset Geral Turma -->
            <button
              type="button"
              class="btn-didas-session btn-reset-all"
              :disabled="enviandoReset !== '' || !isSalaAtiva(sala) || !podeModificarEControlar || alunosVR.length === 0"
              @click="reiniciarTodosEstudantes"
              title="Reiniciar todos os estudantes no VR para o estado inicial"
            >
              <span v-if="enviandoReset === 'all'" class="btn-spinner-tech white"></span>
              <span v-else class="btn-action-icon">🔄</span>
              <span>Reset Geral</span>
            </button>
          </div>

          <!-- BOTÕES AUXILIARES (CONFIGURAÇÃO DE HARDWARE & HISTÓRICO) -->
          <div class="toolbar-right-tools">
            <button
              type="button"
              class="btn-didas-tool"
              @click="modalDispositivosAberto = true"
              title="Configurar óculos VR e participante vinculado"
            >
              <span style="font-size: 1.05rem;">🥽</span>
              <span>Hardware & Aluno</span>
            </button>

            <button
              type="button"
              class="btn-didas-tool"
              @click="modalHistoricoAberto = true"
              title="Histórico de comandos disparados na sessão"
            >
              <span>📜</span>
              <span>Histórico</span>
              <span class="tool-count-pill" v-if="historicoComandos.length > 0">{{ historicoComandos.length }}</span>
            </button>
          </div>
        </div>

        <!-- PAINEL SPLIT SCREEN (ESTILO DIDASCALIAS APPLE GLASS) -->
        <div class="console-split-layout">
          
          <!-- ============================================== -->
          <!-- COLUNA DA ESQUERDA: ALUNOS, CENÁRIOS E SONS     -->
          <!-- ============================================== -->
          <div class="console-left-column">
            
            <!-- SEÇÃO 1: ALUNOS VIRTUAIS -->
            <div class="students-section">
              <div class="section-title-row">
                <span class="section-title">Alunos</span>
                <span class="section-badge-counter">{{ alunosVR.length }} estudantes 3D</span>
                <span v-if="!isSalaAtiva(sala)" class="hint-sala-inativa-pill">⚠️ Sala Inativa: Inicie a sala para disparar</span>
              </div>

              <div class="students-track notranslate" translate="no">
                <div v-if="alunosVR.length === 0" class="no-students-banner">
                  ⚠️ Nenhum aluno 3D sincronizado nesta sala virtual.
                </div>

                <!-- Botões de Aluno (Estilo Didascalias: Vidro com borda suave, ciano luminoso quando selecionado) -->
                <button
                  v-for="aluno in alunosVR"
                  :key="aluno.nome"
                  type="button"
                  class="student-glass-card"
                  :class="{ 
                    'is-selected': alunoAlvoSelecionado === aluno.nome,
                    'is-tea': aluno.isTEA,
                    'is-tdah': aluno.isTDAH
                  }"
                  @click="selecionarAluno(aluno.nome)"
                >
                  <span class="student-card-name">{{ aluno.nome }}</span>
                  <span v-if="aluno.isTEA" class="student-cond-chip chip-tea" title="Espectro Autista">TEA</span>
                  <span v-else-if="aluno.isTDAH" class="student-cond-chip chip-tdah" title="Déficit / Hiperatividade">TDAH</span>
                </button>
              </div>
            </div>

            <!-- DIVISÓRIA SUTIL DIDASCALIAS -->
            <div class="didas-subtle-divider"></div>

            <!-- ÁREA DIVIDIDA: CENÁRIOS/SONS (ESQUERDA) + PLAYER DE VÍDEO (MEIO) -->
            <div class="console-main-content-split">

              <!-- ============================================== -->
              <!-- SUB-COLUNA 1: CENÁRIOS & SONS (ESQUERDA)       -->
              <!-- ============================================== -->
              <div class="scenarios-and-sounds-wrapper">

                <!-- SEÇÃO 2: CENÁRIOS / CONFLITOS VR (DISPARO IMEDIATO) -->
                <div class="scenarios-section">
                  <div class="scenarios-pane-header">
                    <div class="scenarios-title-row">
                      <div class="scenarios-title-wrap">
                        <h2 class="scenarios-title">Cenários</h2>
                        <span class="scenarios-counter-tag">{{ acoesFiltradas.length }}</span>
                      </div>
                      <span class="scenarios-quick-hint">Clique para disparar</span>
                    </div>

                    <!-- Filtros Rápidos de Categoria -->
                    <div class="scenarios-filter-scroll">
                      <button
                        v-for="cat in categoriasFiltro"
                        :key="cat.id"
                        type="button"
                        class="filter-pill-btn"
                        :class="{ 'is-active': categoriaAcaoAtiva === cat.id }"
                        @click="categoriaAcaoAtiva = cat.id"
                      >
                        <span>{{ cat.icon }}</span>
                        <span>{{ cat.label }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Lista Compacta de Cenários -->
                  <div class="scenarios-compact-list">
                    <div
                      v-for="acao in acoesFiltradas"
                      :key="acao.id"
                      class="scenario-compact-card"
                      :class="{
                        'is-firing': acaoEmDisparo === acao.id,
                        'is-locked': !isAcaoDisponivelParaAluno(acao),
                        'is-tea-exclusive': acao.condicaoExclusiva === 'TEA',
                        'is-tdah-exclusive': acao.condicaoExclusiva === 'TDAH'
                      }"
                    >
                      <!-- BOTÃO PRINCIPAL DE AÇÃO (DISPARO IMEDIATO NO VR) -->
                      <button
                        type="button"
                        class="scenario-btn-action"
                        :disabled="acaoEmDisparo !== '' || cooldownDisparo || !isSalaAtiva(sala) || !podeModificarEControlar || !isAcaoDisponivelParaAluno(acao)"
                        @click="dispararCenarioImediato(acao)"
                        :title="!isAcaoDisponivelParaAluno(acao) ? getAcaoLockReason(acao) : `Disparar ${acao.label} imediatamente para ${alunoAlvoSelecionado}`"
                      >
                        <span class="scenario-btn-icon">{{ acao.icon }}</span>
                        <span class="scenario-btn-label">{{ acao.label }}</span>
                        <span v-if="acaoEmDisparo === acao.id" class="btn-spinner-tech red"></span>
                      </button>

                      <!-- PARTE DIREITA: BADGE TEA/TDAH E INTERROGAÇÃO (?) -->
                      <div class="scenario-btn-meta">
                        <span 
                          v-if="acao.condicaoExclusiva" 
                          class="scenario-cond-pill" 
                          :class="acao.condicaoExclusiva.toLowerCase()"
                          :title="`Exclusivo para estudantes com ${acao.condicaoExclusiva}`"
                        >
                          {{ acao.condicaoExclusiva }}
                        </span>

                        <!-- INTERROGAÇÃO COM TOOLTIP AO PASSAR O MOUSE -->
                        <div class="scenario-help-wrapper" @click.stop.prevent>
                          <span 
                            class="scenario-help-icon" 
                            :title="`${acao.label}: ${acao.desc}`"
                            aria-label="Descrição do conflito"
                          >?</span>

                          <div class="scenario-desc-tooltip" role="tooltip">
                            <div class="tooltip-header">
                              <span class="tooltip-icon">{{ acao.icon }}</span>
                              <strong class="tooltip-title">{{ acao.label }}</strong>
                              <span v-if="acao.condicaoExclusiva" class="tooltip-chip" :class="acao.condicaoExclusiva.toLowerCase()">
                                {{ acao.condicaoExclusiva }}
                              </span>
                            </div>
                            <p class="tooltip-text">{{ acao.desc }}</p>
                            <div class="tooltip-arrow"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DOCK COMPACTO INFERIOR: SONS DA SALA -->
                <div 
                  class="sounds-dock-bar"
                  @click="painelSonsAberto = true"
                  title="Clique para abrir e expandir a gaveta de sons da sala sobre os cenários"
                >
                  <div class="sounds-dock-left">
                    <span class="sounds-dock-icon">🔔</span>
                    <div class="sounds-dock-text-group">
                      <strong class="sounds-dock-title">Sons da Sala</strong>
                      <span class="sounds-dock-count-badge">{{ SONS_VR.length }}</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    class="btn-sounds-dock-trigger"
                    @click.stop="painelSonsAberto = true"
                    title="Expandir painel de sons"
                  >
                    <span>Abrir Sons</span>
                    <span class="dock-arrow-icon">▲</span>
                  </button>
                </div>

                <!-- PAINEL EXPANSÍVEL DE SONS (COBRE APENAS OS CENÁRIOS AO ABRIR) -->
                <Transition name="sounds-drawer-expand">
                  <div v-if="painelSonsAberto" class="sounds-expanded-drawer">
                    <div class="sounds-drawer-header">
                      <div class="sounds-drawer-header-left">
                        <div class="sounds-drawer-badge-wrap">
                          <span class="sounds-drawer-icon">🔔</span>
                          <h3 class="sounds-drawer-title">Sons da Sala</h3>
                          <span class="sounds-drawer-tech">Áudio Imersivo</span>
                        </div>
                        <span class="sounds-drawer-subtitle">Dispare efeitos sonoros diretamente no headset VR</span>
                      </div>

                      <button 
                        type="button" 
                        class="btn-sounds-drawer-collapse"
                        @click="painelSonsAberto = false"
                        title="Recolher painel de sons e voltar aos cenários"
                      >
                        <span>Fechar</span>
                        <span class="collapse-arrow-icon">▼</span>
                      </button>
                    </div>

                    <!-- Grade de Sons quando expandido -->
                    <div class="sounds-drawer-grid">
                      <button
                        v-for="som in SONS_VR"
                        :key="som.id"
                        type="button"
                        class="sound-glass-card"
                        :class="{ 'is-firing': somEmExecucao === som.id }"
                        :disabled="somEmExecucao !== '' || cooldownDisparo || !isSalaAtiva(sala) || !podeModificarEControlar"
                        @click="dispararSomVR(som)"
                        :title="`Tocar ${som.label} no VR`"
                      >
                        <span v-if="somEmExecucao === som.id" class="btn-spinner-tech amber"></span>
                        <span v-else class="sound-card-icon">{{ som.icon }}</span>
                        <div class="sound-card-info">
                          <strong class="sound-card-label">{{ som.label }}</strong>
                          <span class="sound-card-desc">{{ som.desc }}</span>
                        </div>
                        <span class="sound-fire-pill">Tocar no VR</span>
                      </button>
                    </div>
                  </div>
                </Transition>

              </div>

              <!-- ============================================== -->
              <!-- SUB-COLUNA 2: PLAYER DE VÍDEO (NO MEIO)        -->
              <!-- ============================================== -->
              <div class="console-video-column" ref="videoContainerRef">
                <div class="video-player-card">
                  
                  <!-- BARRA SUPERIOR LIMPA (BRANCO E CINZA) -->
                  <div class="video-player-topbar">
                    <div class="video-topbar-title-wrap">
                      <span class="video-topbar-dot"></span>
                      <span class="video-topbar-title">Transmissão da Sala</span>
                    </div>

                    <div class="video-topbar-actions">
                      <button 
                        type="button" 
                        class="btn-player-action"
                        @click="abrirNovaAbaTransmissao"
                        title="Abrir transmissão em uma nova aba"
                      >
                        <span class="action-icon">↗</span>
                        <span>Nova Aba</span>
                      </button>
                    </div>
                  </div>

                  <!-- TELA DO VÍDEO COM PLACEHOLDER LIMPO (BRANCO E CINZA) -->
                  <div class="video-screen-viewport">
                    <div class="clean-video-placeholder">
                      <div class="clean-placeholder-circle">
                        <svg class="clean-placeholder-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                          <path d="M23 7l-7 5 7 5V7z" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      </div>

                      <strong class="clean-placeholder-title">Vídeo não encontrado</strong>
                      <span class="clean-placeholder-sub">Nenhuma transmissão detectada no momento</span>
                    </div>
                  </div>

                  <!-- BARRA INFERIOR DE CONTROLES: VOLUME E TELA CHEIA -->
                  <div class="video-player-bottombar">
                    <!-- CONTROLE DE VOLUME -->
                    <div class="player-volume-wrap">
                      <button 
                        type="button" 
                        class="player-ctrl-btn mini"
                        @click="videoMutado = !videoMutado"
                        :title="videoMutado ? 'Desmutar som' : 'Mutar som'"
                      >
                        <span>{{ videoMutado ? '🔇' : '🔊' }}</span>
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        v-model="volumeVideo" 
                        class="player-volume-slider" 
                        :disabled="videoMutado"
                        title="Ajustar volume"
                      />
                      <span class="player-volume-label">{{ videoMutado ? '0%' : volumeVideo + '%' }}</span>
                    </div>

                    <!-- BOTÃO TELA CHEIA -->
                    <div class="player-actions-wrap">
                      <button 
                        type="button" 
                        class="player-ctrl-btn"
                        @click="toggleFullscreenVideo"
                        :title="videoEmTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'"
                      >
                        <span class="btn-ctrl-icon">{{ videoEmTelaCheia ? '⏹️' : '⛶' }}</span>
                        <span>{{ videoEmTelaCheia ? 'Sair' : 'Tela Cheia' }}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

          <!-- ============================================== -->
          <!-- COLUNA DA DIREITA: PAINEL DO ALUNO & TTS       -->
          <!-- ============================================== -->
          <div class="console-right-column">
            
            <!-- PARTE SUPERIOR: NOME DO ALUNO & CONDIÇÃO -->
            <div class="student-meta-panel">
              <div class="student-header-box">
                <span class="student-kicker">ESTUDANTE SELECIONADO:</span>
                <!-- Nome Aluno em Destaque -->
                <h1 class="student-main-name notranslate" translate="no">
                  {{ alunoAlvoSelecionado || 'Nenhum Aluno' }}
                </h1>

                <!-- Condição do Aluno (TDAH / TEA / Típico) -->
                <div class="student-cond-row">
                  <div v-if="alunoAlvoObj" class="student-cond-badge-wrap">
                    <span :class="['student-cond-pill', alunoAlvoObj.isTEA ? 'pill-tea' : alunoAlvoObj.isTDAH ? 'pill-tdah' : 'pill-tipico']">
                      <span class="pill-cond-icon">{{ alunoAlvoObj.isTEA ? '🧩' : alunoAlvoObj.isTDAH ? '⚡' : '👤' }}</span>
                      {{ alunoAlvoObj.condicao }}
                    </span>
                  </div>
                  <span v-else class="student-cond-pill pill-tipico">👤 Estudante Típico</span>
                </div>
              </div>

              <!-- Botão de Reiniciar Aluno Selecionado -->
              <button
                type="button"
                class="btn-reset-student-didas"
                :disabled="enviandoReset !== '' || !isSalaAtiva(sala) || !podeModificarEControlar || !alunoAlvoSelecionado"
                @click="reiniciarEstudanteSelecionado"
                :title="`Reiniciar o comportamento de ${alunoAlvoSelecionado} no VR`"
              >
                <span v-if="enviandoReset === 'single'" class="btn-spinner-tech"></span>
                <span v-else class="btn-reset-icon">🔄</span>
                <span>Reiniciar Estudante</span>
              </button>
            </div>

            <!-- PARTE INFERIOR: FALA DO ESTUDANTE (TEXT-TO-SPEECH) -->
            <div class="student-tts-panel">
              <div class="tts-header-row">
                <span class="tts-icon">🗣️</span>
                <span class="tts-heading">Fala do Estudante (TTS)</span>
              </div>

              <div class="tts-textarea-wrapper">
                <textarea
                  v-model="textoTTS"
                  class="tts-glass-textarea"
                  placeholder="Insira texto aqui..."
                  rows="4"
                  maxlength="300"
                  :disabled="!isSalaAtiva(sala) || !podeModificarEControlar || !alunoAlvoSelecionado"
                  @keydown.enter.exact.prevent="enviarTTS"
                ></textarea>
                <span class="tts-counter-tag">{{ textoTTS.length }}/300</span>
              </div>

              <!-- Botão ENVIAR TEXTO no Estilo Didascalias -->
              <button
                type="button"
                class="btn-didas-tts-send"
                :disabled="enviandoTTS || cooldownDisparo || !isSalaAtiva(sala) || !podeModificarEControlar || !alunoAlvoSelecionado || !textoTTS.trim()"
                @click="enviarTTS"
                :title="!alunoAlvoSelecionado ? 'Selecione um aluno' : !textoTTS.trim() ? 'Digite um texto' : 'Enviar fala para o aluno no VR'"
              >
                <span v-if="enviandoTTS" class="btn-spinner-tech white"></span>
                <span v-else>ENVIAR TEXTO</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>

    <!-- TOAST FLUTUANTE DE FEEDBACK GLOBAL (NÃO DESLOCA A TELA) -->
    <Transition name="toast-slide">
      <div v-if="feedbackComando || feedbackSessao" class="floating-feedback-toast" :class="feedbackComando ? feedbackComando.tipo : feedbackSessao.tipo">
        <span class="toast-symbol">{{ (feedbackComando || feedbackSessao).tipo === 'success' ? '⚡' : '⚠️' }}</span>
        <span class="toast-msg">{{ (feedbackComando || feedbackSessao).texto }}</span>
      </div>
    </Transition>

    <!-- MODAL DE CONFIGURAÇÃO DE HARDWARE E PARTICIPANTE -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="modalDispositivosAberto" class="delete-modal-overlay" @click.self="modalDispositivosAberto = false">
          <div class="config-modal-box" @click.stop>
            <div class="config-modal-header">
              <div class="config-modal-title-row">
                <span class="config-modal-icon">🥽</span>
                <h3>Hardware VR e Participante Vinculado</h3>
              </div>
              <button class="config-modal-close" @click="modalDispositivosAberto = false">&times;</button>
            </div>

            <div class="config-modal-body">
              <!-- Dispositivo VR -->
              <div class="config-modal-field">
                <label>ÓCULOS VR VINCULADO:</label>
                <div class="custom-select-wrapper">
                  <div 
                    class="custom-select-trigger" 
                    :class="{ 'is-open': menuOculosAberto, 'is-disabled': salvandoAtivos || isSalaAtiva(sala) || !podeModificarEControlar }"
                    @click="toggleMenuOculos"
                  >
                    <span>{{ selectedOculosObj ? (selectedOculosObj.modelo || 'Óculos') + ' (N° ' + (selectedOculosObj.numero_oculos || selectedOculosObj.id) + ')' : 'Selecione um óculos VR...' }}</span>
                    <span class="arrow-indicator">▼</span>
                  </div>

                  <div v-if="menuOculosAberto" class="custom-options-dropdown" ref="dropdownOculosRef">
                    <div 
                      class="custom-option" 
                      :class="{ 'is-active': !selectedActiveOculos }"
                      @click="selecionarOculos(null)"
                    >
                      Nenhum dispositivo vinculado
                    </div>
                    <div 
                      v-for="oc in oculosDisponiveis" 
                      :key="oc.id"
                      class="custom-option"
                      :class="{ 'is-active': selectedActiveOculos === oc.id, 'is-disabled': isOculosEmOutraSalaAtiva(oc.id) }"
                      @click="selecionarOculos(oc.id)"
                    >
                      {{ oc.modelo || 'Óculos' }} (N° {{ oc.numero_oculos || oc.id }})
                      <span v-if="isOculosEmOutraSalaAtiva(oc.id)" class="opt-locked-tag">Em uso</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Participante Vinculado -->
              <div class="config-modal-field">
                <label>PARTICIPANTE VINCULADO:</label>
                <input 
                  type="text" 
                  v-model="filtroParticipante" 
                  placeholder="Filtrar participante por nome ou email..." 
                  class="config-modal-input"
                  :disabled="isSalaAtiva(sala) || !podeModificarEControlar"
                />
                <div class="modal-participants-list">
                  <div 
                    v-for="p in participantesFiltrados" 
                    :key="p.id"
                    class="modal-part-item"
                    :class="{ 'is-selected': selectedActiveParticipant === p.id }"
                    @click="!isSalaAtiva(sala) && podeModificarEControlar && (selectedActiveParticipant = p.id)"
                  >
                    <strong>{{ p.nome }}</strong>
                    <span>{{ p.email }}</span>
                  </div>
                </div>
              </div>

              <div class="config-modal-actions">
                <button
                  type="button"
                  class="btn-save-hardware"
                  :disabled="salvandoAtivos || isSalaAtiva(sala) || !podeModificarEControlar"
                  @click="salvarConfiguracoesAtivas"
                >
                  <span v-if="salvandoAtivos" class="btn-spinner-tech white"></span>
                  <span v-else>Salvar Alterações</span>
                </button>
              </div>

              <div class="config-modal-danger-divider"></div>

              <button
                type="button"
                class="btn-danger-modal-trigger"
                :disabled="excluindoSala || isSalaAtiva(sala) || !podeModificarEControlar"
                @click="confirmarExclusaoSala"
              >
                🗑️ Excluir Sala VR
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL DE HISTÓRICO DE COMANDOS -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="modalHistoricoAberto" class="delete-modal-overlay" @click.self="modalHistoricoAberto = false">
          <div class="history-modal-box" @click.stop>
            <div class="config-modal-header">
              <div class="config-modal-title-row">
                <span class="config-modal-icon">📜</span>
                <h3>Histórico de Comandos no VR</h3>
              </div>
              <button class="config-modal-close" @click="modalHistoricoAberto = false">&times;</button>
            </div>

            <div class="history-modal-body">
              <div v-if="historicoComandos.length === 0" class="no-history-msg">
                Nenhum comando disparado nesta sessão ainda.
              </div>

              <div v-else class="history-feed-list">
                <div 
                  v-for="cmd in historicoComandos" 
                  :key="cmd.key" 
                  class="history-feed-item"
                >
                  <span class="history-time">{{ formatHoraComando(cmd.timestamp) }}</span>
                  <strong class="history-target">{{ cmd.aluno_alvo || (cmd.tipo_conflito === 'PlaySound' ? 'Ambiente VR' : (cmd.tipo_conflito === 'StartRoom' || cmd.tipo_conflito === 'EndRoom') ? 'Sessão VR' : 'Turma Completa') }}</strong>
                  <span class="history-arrow">→</span>
                  <span class="history-conflict">
                    {{ getNomeConflito(cmd.tipo_conflito, cmd) }}
                    <code>({{ cmd.tipo_conflito }}{{ cmd.som ? `:${cmd.som}` : '' }})</code>
                  </span>
                  <span v-if="cmd.tipo_conflito === 'TextToSpeech'" class="history-tts-text">“{{ cmd.mensagem }}”</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de Confirmação de Exclusão -->
    <Teleport to="body">
      <Transition name="glass-modal">
        <div v-if="modalExclusaoAberto" class="delete-modal-overlay" @click.self="modalExclusaoAberto = false">
          <div class="delete-modal-box" @click.stop>
            <div class="delete-icon-wrapper">
              <div class="delete-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="delete-warn-svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>

            <h3 class="delete-modal-title">Excluir Sala VR Permanentemente?</h3>
            <p class="delete-modal-subdesc">
              Esta ação é irreversível e excluirá todo o ambiente virtual cadastrado.
            </p>

            <div class="delete-modal-room-badge">
              <span class="room-badge-icon">🥽</span>
              <span class="room-name-text notranslate" translate="no">{{ sala?.roomName }}</span>
            </div>

            <div class="delete-modal-actions">
              <button 
                type="button" 
                class="btn-cancel-delete" 
                @click="modalExclusaoAberto = false"
                :disabled="excluindoSala"
              >
                Cancelar
              </button>
              
              <button 
                type="button" 
                class="btn-confirm-delete" 
                @click="executarExclusaoSala"
                :disabled="excluindoSala"
              >
                <span v-if="excluindoSala" class="btn-spinner-delete"></span>
                <span v-else>Sim, Excluir Sala</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get, update, remove, query, orderByChild, equalTo, push, onValue, limitToLast } from 'firebase/database'
import { useAuthStore } from '../stores/auth'
import { isSalaAtiva } from '../utils/salaUtils'
import { parseAlunosVR } from '../utils/alunosVRUtils'
import MenuLateral from '../components/generic/MenuLateral.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const userData = ref({})
const sala = ref(null)
const todasSalas = ref([])

// Dropdown de Óculos e Hardware
const menuOculosAberto = ref(false)
const dropdownOculosRef = ref(null)
const oculosDisponiveis = ref([])
const selectedActiveOculos = ref(null)

// Participantes
const participantesSala = ref([])
const selectedActiveParticipant = ref(null)
const filtroParticipante = ref('')

// Ações Gerais da Sala
const salvandoAtivos = ref(false)
const mensagemAtivos = ref('')
const tipoMensagem = ref('')

// Modais
const modalExclusaoAberto = ref(false)
const modalDispositivosAberto = ref(false)
const modalHistoricoAberto = ref(false)
const excluindoSala = ref(false)
const mensagemPermissao = ref('')

// ==========================================
// MÓDULO: CENÁRIOS VR
// ==========================================
const CONFLITOS_VR = [
  { id: 'TakeMaterialAll', label: 'Pegar todo o material', icon: '🎒', category: 'material', condicaoExclusiva: null, desc: 'Aluno recolhe todo o material da carteira' },
  { id: 'StandUpConflict', label: 'Levantar em situação de conflito', icon: '⚡', category: 'comportamento', condicaoExclusiva: null, desc: 'Aluno levanta-se em confronto ou atrito' },
  { id: 'HyperstimulationConflict', label: 'Hiperestimulação', icon: '🧠', category: 'emocional', condicaoExclusiva: 'TEA', desc: 'Gera estado de agitação e sobrecarga sensorial (Exclusivo TEA)' },
  { id: 'GetDistractedTEAConflict', label: 'Distrair-se (TEA)', icon: '💭', category: 'atencao', condicaoExclusiva: 'TEA', desc: 'Perde o foco na aula com dispersão do espectro autista (Exclusivo TEA)' },
  { id: 'DrawDistractedConflict', label: 'Desenhar distraído(a)', icon: '✏️', category: 'atencao', condicaoExclusiva: 'TDAH', desc: 'Fica rabiscando no caderno sem focar na aula (Exclusivo TDAH)' },
  { id: 'BotherSomeoneConflict', label: 'Incomodar colegas', icon: '👉', category: 'social', condicaoExclusiva: 'TDAH', desc: 'Interrompe e mexe com colegas próximos (Exclusivo TDAH)' },
  { id: 'GetMaterialWrongConflict', label: 'Pegar o material errado', icon: '❌', category: 'material', condicaoExclusiva: 'TDAH', desc: 'Tira da mochila itens não solicitados (Exclusivo TDAH)' },
]

const categoriaAcaoAtiva = ref('todos')
const alunoAlvoSelecionado = ref('')
const textoTTS = ref('')
const enviandoTTS = ref(false)
const enviandoReset = ref('') // 'all' | 'single' | ''
const cooldownDisparo = ref(false)
const feedbackComando = ref(null)
const acaoEmDisparo = ref('')

// ==========================================
// CONTROLE DE SESSÃO DA SALA & EFEITOS SONOROS VR
// ==========================================
const iniciandoSala = ref(false)
const encerrandoSala = ref(false)
const feedbackSessao = ref(null)
const somEmExecucao = ref('')
const painelSonsAberto = ref(false)

// LISTA DE SONS VR (Extensível para novos botões de som!)
const SONS_VR = [
  {
    id: 'SchoolBell',
    label: 'Sirene Escolar',
    icon: '🔔',
    categoria: 'ambiente',
    desc: 'Sinal sonoro escolar de início/troca de aula no headset VR'
  }
]

// ==========================================
// MÓDULO: PLAYER DE VÍDEO VR (BRANCO E CINZA)
// ==========================================
const videoContainerRef = ref(null)
const volumeVideo = ref(80)
const videoMutado = ref(false)
const videoEmTelaCheia = ref(false)

const abrirNovaAbaTransmissao = () => {
  const routeData = router.resolve({
    name: 'transmissao-sala',
    params: { id: salaId.value }
  })
  window.open(routeData.href, '_blank')
}

const toggleFullscreenVideo = () => {
  if (!videoContainerRef.value) return
  if (!document.fullscreenElement) {
    if (videoContainerRef.value.requestFullscreen) {
      videoContainerRef.value.requestFullscreen().then(() => {
        videoEmTelaCheia.value = true
      }).catch(err => {
        console.warn('Fullscreen não suportado ou negado:', err)
      })
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        videoEmTelaCheia.value = false
      })
    }
  }
}

const handleFullscreenChange = () => {
  videoEmTelaCheia.value = !!document.fullscreenElement
}


// ==========================================
// CONTROLE DE PERMISSÕES & FACILITADOR PLUS
// ==========================================
const facilitadorPlusAtivo = ref(false)

const tipoNormalizado = computed(() => {
  if (!userData.value?.tipo) return 'indefinido'
  return String(userData.value.tipo)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
})

const tipoCadastroNormalizado = computed(() => {
  if (!userData.value?.tipoCadastro) return ''
  return String(userData.value.tipoCadastro)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
})

const isInstituicao = computed(() => {
  return tipoNormalizado.value === 'instituicao' || tipoCadastroNormalizado.value.includes('institui')
})

const isFacilitador = computed(() => {
  return tipoNormalizado.value === 'facilitador' || tipoCadastroNormalizado.value.includes('facilitador')
})

const isFacilitadorPlus = computed(() => {
  if (facilitadorPlusAtivo.value === true) return true
  return userData.value?.FacilitadorPlus === true || userData.value?.FacilitadorPlus === 'true'
})

const podeModificarEControlar = computed(() => {
  if (isInstituicao.value) {
    return isFacilitadorPlus.value === true
  }
  if (isFacilitador.value) {
    return true
  }
  return false
})

// Listeners
let unsubSituacao = null
let unsubAlunos = null
let unsubComandos = null
let unsubFacilitadorPlus = null

const salaId = computed(() => route.params.id)

// Lista de Alunos 3D no VR
const alunosVR = computed(() => {
  if (!sala.value) return []
  return parseAlunosVR(sala.value.Alunos)
})

// Objeto completo do aluno alvo selecionado
const alunoAlvoObj = computed(() => {
  if (!alunoAlvoSelecionado.value) return null
  return alunosVR.value.find(a => a.nome === alunoAlvoSelecionado.value) || null
})

const selecionarAluno = (nome) => {
  alunoAlvoSelecionado.value = nome
}

const categoriasFiltro = computed(() => [
  { id: 'todos', label: 'Todos', icon: '⚡' },
  { id: 'tea', label: 'TEA', icon: '🧩' },
  { id: 'tdah', label: 'TDAH', icon: '⚡' },
  { id: 'material', label: 'Materiais', icon: '🎒' },
  { id: 'social', label: 'Social', icon: '👥' },
  { id: 'emocional', label: 'Comportamento', icon: '🧠' }
])

const acoesFiltradas = computed(() => {
  let list = CONFLITOS_VR
  if (categoriaAcaoAtiva.value !== 'todos') {
    if (categoriaAcaoAtiva.value === 'tea') {
      list = list.filter(c => c.condicaoExclusiva === 'TEA')
    } else if (categoriaAcaoAtiva.value === 'tdah') {
      list = list.filter(c => c.condicaoExclusiva === 'TDAH')
    } else if (categoriaAcaoAtiva.value === 'emocional') {
      list = list.filter(c => c.category === 'emocional' || c.category === 'comportamento')
    } else {
      list = list.filter(c => c.category === categoriaAcaoAtiva.value)
    }
  }
  return list
})

const isAcaoDisponivelParaAluno = (acao) => {
  if (!acao || !acao.condicaoExclusiva) return true
  if (!alunoAlvoObj.value) return false
  if (alunoAlvoObj.value.isTipico) return false
  if (acao.condicaoExclusiva === 'TEA') {
    return alunoAlvoObj.value.isTEA === true
  }
  if (acao.condicaoExclusiva === 'TDAH') {
    return alunoAlvoObj.value.isTDAH === true
  }
  return false
}

const getAcaoLockReason = (acao) => {
  if (!acao || !acao.condicaoExclusiva) return ''
  if (!alunoAlvoObj.value) return 'Selecione um aluno para liberar'
  if (alunoAlvoObj.value.isTipico) {
    return `Indisponível: O aluno ${alunoAlvoObj.value.nome} é típico. Esta ação é exclusiva para alunos com ${acao.condicaoExclusiva}.`
  }
  if (acao.condicaoExclusiva === 'TEA' && !alunoAlvoObj.value.isTEA) {
    return `Indisponível: Esta ação é exclusiva para alunos com TEA.`
  }
  if (acao.condicaoExclusiva === 'TDAH' && !alunoAlvoObj.value.isTDAH) {
    return `Indisponível: Esta ação é exclusiva para alunos com TDAH.`
  }
  return ''
}

const historicoComandos = computed(() => {
  if (!sala.value || !sala.value.comando_facilitador) return []
  const cf = sala.value.comando_facilitador
  return Object.entries(cf)
    .map(([key, data]) => ({
      key,
      ...data
    }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 15)
})

const getNomeConflito = (tipoId, cmd) => {
  const c = CONFLITOS_VR.find(item => item.id === tipoId)
  if (c) return c.label
  if (tipoId === 'StartRoom') return 'Iniciar Sala'
  if (tipoId === 'EndRoom') return 'Encerrar Sala'
  if (tipoId === 'PlaySound') {
    if (cmd?.som === 'SchoolBell') return 'Sirene Escolar'
    const somObj = SONS_VR.find(s => s.id === cmd?.som)
    return somObj ? somObj.label : 'Efeito Sonoro'
  }
  if (tipoId === 'TextToSpeech') return 'Fala do Estudante (TTS)'
  if (tipoId === 'ResetAllStudents') return 'Reset Geral Turma'
  if (tipoId === 'ResetSingleStudent') return 'Reset Estudante'
  if (tipoId === 'Hyperstimulate' || tipoId === 'HyperstimulationConflict') return 'Hiperestimulação'
  if (tipoId === 'GetDistracted' || tipoId === 'GetDistractedTEAConflict') return 'Distrair-se (TEA)'
  if (tipoId === 'BotherRandomStudents' || tipoId === 'BotherSomeoneConflict') return 'Incomodar colegas'
  if (tipoId === 'DrawDistracted' || tipoId === 'DrawDistractedConflict') return 'Desenhar distraído(a)'
  if (tipoId === 'GetOutMaterialWrong' || tipoId === 'GetMaterialWrongConflict') return 'Pegar o material errado'
  return tipoId
}

const formatHoraComando = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// DISPARO IMEDIATO AO CLICAR EM UM CENÁRIO (Sem confirmação intermediária)
const dispararCenarioImediato = async (acao) => {
  if (acaoEmDisparo.value || cooldownDisparo.value) return

  if (!podeModificarEControlar.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para enviar comandos ao VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Esta sala não está ativa no momento. Inicie a simulação no botão "Iniciar a Sala" para enviar comandos.'
    }
    return
  }

  if (!alunoAlvoSelecionado.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Por favor, selecione um aluno na barra superior de Alunos.'
    }
    return
  }

  if (!isAcaoDisponivelParaAluno(acao)) {
    const motivo = getAcaoLockReason(acao)
    feedbackComando.value = {
      tipo: 'error',
      texto: motivo || `Ação exclusiva para alunos com ${acao.condicaoExclusiva}.`
    }
    return
  }

  acaoEmDisparo.value = acao.id
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: acao.id,
      aluno_alvo: alunoAlvoSelecionado.value,
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    feedbackComando.value = {
      tipo: 'success',
      texto: `Cenário "${acao.label}" disparado para ${alunoAlvoSelecionado.value} no VR!`
    }
  } catch (error) {
    console.error("Erro ao enviar comando para o óculos VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao enviar para o Firebase. Tente novamente.'
    }
  } finally {
    acaoEmDisparo.value = ''
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 700)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 4000)
  }
}

// ENVIAR TEXT-TO-SPEECH (TTS)
const enviarTTS = async () => {
  if (cooldownDisparo.value || enviandoTTS.value || acaoEmDisparo.value || enviandoReset.value) return

  if (!podeModificarEControlar.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para enviar comandos ao VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Esta sala não está ativa no momento. Inicie a simulação no botão "Iniciar a Sala" para enviar comandos.'
    }
    return
  }

  if (!alunoAlvoSelecionado.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Por favor, selecione um aluno para enviar o comando de fala.'
    }
    return
  }

  const mensagemLimpa = textoTTS.value.trim()
  if (!mensagemLimpa) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Por favor, digite um texto para a fala do aluno.'
    }
    return
  }

  enviandoTTS.value = true
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'TextToSpeech',
      aluno_alvo: alunoAlvoSelecionado.value,
      timestamp: timestampAtual,
      mensagem: mensagemLimpa
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    feedbackComando.value = {
      tipo: 'success',
      texto: `Fala "${mensagemLimpa}" enviada com sucesso para ${alunoAlvoSelecionado.value} no VR!`
    }
    textoTTS.value = ''
  } catch (error) {
    console.error("Erro ao enviar comando TextToSpeech para o óculos VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao enviar para o Firebase. Tente novamente.'
    }
  } finally {
    enviandoTTS.value = false
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 700)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 4000)
  }
}

// REINICIAR ESTUDANTE SELECIONADO
const reiniciarEstudanteSelecionado = async () => {
  if (cooldownDisparo.value || acaoEmDisparo.value || enviandoReset.value) return

  if (!podeModificarEControlar.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para enviar comandos ao VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Esta sala não está ativa no momento. Inicie a simulação no óculos VR para enviar comandos.'
    }
    return
  }

  if (!alunoAlvoSelecionado.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Por favor, selecione um estudante para reiniciar seu comportamento.'
    }
    return
  }

  enviandoReset.value = 'single'
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'ResetSingleStudent',
      aluno_alvo: alunoAlvoSelecionado.value,
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    feedbackComando.value = {
      tipo: 'success',
      texto: `Estudante "${alunoAlvoSelecionado.value}" reiniciado(a) com sucesso no VR!`
    }
  } catch (error) {
    console.error("Erro ao reiniciar estudante no VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao enviar comando de reinicialização para o Firebase.'
    }
  } finally {
    enviandoReset.value = ''
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 700)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 4000)
  }
}

// REINICIAR TODOS ESTUDANTES
const reiniciarTodosEstudantes = async () => {
  if (cooldownDisparo.value || acaoEmDisparo.value || enviandoReset.value) return

  if (!podeModificarEControlar.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para enviar comandos ao VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Esta sala não está ativa no momento. Inicie a simulação no óculos VR para enviar comandos.'
    }
    return
  }

  if (alunosVR.value.length === 0) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Nenhum estudante virtual encontrado nesta sala.'
    }
    return
  }

  enviandoReset.value = 'all'
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'ResetAllStudents',
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    feedbackComando.value = {
      tipo: 'success',
      texto: 'Comando para reiniciar TODOS os estudantes disparado com sucesso no VR!'
    }
  } catch (error) {
    console.error("Erro ao reiniciar todos os estudantes no VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao enviar comando de reinicialização para o Firebase.'
    }
  } finally {
    enviandoReset.value = ''
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 700)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 4000)
  }
}

// INICIAR SALA NO VR
const iniciarSalaVR = async () => {
  if (iniciandoSala.value || encerrandoSala.value) return

  if (!podeModificarEControlar.value) {
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para iniciar a sala no VR.'
    }
    return
  }

  if (isSalaAtiva(sala.value)) {
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Esta sala já está com a simulação ativa no óculos VR.'
    }
    return
  }

  iniciandoSala.value = true
  feedbackSessao.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'StartRoom',
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    const situacaoRef = dbRef(database, `classroom_configs/${sala.value.id}/situacao_atual`)
    await update(situacaoRef, { ativo: 'sim' })

    if (sala.value) {
      if (!sala.value.situacao_atual || typeof sala.value.situacao_atual !== 'object') {
        sala.value.situacao_atual = { ativo: 'sim' }
      } else {
        sala.value.situacao_atual.ativo = 'sim'
      }
    }

    feedbackSessao.value = {
      tipo: 'success',
      texto: 'Sala iniciada com sucesso! Simulação ativa no VR e comandos liberados.'
    }
  } catch (error) {
    console.error("Erro ao iniciar sala VR:", error)
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao iniciar a sala no Firebase. Tente novamente.'
    }
  } finally {
    iniciandoSala.value = false
    setTimeout(() => {
      if (feedbackSessao.value?.tipo === 'success') {
        feedbackSessao.value = null
      }
    }, 4000)
  }
}

// ENCERRAR SALA NO VR
const encerrarSalaVR = async () => {
  if (iniciandoSala.value || encerrandoSala.value) return

  if (!podeModificarEControlar.value) {
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para encerrar a sala no VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Esta sala já está inativa no óculos VR.'
    }
    return
  }

  encerrandoSala.value = true
  feedbackSessao.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'EndRoom',
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    const situacaoRef = dbRef(database, `classroom_configs/${sala.value.id}/situacao_atual`)
    await update(situacaoRef, { ativo: 'nao' })

    if (sala.value) {
      if (!sala.value.situacao_atual || typeof sala.value.situacao_atual !== 'object') {
        sala.value.situacao_atual = { ativo: 'nao' }
      } else {
        sala.value.situacao_atual.ativo = 'nao'
      }
    }

    feedbackSessao.value = {
      tipo: 'success',
      texto: 'Sala encerrada com sucesso no VR.'
    }
  } catch (error) {
    console.error("Erro ao encerrar sala VR:", error)
    feedbackSessao.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao encerrar a sala no Firebase. Tente novamente.'
    }
  } finally {
    encerrandoSala.value = false
    setTimeout(() => {
      if (feedbackSessao.value?.tipo === 'success') {
        feedbackSessao.value = null
      }
    }, 4000)
  }
}

// DISPARAR SOM VR (Sirene Escolar)
const dispararSomVR = async (som) => {
  if (somEmExecucao.value || cooldownDisparo.value || acaoEmDisparo.value || enviandoTTS.value || enviandoReset.value) return

  if (!podeModificarEControlar.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para disparar sons no VR.'
    }
    return
  }

  if (!isSalaAtiva(sala.value)) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Esta sala não está ativa no momento. Inicie a simulação no botão "Iniciar a Sala" para disparar efeitos sonoros.'
    }
    return
  }

  somEmExecucao.value = som.id
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: 'PlaySound',
      som: som.id,
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    feedbackComando.value = {
      tipo: 'success',
      texto: `Efeito sonoro "${som.label}" disparado com sucesso no VR!`
    }
  } catch (error) {
    console.error("Erro ao disparar som no VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao disparar o som para o Firebase. Tente novamente.'
    }
  } finally {
    somEmExecucao.value = ''
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 700)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 4000)
  }
}

// Helpers de Hardware e Participantes
const selectedOculosObj = computed(() => {
  if (!selectedActiveOculos.value) return null
  return oculosDisponiveis.value.find(o => o.id === selectedActiveOculos.value) || null
})

const participantesFiltrados = computed(() => {
  if (!filtroParticipante.value.trim()) return participantesSala.value
  const q = filtroParticipante.value.toLowerCase().trim()
  return participantesSala.value.filter(p => 
    (p.nome && p.nome.toLowerCase().includes(q)) || 
    (p.email && p.email.toLowerCase().includes(q))
  )
})

const voltar = () => {
  router.push('/home')
}

const toggleMenuOculos = () => {
  if (salvandoAtivos.value || isSalaAtiva(sala.value) || !podeModificarEControlar.value) return
  menuOculosAberto.value = !menuOculosAberto.value
}

const selecionarOculos = (oculosId) => {
  if (salvandoAtivos.value || isSalaAtiva(sala.value) || !podeModificarEControlar.value) return
  if (oculosId && isOculosEmOutraSalaAtiva(oculosId)) return
  selectedActiveOculos.value = oculosId
  menuOculosAberto.value = false
}

const isOculosEmOutraSalaAtiva = (oculosId) => {
  if (!oculosId) return false
  return todasSalas.value.some(s => {
    if (sala.value && s.id === sala.value.id) return false
    return s.activeHeadsetId === oculosId && isSalaAtiva(s)
  })
}

const handleClickForaOculos = (e) => {
  if (dropdownOculosRef.value && !dropdownOculosRef.value.contains(e.target)) {
    menuOculosAberto.value = false
  }
}

// Salvar Configurações de Hardware e Participante
const salvarConfiguracoesAtivas = async () => {
  if (salvandoAtivos.value) return

  if (!podeModificarEControlar.value) {
    mensagemAtivos.value = "Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para alterar configurações."
    tipoMensagem.value = "error"
    return
  }

  if (isSalaAtiva(sala.value)) {
    mensagemAtivos.value = "Esta sala está com status \"Ativa\" no momento e não pode ser modificada."
    tipoMensagem.value = "error"
    return
  }

  salvandoAtivos.value = true
  mensagemAtivos.value = ''

  try {
    const freshSnap = await get(dbRef(database, `classroom_configs/${sala.value.id}`))
    if (freshSnap.exists() && isSalaAtiva(freshSnap.val())) {
      mensagemAtivos.value = "Esta sala acabou de ser ativada no óculos e não pode ser modificada."
      tipoMensagem.value = "error"
      return
    }

    const updates = {}

    if (selectedActiveOculos.value) {
      const qOculos = query(dbRef(database, 'classroom_configs'), orderByChild('activeHeadsetId'), equalTo(selectedActiveOculos.value))
      const snapOculos = await get(qOculos)
      if (snapOculos.exists()) {
        const salasComMesmoOculos = snapOculos.val()
        for (const sId in salasComMesmoOculos) {
          if (sId !== sala.value.id) {
            if (isSalaAtiva(salasComMesmoOculos[sId])) {
              mensagemAtivos.value = "O óculos selecionado está em uso em outra sala ativa."
              tipoMensagem.value = "error"
              return
            }
            updates[`classroom_configs/${sId}/activeHeadsetId`] = null
          }
        }
      }
    }

    updates[`classroom_configs/${sala.value.id}/activeParticipantId`] = selectedActiveParticipant.value
    updates[`classroom_configs/${sala.value.id}/activeHeadsetId`] = selectedActiveOculos.value || null

    if (selectedActiveOculos.value && selectedActiveOculos.value !== sala.value.activeHeadsetId) {
      updates[`classroom_configs/${sala.value.id}/Alunos`] = null
    }

    await update(dbRef(database), updates)

    if (selectedActiveOculos.value && selectedActiveOculos.value !== sala.value.activeHeadsetId) {
      await remove(dbRef(database, `classroom_configs/${sala.value.id}/Alunos`))
    }

    sala.value.activeParticipantId = selectedActiveParticipant.value
    sala.value.activeHeadsetId = selectedActiveOculos.value || null

    mensagemAtivos.value = "Configurações de hardware e participante salvas com sucesso!"
    tipoMensagem.value = "success"
    modalDispositivosAberto.value = false
  } catch (error) {
    console.error("Erro ao salvar ativos:", error)
    mensagemAtivos.value = "Ocorreu um erro ao salvar as configurações. Tente novamente."
    tipoMensagem.value = "error"
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => {
      mensagemAtivos.value = ''
    }, 4000)
  }
}

// Carregar Dados da Sala
const carregarDadosSala = async () => {
  isLoading.value = true
  try {
    const sId = salaId.value
    if (!sId) {
      isLoading.value = false
      return
    }

    const salaRef = dbRef(database, `classroom_configs/${sId}`)
    const snap = await get(salaRef)

    if (snap.exists()) {
      const data = snap.val()
      sala.value = { id: sId, ...data }

      selectedActiveOculos.value = data.activeHeadsetId || null
      selectedActiveParticipant.value = data.activeParticipantId || null

      iniciarListenersOtimizados()

      let instituicaoId = null
      if (isInstituicao.value) {
        instituicaoId = userData.value.id || userData.value.uid
      } else if (data.instituicaoId) {
        instituicaoId = data.instituicaoId
      }

      if (instituicaoId) {
        try {
          const oculosSnap = await get(dbRef(database, `instituicoes/${instituicaoId}/oculos`))
          if (oculosSnap.exists()) {
            const d = oculosSnap.val()
            oculosDisponiveis.value = Object.keys(d).map(k => ({ id: k, ...d[k] }))
          }
        } catch (e) {
          console.warn("Erro ao buscar óculos:", e)
        }
      }

      if (sala.value.targetType === 'grupo' && sala.value.targetId && instituicaoId) {
        try {
          const gSnap = await get(dbRef(database, `instituicoes/${instituicaoId}/grupos/${sala.value.targetId}/participantes`))
          if (gSnap.exists()) {
            participantesSala.value = gSnap.val() || []
          }
        } catch (e) {
          console.warn("Erro ao buscar participantes do grupo:", e)
        }
      } else if (sala.value.targetType === 'aluno' && sala.value.targetId) {
        try {
          const uSnap = await get(dbRef(database, `usuarios/${sala.value.targetId}`))
          if (uSnap.exists()) {
            const u = uSnap.val()
            participantesSala.value = [{ id: sala.value.targetId, nome: u.nome, email: u.email }]
            selectedActiveParticipant.value = sala.value.targetId
          }
        } catch (e) {
          console.warn("Erro ao buscar aluno titular:", e)
        }
      }

      if (instituicaoId) {
        try {
          const qSalasInst = query(dbRef(database, 'classroom_configs'), orderByChild('instituicaoId'), equalTo(instituicaoId))
          const todasSnap = await get(qSalasInst)
          if (todasSnap.exists()) {
            const d = todasSnap.val()
            todasSalas.value = Object.keys(d).map(k => ({ id: k, ...d[k] }))
          }
        } catch (e) {
          console.warn("Erro ao buscar salas indexadas:", e)
        }
      }
    } else {
      sala.value = null
    }
  } catch (error) {
    console.error("Erro ao carregar dados da sala:", error)
  } finally {
    isLoading.value = false
  }
}

const limparListeners = () => {
  if (unsubSituacao) unsubSituacao()
  if (unsubAlunos) unsubAlunos()
  if (unsubComandos) unsubComandos()
  if (unsubFacilitadorPlus) unsubFacilitadorPlus()
  unsubSituacao = null
  unsubAlunos = null
  unsubComandos = null
  unsubFacilitadorPlus = null
}

const iniciarListenersOtimizados = () => {
  limparListeners()
  if (!salaId.value) return

  // 1. Escuta situação (ativo/inativo)
  const situacaoRef = dbRef(database, `classroom_configs/${salaId.value}/situacao_atual`)
  unsubSituacao = onValue(situacaoRef, (snap) => {
    if (sala.value) {
      sala.value.situacao_atual = snap.val() || { ativo: "nao" }
    }
  })

  // 2. Escuta os alunos 3D no VR
  const alunosRef = dbRef(database, `classroom_configs/${salaId.value}/Alunos`)
  unsubAlunos = onValue(alunosRef, (snap) => {
    if (sala.value) {
      sala.value.Alunos = snap.val() || null
      if (!alunoAlvoSelecionado.value && alunosVR.value.length > 0) {
        alunoAlvoSelecionado.value = alunosVR.value[0].nome
      } else if (alunosVR.value.length === 0) {
        alunoAlvoSelecionado.value = ''
      }
    }
  })

  // 3. Escuta últimos 15 comandos
  const qComandos = query(
    dbRef(database, `classroom_configs/${salaId.value}/comando_facilitador`),
    limitToLast(15)
  )
  unsubComandos = onValue(qComandos, (snap) => {
    if (sala.value) {
      sala.value.comando_facilitador = snap.val() || null
    }
  })

  // 4. Se for instituição, escuta FacilitadorPlus
  const instId = userData.value?.instituicaoId || userData.value?.id || sala.value?.instituicaoId
  if (isInstituicao.value && instId) {
    const fPlusRef = dbRef(database, `instituicoes/${instId}/FacilitadorPlus`)
    unsubFacilitadorPlus = onValue(fPlusRef, (snap) => {
      const val = snap.val()
      facilitadorPlusAtivo.value = val === true || val === 'true'
    })
  }
}

// Exclusão da Sala
const confirmarExclusaoSala = () => {
  if (isSalaAtiva(sala.value)) {
    mensagemPermissao.value = "Esta sala está com status \"Ativa\" no momento e não pode ser excluída."
    return
  }
  modalExclusaoAberto.value = true
}

const executarExclusaoSala = async () => {
  if (!podeModificarEControlar.value) {
    mensagemPermissao.value = "Sua instituição possui acesso de visualização. É necessário FacilitadorPlus para excluir salas."
    return
  }

  if (isSalaAtiva(sala.value)) {
    mensagemPermissao.value = "Esta sala está com status \"Ativa\" no momento e não pode ser excluída."
    return
  }

  excluindoSala.value = true
  try {
    const freshSnap = await get(dbRef(database, `classroom_configs/${sala.value.id}`))
    if (freshSnap.exists() && isSalaAtiva(freshSnap.val())) {
      mensagemPermissao.value = "Esta sala acabou de ser ativada e não pode ser excluída."
      return
    }

    await remove(dbRef(database, `classroom_configs/${sala.value.id}`))
    modalExclusaoAberto.value = false
    router.push('/home')
  } catch (error) {
    console.error("Erro ao excluir sala:", error)
    mensagemPermissao.value = "Erro ao excluir sala. Tente novamente."
  } finally {
    excluindoSala.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickForaOculos)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      facilitadorPlusAtivo.value = profile.FacilitadorPlus === true || profile.FacilitadorPlus === 'true'
      await carregarDadosSala()
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    router.push('/')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickForaOculos)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  limparListeners()
})
</script>

<style scoped>
/* ==========================================
   CONSOLE VIEWPORT LOCK (SEM SCROLL GERAL)
   ========================================== */
.console-viewport-lock {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Redução compacta da navbar para tela de console */
.console-viewport-lock :deep(.navbar),
.console-viewport-lock .navbar {
  padding: 8px 24px 8px 90px !important;
  min-height: 52px !important;
  height: 52px !important;
}

.console-viewport-lock :deep(.main-logo),
.console-viewport-lock .main-logo {
  height: 32px !important;
  width: auto !important;
}

.console-viewport-lock :deep(.brand-name),
.console-viewport-lock .brand-name {
  font-size: 1.25rem !important;
}

/* Espaço de segurança para tradutor no canto superior direito */
.safe-translate-space {
  padding-right: 140px;
}

/* ==========================================
   CONSOLE MAIN CONTENT & TOOLBAR
   ========================================== */
.console-main-content {
  flex: 1;
  min-height: 0;
  height: calc(100vh - 52px);
  padding: 8px 18px 10px 88px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.console-wrapper {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

/* ==========================================
   BARRA SUPERIOR DE SESSÃO DIDASCALIAS
   ========================================== */
.console-session-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 6px 14px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  flex-shrink: 0;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-back-nav-compact {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 5px 10px;
  color: #334155;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.btn-back-nav-compact:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #0071e3;
  transform: translateX(-2px);
}

.back-svg-mini {
  width: 13px;
  height: 13px;
}

.toolbar-room-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
}

.room-badge-icon {
  font-size: 1rem;
}

.room-badge-name {
  font-size: 0.86rem;
  font-weight: 800;
  color: #0f172a;
}

.toolbar-center-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-didas-session {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.btn-didas-session:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.btn-didas-session:active:not(:disabled) {
  transform: translateY(0);
}

.btn-didas-session:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(30%);
  box-shadow: none;
  transform: none;
}

.btn-start {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28);
}

.btn-end {
  background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
  box-shadow: 0 3px 10px rgba(225, 29, 72, 0.26);
}

.btn-reset-all {
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.22);
}

.btn-action-icon {
  font-size: 0.8rem;
}

.toolbar-right-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-didas-tool {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 5px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.btn-didas-tool:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #0071e3;
  transform: translateY(-1px);
}

.tool-count-pill {
  background: #0071e3;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
}

/* ==========================================
   PAINEL SPLIT SCREEN (ESTILO DIDASCALIAS)
   ========================================== */
.console-split-layout {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 12px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 10px 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

/* ==========================================
   COLUNA DA ESQUERDA: ALUNOS, CENÁRIOS, SONS
   ========================================== */
.console-left-column {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* SEÇÃO 1: ALUNOS (COMPACTO, SEM SCROLL HORIZONTAL) */
.students-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.section-badge-counter {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 6px;
}

.hint-sala-inativa-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: #d97706;
  background: #fef3c7;
  padding: 2px 7px;
  border-radius: 6px;
  margin-left: auto;
}

/* Track de estudantes em flex-wrap compacto: ZERO scroll horizontal */
.students-track {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  overflow-x: hidden;
  overflow-y: hidden;
  padding: 1px 0;
}

.student-glass-card {
  border: 1.5px solid #bae6fd;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.88);
  padding: 4px 9px;
  height: 28px;
  min-width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.06);
}

.student-glass-card:hover {
  background: #f0f9ff;
  border-color: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(2, 132, 199, 0.14);
}

/* Aluno Selecionado (Ciano Luminoso Apple Glass) */
.student-glass-card.is-selected {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #0284c7;
  color: #0369a1;
  font-weight: 800;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.25);
}

.student-cond-chip {
  font-size: 0.58rem;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  text-transform: uppercase;
}

.student-cond-chip.chip-tea {
  background: #e0e7ff;
  color: #4338ca;
}

.student-cond-chip.chip-tdah {
  background: #fef3c7;
  color: #b45309;
}

.no-students-banner {
  font-size: 0.78rem;
  color: #b45309;
  padding: 4px 10px;
  background: #fef3c7;
  border-radius: 7px;
}

/* DIVISÓRIA SUTIL DIDASCALIAS */
.didas-subtle-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 5px 0;
  flex-shrink: 0;
}

/* ==========================================
   CONTAINER SPLIT: CENÁRIOS/SONS (ESQ) & PLAYER VÍDEO (MEIO)
   ========================================== */
.console-main-content-split {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 380px) 1fr;
  gap: 12px;
  overflow: hidden;
}

/* ==========================================
   SUB-COLUNA 1: CENÁRIOS E GAVETA DE SONS
   ========================================== */
.scenarios-and-sounds-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: 14px;
  padding: 8px 10px;
  gap: 6px;
}

/* SEÇÃO 2: CENÁRIOS */
.scenarios-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.scenarios-pane-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}

.scenarios-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scenarios-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scenarios-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.2px;
}

.scenarios-counter-tag {
  font-size: 0.68rem;
  font-weight: 800;
  color: #0071e3;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.scenarios-quick-hint {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 500;
}

.scenarios-filter-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}

.scenarios-filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 0.7rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-pill-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.filter-pill-btn.is-active {
  background: #0071e3;
  border-color: #0071e3;
  color: #ffffff;
}

/* LISTA COMPACTA DE CENÁRIOS */
.scenarios-compact-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: visible;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 2px 2px 4px 2px;
  scrollbar-width: thin;
}

.scenario-compact-card {
  border: 1.5px solid #fed7aa;
  border-radius: 9px;
  background: #ffffff;
  padding: 4px 8px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  position: relative;
  overflow: visible;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.scenario-compact-card:hover {
  transform: translateY(-1px);
  border-color: #f97316;
  box-shadow: 0 3px 8px rgba(249, 115, 22, 0.14);
}

.scenario-compact-card.is-tea-exclusive {
  border-color: #c7d2fe;
}

.scenario-compact-card.is-tea-exclusive:hover {
  border-color: #6366f1;
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.15);
}

.scenario-compact-card.is-tdah-exclusive {
  border-color: #fde68a;
}

.scenario-compact-card.is-tdah-exclusive:hover {
  border-color: #f59e0b;
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.15);
}

.scenario-compact-card.is-firing {
  border-color: #10b981;
  background: #ecfdf5;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
}

.scenario-compact-card.is-locked {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: #cbd5e1;
  box-shadow: none;
  transform: none;
  filter: grayscale(25%);
}

.scenario-btn-action {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.scenario-btn-action:disabled {
  cursor: not-allowed;
}

.scenario-btn-icon {
  font-size: 1.05rem;
  flex-shrink: 0;
}

.scenario-btn-label {
  font-size: 0.77rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.scenario-btn-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.scenario-cond-pill {
  font-size: 0.58rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}

.scenario-cond-pill.tea {
  background: #e0e7ff;
  color: #4338ca;
}

.scenario-cond-pill.tdah {
  background: #fef3c7;
  color: #b45309;
}

/* INTERROGAÇÃO (?) COM TOOLTIP FLUTUANTE */
.scenario-help-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.scenario-help-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  transition: all 0.18s ease;
  user-select: none;
}

.scenario-help-wrapper:hover .scenario-help-icon {
  background: #0071e3;
  color: #ffffff;
  border-color: #0071e3;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.3);
}

.scenario-desc-tooltip {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) translateX(4px);
  width: 230px;
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9px;
  padding: 8px 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
  color: #ffffff;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  z-index: 100;
  text-align: left;
}

.scenario-help-wrapper:hover .scenario-desc-tooltip {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(-50%) translateX(0);
}

/* Ajuste de posição para itens superiores e inferiores não cliparem */
.scenario-compact-card:first-child .scenario-desc-tooltip,
.scenario-compact-card:nth-child(2) .scenario-desc-tooltip {
  top: 0;
  transform: translateY(0) translateX(4px);
}

.scenario-compact-card:first-child .scenario-help-wrapper:hover .scenario-desc-tooltip,
.scenario-compact-card:nth-child(2) .scenario-help-wrapper:hover .scenario-desc-tooltip {
  transform: translateY(0) translateX(0);
}

.scenario-compact-card:first-child .tooltip-arrow,
.scenario-compact-card:nth-child(2) .tooltip-arrow {
  top: 10px;
}

.scenario-compact-card:last-child .scenario-desc-tooltip,
.scenario-compact-card:nth-last-child(2) .scenario-desc-tooltip {
  top: auto;
  bottom: 0;
  transform: translateY(0) translateX(4px);
}

.scenario-compact-card:last-child .scenario-help-wrapper:hover .scenario-desc-tooltip,
.scenario-compact-card:nth-last-child(2) .scenario-help-wrapper:hover .scenario-desc-tooltip {
  transform: translateY(0) translateX(0);
}

.scenario-compact-card:last-child .tooltip-arrow,
.scenario-compact-card:nth-last-child(2) .tooltip-arrow {
  top: auto;
  bottom: 10px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

.tooltip-icon {
  font-size: 0.95rem;
}

.tooltip-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #f8fafc;
}

.tooltip-chip {
  font-size: 0.58rem;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: auto;
}

.tooltip-chip.tea {
  background: #312e81;
  color: #a5b4fc;
}

.tooltip-chip.tdah {
  background: #78350f;
  color: #fde68a;
}

.tooltip-text {
  font-size: 0.71rem;
  color: #cbd5e1;
  line-height: 1.35;
  margin: 0;
}

.tooltip-arrow {
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: rgba(15, 23, 42, 0.96);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

/* ==========================================
   SUB-COLUNA 2: PLAYER DE VÍDEO (BRANCO E CINZA)
   ========================================== */
.console-video-column {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-player-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  position: relative;
}

/* BARRA SUPERIOR DO PLAYER (BRANCO E CINZA) */
.video-player-topbar {
  height: 40px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  flex-shrink: 0;
  gap: 8px;
}

.video-topbar-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.video-topbar-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.video-topbar-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.video-topbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-player-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-player-action:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 0.8rem;
  color: #64748b;
}

/* TELA DO VÍDEO (VIEWPORT CLEAN BRANCO E CINZA) */
.video-screen-viewport {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* PLACEHOLDER LIMPO (BRANCO E CINZA) */
.clean-video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  max-width: 380px;
}

.clean-placeholder-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.clean-placeholder-svg {
  width: 26px;
  height: 26px;
  color: #94a3b8;
}

.clean-placeholder-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.2px;
}

.clean-placeholder-sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* BARRA INFERIOR DE CONTROLES DO PLAYER (BRANCO E CINZA) */
.video-player-bottombar {
  height: 42px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  flex-shrink: 0;
}

.player-volume-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-volume-slider {
  width: 75px;
  height: 4px;
  accent-color: #475569;
  cursor: pointer;
}

.player-volume-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  min-width: 28px;
}

.player-actions-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-ctrl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.player-ctrl-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.player-ctrl-btn.mini {
  padding: 3px 6px;
  font-size: 0.85rem;
  background: transparent;
  border-color: transparent;
}

.player-ctrl-btn.mini:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.btn-ctrl-icon {
  font-size: 0.8rem;
  color: #475569;
}



/* ==========================================
   SEÇÃO 3: SONS DA SALA (DOCK BAR & EXPANDABLE DRAWER)
   ========================================== */

/* BARRA INFERIOR / DOCK COMPACTO COM SETINHA */
.sounds-dock-bar {
  flex-shrink: 0;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
  gap: 8px;
}

.sounds-dock-bar:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.16);
  transform: translateY(-1px);
}

.sounds-dock-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sounds-dock-icon {
  font-size: 0.95rem;
}

.sounds-dock-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #92400e;
}

.sounds-dock-text-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.sounds-dock-count-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: #b45309;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #fde68a;
  padding: 1px 5px;
  border-radius: 999px;
}

.sounds-dock-tech {
  font-size: 0.62rem;
  font-weight: 800;
  background: #ffffff;
  color: #92400e;
  padding: 1px 5px;
  border-radius: 5px;
  border: 1px solid #fde68a;
}

.sounds-dock-count {
  font-size: 0.68rem;
  font-weight: 700;
  color: #b45309;
}


.sounds-dock-center {
  font-size: 0.7rem;
  color: #b45309;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-sounds-dock-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #f59e0b;
  border-radius: 7px;
  padding: 3px 9px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #b45309;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-sounds-dock-trigger:hover {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

.dock-arrow-icon {
  font-size: 0.65rem;
  transition: transform 0.2s ease;
}

/* PAINEL EXPANSÍVEL DE SONS (COBRE OS CENÁRIOS AO ABRIR) */
.sounds-expanded-drawer {
  position: absolute;
  inset: 0;
  z-index: 25;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid #fde68a;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.18);
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  gap: 10px;
  overflow: hidden;
}

.sounds-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid #fef3c7;
  padding-bottom: 8px;
}

.sounds-drawer-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sounds-drawer-badge-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sounds-drawer-icon {
  font-size: 1.05rem;
}

.sounds-drawer-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #92400e;
  margin: 0;
}

.sounds-drawer-tech {
  font-size: 0.64rem;
  font-weight: 800;
  background: #fef3c7;
  color: #92400e;
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid #fde68a;
}

.sounds-drawer-subtitle {
  font-size: 0.72rem;
  color: #78350f;
  font-weight: 500;
}

.btn-sounds-drawer-collapse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
}

.btn-sounds-drawer-collapse:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
}

.collapse-arrow-icon {
  font-size: 0.65rem;
}

.sounds-drawer-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px;
  padding-right: 4px;
  scrollbar-width: thin;
}

.sound-glass-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fde68a;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
}

.sound-glass-card:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #f59e0b;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2);
}

.sound-glass-card:active:not(:disabled) {
  transform: scale(0.98);
}

.sound-glass-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(20%);
}

.sound-card-icon {
  font-size: 1.2rem;
  background: #ffffff;
  border-radius: 8px;
  padding: 5px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fde68a;
}

.sound-card-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sound-card-label {
  font-size: 0.84rem;
  font-weight: 800;
  color: #92400e;
}

.sound-card-desc {
  font-size: 0.68rem;
  color: #b45309;
}

.sound-fire-pill {
  font-size: 0.64rem;
  font-weight: 800;
  color: #d97706;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid #fde68a;
  flex-shrink: 0;
}

/* Transição de abertura da gaveta de sons */
.sounds-drawer-expand-enter-active,
.sounds-drawer-expand-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.sounds-drawer-expand-enter-from,
.sounds-drawer-expand-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ==========================================
   COLUNA DA DIREITA: PAINEL DO ALUNO & TTS
   ========================================== */
.console-right-column {
  border-left: 1.5px solid #e2e8f0;
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 0;
}

/* PARTE SUPERIOR */
.student-meta-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.student-header-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.student-kicker {
  font-size: 0.64rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.4px;
}

.student-main-name {
  font-size: 1.45rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.3px;
}

.student-cond-row {
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.student-cond-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.student-cond-pill.pill-tea {
  background: #e0e7ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.student-cond-pill.pill-tdah {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.student-cond-pill.pill-tipico {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-reset-student-didas {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.btn-reset-student-didas:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
  transform: translateY(-1px);
}

.btn-reset-student-didas:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* PARTE INFERIOR: TEXT-TO-SPEECH (TTS) */
.student-tts-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f0f7ff 0%, #f5f3ff 100%);
  border: 1.5px solid #c7d2fe;
  border-radius: 14px;
  padding: 10px 12px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.06);
}

.tts-header-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tts-icon {
  font-size: 0.95rem;
}

.tts-heading {
  font-size: 0.76rem;
  font-weight: 800;
  color: #312e81;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tts-textarea-wrapper {
  position: relative;
  width: 100%;
}

.tts-glass-textarea {
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  width: 100%;
  height: 80px;
  padding: 8px 10px;
  font-size: 0.84rem;
  resize: none;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  font-weight: 500;
  font-family: inherit;
  transition: border-color 0.2s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
}

.tts-glass-textarea:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.tts-glass-textarea:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.tts-counter-tag {
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.9);
  padding: 1px 5px;
  border-radius: 4px;
}

.btn-didas-tts-send {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.86rem;
  letter-spacing: 0.3px;
  border: none;
  border-radius: 10px;
  padding: 9px 14px;
  width: 100%;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 3px 12px rgba(37, 99, 235, 0.28);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-didas-tts-send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.38);
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 50%, #4338ca 100%);
}

.btn-didas-tts-send:active:not(:disabled) {
  transform: translateY(0);
}

.btn-didas-tts-send:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: grayscale(20%);
}

/* ==========================================
   TOAST FLUTUANTE DE FEEDBACK GLOBAL
   ========================================== */
.floating-feedback-toast {
  position: fixed;
  top: 76px;
  right: 28px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 800;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(16px);
  border: 1.5px solid;
}

.floating-feedback-toast.success {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.floating-feedback-toast.error {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

/* ==========================================
   MODAIS: HARDWARE & HISTÓRICO
   ========================================== */
.config-modal-box {
  background: #ffffff;
  border-radius: 20px;
  width: 90%;
  max-width: 540px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.config-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.config-modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-modal-title-row h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.config-modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
}

.config-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-modal-field label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
}

.custom-select-trigger {
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
  cursor: pointer;
  background: #ffffff;
}

.custom-options-dropdown {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 4px;
  max-height: 180px;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.custom-option {
  padding: 10px 14px;
  font-size: 0.86rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.custom-option:hover {
  background: #f1f5f9;
}

.custom-option.is-active {
  background: #eff6ff;
  color: #0071e3;
  font-weight: 800;
}

.custom-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.opt-locked-tag {
  font-size: 0.65rem;
  background: #fee2e2;
  color: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.config-modal-input {
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.88rem;
  outline: none;
}

.modal-participants-list {
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 6px;
}

.modal-part-item {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
}

.modal-part-item:hover {
  background: #f8fafc;
}

.modal-part-item.is-selected {
  background: #eff6ff;
  border-left: 3px solid #0071e3;
}

.btn-save-hardware {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.92rem;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  width: 100%;
}

.btn-save-hardware:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-modal-danger-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

.btn-danger-modal-trigger {
  background: transparent;
  border: 1.5px solid #fecaca;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-danger-modal-trigger:hover:not(:disabled) {
  background: #fef2f2;
}

/* HISTÓRICO MODAL */
.history-modal-box {
  background: #ffffff;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.history-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.history-feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-feed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.84rem;
}

.history-time {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 700;
}

.history-target {
  color: #0f172a;
}

.history-arrow {
  color: #94a3b8;
}

.history-conflict {
  color: #0071e3;
  font-weight: 700;
}

.history-conflict code {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 4px;
}

.history-tts-text {
  font-style: italic;
  color: #0369a1;
  font-weight: 600;
}

.no-history-msg {
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  padding: 30px;
}

/* MODAL DELETAR (BASE) */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.delete-modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 440px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.delete-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.delete-warn-svg {
  width: 26px;
  height: 26px;
}

.delete-modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.delete-modal-subdesc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.delete-modal-room-badge {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  font-weight: 800;
  font-size: 0.95rem;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel-delete {
  flex: 1;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 11px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.btn-confirm-delete {
  flex: 1;
  background: #ef4444;
  border: none;
  border-radius: 10px;
  padding: 11px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
}

.btn-spinner-tech {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
  display: inline-block;
}

.btn-spinner-tech.white {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
}

.btn-spinner-tech.red {
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-top-color: #ef4444;
}

.btn-spinner-tech.amber {
  border: 2px solid rgba(217, 119, 6, 0.2);
  border-top-color: #d97706;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.glass-modal-enter-active, .glass-modal-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-modal-enter-from, .glass-modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}

@media (max-width: 1200px) {
  .console-main-content-split {
    grid-template-columns: minmax(290px, 340px) 1fr;
  }
}

@media (max-width: 960px) {
  .console-main-content-split {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .console-video-column {
    min-height: 280px;
  }
}
</style>
