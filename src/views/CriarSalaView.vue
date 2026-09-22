<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <!-- Toast Flutuante Global de Alta Visibilidade -->
    <transition name="toast-slide">
      <div v-if="toastNotificacao.visivel" :class="['floating-toast', toastNotificacao.tipo]">
        <div class="toast-icon-circle">
          <span v-if="toastNotificacao.tipo === 'success'">✓</span>
          <span v-else-if="toastNotificacao.tipo === 'error'">✕</span>
          <span v-else>ℹ</span>
        </div>
        <div class="toast-text-group">
          <span class="toast-title">{{ toastNotificacao.titulo }}</span>
          <span class="toast-message">{{ toastNotificacao.mensagem }}</span>
        </div>
        <button type="button" class="toast-close-btn" @click="fecharToast" title="Fechar notificação">&times;</button>
      </div>
    </transition>

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
        <p>A carregar o ambiente...</p>
      </div>

      <div v-else class="form-container-glass stagger-in-2">
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass notranslate" translate="no">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Configurador de Ambientes VR</span>
              </div>
              <h1 class="welcome-title">Criar Nova Sala de Aula VR</h1>
              <p class="welcome-subtitle">Personalize a geometria da sala virtual, distribuição de mesas e defina o público-alvo.</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="salvarConfiguracao" class="glass-form-card">
          
          <!-- Seção 1: Público-Alvo -->
          <div class="form-step-section">
            <div class="step-badge-row">
              <span class="step-num">1</span>
              <h3 class="step-title">Definir Público-Alvo da Sala</h3>
            </div>

            <!-- Radio Cards Interativos -->
            <div class="target-type-selector">
              <label :class="['target-card-option', { active: form.targetType === 'grupo' }]">
                <input type="radio" v-model="form.targetType" value="grupo" class="hidden-radio" />
                <div class="target-card-icon">👥</div>
                <div class="target-card-info">
                  <span class="target-card-title">Para uma Turma / Grupo</span>
                  <span class="target-card-desc">Vincule a um grupo com múltiplos participantes</span>
                </div>
                <div class="target-check-mark" v-if="form.targetType === 'grupo'">✓</div>
              </label>

              <label :class="['target-card-option', { active: form.targetType === 'aluno' }]">
                <input type="radio" v-model="form.targetType" value="aluno" class="hidden-radio" />
                <div class="target-card-icon">👤</div>
                <div class="target-card-info">
                  <span class="target-card-title">Para um Aluno Individual</span>
                  <span class="target-card-desc">Sessão dedicada para um único estudante</span>
                </div>
                <div class="target-check-mark" v-if="form.targetType === 'aluno'">✓</div>
              </label>
            </div>

            <!-- Dropdown Grupo -->
            <div v-if="form.targetType === 'grupo'" class="target-select-glass">
              <label class="input-label-glass">
                <span class="label-icon">📂</span>
                Selecione o Grupo de Alunos
              </label>
              <select v-model="form.targetId" class="glass-input-field" required>
                <option value="" disabled>Escolha um grupo disponível...</option>
                <option v-for="grupo in gruposDisponiveis" :key="grupo.id" :value="grupo.id" class="notranslate" translate="no">
                  {{ grupo.nome }} ({{ grupo.participantes ? grupo.participantes.length : 0 }} participantes)
                </option>
              </select>
              <p v-if="gruposDisponiveis.length === 0" class="empty-error-hint">Nenhum grupo cadastrado por você. Crie um grupo primeiro.</p>
            </div>

            <!-- Dropdown Aluno -->
            <div v-if="form.targetType === 'aluno'" class="target-select-glass">
              <label class="input-label-glass">
                <span class="label-icon">🎓</span>
                Selecione o Aluno
              </label>
              <select v-model="form.targetId" class="glass-input-field" required>
                <option value="" disabled>Escolha um aluno cadastrado...</option>
                <option v-for="aluno in alunosDisponiveis" :key="aluno.id" :value="aluno.id" class="notranslate" translate="no">
                  {{ aluno.nome }} ({{ aluno.email }})
                </option>
              </select>
              <p v-if="alunosDisponiveis.length === 0" class="empty-error-hint">Nenhum aluno cadastrado na instituição.</p>
            </div>
          </div>

          <div class="divider-glass"></div>

          <!-- Seção 2: Parâmetros da Sala VR -->
          <div class="form-step-section">
            <div class="step-header-with-actions">
              <div class="step-badge-row">
                <span class="step-num">2</span>
                <div class="step-title-group">
                  <h3 class="step-title">Parâmetros do Cenário Virtual</h3>
                  <p class="step-subtitle-desc">Configure a geometria ou carregue um modelo pronto da instituição</p>
                </div>
              </div>

              <!-- Ações Rápidas de Modelo -->
              <div class="model-quick-actions">
                <button 
                  type="button" 
                  class="btn-quick-model btn-load-model"
                  @click="abrirModalCarregarModelo"
                  title="Carregar um modelo pré-configurado"
                >
                  <span class="btn-icon">📂</span>
                  <span>Carregar Modelo Pronto</span>
                  <span v-if="modelosDisponiveis.length > 0" class="model-count-pill">{{ modelosDisponiveis.length }}</span>
                </button>

                <button 
                  type="button" 
                  class="btn-quick-model btn-save-model"
                  @click="abrirModalSalvarModelo"
                  title="Salvar esta configuração como modelo para a instituição"
                >
                  <span class="btn-icon">💾</span>
                  <span>Salvar como Modelo</span>
                </button>
              </div>
            </div>

            <div class="input-group-glass full-width">
              <label class="input-label-glass">
                <span class="label-icon">🏷️</span>
                Nome da Sala de Aula <span class="hint-text">(Identificação visual)</span>
              </label>
              <input 
                type="text" 
                v-model="form.roomName" 
                class="glass-input-field" 
                placeholder="Ex: Laboratório de Física e Robótica" 
                required 
              />
            </div>

            <div class="grid-form-fields">
              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">📐</span>
                  Formato da Sala (Shape)
                </label>
                <select v-model.number="form.shape" class="glass-input-field" required>
                  <option value="0">0 - Retangular / Padrão</option>
                  <option value="1">1 - Semicírculo</option>
                  <option value="2">2 - Circular</option>
                </select>
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">👦</span>
                  Meninos (numBoys)
                </label>
                <input type="number" v-model.number="form.numBoys" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">👧</span>
                  Meninas (numGirls)
                </label>
                <input type="number" v-model.number="form.numGirls" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">🪑</span>
                  Mesas (numDesks)
                </label>
                <input type="number" v-model.number="form.numDesks" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">↔️</span>
                  Fileiras (rows)
                </label>
                <input type="number" v-model.number="form.rows" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">↕️</span>
                  Colunas (cols)
                </label>
                <input type="number" v-model.number="form.cols" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">⭕</span>
                  Raio (radius)
                </label>
                <input type="number" step="0.1" v-model.number="form.radius" class="glass-input-field" min="0" required />
              </div>

              <div class="input-group-glass">
                <label class="input-label-glass">
                  <span class="label-icon">🏛️</span>
                  Max. Mesas Semicírculo
                </label>
                <input type="number" v-model.number="form.maxDesksInSemiCircle" class="glass-input-field" min="0" required />
              </div>
            </div>
          </div>

          <!-- Rodapé do Formulário -->
          <div class="form-actions-footer">
            <router-link to="/home" class="btn-cancel-glass">Cancelar</router-link>
            <button 
              type="button" 
              class="btn-save-template-glass" 
              @click="abrirModalSalvarModelo"
              :disabled="isSaving || isSavingModel"
              title="Salvar a geometria atual como modelo compartilhado para a instituição"
            >
              <span class="btn-icon">💾</span>
              <span>Salvar Modelo</span>
            </button>
            <button type="submit" class="btn-submit-glass" :disabled="isSaving || !isFormValid">
              <span v-if="isSaving" class="spinner-btn"></span>
              <span>{{ isSaving ? 'Criando Sala VR...' : 'Criar e Salvar Sala VR' }}</span>
            </button>
          </div>

        </form>

        <!-- MODAL: Carregar Modelo Pronto -->
        <div v-if="modalCarregarAberto" class="modal-overlay" @click.self="fecharModalCarregar">
          <div class="modal-glass-container modal-large">
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">SALAS MODELO</span>
                <h2 class="modal-title">Carregar Configuração Pronta</h2>
                <p class="modal-subtitle">Selecione um modelo para preencher instantaneamente os parâmetros do cenário virtual.</p>
              </div>
              <button type="button" class="close-btn" @click="fecharModalCarregar">&times;</button>
            </div>

            <!-- Abas de Navegação de Modelos -->
            <div class="modal-tabs-bar">
              <button 
                type="button" 
                :class="['tab-pill', { active: tabModeloAtiva === 'instituicao' }]"
                @click="tabModeloAtiva = 'instituicao'"
              >
                <span>🏫 Modelos da Instituição</span>
                <span class="tab-badge">{{ modelosDisponiveis.length }}</span>
              </button>
              <button 
                type="button" 
                :class="['tab-pill', { active: tabModeloAtiva === 'padrao' }]"
                @click="tabModeloAtiva = 'padrao'"
              >
                <span>✨ Modelos Padrão do Sistema</span>
                <span class="tab-badge">{{ modelosPadrao.length }}</span>
              </button>
            </div>

            <div class="modal-body-scrollable">
              <!-- Aba 1: Modelos Customizados da Instituição -->
              <div v-if="tabModeloAtiva === 'instituicao'">
                <div v-if="modelosDisponiveis.length === 0" class="empty-model-state">
                  <div class="empty-icon">📂</div>
                  <h4>Nenhum modelo personalizado salvo</h4>
                  <p>Sua instituição ainda não possui salas modelo salvas pelos facilitadores.</p>
                  <p class="empty-sub">Configure os parâmetros da sala e clique em <strong>"Salvar como Modelo"</strong> para disponibilizar para toda a equipe!</p>
                </div>

                <div v-else class="models-grid">
                  <div 
                    v-for="modelo in modelosDisponiveis" 
                    :key="modelo.id" 
                    class="model-card-item"
                  >
                    <div class="model-card-top">
                      <span class="model-shape-badge" :class="'shape-' + modelo.shape">
                        {{ getShapeLabel(modelo.shape) }}
                      </span>
                      <button 
                        v-if="podeExcluirModelo(modelo)"
                        type="button" 
                        class="btn-delete-model"
                        title="Excluir este modelo"
                        @click="confirmarExclusaoModelo(modelo)"
                      >
                        🗑️
                      </button>
                    </div>

                    <h4 class="model-name">{{ modelo.nomeModelo || modelo.roomName || 'Modelo sem Nome' }}</h4>
                    <p v-if="modelo.roomName && modelo.roomName !== modelo.nomeModelo" class="model-subname">
                      Nome da sala: <em>{{ modelo.roomName }}</em>
                    </p>

                    <!-- Tags com detalhes dos parâmetros -->
                    <div class="model-params-tags">
                      <span class="param-tag">🪑 <strong>{{ modelo.numDesks || 0 }}</strong> mesas</span>
                      <span class="param-tag">👦 <strong>{{ modelo.numBoys || 0 }}</strong> meninos</span>
                      <span class="param-tag">👧 <strong>{{ modelo.numGirls || 0 }}</strong> meninas</span>
                      <span v-if="Number(modelo.shape) === 0" class="param-tag">↔️ {{ modelo.rows || 0 }}x{{ modelo.cols || 0 }}</span>
                      <span v-if="Number(modelo.shape) === 1" class="param-tag">🏛️ Max: {{ modelo.maxDesksInSemiCircle || 0 }}</span>
                      <span v-if="modelo.radius" class="param-tag">⭕ Raio: {{ modelo.radius }}m</span>
                    </div>

                    <div class="model-card-footer">
                      <div class="model-author-meta">
                        <span class="author-label">Criado por:</span>
                        <span class="author-name notranslate" translate="no">{{ modelo.criadoPor || 'Facilitador' }}</span>
                      </div>
                      <button 
                        type="button" 
                        class="btn-apply-model"
                        @click="aplicarModelo(modelo)"
                      >
                        Carregar Modelo ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aba 2: Modelos Padrão do Sistema -->
              <div v-if="tabModeloAtiva === 'padrao'">
                <div class="models-grid">
                  <div 
                    v-for="modelo in modelosPadrao" 
                    :key="modelo.id" 
                    class="model-card-item preset"
                  >
                    <div class="model-card-top">
                      <span class="model-shape-badge" :class="'shape-' + modelo.shape">
                        {{ getShapeLabel(modelo.shape) }}
                      </span>
                      <span class="preset-tag">Padrão Didascalias</span>
                    </div>

                    <h4 class="model-name">{{ modelo.nomeModelo }}</h4>
                    <p class="model-desc-preset">{{ modelo.descricao }}</p>

                    <!-- Tags com detalhes dos parâmetros -->
                    <div class="model-params-tags">
                      <span class="param-tag">🪑 <strong>{{ modelo.numDesks }}</strong> mesas</span>
                      <span class="param-tag">👦 <strong>{{ modelo.numBoys }}</strong> meninos</span>
                      <span class="param-tag">👧 <strong>{{ modelo.numGirls }}</strong> meninas</span>
                      <span v-if="Number(modelo.shape) === 0" class="param-tag">↔️ {{ modelo.rows }}x{{ modelo.cols }}</span>
                      <span v-if="Number(modelo.shape) === 1" class="param-tag">🏛️ Max: {{ modelo.maxDesksInSemiCircle }}</span>
                      <span v-if="modelo.radius" class="param-tag">⭕ Raio: {{ modelo.radius }}m</span>
                    </div>

                    <div class="model-card-footer">
                      <button 
                        type="button" 
                        class="btn-apply-model preset-btn"
                        @click="aplicarModelo(modelo)"
                      >
                        Carregar Modelo ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel-glass" @click="fecharModalCarregar">Fechar</button>
            </div>
          </div>
        </div>

        <!-- MODAL: Salvar como Sala Modelo -->
        <div v-if="modalSalvarAberto" class="modal-overlay" @click.self="fecharModalSalvar">
          <div class="modal-glass-container">
            <div class="modal-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag">COMPARTILHAR COM A INSTITUIÇÃO</span>
                <h2 class="modal-title">Salvar Sala Modelo</h2>
                <p class="modal-subtitle">Qualquer outro facilitador da instituição poderá usar este modelo pronto.</p>
              </div>
              <button type="button" class="close-btn" @click="fecharModalSalvar">&times;</button>
            </div>

            <div class="modal-body">
              <!-- Alerta de Erro INTERNO no Menu Suspenso de Salvação -->
              <div v-if="modalSalvarErro" class="modal-alert-box error">
                <div class="modal-alert-icon-wrap">⚠️</div>
                <div class="modal-alert-content">
                  <strong class="modal-alert-title">Não foi possível salvar o modelo</strong>
                  <p class="modal-alert-desc">{{ modalSalvarErro }}</p>
                </div>
                <button type="button" class="modal-alert-close" @click="modalSalvarErro = ''">&times;</button>
              </div>

              <div class="input-group-glass full-width">
                <label class="input-label-glass">
                  <span class="label-icon">🏷️</span>
                  Nome do Modelo de Sala
                </label>
                <input 
                  type="text" 
                  v-model="nomeNovoModelo" 
                  class="glass-input-field" 
                  placeholder="Ex: Laboratório Padrão - 20 Lugares"
                  required
                  @input="modalSalvarErro = ''"
                  @keydown.enter.prevent="salvarModeloConfirmado"
                />
                <span class="hint-text">Dê um nome intuitivo para facilitar a busca pelos outros facilitadores.</span>
              </div>

              <!-- Resumo da Configuração que será salva -->
              <div class="model-preview-box">
                <h5 class="preview-title">Resumo dos Parâmetros a Salvar:</h5>
                <div class="preview-grid">
                  <div class="preview-item">
                    <span class="item-label">Formato:</span>
                    <span class="item-value">{{ getShapeLabel(form.shape) }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="item-label">Mesas:</span>
                    <span class="item-value">{{ form.numDesks }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="item-label">Meninos / Meninas:</span>
                    <span class="item-value">{{ form.numBoys }} / {{ form.numGirls }}</span>
                  </div>
                  <div class="preview-item" v-if="Number(form.shape) === 0">
                    <span class="item-label">Fileiras x Colunas:</span>
                    <span class="item-value">{{ form.rows }} x {{ form.cols }}</span>
                  </div>
                  <div class="preview-item" v-if="Number(form.shape) === 1">
                    <span class="item-label">Max. Semicírculo:</span>
                    <span class="item-value">{{ form.maxDesksInSemiCircle }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="item-label">Raio:</span>
                    <span class="item-value">{{ form.radius }}m</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel-glass" @click="fecharModalSalvar" :disabled="isSavingModel">
                Cancelar
              </button>
              <button 
                type="button" 
                class="btn-save-confirm" 
                @click="salvarModeloConfirmado"
                :disabled="isSavingModel || !nomeNovoModelo.trim()"
              >
                <span v-if="isSavingModel" class="spinner-btn"></span>
                <span>{{ isSavingModel ? 'Salvando...' : 'Confirmar e Salvar Modelo' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- MODAL: Confirmar Exclusão de Modelo -->
        <div v-if="modeloParaExcluir" class="modal-overlay delete-overlay" @click.self="modeloParaExcluir = null">
          <div class="modal-glass-container modal-small">
            <div class="modal-header delete-header">
              <div class="modal-title-wrapper">
                <span class="modal-tag delete-tag">ATENÇÃO</span>
                <h2 class="modal-title">Excluir Sala Modelo?</h2>
              </div>
              <button type="button" class="close-btn" @click="modeloParaExcluir = null">&times;</button>
            </div>
            <div class="modal-body">
              <p>Tem certeza de que deseja excluir o modelo <strong>"{{ modeloParaExcluir.nomeModelo || modeloParaExcluir.roomName }}"</strong>?</p>
              <p class="delete-warning-text">Ele será removido do catálogo de todos os facilitadores da instituição.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel-glass" @click="modeloParaExcluir = null">Cancelar</button>
              <button type="button" class="btn-confirm-delete" @click="executarExclusaoModelo">Excluir Modelo</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get, push, set, query, orderByChild, equalTo, remove } from 'firebase/database'
import { useAuthStore } from '../stores/auth'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const isSaving = ref(false)
const userData = ref({})

const gruposDisponiveis = ref([])
const alunosDisponiveis = ref([])
const modelosDisponiveis = ref([])

// Estados dos Modais de Sala Modelo
const modalCarregarAberto = ref(false)
const modalSalvarAberto = ref(false)
const nomeNovoModelo = ref('')
const isSavingModel = ref(false)
const modalSalvarErro = ref('')
const modeloParaExcluir = ref(null)
const tabModeloAtiva = ref('instituicao')

// Sistema de Notificações Toast Flutuantes de Alta Visibilidade
const toastNotificacao = reactive({
  visivel: false,
  tipo: 'success', // 'success' | 'error' | 'info'
  titulo: '',
  mensagem: ''
})
let toastTimeout = null

const exibirAlerta = (tipo, mensagem, titulo = '') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  
  toastNotificacao.tipo = tipo
  toastNotificacao.mensagem = mensagem
  toastNotificacao.titulo = titulo || (tipo === 'success' ? 'Sucesso!' : tipo === 'error' ? 'Atenção' : 'Informação')
  toastNotificacao.visivel = true

  toastTimeout = setTimeout(() => {
    toastNotificacao.visivel = false
  }, 4500)
}

const fecharToast = () => {
  toastNotificacao.visivel = false
  if (toastTimeout) clearTimeout(toastTimeout)
}

// Modelos Padrão / Sugeridos do Sistema
const modelosPadrao = [
  {
    id: 'padrao_retangular',
    nomeModelo: 'Sala Tradicional (Fileiras)',
    descricao: 'Disposição convencional retangular com fileiras organizadas, ideal para aulas expositivas.',
    roomName: 'Sala de Aula Tradicional',
    shape: 0,
    numBoys: 10,
    numGirls: 10,
    numDesks: 20,
    rows: 4,
    cols: 5,
    radius: 10,
    maxDesksInSemiCircle: 0
  },
  {
    id: 'padrao_semicirculo',
    nomeModelo: 'Auditório / Anfiteatro',
    descricao: 'Disposição em semicírculo com foco frontal, ideal para apresentações e debates dinâmicos.',
    roomName: 'Auditório em Semicírculo',
    shape: 1,
    numBoys: 12,
    numGirls: 12,
    numDesks: 24,
    rows: 3,
    cols: 8,
    radius: 12,
    maxDesksInSemiCircle: 12
  },
  {
    id: 'padrao_circular',
    nomeModelo: 'Roda de Conversa (Circular)',
    descricao: 'Disposição em círculo 360°, promovendo integração horizontal de todos os participantes.',
    roomName: 'Círculo de Discussão',
    shape: 2,
    numBoys: 8,
    numGirls: 8,
    numDesks: 16,
    rows: 1,
    cols: 16,
    radius: 8,
    maxDesksInSemiCircle: 0
  }
]

const form = reactive({
  targetType: 'grupo',
  targetId: '',
  roomName: '',
  numBoys: 0,
  numGirls: 0,
  numDesks: 0,
  shape: 0,
  rows: 0,
  cols: 0,
  radius: 10.0,
  maxDesksInSemiCircle: 0
})

const initials = computed(() => {
  const nome = (userData.value.nome || '?').trim()
  const nomes = nome.split(/\s+/)
  if (nomes.length === 1) {
    return nomes[0].length <= 4 ? nomes[0].toUpperCase() : nomes[0].substring(0, 2).toUpperCase()
  }
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const isFormValid = computed(() => {
  if (!form.targetId) return false
  if (!form.roomName.trim()) return false
  return true
})

const getShapeLabel = (s) => {
  const val = Number(s)
  if (val === 1) return '1 - Semicírculo'
  if (val === 2) return '2 - Circular'
  return '0 - Retangular'
}

onMounted(async () => {
  try {
    const profile = await authStore.getUserProfile()
    if (profile && profile.tipo !== 'indefinido') {
      userData.value = profile
      const t = String(profile.tipo || '').toLowerCase()
      const tc = String(profile.tipoCadastro || '').toLowerCase()
      const isInst = t.includes('institui') || tc.includes('institui')
      const isPlus = profile.FacilitadorPlus === true || profile.FacilitadorPlus === 'true'

      if (isInst && !isPlus) {
        router.push('/home')
        return
      }

      await fetchDependencias(profile.instituicaoId || profile.id, profile.id)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
  } finally {
    isLoading.value = false
  }
})

const carregarModelosInstituicao = async (instId) => {
  const targetInstId = String(instId || userData.value?.instituicaoId || userData.value?.id || '').trim()
  if (!targetInstId) return

  try {
    const lista = []

    // 1. Tenta buscar em instituicoes/${targetInstId}/salas_modelo
    try {
      const modelosRef = dbRef(database, `instituicoes/${targetInstId}/salas_modelo`)
      const modelosSnap = await get(modelosRef)
      if (modelosSnap.exists()) {
        const data = modelosSnap.val()
        Object.keys(data).forEach(key => {
          lista.push({ id: key, ...data[key] })
        })
      }
    } catch (e) {
      console.warn("Aviso ao buscar em instituicoes/.../salas_modelo:", e)
    }

    // 2. Fallback: busca também em salas_modelo na raiz filtrando pela instituição
    try {
      const qRoot = query(dbRef(database, 'salas_modelo'), orderByChild('instituicaoId'), equalTo(targetInstId))
      const rootSnap = await get(qRoot)
      if (rootSnap.exists()) {
        const dataRoot = rootSnap.val()
        Object.keys(dataRoot).forEach(key => {
          if (!lista.some(item => item.id === key)) {
            lista.push({ id: key, ...dataRoot[key] })
          }
        })
      }
    } catch (e) {
      console.warn("Aviso ao buscar em salas_modelo raiz:", e)
    }

    modelosDisponiveis.value = lista.reverse()
  } catch (error) {
    console.error("Erro ao carregar salas modelo:", error)
  }
}

const fetchDependencias = async (instituicaoId, facilitadorId) => {
  if (!instituicaoId) return

  try {
    // 1. Buscar Grupos do Facilitador
    const gruposRef = dbRef(database, `instituicoes/${instituicaoId}/grupos`)
    const gruposSnap = await get(gruposRef)
    if (gruposSnap.exists()) {
      const gruposData = gruposSnap.val()
      gruposDisponiveis.value = Object.keys(gruposData)
        .map(key => ({ id: key, ...gruposData[key] }))
        .filter(g => g.facilitadorId === facilitadorId)
    }

    // 2. Buscar Usuários/Alunos da Instituição via Query Indexada
    const qUsers = query(dbRef(database, 'usuarios'), orderByChild('instituicaoId'), equalTo(instituicaoId))
    const usersSnap = await get(qUsers)
    if (usersSnap.exists()) {
      const todosUsuarios = usersSnap.val()
      alunosDisponiveis.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.tipoCadastro === 'Usuario' || u.tipo === 'Usuario')
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    } else {
      alunosDisponiveis.value = []
    }

    // 3. Buscar Salas Modelo da Instituição
    await carregarModelosInstituicao(instituicaoId)
  } catch (error) {
    console.error("Erro ao buscar dependências:", error)
  }
}

// Controladores dos Modais de Sala Modelo
const abrirModalSalvarModelo = () => {
  nomeNovoModelo.value = form.roomName.trim() || ''
  modalSalvarErro.value = ''
  modalSalvarAberto.value = true
}

const fecharModalSalvar = () => {
  modalSalvarAberto.value = false
  modalSalvarErro.value = ''
  nomeNovoModelo.value = ''
}

const salvarModeloConfirmado = async () => {
  const nome = nomeNovoModelo.value.trim()
  if (!nome) {
    modalSalvarErro.value = 'Por favor, informe um nome para a Sala Modelo.'
    return
  }

  const instId = String(userData.value?.instituicaoId || userData.value?.id || userData.value?.uid || authStore.user?.uid || '').trim()
  if (!instId) {
    modalSalvarErro.value = 'Instituição não identificada no seu perfil de usuário.'
    return
  }

  isSavingModel.value = true
  modalSalvarErro.value = ''

  try {
    const criadorId = String(userData.value?.id || userData.value?.uid || authStore.user?.uid || 'facilitador')
    const criadoPor = String(userData.value?.nome || userData.value?.email || 'Facilitador')

    const payload = {
      nomeModelo: nome,
      roomName: String(form.roomName || nome).trim(),
      shape: Number(form.shape || 0),
      numBoys: Number(form.numBoys || 0),
      numGirls: Number(form.numGirls || 0),
      numDesks: Number(form.numDesks || 0),
      rows: Number(form.rows || 0),
      cols: Number(form.cols || 0),
      radius: Number(form.radius || 0),
      maxDesksInSemiCircle: Number(form.maxDesksInSemiCircle || 0),
      criadoPor: criadoPor,
      criadorId: criadorId,
      instituicaoId: instId,
      criadoEm: new Date().toISOString()
    }

    let savedKey = null

    // 1. Tenta salvar na instituição: instituicoes/${instId}/salas_modelo
    try {
      const modelosRef = dbRef(database, `instituicoes/${instId}/salas_modelo`)
      const novoModeloRef = push(modelosRef)
      await set(novoModeloRef, payload)
      savedKey = novoModeloRef.key
    } catch (errInst) {
      console.warn("Falha ao salvar em instituicoes/.../salas_modelo, tentando em salas_modelo raiz:", errInst)
      // 2. Fallback: salva na raiz salas_modelo
      const rootRef = dbRef(database, 'salas_modelo')
      const novoRootRef = push(rootRef)
      await set(novoRootRef, payload)
      savedKey = novoRootRef.key
    }

    // Atualiza a lista em memória
    modelosDisponiveis.value.unshift({
      id: savedKey || Date.now().toString(),
      ...payload
    })

    // Fecha o menu suspenso de salvar imediatamente
    modalSalvarAberto.value = false
    nomeNovoModelo.value = ''
    modalSalvarErro.value = ''

    // Dispara alerta flutuante de sucesso claro e destacado
    exibirAlerta('success', `Sala Modelo "${nome}" salva com sucesso para toda a sua instituição!`, 'Modelo Salvo!')

  } catch (error) {
    console.error("Erro ao salvar sala modelo:", error)
    modalSalvarErro.value = error?.message || 'Erro ao salvar sala modelo. Verifique sua conexão e tente novamente.'
  } finally {
    isSavingModel.value = false
  }
}

const abrirModalCarregarModelo = () => {
  if (modelosDisponiveis.value.length === 0 && modelosPadrao.length > 0) {
    tabModeloAtiva.value = 'padrao'
  } else {
    tabModeloAtiva.value = 'instituicao'
  }
  modalCarregarAberto.value = true
}

const fecharModalCarregar = () => {
  modalCarregarAberto.value = false
}

const aplicarModelo = (modelo) => {
  if (!modelo) return

  form.roomName = modelo.roomName || modelo.nomeModelo || form.roomName
  form.shape = Number(modelo.shape ?? 0)
  form.numBoys = Number(modelo.numBoys ?? 0)
  form.numGirls = Number(modelo.numGirls ?? 0)
  form.numDesks = Number(modelo.numDesks ?? 0)
  form.rows = Number(modelo.rows ?? 0)
  form.cols = Number(modelo.cols ?? 0)
  form.radius = Number(modelo.radius ?? 10)
  form.maxDesksInSemiCircle = Number(modelo.maxDesksInSemiCircle ?? 0)

  modalCarregarAberto.value = false
  exibirAlerta('success', `Modelo "${modelo.nomeModelo || modelo.roomName}" aplicado aos parâmetros da sala com sucesso!`, 'Modelo Carregado!')
}

const podeExcluirModelo = (modelo) => {
  if (!modelo || !userData.value) return false
  const t = String(userData.value.tipo || '').toLowerCase()
  const tc = String(userData.value.tipoCadastro || '').toLowerCase()
  const isInst = t.includes('institui') || tc.includes('institui')
  return isInst || modelo.criadorId === userData.value.id || modelo.criadorId === userData.value.uid
}

const confirmarExclusaoModelo = (modelo) => {
  modeloParaExcluir.value = modelo
}

const executarExclusaoModelo = async () => {
  if (!modeloParaExcluir.value) return
  const instId = String(userData.value?.instituicaoId || userData.value?.id || userData.value?.uid || '')
  const modeloId = modeloParaExcluir.value.id
  const nome = modeloParaExcluir.value.nomeModelo || 'Modelo'

  try {
    try {
      await remove(dbRef(database, `instituicoes/${instId}/salas_modelo/${modeloId}`))
    } catch (e) {}
    try {
      await remove(dbRef(database, `salas_modelo/${modeloId}`))
    } catch (e) {}

    modelosDisponiveis.value = modelosDisponiveis.value.filter(m => m.id !== modeloId)
    modeloParaExcluir.value = null

    exibirAlerta('success', `Modelo "${nome}" removido do catálogo com sucesso.`, 'Modelo Excluído')
  } catch (error) {
    console.error("Erro ao excluir modelo:", error)
    exibirAlerta('error', 'Erro ao excluir modelo.', 'Falha na Exclusão')
  }
}

const salvarConfiguracao = async () => {
  if (!isFormValid.value) return

  const t = String(userData.value.tipo || '').toLowerCase()
  const tc = String(userData.value.tipoCadastro || '').toLowerCase()
  const isInst = t.includes('institui') || tc.includes('institui')
  const isPlus = userData.value.FacilitadorPlus === true || userData.value.FacilitadorPlus === 'true'

  if (isInst && !isPlus) {
    exibirAlerta('error', 'Sua instituição não possui permissão FacilitadorPlus para criar salas VR.', 'Acesso Negado')
    return
  }
  
  isSaving.value = true
  
  try {
    const configsRef = dbRef(database, 'classroom_configs')
    const novaConfigRef = push(configsRef)

    const payload = {
      roomName: form.roomName,
      targetType: form.targetType,
      targetId: form.targetId,
      instituicaoId: userData.value.instituicaoId || userData.value.id,
      facilitadorId: userData.value.id || userData.value.uid || 'facilitador',
      criadoEm: new Date().toISOString(),
      situacao_atual: {
        ativo: "nao"
      },
      
      numBoys: form.numBoys,
      numGirls: form.numGirls,
      numDesks: form.numDesks,
      shape: form.shape,
      rows: form.rows,
      cols: form.cols,
      radius: form.radius,
      maxDesksInSemiCircle: form.maxDesksInSemiCircle
    }

    await set(novaConfigRef, payload)
    
    exibirAlerta('success', 'Sala VR configurada e criada com sucesso! Redirecionando...', 'Sala Criada!')
    
    form.roomName = ''
    form.targetId = ''
    setTimeout(() => { 
      router.push('/home')
    }, 1800)

  } catch (error) {
    console.error("Erro ao salvar sala:", error)
    exibirAlerta('error', 'Ocorreu um erro ao salvar a sala. Tente novamente.', 'Erro ao Salvar')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.form-container-glass {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
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
  margin-bottom: 28px;
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

.welcome-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

/* Glass Form Card */
.glass-form-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-step-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.step-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0071e3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  box-shadow: 0 4px 10px rgba(0, 113, 227, 0.3);
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
  margin: 0;
}

/* Target Type Selector */
.target-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.target-card-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.9);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.target-card-option:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.target-card-option.active {
  background: #eff6ff;
  border-color: #0071e3;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.15);
}

.hidden-radio {
  display: none;
}

.target-card-icon {
  font-size: 2rem;
}

.target-card-info {
  display: flex;
  flex-direction: column;
}

.target-card-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
}

.target-card-desc {
  font-size: 0.78rem;
  color: #64748b;
}

.target-check-mark {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0071e3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.target-select-glass {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 18px;
  border-radius: 16px;
}

.divider-glass {
  height: 1px;
  background: rgba(226, 232, 240, 0.8);
}

/* Grid Form Inputs */
.grid-form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.input-group-glass {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group-glass.full-width {
  width: 100%;
}

.input-label-glass {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.label-icon { font-size: 1rem; }

.hint-text {
  font-size: 0.76rem;
  font-weight: 400;
  color: #94a3b8;
}

.glass-input-field {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(203, 213, 225, 0.9);
  background: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.glass-input-field:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12);
}

.empty-error-hint {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 6px 0 0 0;
  font-style: italic;
}

/* Step Header With Actions */
.step-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.step-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-subtitle-desc {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
}

.model-quick-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-quick-model {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-load-model {
  background: rgba(239, 246, 255, 0.95);
  border: 1.5px solid rgba(191, 219, 254, 0.9);
  color: #0071e3;
}

.btn-load-model:hover {
  background: #0071e3;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 113, 227, 0.25);
}

.btn-load-model:hover .model-count-pill {
  background: #ffffff;
  color: #0071e3;
}

.model-count-pill {
  background: #0071e3;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.btn-save-model {
  background: rgba(240, 253, 244, 0.95);
  border: 1.5px solid rgba(187, 247, 208, 0.9);
  color: #059669;
}

.btn-save-model:hover {
  background: #059669;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.25);
}

/* Actions Footer */
.form-actions-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 10px;
}

.btn-cancel-glass {
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.2s ease;
}

.btn-cancel-glass:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-save-template-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #059669;
  background: rgba(236, 253, 245, 0.9);
  border: 1.5px solid rgba(167, 243, 208, 0.9);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-save-template-glass:hover:not(:disabled) {
  background: #059669;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(16, 185, 129, 0.25);
}

.btn-save-template-glass:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

.btn-submit-glass {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-submit-glass:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 113, 227, 0.4);
}

.btn-submit-glass:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.spinner-btn {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Feedback Toast */
.feedback-toast-glass {
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  text-align: center;
}

.feedback-toast-glass.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-toast-glass.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* MODAIS APPLE GLASSMORPHISM */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-glass-container {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  width: 100%;
  max-width: 560px;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: glassFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.modal-glass-container.modal-large {
  max-width: 780px;
}

.modal-glass-container.modal-small {
  max-width: 440px;
}

.modal-header {
  padding: 22px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.modal-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.close-btn {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.modal-tabs-bar {
  display: flex;
  gap: 10px;
  padding: 12px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  background: rgba(248, 250, 252, 0.65);
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  background: transparent;
  font-size: 0.86rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}

.tab-pill.active {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-badge {
  background: rgba(226, 232, 240, 0.9);
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
}

.tab-pill.active .tab-badge {
  background: #0071e3;
  color: #ffffff;
}

.modal-body-scrollable {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(85vh - 180px);
}

.modal-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.model-card-item {
  background: rgba(255, 255, 255, 0.88);
  border: 1.5px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.model-card-item:hover {
  border-color: #0071e3;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 113, 227, 0.12);
}

.model-card-item.preset {
  background: rgba(248, 250, 252, 0.85);
  border-color: rgba(226, 232, 240, 0.9);
}

.model-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-shape-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shape-0 {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.shape-1 {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

.shape-2 {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.preset-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 3px 8px;
  border-radius: 6px;
}

.btn-delete-model {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  padding: 4px 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-delete-model:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.model-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.model-subname {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.model-desc-preset {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0;
}

.model-params-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.param-tag {
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #334155;
}

.model-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(241, 245, 249, 0.9);
  gap: 10px;
}

.model-author-meta {
  display: flex;
  flex-direction: column;
}

.author-label {
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 600;
}

.author-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.btn-apply-model {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
}

.btn-apply-model:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.35);
}

.btn-apply-model.preset-btn {
  margin-left: auto;
}

.empty-model-state {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 2.8rem;
  margin-bottom: 4px;
}

.empty-model-state h4 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.empty-model-state p {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  max-width: 440px;
}

.empty-model-state .empty-sub {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 8px;
}

.model-preview-box {
  background: rgba(248, 250, 252, 0.9);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 600;
}

.item-value {
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 700;
}

.modal-footer {
  padding: 18px 28px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.btn-save-confirm {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
}

.btn-save-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.btn-save-confirm:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.delete-overlay {
  background: rgba(15, 23, 42, 0.6);
}

.delete-header {
  border-bottom-color: rgba(254, 202, 202, 0.8);
}

.delete-tag {
  color: #dc2626;
}

.delete-warning-text {
  font-size: 0.84rem;
  color: #dc2626;
  margin-top: 6px;
  font-weight: 600;
}

.btn-confirm-delete {
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm-delete:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* TOAST FLUTUANTE GLOBAL */
.floating-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.05);
  max-width: 90vw;
  width: auto;
  min-width: 320px;
}

.floating-toast.success {
  border: 1.5px solid #10b981;
}

.floating-toast.error {
  border: 1.5px solid #ef4444;
}

.floating-toast.info {
  border: 1.5px solid #0071e3;
}

.toast-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
}

.floating-toast.success .toast-icon-circle {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.floating-toast.error .toast-icon-circle {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

.floating-toast.info .toast-icon-circle {
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.35);
}

.toast-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.toast-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.toast-message {
  font-size: 0.86rem;
  font-weight: 600;
  color: #475569;
}

.toast-close-btn {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: all 0.2s ease;
}

.toast-close-btn:hover {
  color: #0f172a;
  transform: scale(1.1);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -40px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

/* ALERTA INTERNO NO MODAL */
.modal-alert-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  animation: glassFadeUp 0.25s ease both;
}

.modal-alert-box.error {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #991b1b;
}

.modal-alert-icon-wrap {
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1.2;
}

.modal-alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.modal-alert-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #991b1b;
}

.modal-alert-desc {
  font-size: 0.8rem;
  color: #b91c1c;
  margin: 0;
  line-height: 1.35;
}

.modal-alert-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #f87171;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.modal-alert-close:hover {
  color: #991b1b;
}

@media (max-width: 680px) {
  .target-type-selector { grid-template-columns: 1fr; }
  .grid-form-fields { grid-template-columns: 1fr; }
  .glass-form-card { padding: 22px; }
  .form-actions-footer { flex-direction: column; }
  .btn-submit-glass, .btn-save-template-glass, .btn-cancel-glass { width: 100%; text-align: center; justify-content: center; }
  .step-header-with-actions { flex-direction: column; align-items: flex-start; }
  .model-quick-actions { width: 100%; }
  .btn-quick-model { flex: 1; justify-content: center; }
  .models-grid { grid-template-columns: 1fr; }
  .preview-grid { grid-template-columns: 1fr; }
}
</style>
