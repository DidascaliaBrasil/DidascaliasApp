<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <!-- Menu Lateral da Aplicação -->
    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
    />

    <!-- Header / Navbar Principal -->
    <nav class="navbar">
      <div class="logo-area stagger-in">
        <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
        <span class="brand-name notranslate" translate="no">Didascalias</span>
      </div>

      <div class="navbar-right-info" v-if="sala">
        <span :class="['session-live-pulse-badge', isSalaAtiva(sala) ? 'badge-sala-ativa' : 'badge-sala-inativa']">
          <span class="pulse-beacon" v-if="isSalaAtiva(sala)"></span>
          <span class="idle-beacon" v-else></span>
          <span>{{ isSalaAtiva(sala) ? 'Sessão Ativa no VR' : 'Sessão Inativa' }}</span>
        </span>
      </div>
    </nav>

    <!-- Conteúdo Principal de Tela Cheia -->
    <main class="main-content">
      
      <!-- Estado de Carregamento Geral -->
      <div v-if="isLoading" class="loading-state stagger-in">
        <div class="spinner"></div>
        <p>A carregar configuração e telemetria da sala VR...</p>
      </div>

      <!-- Erro ao Encontrar Sala -->
      <div v-else-if="!sala" class="error-box stagger-in">
        <h3>Sala não encontrada</h3>
        <p>A sala solicitada não existe ou foi removida do sistema.</p>
        <button class="btn-back-link" @click="voltar">
          &larr; Voltar para a Home
        </button>
      </div>

      <!-- Tela Completa da Sala -->
      <div v-else class="sala-view-container stagger-in-2">
        
        <!-- Barra de Navegação Superior (Breadcrumb + Botão Voltar) -->
        <div class="top-nav-bar-glass">
          <button class="btn-back-nav" @click="voltar" title="Voltar para a lista de salas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="back-arrow-svg">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Voltar para Salas</span>
          </button>

          <div class="breadcrumbs-trail">
            <router-link to="/home" class="bc-item">Início</router-link>
            <span class="bc-sep">/</span>
            <span class="bc-item current notranslate" translate="no">{{ sala.roomName || 'Configurar Sala' }}</span>
          </div>
        </div>

        <!-- Hero Header Glass com Identidade e Telemetria Completa -->
        <div class="room-hero-glass">
          <div class="room-hero-content">
            <div class="room-avatar-hud">
              <span class="avatar-vr-emoji">🥽</span>
            </div>

            <div class="room-hero-meta">
              <div class="hero-top-tags">
                <span class="kicker-badge">SESSÃO & AMBIENTE VR</span>
                <span class="target-type-badge">
                  {{ sala.targetType === 'grupo' ? '👥 Grupo / Turma' : '👤 Aluno Individual' }}
                </span>
                <span :class="['status-live-tag', isSalaAtiva(sala) ? 'is-active' : 'is-idle']">
                  <span class="status-dot"></span>
                  {{ isSalaAtiva(sala) ? 'Sala Ativa no Momento' : 'Sala Inativa' }}
                </span>
                <span v-if="isInstituicao" :class="['role-access-badge', isFacilitadorPlus ? 'access-plus' : 'access-readonly']">
                  {{ isFacilitadorPlus ? '⭐ Instituição FacilitadorPlus' : '👁️ Visualização Institucional' }}
                </span>
              </div>

              <h1 class="room-hero-title notranslate" translate="no">{{ sala.roomName || 'Sala VR' }}</h1>
              <p class="room-hero-desc">
                Painel central de controle da sala virtual. Configure o hardware VR, vincule participantes e gerencie a simulação imersiva.
              </p>
            </div>
          </div>

          <!-- Quick Telemetry Bar (Zero Truncamento, 4 Cards Tecnológicos) -->
          <div class="telemetry-bar-grid">
            <div class="telem-item-card">
              <div class="telem-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="telem-data">
                <span class="telem-label">FACILITADOR RESPONSÁVEL</span>
                <span class="telem-value notranslate" translate="no">{{ facilitadorNome }}</span>
              </div>
            </div>

            <div class="telem-item-card">
              <div class="telem-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <line x1="10" y1="4" x2="10" y2="20"></line>
                </svg>
              </div>
              <div class="telem-data">
                <span class="telem-label">LAYOUT DA SALA</span>
                <span class="telem-value">{{ sala.numDesks || 0 }} mesas • Formato {{ getShapeName(sala.shape) }}</span>
              </div>
            </div>

            <div class="telem-item-card">
              <div class="telem-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="telem-data">
                <span class="telem-label">CAPACIDADE TOTAL</span>
                <span class="telem-value">{{ (sala.numBoys || 0) + (sala.numGirls || 0) }} alunos ({{ sala.numBoys || 0 }} 👦 • {{ sala.numGirls || 0 }} 👧)</span>
              </div>
            </div>

            <div class="telem-item-card">
              <div class="telem-icon">
                <span style="font-size: 1.2rem;">🥽</span>
              </div>
              <div class="telem-data">
                <span class="telem-label">HARDWARE VINCULADO</span>
                <span class="telem-value" :class="{ 'text-green': selectedActiveOculos }">
                  {{ selectedOculosObj ? (selectedOculosObj.modelo || 'Óculos VR') + ' (N° ' + (selectedOculosObj.numero_oculos || selectedOculosObj.id) + ')' : 'Nenhum dispositivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerta de Modo Somente Leitura para Instituições sem FacilitadorPlus -->
        <div v-if="isInstituicao && !isFacilitadorPlus" class="instituicao-readonly-alert">
          <div class="readonly-alert-icon">👁️</div>
          <div class="readonly-alert-text">
            <div class="readonly-title-wrap">
              <strong>Acesso Institucional — Modo Somente Leitura</strong>
              <span class="readonly-tag-badge">Apenas Visualização</span>
            </div>
            <p>Sua instituição tem acesso para acompanhar e visualizar esta sala. Modificações no óculos VR, troca de participantes, exclusão de sala ou controle em tempo real exigem a permissão <strong>FacilitadorPlus = true</strong> no cadastro institucional.</p>
          </div>
        </div>

        <!-- Alerta de Bloqueio quando Sala está Ativa -->
        <div v-if="isSalaAtiva(sala)" class="sala-ativa-lock-alert">
          <div class="lock-alert-icon">🔒</div>
          <div class="lock-alert-text">
            <strong>Sala Ativa no Momento</strong>
            <p>Esta sala está em execução ativa no óculos VR. Não é possível conectar outro óculos, desconectar o dispositivo, alternar o participante ou excluir a sala enquanto a situação for Ativa.</p>
          </div>
        </div>

        <!-- Canvas Amplo em Duas Colunas para Configuração e Futuras Funcionalidades -->
        <div class="room-canvas-grid" :class="{ 'has-dropdown-open': menuOculosAberto }">
          
          <!-- COLUNA 1: Dispositivo VR -->
          <div class="canvas-card-module" :class="{ 'module-locked': isSalaAtiva(sala), 'is-collapsed': !menu1Aberto, 'has-dropdown-open': menuOculosAberto }">
            <div 
              class="module-header-row clickable-accordion-header"
              role="button"
              tabindex="0"
              @click="toggleMenu1"
              @keydown.enter.prevent="toggleMenu1"
              @keydown.space.prevent="toggleMenu1"
              :title="menu1Aberto ? 'Clique para recolher menu' : 'Clique para expandir menu'"
            >
              <div class="module-number-badge">01</div>
              <div class="module-header-text">
                <div class="module-title-wrap">
                  <h3 class="module-title">Dispositivo VR</h3>
                  <span v-if="selectedActiveOculos" class="hardware-status-badge connected">
                    <span class="pulse-dot"></span> Hardware Conectado
                  </span>
                  <span v-else class="hardware-status-badge pending">
                    <span class="idle-dot"></span> Seleção Pendente
                  </span>
                </div>
                <p class="module-desc">Óculos físico vinculado para executar a simulação imersiva</p>

                <!-- Resumo quando colapsado -->
                <div v-if="!menu1Aberto" class="module-collapsed-summary">
                  <span class="summary-chip">
                    🥽 {{ selectedOculosObj ? (selectedOculosObj.modelo || 'Óculos VR') + ' (N° ' + (selectedOculosObj.numero_oculos || selectedOculosObj.id) + ')' : 'Nenhum dispositivo vinculado' }}
                  </span>
                </div>
              </div>

              <!-- Chevron Animado -->
              <div class="accordion-chevron-box" :class="{ 'is-flipped': menu1Aberto }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Corpo Colapsável do Módulo 1 -->
            <Transition name="accordion-slide">
              <div v-if="menu1Aberto" class="module-collapsible-body">
                <!-- Custom Dropdown Moderno de Seleção de Óculos VR -->
                <div 
                  class="custom-oculos-dropdown-container" 
                  ref="dropdownOculosRef"
                  :class="{ 'is-open': menuOculosAberto, 'is-disabled': salvandoAtivos || isSalaAtiva(sala) || !podeModificarEControlar }"
                >
                  <!-- Trigger Button / Campo Visível -->
                  <div 
                    class="custom-oculos-trigger"
                    role="button"
                    tabindex="0"
                    @click="toggleMenuOculos"
                    @keydown.enter.prevent="toggleMenuOculos"
                    @keydown.space.prevent="toggleMenuOculos"
                    :class="{ 'is-disabled': salvandoAtivos || isSalaAtiva(sala) || !podeModificarEControlar }"
                  >
                    <div class="trigger-left">
                      <div 
                        class="headset-icon-box" 
                        :class="{ 'has-selection': selectedActiveOculos }"
                        style="width: 38px; height: 38px; min-width: 38px; max-width: 38px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;"
                      >
                        <span v-if="selectedActiveOculos" style="font-size: 1.25rem;">🥽</span>
                        <svg 
                          v-else 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          fill="none" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          style="width: 20px; height: 20px; min-width: 20px; max-width: 20px; display: block;"
                          class="vr-headset-svg"
                        >
                          <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4l-2-2h-4l-2 2H4a2 2 0 0 1-2-2v-6z"></path>
                          <circle cx="8" cy="13" r="2"></circle>
                          <circle cx="16" cy="13" r="2"></circle>
                          <line x1="10" y1="13" x2="14" y2="13"></line>
                        </svg>
                      </div>
                      <div class="trigger-label-group">
                        <template v-if="selectedOculosObj">
                          <span class="selected-oculos-title notranslate" translate="no">
                            {{ selectedOculosObj.modelo || 'Óculos VR' }}
                          </span>
                          <span class="selected-oculos-sub notranslate" translate="no">
                            N° {{ selectedOculosObj.numero_oculos || selectedOculosObj.id }} • Vinculado
                          </span>
                        </template>
                        <template v-else>
                          <span class="placeholder-oculos-title">Nenhum (Clique para escolher um óculos)</span>
                          <span class="placeholder-oculos-sub">Toque para selecionar um dispositivo VR</span>
                        </template>
                      </div>
                    </div>

                    <div 
                      class="trigger-chevron" 
                      :class="{ 'is-flipped': menuOculosAberto }"
                      style="width: 22px; height: 22px; min-width: 22px; max-width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        width="18" 
                        height="18" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2.5"
                        style="width: 18px; height: 18px; min-width: 18px; max-width: 18px; display: block;"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  <!-- Menu Popover Elegante em Glassmorphism -->
                  <Transition name="dropdown-scale">
                    <div v-if="menuOculosAberto" class="custom-oculos-menu" @click.stop>
                      <div class="menu-header-hint">
                        <span>DISPOSITIVOS VR DA INSTITUIÇÃO</span>
                        <span class="count-badge-sub">{{ oculosDisponiveis.length }}</span>
                      </div>

                      <div class="menu-items-scroll">
                        <!-- Opção 1: Nenhum (Desconectar) -->
                        <div 
                          class="oculos-menu-item item-none"
                          :class="{ 'is-active': selectedActiveOculos === null }"
                          @click="selecionarOculos(null)"
                        >
                          <div class="item-icon-box none-icon" style="width: 36px; height: 36px; min-width: 36px; max-width: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; min-width: 18px; max-width: 18px; display: block;">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                          </div>
                          <div class="item-text-info">
                            <span class="item-title">Nenhum Dispositivo</span>
                            <span class="item-desc">Não vincular óculos a esta sala no momento</span>
                          </div>
                          <div v-if="selectedActiveOculos === null" class="item-check">✓</div>
                        </div>

                        <!-- Lista de Óculos Reais -->
                        <div 
                          v-for="oculos in oculosDisponiveis" 
                          :key="oculos.id"
                          class="oculos-menu-item"
                          :class="{ 
                            'is-active': selectedActiveOculos === oculos.id,
                            'is-blocked': isOculosEmOutraSalaAtiva(oculos.id)
                          }"
                          @click="selecionarOculos(oculos.id)"
                        >
                          <div class="item-icon-box vr-icon" :class="{ 'is-active': selectedActiveOculos === oculos.id }" style="width: 36px; height: 36px; min-width: 36px; max-width: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            🥽
                          </div>

                          <div class="item-text-info">
                            <div class="item-title-row">
                              <span class="item-title notranslate" translate="no">{{ oculos.modelo || 'Óculos VR' }}</span>
                              <span class="badge-numero-oculos notranslate" translate="no">N° {{ oculos.numero_oculos || oculos.id }}</span>
                            </div>
                            <span v-if="isOculosEmOutraSalaAtiva(oculos.id)" class="item-status-warning">
                              🔒 Em uso em outra sala ativa (Bloqueado)
                            </span>
                            <span v-else-if="selectedActiveOculos === oculos.id" class="item-status-active">
                              ✓ Dispositivo selecionado para esta sala
                            </span>
                            <span v-else class="item-status-avail">
                              Disponível para conectar
                            </span>
                          </div>

                          <div class="item-action-indicator">
                            <span v-if="selectedActiveOculos === oculos.id" class="badge-selected-pill">
                              Selecionado
                            </span>
                            <span v-else-if="isOculosEmOutraSalaAtiva(oculos.id)" class="badge-locked-pill">
                              Bloqueado
                            </span>
                            <span v-else class="action-arrow-sub">
                              Conectar &rarr;
                            </span>
                          </div>
                        </div>

                        <div v-if="oculosDisponiveis.length === 0" class="empty-dropdown-message">
                          <span class="empty-icon">🥽</span>
                          <span>Nenhum óculos cadastrado nesta instituição.</span>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Telemetria do Headset Selecionado -->
                <div v-if="selectedOculosObj" class="active-headset-preview">
                  <div class="preview-glow-bar"></div>
                  <div class="preview-icon-col">
                    <span class="hw-icon">🥽</span>
                  </div>
                  <div class="preview-meta-col">
                    <span class="preview-model notranslate" translate="no">{{ selectedOculosObj.modelo || 'Óculos VR' }}</span>
                    <span class="preview-sub notranslate" translate="no">Identificação: N° {{ selectedOculosObj.numero_oculos || selectedOculosObj.id }} • Transmissão Ativa</span>
                  </div>
                  <div class="preview-state-tag">
                    <span class="tag-signal">ONLINE</span>
                  </div>
                </div>

                <p v-if="!podeModificarEControlar" class="readonly-inline-hint">
                  🔒 Alteração de óculos bloqueada: apenas visualização (Requer FacilitadorPlus).
                </p>

                <p v-if="oculosDisponiveis.length === 0" class="empty-warn-tech">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warn-svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Nenhum óculos VR cadastrado nesta instituição. Solicite à instituição o cadastro de óculos.
                </p>
              </div>
            </Transition>
          </div>

          <!-- COLUNA 2: Participante Ativo -->
          <div class="canvas-card-module" :class="{ 'module-locked': isSalaAtiva(sala), 'is-collapsed': !menu2Aberto }">
            <div 
              class="module-header-row clickable-accordion-header"
              role="button"
              tabindex="0"
              @click="toggleMenu2"
              @keydown.enter.prevent="toggleMenu2"
              @keydown.space.prevent="toggleMenu2"
              :title="menu2Aberto ? 'Clique para recolher menu' : 'Clique para expandir menu'"
            >
              <div class="module-number-badge">02</div>
              <div class="module-header-text">
                <div class="module-title-wrap">
                  <h3 class="module-title">Quem vai usar o óculos agora?</h3>
                  <span class="count-tech-badge">
                    {{ sala.targetType === 'aluno' ? '1 Aluno Vinculado' : participantesFiltrados.length + ' Alunos na Turma' }}
                  </span>
                </div>
                <p class="module-desc">
                  {{ sala.targetType === 'aluno' ? 'Estudante titular associado a esta sessão' : 'Selecione o participante que executará a sessão VR no momento' }}
                </p>

                <!-- Resumo quando colapsado -->
                <div v-if="!menu2Aberto" class="module-collapsed-summary">
                  <span class="summary-chip">
                    👤 Ativo: <strong class="notranslate" translate="no">{{ participanteAtivoNome }}</strong>
                  </span>
                </div>
              </div>

              <!-- Chevron Animado -->
              <div class="accordion-chevron-box" :class="{ 'is-flipped': menu2Aberto }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Corpo Colapsável do Módulo 2 -->
            <Transition name="accordion-slide">
              <div v-if="menu2Aberto" class="module-collapsible-body">
                <!-- Caso 1: Aluno Individual -->
                <div v-if="sala.targetType === 'aluno'" class="digital-student-pass">
                  <div class="pass-accent-light"></div>
                  <div class="pass-avatar-box notranslate" translate="no">
                    {{ participantesSala[0]?.nome?.charAt(0).toUpperCase() || 'A' }}
                  </div>
                  <div class="pass-details-box">
                    <div class="pass-identity-row">
                      <span class="pass-role-micro">PARTICIPANTE TITULAR</span>
                      <span class="pass-chip-verified">✓ Vinculado</span>
                    </div>
                    <strong class="pass-name notranslate" translate="no">{{ participantesSala[0]?.nome || 'Alunos não encontrados' }}</strong>
                    <span class="pass-email notranslate" translate="no">{{ participantesSala[0]?.email || '' }}</span>
                  </div>
                </div>

                <!-- Caso 2: Grupo / Turma -->
                <div v-else class="group-selection-zone">
                  <!-- Barra de Busca Rápida -->
                  <div class="tech-search-bar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                      type="text" 
                      v-model="filtroParticipante" 
                      placeholder="Pesquisar aluno por nome ou e-mail..." 
                      class="tech-search-input"
                      :disabled="isSalaAtiva(sala) || !podeModificarEControlar"
                    />
                    <button v-if="filtroParticipante" class="clear-search-btn" @click="filtroParticipante = ''">&times;</button>
                  </div>

                  <!-- Lista de Participantes em Cards Tecnológicos -->
                  <div class="student-cards-scrollable">
                    <div 
                      v-for="aluno in participantesFiltrados" 
                      :key="aluno.id"
                      class="student-hud-card"
                      :class="{ 
                        'selected-active': selectedActiveParticipant === aluno.id,
                        'is-disabled': isSalaAtiva(sala) || !podeModificarEControlar
                      }"
                      @click="!isSalaAtiva(sala) && podeModificarEControlar && (selectedActiveParticipant = aluno.id)"
                    >
                      <div class="st-card-profile">
                        <div class="st-hud-avatar notranslate" translate="no">
                          {{ aluno.nome?.charAt(0).toUpperCase() || 'A' }}
                        </div>
                        <div class="st-hud-meta">
                          <span class="st-hud-name notranslate" translate="no">{{ aluno.nome }}</span>
                          <span class="st-hud-email notranslate" translate="no">{{ aluno.email }}</span>
                        </div>
                      </div>

                      <div class="st-hud-action">
                        <span v-if="selectedActiveParticipant === aluno.id" class="check-mark-tech">✓ Ativo</span>
                        <span v-else class="inactive-radio-circle"></span>
                      </div>
                    </div>

                    <div v-if="participantesFiltrados.length === 0" class="empty-search-alert">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-search-svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <span>Alunos não encontrados{{ filtroParticipante ? ' para a busca realizada.' : '.' }}</span>
                    </div>
                  </div>

                  <p v-if="!podeModificarEControlar" class="readonly-inline-hint">
                    🔒 Seleção de participante bloqueada: apenas visualização (Requer FacilitadorPlus).
                  </p>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- MÓDULO 03: CENTRO DE INTERAÇÃO E COMANDOS VR EM TEMPO REAL -->
        <div 
          class="vr-interaction-module-glass" 
          :class="{ 
            'is-active-session': isSalaAtiva(sala), 
            'is-locked-session': !isSalaAtiva(sala),
            'is-collapsed': !menu3Aberto || !isSalaAtiva(sala)
          }"
        >
          <!-- Header do Módulo (Clicável SOMENTE se a sala estiver ativa!) -->
          <div 
            class="module-header-row vr-interact-header"
            :class="{ 
              'clickable-accordion-header': isSalaAtiva(sala), 
              'header-locked-disabled': !isSalaAtiva(sala),
              'is-open': menu3Aberto && isSalaAtiva(sala)
            }"
            @click="toggleMenu3"
            :role="isSalaAtiva(sala) ? 'button' : undefined"
            :tabindex="isSalaAtiva(sala) ? 0 : undefined"
            @keydown.enter.prevent="toggleMenu3"
            @keydown.space.prevent="toggleMenu3"
            :title="!isSalaAtiva(sala) ? 'Menu bloqueado: a sala precisa estar Ativa no óculos VR para ser aberta' : (menu3Aberto ? 'Clique para recolher menu' : 'Clique para expandir menu')"
          >
            <div class="module-header-left">
              <div class="module-number-badge accent-purple">03</div>
              <div class="module-header-text">
                <div class="module-title-wrap">
                  <h3 class="module-title">Interagir com o Óculos VR (Comandos em Tempo Real)</h3>
                  <span v-if="!isSalaAtiva(sala)" class="hardware-status-badge locked-badge">
                    <span class="lock-icon-mini">🔒</span> Bloqueado (Sala Inativa)
                  </span>
                  <span v-else-if="!podeModificarEControlar" class="hardware-status-badge locked-badge">
                    <span class="lock-icon-mini">👁️</span> Acompanhamento (Sem FacilitadorPlus)
                  </span>
                  <span v-else class="hardware-status-badge live-active-pulse">
                    <span class="pulse-beacon-dot"></span> Transmissão VR Aberta
                  </span>
                </div>
                <p class="module-desc">
                  {{ !isSalaAtiva(sala) ? 'Menu indisponível enquanto a sala estiver inativa. Inicie a simulação no óculos VR para liberar a interação.' : (!podeModificarEControlar ? 'Modo de acompanhamento: visualize os alunos e o histórico de comandos em tempo real. Disparo de novos comandos requer FacilitadorPlus.' : 'Dispare conflitos comportamentais diretamente no headset VR durante a simulação ativa.') }}
                </p>

                <!-- Resumo quando colapsado e sala ativa -->
                <div v-if="!menu3Aberto && isSalaAtiva(sala)" class="module-collapsed-summary">
                  <span v-if="!podeModificarEControlar" class="summary-chip locked">
                    👁️ Acompanhamento em tempo real • {{ alunosVR.length > 0 ? alunosVR.length + ' Alunos 3D' : 'Alunos n encontrados' }} (Somente Leitura)
                  </span>
                  <span v-else class="summary-chip purple">
                    ⚡ 19 Comandos VR Prontos • {{ alunosVR.length > 0 ? alunosVR.length + ' Alunos 3D' : 'Alunos n encontrados' }} (Clique para abrir)
                  </span>
                </div>
                <!-- Alerta quando sala inativa (Sem opção de clicar) -->
                <div v-else-if="!isSalaAtiva(sala)" class="module-collapsed-summary">
                  <span class="summary-chip locked">
                    🔒 Interação desabilitada: Sala Inativa (Sem opção de abrir)
                  </span>
                </div>
              </div>
            </div>

            <div class="header-right-controls">
              <!-- Contador de Alunos no VR ou Fallback -->
              <div class="vr-students-count-chip" v-if="alunosVR.length > 0">
                <span class="count-num">{{ alunosVR.length }}</span>
                <span class="count-lbl">Alunos 3D</span>
              </div>
              <div class="vr-students-notfound-chip" v-else>
                <span class="notfound-icon">⚠️</span>
                <span class="notfound-lbl">Alunos n encontrados</span>
              </div>

              <!-- Chevron de Abertura ou Cadeado Bloqueado -->
              <div v-if="isSalaAtiva(sala)" class="accordion-chevron-box" :class="{ 'is-flipped': menu3Aberto }">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div v-else class="accordion-lock-box" title="Bloqueado: Sala Inativa (Sem opção de clique)">
                <span style="font-size: 1.15rem;">🔒</span>
              </div>
            </div>
          </div>

          <!-- Corpo do Módulo 3 (Visível SOMENTE quando menu3Aberto for true E a sala estiver ativa) -->
          <Transition name="accordion-slide">
            <div v-if="menu3Aberto && isSalaAtiva(sala)" class="module-collapsible-body">
              
              <!-- Banner informativo se a sala estiver inativa -->
              <div v-if="!isSalaAtiva(sala)" class="vr-interact-locked-banner">
                <div class="locked-banner-icon">🔒</div>
                <div class="locked-banner-content">
                  <strong>Interação com o Óculos VR Desabilitada</strong>
                  <p>
                    Esta sala está com a situação <strong>Inativa</strong>. Para interagir com o óculos e disparar conflitos aos alunos virtuais, inicie a simulação no óculos VR para torná-la <strong>Ativa</strong>.
                  </p>
                </div>
              </div>

              <!-- Conteúdo Interativo -->
              <div class="vr-interact-body" :class="{ 'controls-disabled': !isSalaAtiva(sala) }">
                
                <!-- Banner Informativo para Instituições sem FacilitadorPlus -->
                <div v-if="!podeModificarEControlar" class="vr-readonly-mode-banner">
                  <span class="vr-readonly-banner-icon">🔒</span>
                  <div class="vr-readonly-banner-text">
                    <strong>Modo de Acompanhamento (Somente Leitura)</strong>
                    <p>Sua instituição pode acompanhar os alunos virtuais e o histórico de comandos em tempo real. O disparo de conflitos e controle da sala exige permissão <strong>FacilitadorPlus = true</strong>.</p>
                  </div>
                </div>
                
                <!-- ETAPA A: Selecionar o Aluno Alvo -->
                <div class="interact-step-box">
                  <div class="step-subhead">
                    <div class="step-subhead-left">
                      <span class="subhead-badge">Passo 1</span>
                      <span class="subhead-title">Selecione o Aluno Alvo no VR:</span>
                    </div>
                    <div class="step-subhead-right">
                      <span v-if="alunoAlvoSelecionado" class="selected-target-pill notranslate" translate="no">
                        Aluno Selecionado: <strong>{{ alunoAlvoSelecionado }}</strong>
                      </span>
                      <span v-else-if="alunosVR.length === 0" class="notfound-target-pill">
                        Alunos n encontrados
                      </span>
                      <span v-else class="pending-target-pill">
                        Selecione um aluno abaixo
                      </span>
                    </div>
                  </div>

                  <!-- Lista de Chips de Alunos 3D -->
                  <div v-if="alunosVR.length > 0" class="vr-target-students-grid">
                    <button
                      v-for="aluno in alunosVR"
                      :key="aluno.key"
                      type="button"
                      class="vr-student-target-btn notranslate"
                      translate="no"
                      :class="{ 'is-selected': alunoAlvoSelecionado === aluno.nome, 'btn-disabled': !podeModificarEControlar }"
                      :disabled="!isSalaAtiva(sala) || !podeModificarEControlar"
                      @click="podeModificarEControlar && (alunoAlvoSelecionado = aluno.nome)"
                    >
                      <div class="target-avatar">
                        {{ (aluno.nome || 'A').charAt(0).toUpperCase() }}
                      </div>
                      <div class="target-name-wrap">
                        <span class="target-name">{{ aluno.nome }}</span>
                        <span class="target-slot-code">{{ aluno.key }}</span>
                      </div>
                      <span v-if="alunoAlvoSelecionado === aluno.nome" class="target-check-badge">✓</span>
                    </button>
                  </div>

                  <!-- Fallback: Alunos não encontrados -->
                  <div v-else class="empty-vr-students-warn">
                    <div class="empty-warn-icon-box">⚠️</div>
                    <div class="empty-warn-text">
                      <strong class="empty-warn-title">Alunos n encontrados</strong>
                      <p class="empty-warn-desc">
                        Nenhum aluno virtual foi registrado no nó <code>Alunos</code> desta sala no óculos VR.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ETAPA B: Selecionar Ação / Conflito Comportamental -->
                <div class="interact-step-box" style="margin-top: 24px;">
                  <div class="step-subhead-row">
                    <div class="step-subhead">
                      <span class="subhead-badge">Passo 2</span>
                      <span class="subhead-title">Selecione a Ação / Conflito a Disparar:</span>
                    </div>

                    <!-- Barra de Busca Rápida de Ações -->
                    <div class="action-search-bar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-mini-svg">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        v-model="buscaAcao"
                        placeholder="Filtrar por nome ou código..."
                        class="action-search-input"
                        :disabled="!isSalaAtiva(sala) || !podeModificarEControlar"
                      />
                      <button v-if="buscaAcao" class="clear-search-btn" @click="buscaAcao = ''">&times;</button>
                    </div>
                  </div>

                  <!-- Filtros de Categorias -->
                  <div class="action-category-pills">
                    <button
                      type="button"
                      v-for="cat in categoriasAcoes"
                      :key="cat.id"
                      class="cat-pill"
                      :class="{ active: categoriaAcaoAtiva === cat.id }"
                      :disabled="!isSalaAtiva(sala) || !podeModificarEControlar"
                      @click="podeModificarEControlar && (categoriaAcaoAtiva = cat.id)"
                    >
                      <span class="cat-icon">{{ cat.icon }}</span>
                      <span>{{ cat.label }}</span>
                      <span class="cat-count">{{ cat.count }}</span>
                    </button>
                  </div>

                  <!-- Grid dos 19 Cards de Ações -->
                  <div class="vr-actions-cards-grid">
                    <div
                      v-for="acao in acoesFiltradas"
                      :key="acao.id"
                      class="action-choice-card"
                      :class="{ 'is-selected': acaoSelecionada === acao.id, 'card-disabled': !isSalaAtiva(sala) || !podeModificarEControlar }"
                      @click="isSalaAtiva(sala) && podeModificarEControlar && (acaoSelecionada = acao.id)"
                    >
                      <div class="action-card-top">
                        <span class="action-emoji-symbol">{{ acao.icon }}</span>
                        <span v-if="acaoSelecionada === acao.id" class="action-selected-tag">✓ Selecionada</span>
                      </div>

                      <h5 class="action-title-text">{{ acao.label }}</h5>
                      <p class="action-desc-text">{{ acao.desc }}</p>

                      <div class="action-card-footer">
                        <code class="action-code-tag">{{ acao.id }}</code>
                      </div>
                    </div>

                    <div v-if="acoesFiltradas.length === 0" class="empty-actions-result">
                      <p>Nenhuma ação encontrada para "{{ buscaAcao }}".</p>
                    </div>
                  </div>
                </div>

                <!-- Toast de Feedback de Envio -->
                <Transition name="fade-slide">
                  <div v-if="feedbackComando" class="command-feedback-toast" :class="feedbackComando.tipo">
                    <span class="toast-indicator-icon">{{ feedbackComando.tipo === 'success' ? '⚡' : '⚠️' }}</span>
                    <span class="toast-indicator-text">{{ feedbackComando.texto }}</span>
                  </div>
                </Transition>

                <!-- BARRA DE DISPARO FINAL -->
                <div class="command-dispatch-bar">
                  <div class="dispatch-summary">
                    <div class="summary-target-info">
                      <span class="summary-lbl">DESTINATÁRIO (ALUNO ALVO):</span>
                      <strong class="summary-val notranslate" translate="no">
                        {{ alunoAlvoSelecionado ? alunoAlvoSelecionado : (alunosVR.length === 0 ? 'Alunos n encontrados' : 'Selecione no Passo 1') }}
                      </strong>
                    </div>
                    <div class="summary-sep">→</div>
                    <div class="summary-action-info">
                      <span class="summary-lbl">CONFLITO / AÇÃO VR:</span>
                      <strong class="summary-val">
                        {{ acaoSelecionadaObj ? acaoSelecionadaObj.label + ' (' + acaoSelecionadaObj.id + ')' : 'Selecione no Passo 2' }}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn-dispatch-command"
                    :disabled="enviandoComando || !isSalaAtiva(sala) || !podeModificarEControlar || !acaoSelecionada || !alunoAlvoSelecionado || alunosVR.length === 0"
                    @click="enviarComandoVR"
                  >
                    <span v-if="enviandoComando" class="btn-spinner-tech"></span>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="dispatch-svg">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span>
                      {{ enviandoComando ? 'Transmitindo para o Óculos...' : !isSalaAtiva(sala) ? 'Interação Bloqueada (Sala Inativa)' : (!podeModificarEControlar ? 'Controle Bloqueado (Requer FacilitadorPlus)' : (alunosVR.length === 0 ? 'Alunos n encontrados' : 'Enviar Comando para o Óculos VR')) }}
                    </span>
                  </button>
                </div>

                <!-- FEED / HISTÓRICO DE COMANDOS RECENTES DISPARADOS -->
                <div v-if="historicoComandos.length > 0" class="recent-commands-feed">
                  <div class="feed-header-row">
                    <span class="feed-title">Histórico Recente de Comandos nesta Sessão:</span>
                    <span class="feed-count-badge">{{ historicoComandos.length }} disparado(s)</span>
                  </div>
                  <div class="commands-feed-list">
                    <div
                      v-for="cmd in historicoComandos"
                      :key="cmd.key"
                      class="command-feed-item"
                    >
                      <div class="feed-item-left">
                        <span class="feed-status-dot"></span>
                        <span class="feed-time">{{ formatHoraComando(cmd.timestamp) }}</span>
                        <span class="feed-aluno notranslate" translate="no">{{ cmd.aluno_alvo }}</span>
                        <span class="feed-arrow">→</span>
                        <span class="feed-conflito">
                          {{ getNomeConflito(cmd.tipo_conflito) }}
                          <code class="feed-code">({{ cmd.tipo_conflito }})</code>
                        </span>
                      </div>
                      <span class="feed-check-tag">✓ No VR</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Transition>
        </div>

        <!-- Feedback Messages -->
        <div v-if="mensagemAtivos" class="feedback-toast-box">
          <div :class="['feedback-toast-card', tipoMensagem]">
            <span v-if="tipoMensagem === 'success'">✓</span>
            <span v-else>⚠️</span>
            <span>{{ mensagemAtivos }}</span>
          </div>
        </div>

        <!-- Seção de Ações Principais -->
        <div class="actions-zone-glass">
          <button 
            type="button"
            class="btn-confirm-session-tech"
            :disabled="salvandoAtivos || isSalaAtiva(sala) || !podeModificarEControlar"
            @click="salvarConfiguracoesAtivas"
          >
            <span v-if="salvandoAtivos" class="btn-spinner-tech"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-action-svg">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="btn-confirm-text">
              {{ salvandoAtivos ? 'Gravando Alterações...' : !podeModificarEControlar ? 'Somente Leitura (Requer FacilitadorPlus)' : isSalaAtiva(sala) ? 'Alterações Bloqueadas (Sala Ativa)' : 'Confirmar e Salvar Sessão' }}
            </span>
          </button>
        </div>

        <!-- Zona de Perigo (Exclusão da Sala) -->
        <div class="danger-zone-box">
          <div class="danger-zone-info">
            <span class="danger-zone-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Excluir Sala VR
            </span>
            <span class="danger-zone-desc">
              Exclui permanentemente esta sala e todos os dados de configuração vinculados a ela.
            </span>
          </div>

          <button 
            type="button"
            class="btn-delete-room-full" 
            :disabled="excluindoSala || isSalaAtiva(sala) || !podeModificarEControlar"
            @click="confirmarExclusaoSala"
          >
            <span v-if="excluindoSala" class="btn-spinner-delete"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>{{ !podeModificarEControlar ? 'Exclusão Bloqueada (Requer FacilitadorPlus)' : isSalaAtiva(sala) ? 'Exclusão Bloqueada (Sala Ativa)' : 'Excluir Sala VR' }}</span>
          </button>
        </div>

      </div>
    </main>

    <!-- Modal de Confirmação de Exclusão Elegante -->
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

            <div class="delete-modal-points">
              <div class="delete-point-row">
                <span class="bullet-dot"></span>
                <span>O óculos conectado será desvinculado e liberado.</span>
              </div>
              <div class="delete-point-row">
                <span class="bullet-dot"></span>
                <span>O histórico de telemetria desta sala deixará de estar ativo.</span>
              </div>
              <div class="delete-point-row alert">
                <span class="bullet-dot red"></span>
                <span>Alunos não poderão mais se conectar a esta sala no óculos.</span>
              </div>
            </div>

            <p v-if="mensagemPermissao" class="delete-error-note">{{ mensagemPermissao }}</p>

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
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="trash-action-svg">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>{{ excluindoSala ? 'Excluindo...' : 'Sim, Excluir Sala' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get, update, remove, query, orderByChild, equalTo, push, onValue, limitToLast } from 'firebase/database'
import { useAuthStore } from '../stores/auth'
import { isSalaAtiva } from '../utils/salaUtils'
import MenuLateral from '../components/generic/MenuLateral.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const userData = ref({})
const sala = ref(null)
const todasSalas = ref([])

// ==========================================
// ESTADO DOS MENUS (Iniciam minimizados por padrão)
// ==========================================
const menu1Aberto = ref(false)
const menu2Aberto = ref(false)
const menu3Aberto = ref(false)

const toggleMenu1 = () => {
  menu1Aberto.value = !menu1Aberto.value
}

const toggleMenu2 = () => {
  menu2Aberto.value = !menu2Aberto.value
}

const toggleMenu3 = () => {
  // Se a sala estiver inativa, o menu 3 fica minimizado SEM OPÇÃO de clicar para abrir
  if (!isSalaAtiva(sala.value)) return
  menu3Aberto.value = !menu3Aberto.value
}

// Se a sala transicionar para inativa no banco em tempo real, força o fechamento imediato do menu 3
watch(
  () => isSalaAtiva(sala.value),
  (ativa) => {
    if (!ativa) {
      menu3Aberto.value = false
    }
  }
)

// Dropdown de Óculos
const menuOculosAberto = ref(false)
const dropdownOculosRef = ref(null)
const oculosDisponiveis = ref([])
const selectedActiveOculos = ref(null)

// Participantes
const participantesSala = ref([])
const selectedActiveParticipant = ref(null)
const filtroParticipante = ref('')

// Resumo do Participante Ativo para o Menu 2 colapsado
const participanteAtivoNome = computed(() => {
  if (sala.value?.targetType === 'aluno') {
    return participantesSala.value[0]?.nome || 'Aluno Individual Titular'
  }
  if (selectedActiveParticipant.value) {
    const found = participantesSala.value.find(p => p.id === selectedActiveParticipant.value)
    return found?.nome || 'Participante Selecionado'
  }
  return 'Nenhum selecionado'
})

// Ações Gerais da Sala
const salvandoAtivos = ref(false)
const mensagemAtivos = ref('')
const tipoMensagem = ref('')

// Exclusão
const modalExclusaoAberto = ref(false)
const excluindoSala = ref(false)
const mensagemPermissao = ref('')

// Facilitador Nome
const facilitadorNome = ref('Facilitador')

// ==========================================
// MÓDULO 03: INTERAÇÃO & COMANDOS VR
// ==========================================
const CONFLITOS_VR = [
  { id: 'TakeMaterialAll', label: 'Pegar todo o material', icon: '🎒', category: 'material', desc: 'Aluno recolhe todo o material da carteira' },
  { id: 'StandUpConflict', label: 'Levantar em situação de conflito', icon: '⚡', category: 'comportamento', desc: 'Aluno levanta-se em confronto ou atrito' },
  { id: 'Hyperstimulate', label: 'Hiperestimular', icon: '🧠', category: 'emocional', desc: 'Gera estado de agitação e sobrecarga sensorial' },
  { id: 'GetDistracted', label: 'Distrair-se', icon: '💭', category: 'atencao', desc: 'Perde o foco na aula e dispersa a atenção' },
  { id: 'DrawDistracted', label: 'Desenhar distraído(a)', icon: '✏️', category: 'atencao', desc: 'Fica rabiscando ou desenhando no caderno' },
  { id: 'BotherRandomStudents', label: 'Incomodar alunos aleatórios', icon: '👉', category: 'social', desc: 'Interrompe e mexe com colegas próximos' },
  { id: 'GetOutMaterialWrong', label: 'Pegar o material errado', icon: '❌', category: 'material', desc: 'Tira da mochila itens não solicitados' },
  { id: 'SitTogether', label: 'Sentar junto', icon: '🪑', category: 'social', desc: 'Muda de lugar para sentar próximo a outro aluno' },
  { id: 'StandUp', label: 'Levantar-se', icon: '🧍', category: 'movimento', desc: 'Levanta-se da sua carteira na sala' },
  { id: 'LeaveDesk', label: 'Sair da carteira', icon: '🚶', category: 'movimento', desc: 'Afasta-se do seu lugar e circula pela sala' },
  { id: 'MoveToRandomPoint', label: 'Mover-se para ponto aleatório', icon: '🎲', category: 'movimento', desc: 'Desloca-se até um ponto qualquer da sala' },
  { id: 'RunToRandomPoint', label: 'Correr para ponto aleatório', icon: '🏃', category: 'movimento', desc: 'Corre de forma desgovernada pela sala' },
  { id: 'AnxiousRunToRandomPoint', label: 'Correr ansiosamente', icon: '😰', category: 'emocional', desc: 'Fuga ansiosa e agitada pela sala' },
  { id: 'MoveToFrontDoor', label: 'Mover-se para a porta da frente', icon: '🚪', category: 'movimento', desc: 'Caminha em direção à porta de entrada' },
  { id: 'GoToFloor', label: 'Sentar no chão', icon: '🧘', category: 'comportamento', desc: 'Senta-se no chão entre as carteiras' },
  { id: 'ChangeSits', label: 'Trocar de assento (ChangeSeats)', icon: '🔄', category: 'movimento', desc: 'Troca de carteira com outro colega' },
  { id: 'TakeMaterialOut', label: 'Pegar o material', icon: '📖', category: 'material', desc: 'Retira seu material da mochila' },
  { id: 'Make Students Laugh', label: 'Fazer os alunos rirem', icon: '😄', category: 'social', desc: 'Conta piada ou faz brincadeira para a turma rir' },
  { id: 'Make Students Talk', label: 'Fazer os alunos falarem', icon: '🗣️', category: 'social', desc: 'Inicia conversa paralela em voz alta' },
]

const acaoSelecionada = ref('')
const categoriaAcaoAtiva = ref('todos')
const buscaAcao = ref('')
const alunoAlvoSelecionado = ref('')
const enviandoComando = ref(false)
const cooldownDisparo = ref(false)
const feedbackComando = ref(null)

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
  // Se for universidade / instituição de ensino:
  // APENAS SE tiver FacilitadorPlus = true pode modificar e controlar
  if (isInstituicao.value) {
    return isFacilitadorPlus.value === true
  }
  // Facilitadores mantêm permissão de controle e configuração
  if (isFacilitador.value) {
    return true
  }
  // Demais perfis (apenas visualização)
  return false
})

// Listeners cirúrgicos em nós folha (Zero sobrecarga de RTDB)
let unsubSituacao = null
let unsubAlunos = null
let unsubComandos = null
let unsubFacilitadorPlus = null

const salaId = computed(() => route.params.id)

// Lista de Alunos 3D no VR (Lê estritamente de classroom_configs/${id}/Alunos)
const alunosVR = computed(() => {
  if (!sala.value) return []
  const al = sala.value.Alunos
  if (al) {
    if (Array.isArray(al)) {
      const items = al
        .filter(Boolean)
        .map((item, idx) => {
          const nome = typeof item === 'string' ? item : (item?.nome || item?.name || '')
          return { key: `Aluno${idx+1}`, nome: (nome || '').trim() }
        })
        .filter(item => item.nome.length > 0)
      if (items.length > 0) return items
    } else if (typeof al === 'object') {
      const entries = Object.entries(al)
        .map(([key, val]) => {
          const nome = typeof val === 'string' ? val : (val?.nome || val?.name || '')
          return { key, nome: (nome || '').trim() }
        })
        .filter(item => item.nome.length > 0)
      if (entries.length > 0) return entries
    }
  }
  
  // Não cria alunos fictícios se o nó Alunos não estiver presente no óculos VR
  return []
})

const acaoSelecionadaObj = computed(() => {
  if (!acaoSelecionada.value) return null
  return CONFLITOS_VR.find(c => c.id === acaoSelecionada.value) || null
})

const categoriasAcoes = computed(() => {
  return [
    { id: 'todos', label: 'Todos', icon: '⚡', count: CONFLITOS_VR.length },
    { id: 'atencao', label: 'Atenção & Foco', icon: '💭', count: CONFLITOS_VR.filter(c => c.category === 'atencao').length },
    { id: 'movimento', label: 'Movimentação', icon: '🏃', count: CONFLITOS_VR.filter(c => c.category === 'movimento').length },
    { id: 'material', label: 'Materiais', icon: '🎒', count: CONFLITOS_VR.filter(c => c.category === 'material').length },
    { id: 'social', label: 'Social', icon: '👥', count: CONFLITOS_VR.filter(c => c.category === 'social').length },
    { id: 'emocional', label: 'Emocional & Conflito', icon: '🧠', count: CONFLITOS_VR.filter(c => c.category === 'emocional' || c.category === 'comportamento').length },
  ]
})

const acoesFiltradas = computed(() => {
  let list = CONFLITOS_VR
  if (categoriaAcaoAtiva.value !== 'todos') {
    if (categoriaAcaoAtiva.value === 'emocional') {
      list = list.filter(c => c.category === 'emocional' || c.category === 'comportamento')
    } else {
      list = list.filter(c => c.category === categoriaAcaoAtiva.value)
    }
  }
  if (buscaAcao.value.trim()) {
    const q = buscaAcao.value.toLowerCase().trim()
    list = list.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q)
    )
  }
  return list
})

const historicoComandos = computed(() => {
  if (!sala.value || !sala.value.comando_facilitador) return []
  const cf = sala.value.comando_facilitador
  return Object.entries(cf)
    .map(([key, data]) => ({
      key,
      ...data
    }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 10)
})

const getNomeConflito = (tipoId) => {
  const c = CONFLITOS_VR.find(item => item.id === tipoId)
  return c ? c.label : tipoId
}

const formatHoraComando = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const enviarComandoVR = async () => {
  if (cooldownDisparo.value) return

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
      texto: 'Por favor, selecione o aluno alvo no Passo 1.'
    }
    return
  }

  if (!acaoSelecionada.value) {
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Por favor, selecione a ação ou conflito no Passo 2.'
    }
    return
  }

  enviandoComando.value = true
  cooldownDisparo.value = true
  feedbackComando.value = null

  try {
    const timestampAtual = Date.now()
    const payload = {
      tipo_conflito: acaoSelecionada.value,
      aluno_alvo: alunoAlvoSelecionado.value,
      timestamp: timestampAtual
    }

    const comandosRef = dbRef(database, `classroom_configs/${sala.value.id}/comando_facilitador`)
    await push(comandosRef, payload)

    const acaoObj = CONFLITOS_VR.find(c => c.id === acaoSelecionada.value)
    feedbackComando.value = {
      tipo: 'success',
      texto: `Ação "${acaoObj?.label || acaoSelecionada.value}" disparada com sucesso para ${alunoAlvoSelecionado.value} no VR!`
    }
  } catch (error) {
    console.error("Erro ao enviar comando para o óculos VR:", error)
    feedbackComando.value = {
      tipo: 'error',
      texto: 'Ocorreu um erro ao enviar para o Firebase. Tente novamente.'
    }
  } finally {
    enviandoComando.value = false
    setTimeout(() => {
      cooldownDisparo.value = false
    }, 1200)
    setTimeout(() => {
      if (feedbackComando.value?.tipo === 'success') {
        feedbackComando.value = null
      }
    }, 6000)
  }
}

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

const getShapeName = (shape) => {
  if (shape === 1) return 'Semicírculo'
  if (shape === 2) return 'Circular'
  return 'Retangular'
}

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

// Carregamento dos dados da sala e dependências
const carregarDadosSala = async () => {
  if (!salaId.value) {
    isLoading.value = false
    return
  }

  try {
    const salaRef = dbRef(database, `classroom_configs/${salaId.value}`)
    const snap = await get(salaRef)

    if (!snap.exists()) {
      sala.value = null
      isLoading.value = false
      return
    }

    sala.value = { id: salaId.value, ...snap.val() }
    selectedActiveParticipant.value = sala.value.activeParticipantId || null
    selectedActiveOculos.value = sala.value.activeHeadsetId || null

    const instituicaoId = sala.value.instituicaoId || userData.value.instituicaoId

    // 1. Carregar nome do facilitador
    if (sala.value.facilitadorId) {
      try {
        const fSnap = await get(dbRef(database, `usuarios/${sala.value.facilitadorId}`))
        if (fSnap.exists()) {
          facilitadorNome.value = fSnap.val().nome || 'Facilitador'
        }
      } catch (e) {
        console.warn("Erro ao buscar facilitador:", e)
      }
    }

    // 2. Carregar óculos disponíveis da instituição
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

    // 3. Carregar participantes
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

    // 4. Carregar salas da instituição via QUERY INDEXADA (JAMAIS baixa a raiz inteira)
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

    iniciarListenersOtimizados()
  } catch (error) {
    console.error("Erro ao carregar dados da sala:", error)
  } finally {
    isLoading.value = false
  }
}

// =========================================================
// ASSINATURAS OTIMIZADAS (Zero sobrecarga de RTDB)
// =========================================================
const limparListeners = () => {
  if (unsubSituacao) {
    unsubSituacao()
    unsubSituacao = null
  }
  if (unsubAlunos) {
    unsubAlunos()
    unsubAlunos = null
  }
  if (unsubComandos) {
    unsubComandos()
    unsubComandos = null
  }
  if (unsubFacilitadorPlus) {
    unsubFacilitadorPlus()
    unsubFacilitadorPlus = null
  }
}

const iniciarListenersOtimizados = () => {
  limparListeners()
  if (!salaId.value) return

  // 1. Escuta estritamente o status de ativo/inativo (~15 bytes)
  const situacaoRef = dbRef(database, `classroom_configs/${salaId.value}/situacao_atual`)
  unsubSituacao = onValue(situacaoRef, (snap) => {
    if (sala.value) {
      sala.value.situacao_atual = snap.val() || { ativo: "nao" }
    }
  })

  // 2. Escuta os alunos virtuais 3D da sala (~100 bytes, fires once)
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

  // 3. Escuta APENAS os últimos 5 comandos com limitToLast(5) (nunca baixa o histórico inteiro)
  const qComandos = query(
    dbRef(database, `classroom_configs/${salaId.value}/comando_facilitador`),
    limitToLast(5)
  )
  unsubComandos = onValue(qComandos, (snap) => {
    if (sala.value) {
      sala.value.comando_facilitador = snap.val() || null
    }
  })

  // 4. Se for instituição, escuta FacilitadorPlus em tempo real
  const instId = userData.value?.instituicaoId || userData.value?.id || sala.value?.instituicaoId
  if (isInstituicao.value && instId) {
    const plusRef = dbRef(database, `instituicoes/${instId}/FacilitadorPlus`)
    unsubFacilitadorPlus = onValue(plusRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val()
        facilitadorPlusAtivo.value = val === true || val === 'true'
      } else {
        facilitadorPlusAtivo.value = false
      }
    })
  }
}

// Salvar Configurações Ativas
const salvarConfiguracoesAtivas = async () => {
  if (!podeModificarEControlar.value) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Sua instituição possui acesso de visualização. É necessário ter FacilitadorPlus para alterar configurações da sala.'
    return
  }

  if (isSalaAtiva(sala.value)) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Esta sala está ativa no momento. Não é possível alterar óculos ou participantes enquanto ela estiver ativa.'
    return
  }

  if (selectedActiveOculos.value && isOculosEmOutraSalaAtiva(selectedActiveOculos.value)) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'O óculos selecionado já está conectado a outra sala que está com status Ativa.'
    return
  }

  if (sala.value.targetType === 'grupo' && !selectedActiveParticipant.value) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Selecione o participante que estará ativo no momento.'
    return
  }

  salvandoAtivos.value = true
  mensagemAtivos.value = ''

  try {
    // Verificação em tempo real no banco
    const freshSnap = await get(dbRef(database, `classroom_configs/${sala.value.id}`))
    if (freshSnap.exists() && isSalaAtiva(freshSnap.val())) {
      sala.value = { id: sala.value.id, ...freshSnap.val() }
      tipoMensagem.value = 'error'
      mensagemAtivos.value = 'Esta sala foi ativada recentemente no óculos! Alterações bloqueadas.'
      return
    }

    const updates = {}
    let mensagemExtra = ''

    if (selectedActiveOculos.value) {
      const qOculos = query(dbRef(database, 'classroom_configs'), orderByChild('activeHeadsetId'), equalTo(selectedActiveOculos.value))
      const oculosSnap = await get(qOculos)
      if (oculosSnap.exists()) {
        const salasComOculos = oculosSnap.val()
        for (const sId in salasComOculos) {
          if (sId !== sala.value.id) {
            if (isSalaAtiva(salasComOculos[sId])) {
              tipoMensagem.value = 'error'
              mensagemAtivos.value = 'O óculos selecionado está em outra sala ativa e não pode ser transferido agora.'
              return
            }
            updates[`classroom_configs/${sId}/activeHeadsetId`] = null
            mensagemExtra = ' (Óculos movido de outra sala)'
          }
        }
      }
    }

    updates[`classroom_configs/${sala.value.id}/activeParticipantId`] = selectedActiveParticipant.value
    updates[`classroom_configs/${sala.value.id}/activeHeadsetId`] = selectedActiveOculos.value || null
    // Apaga o conjunto inteiro de Alunos (Aluno1, Aluno2, Aluno3, ...) de dentro da configuração da sala
    updates[`classroom_configs/${sala.value.id}/Alunos`] = null

    await update(dbRef(database), updates)

    // Remoção explícita de segurança para garantir que todo o nó Alunos seja limpo do Firebase
    try {
      await remove(dbRef(database, `classroom_configs/${sala.value.id}/Alunos`))
    } catch (errRemocao) {
      console.warn("Nó Alunos já removido:", errRemocao)
    }

    sala.value.activeParticipantId = selectedActiveParticipant.value
    sala.value.activeHeadsetId = selectedActiveOculos.value || null
    sala.value.Alunos = null
    alunoAlvoSelecionado.value = ''

    tipoMensagem.value = 'success'
    mensagemAtivos.value = 'Configuração da sessão salva com sucesso!' + mensagemExtra
  } catch (error) {
    console.error("Erro ao salvar configurações ativas:", error)
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoAtivos.value = false
    setTimeout(() => { mensagemAtivos.value = '' }, 5000)
  }
}

// Exclusão da Sala
const confirmarExclusaoSala = () => {
  if (!podeModificarEControlar.value) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Sua instituição possui acesso de visualização. É necessário ter FacilitadorPlus para excluir salas.'
    return
  }

  if (isSalaAtiva(sala.value)) {
    tipoMensagem.value = 'error'
    mensagemAtivos.value = 'Esta sala está com status "Ativa". Não é possível excluí-la.'
    return
  }

  const idsAutorizados = [
    userData.value.id,
    userData.value.uid,
    userData.value.authUid,
    userData.value.idCurto
  ].filter(Boolean)

  if (sala.value.facilitadorId && !idsAutorizados.includes(sala.value.facilitadorId)) {
    mensagemPermissao.value = "Você só tem permissão para excluir as salas que você mesmo criou."
  } else {
    mensagemPermissao.value = ''
  }

  modalExclusaoAberto.value = true
}

const executarExclusaoSala = async () => {
  if (!sala.value?.id) return

  if (!podeModificarEControlar.value) {
    mensagemPermissao.value = "Sua instituição possui acesso de visualização. É necessário ter FacilitadorPlus para excluir salas."
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
  limparListeners()
})
</script>

<style scoped>
/* Layout e Container Principal */
.sala-view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Barra Superior com Breadcrumb e Botão Voltar */
.top-nav-bar-glass {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 12px 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.btn-back-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 9px 16px;
  color: #334155;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.btn-back-nav:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #0071e3;
  transform: translateX(-3px);
}

.back-arrow-svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.breadcrumbs-trail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.bc-item {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
}

.bc-item:hover:not(.current) {
  color: #0071e3;
}

.bc-item.current {
  color: #0f172a;
  font-weight: 700;
}

.bc-sep {
  color: #cbd5e1;
}

/* Navbar Right Status Pill */
.session-live-pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.badge-sala-ativa {
  background: #ecfdf5;
  color: #059669;
  border: 1.5px solid #a7f3d0;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
}

.badge-sala-inativa {
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #cbd5e1;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  animation: beaconPulse 2s infinite;
}

.idle-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

@keyframes beaconPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Room Hero Glass */
.room-hero-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 16px 40px -8px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.room-hero-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.room-avatar-hud {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0, 113, 227, 0.3);
  flex-shrink: 0;
}

.avatar-vr-emoji {
  font-size: 2.2rem;
}

.room-hero-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.hero-top-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.kicker-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.8px;
}

.target-type-badge {
  font-size: 0.76rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-live-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
}

.status-live-tag.is-active {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-live-tag.is-idle {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.room-hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.6px;
  margin: 0;
  line-height: 1.2;
}

.room-hero-desc {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
  max-width: 800px;
}

/* Quick Telemetry Grid */
.telemetry-bar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.telem-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.telem-item-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.telem-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  color: #0071e3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.telem-icon svg {
  width: 18px;
  height: 18px;
}

.telem-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.telem-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.4px;
}

.telem-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.telem-value.text-green {
  color: #059669;
}

/* Alerta de Sala Ativa */
.sala-ativa-lock-alert {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.12);
  animation: fadeIn 0.3s ease;
}

.lock-alert-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.lock-alert-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #92400e;
}

.lock-alert-text strong {
  font-size: 0.95rem;
  font-weight: 700;
}

.lock-alert-text p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #b45309;
}

/* Badges de Acesso Institucional no Topo */
.role-access-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
}

.role-access-badge.access-plus {
  background: linear-gradient(135deg, #ecfdf5 0%, #f3e8ff 100%);
  color: #7c3aed;
  border: 1px solid #d8b4fe;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.12);
}

.role-access-badge.access-readonly {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

/* Alerta Institucional de Modo Somente Leitura */
.instituicao-readonly-alert {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
  animation: fadeIn 0.3s ease;
}

.readonly-alert-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.readonly-alert-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #1e40af;
}

.readonly-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.readonly-title-wrap strong {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e3a8a;
}

.readonly-tag-badge {
  font-size: 0.72rem;
  font-weight: 800;
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  padding: 2px 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.readonly-alert-text p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: #1e40af;
}

.readonly-inline-hint {
  margin: 8px 0 0 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Banner de Visualização Dentro do Menu 3 */
.vr-readonly-mode-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
}

.vr-readonly-banner-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.vr-readonly-banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vr-readonly-banner-text strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.vr-readonly-banner-text p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
}

.card-disabled {
  opacity: 0.55 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  filter: grayscale(40%);
}

.btn-disabled {
  opacity: 0.55 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

/* Canvas Grid de Configuração (2 Colunas Amplas) */
.room-canvas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  position: relative;
  z-index: 50;
}

.room-canvas-grid.has-dropdown-open {
  z-index: 9999 !important;
}

@media (max-width: 960px) {
  .room-canvas-grid {
    grid-template-columns: 1fr;
  }
}

.canvas-card-module {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 22px;
  padding: 24px 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: all 0.25s ease;
  position: relative;
  z-index: 10;
}

.canvas-card-module.has-dropdown-open,
.canvas-card-module:has(.custom-oculos-dropdown-container.is-open) {
  z-index: 10000 !important;
}

.canvas-card-module.is-collapsed {
  gap: 0;
}

.canvas-card-module.module-locked {
  background: rgba(248, 250, 252, 0.85);
  border-color: #e2e8f0;
}

.module-header-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

/* Accordion & Cabeçalhos Clicáveis */
.clickable-accordion-header {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.clickable-accordion-header:hover {
  opacity: 0.92;
}

.header-locked-disabled {
  cursor: not-allowed !important;
  user-select: none;
  opacity: 0.72;
}

.header-locked-disabled * {
  cursor: not-allowed !important;
}

.accordion-chevron-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, color 0.2s;
}

.clickable-accordion-header:hover .accordion-chevron-box {
  background: #e2e8f0;
  color: #0f172a;
}

.accordion-chevron-box.is-flipped {
  transform: rotate(180deg);
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #0071e3;
}

.accordion-lock-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fee2e2;
  border: 1.5px solid #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: not-allowed;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.header-right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.module-collapsed-summary {
  margin-top: 6px;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 3px 10px;
  border-radius: 8px;
}

.summary-chip.purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
  color: #6d28d9;
}

.summary-chip.locked {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

/* Transição do Acordeão */
.accordion-slide-enter-active,
.accordion-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.accordion-slide-enter-from,
.accordion-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.module-number-badge {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.module-header-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.module-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.module-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.module-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.35;
}

.hardware-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 11px;
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
  font-size: 0.74rem;
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
  z-index: 100;
}

.custom-oculos-dropdown-container.is-open {
  z-index: 50000 !important;
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
  padding: 12px 18px;
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
  gap: 14px !important;
  min-width: 0;
  flex: 1;
}

.headset-icon-box {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
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
  font-size: 0.96rem;
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
  font-size: 0.94rem;
  font-weight: 600;
  color: #64748b;
}

.placeholder-oculos-sub {
  font-size: 0.78rem;
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
  z-index: 999999 !important;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1.5px solid rgba(0, 113, 227, 0.25);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2), 0 8px 24px rgba(0, 113, 227, 0.12);
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
  margin-bottom: 8px;
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
  padding: 10px 14px;
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
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 1.25rem;
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
  color: #059669;
}

.item-status-avail {
  font-size: 0.74rem;
  color: #64748b;
}

.item-check {
  color: #0071e3;
  font-weight: 800;
  font-size: 1rem;
}

.item-action-indicator {
  flex-shrink: 0;
}

.badge-selected-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: #0071e3;
  color: #ffffff;
  padding: 3px 9px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.badge-locked-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  padding: 3px 9px;
  border-radius: 6px;
}

.action-arrow-sub {
  font-size: 0.76rem;
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
}

.preview-sub {
  font-size: 0.76rem;
  color: #475569;
  font-weight: 500;
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
}

.warn-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Digital Student Pass */
.digital-student-pass {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border: 1.5px solid #bfdbfe;
  border-radius: 16px;
  padding: 16px 20px;
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
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 1.15rem;
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
}

.pass-role-micro {
  font-size: 0.65rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.6px;
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
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.pass-email {
  font-size: 0.82rem;
  color: #64748b;
}

/* Grupo Selection Zone */
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
  background: none;
  border: none;
}

.clear-search-btn:hover {
  color: #ef4444;
}

.student-cards-scrollable {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
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

.student-hud-card:hover:not(.is-disabled) {
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

.student-hud-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.7;
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
}

.st-hud-email {
  font-size: 0.78rem;
  color: #64748b;
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
  margin-top: 4px;
}

.feedback-toast-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 600;
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

/* Actions Zone */
.actions-zone-glass {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.btn-confirm-session-tech {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 360px;
  padding: 15px 28px;
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

/* Zona de Perigo */
.danger-zone-box {
  padding: 20px 24px;
  background: #fff5f5;
  border: 1.5px dashed #fca5a5;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.danger-zone-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  flex: 1;
  min-width: 240px;
}

.danger-zone-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #b91c1c;
  display: flex;
  align-items: center;
  gap: 6px;
}

.danger-zone-desc {
  font-size: 0.82rem;
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
  padding: 12px 20px;
  font-size: 0.88rem;
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

.btn-back-link {
  background: #0071e3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
}

/* Modal de Exclusão */
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
  box-shadow: 0 25px 60px -15px rgba(220, 38, 38, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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

/* ===================================================
   MÓDULO 03: CENTRO DE INTERAÇÃO & COMANDOS VR
   =================================================== */
.vr-interaction-module-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.vr-interaction-module-glass.is-active-session {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 16px 48px rgba(16, 185, 129, 0.08), 0 4px 20px rgba(0, 113, 227, 0.06);
}

.vr-interaction-module-glass.is-locked-session {
  border-color: rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.6);
}

.accent-purple {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35) !important;
}

.live-active-pulse {
  background: rgba(16, 185, 129, 0.12) !important;
  border-color: rgba(16, 185, 129, 0.35) !important;
  color: #059669 !important;
  font-weight: 700 !important;
}

.pulse-beacon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseBeaconDot 1.8s infinite;
}

@keyframes pulseBeaconDot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.locked-badge {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #64748b !important;
}

.lock-icon-mini {
  font-size: 0.85rem;
}

.vr-students-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.vr-students-count-chip .count-num {
  font-size: 1.1rem;
  font-weight: 800;
  color: #6366f1;
}

.vr-students-count-chip .count-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vr-interact-locked-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-left: 5px solid #f59e0b;
  border-radius: 14px;
  padding: 16px 20px;
  color: #92400e;
}

.locked-banner-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.locked-banner-content strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 3px;
  color: #78350f;
}

.locked-banner-content p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #92400e;
}

.vr-interact-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: opacity 0.25s ease;
}

.vr-interact-body.controls-disabled {
  opacity: 0.55;
  pointer-events: none;
  filter: grayscale(0.2);
  user-select: none;
}

.interact-step-box {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 22px 24px;
}

.step-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.step-subhead-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subhead-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #6366f1;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subhead-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.selected-target-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  color: #1d4ed8;
  font-size: 0.82rem;
}

.selected-target-pill strong {
  font-weight: 800;
  color: #0071e3;
}

.pending-target-pill {
  font-size: 0.82rem;
  color: #94a3b8;
  font-style: italic;
}

/* Chips de Alunos 3D */
.vr-target-students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.vr-student-target-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
}

.vr-student-target-btn:hover:not(:disabled) {
  border-color: #6366f1;
  background: #fbfbfe;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.12);
}

.vr-student-target-btn.is-selected {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border-color: #4f46e5;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
  transform: translateY(-2px);
}

.target-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.vr-student-target-btn.is-selected .target-avatar {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.target-name-wrap {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.target-name {
  font-size: 0.92rem;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.target-slot-code {
  font-size: 0.7rem;
  color: #64748b;
}

.vr-student-target-btn.is-selected .target-slot-code {
  color: rgba(255, 255, 255, 0.8);
}

.target-check-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #10b981;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.empty-vr-students-warn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: #fffbeb;
  border: 1.5px dashed #fcd34d;
  border-radius: 16px;
  text-align: left;
}

.empty-warn-icon-box {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.empty-warn-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.empty-warn-title {
  font-size: 0.96rem;
  font-weight: 800;
  color: #92400e;
}

.empty-warn-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #b45309;
  line-height: 1.4;
}

.vr-students-notfound-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #b45309;
}

.notfound-target-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 9999px;
  color: #b45309;
  font-size: 0.82rem;
  font-weight: 700;
}

/* Passo B: Seletor de Conflitos */
.step-subhead-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 16px;
}

.action-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 8px 14px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
}

.search-mini-svg {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  flex-shrink: 0;
}

.action-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.88rem;
  color: #1e293b;
  width: 100%;
}

.action-search-input::placeholder {
  color: #94a3b8;
}

.action-category-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 16px;
  scrollbar-width: thin;
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.cat-pill:hover:not(:disabled) {
  background: #f1f5f9;
  color: #1e293b;
}

.cat-pill.active {
  background: #1e293b;
  color: #ffffff;
  border-color: #1e293b;
}

.cat-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
}

.cat-pill.active .cat-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Grid de Cards de Ações */
.vr-actions-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.action-choice-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  position: relative;
}

.action-choice-card:hover:not(.card-disabled) {
  border-color: #6366f1;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

.action-choice-card.is-selected {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-color: #6366f1;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  transform: translateY(-3px);
}

.action-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-emoji-symbol {
  font-size: 1.7rem;
}

.action-selected-tag {
  font-size: 0.72rem;
  font-weight: 800;
  background: #6366f1;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.action-title-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.action-desc-text {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
}

.action-card-footer {
  margin-top: 4px;
}

.action-code-tag {
  font-family: monospace;
  font-size: 0.72rem;
  padding: 3px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  display: inline-block;
}

.action-choice-card.is-selected .action-code-tag {
  background: rgba(99, 102, 241, 0.15);
  color: #4338ca;
  font-weight: 700;
}

.empty-actions-result {
  grid-column: 1 / -1;
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Feedback Toast */
.command-feedback-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 700;
  margin-top: 10px;
}

.command-feedback-toast.success {
  background: #ecfdf5;
  border: 1.5px solid #a7f3d0;
  color: #065f46;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
}

.command-feedback-toast.error {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #991b1b;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
}

.toast-indicator-icon {
  font-size: 1.2rem;
}

/* Barra de Disparo */
.command-dispatch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px 24px;
  margin-top: 8px;
}

.dispatch-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-target-info,
.summary-action-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-lbl {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.summary-val {
  font-size: 0.95rem;
  color: #1e293b;
}

.summary-sep {
  font-size: 1.2rem;
  color: #cbd5e1;
}

.btn-dispatch-command {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.96rem;
  border: none;
  border-radius: 14px;
  padding: 14px 28px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.btn-dispatch-command:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.45);
}

.btn-dispatch-command:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.dispatch-svg {
  width: 18px;
  height: 18px;
}

/* Feed de Comandos Recentes */
.recent-commands-feed {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 10px;
}

.feed-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.feed-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feed-count-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 999px;
}

.commands-feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.command-feed-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.85rem;
}

.feed-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.feed-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.feed-time {
  font-family: monospace;
  font-size: 0.78rem;
  color: #94a3b8;
}

.feed-aluno {
  font-weight: 800;
  color: #1e293b;
}

.feed-arrow {
  color: #cbd5e1;
}

.feed-conflito {
  font-weight: 600;
  color: #4f46e5;
}

.feed-code {
  font-family: monospace;
  font-size: 0.72rem;
  color: #64748b;
}

.feed-check-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 6px;
}

/* Animations */
.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.glass-modal-enter-active, .glass-modal-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-modal-enter-from, .glass-modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}
</style>
