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
        <p>A carregar o ambiente...</p>
      </div>

      <div v-else class="form-container-glass stagger-in-2">
        <!-- Hero Header Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass">{{ initials }}</div>
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
                <option v-for="grupo in gruposDisponiveis" :key="grupo.id" :value="grupo.id">
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
                <option v-for="aluno in alunosDisponiveis" :key="aluno.id" :value="aluno.id">
                  {{ aluno.nome }} ({{ aluno.email }})
                </option>
              </select>
              <p v-if="alunosDisponiveis.length === 0" class="empty-error-hint">Nenhum aluno cadastrado na instituição.</p>
            </div>
          </div>

          <div class="divider-glass"></div>

          <!-- Seção 2: Parâmetros da Sala VR -->
          <div class="form-step-section">
            <div class="step-badge-row">
              <span class="step-num">2</span>
              <h3 class="step-title">Parâmetros do Cenário Virtual</h3>
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

          <!-- Toast Feedback -->
          <div class="feedback-area" v-if="feedbackMsg">
            <p :class="['feedback-toast-glass', feedbackType]">{{ feedbackMsg }}</p>
          </div>

          <!-- Rodapé do Formulário -->
          <div class="form-actions-footer">
            <router-link to="/home" class="btn-cancel-glass">Cancelar</router-link>
            <button type="submit" class="btn-submit-glass" :disabled="isSaving || !isFormValid">
              <span v-if="isSaving" class="spinner-btn"></span>
              <span>{{ isSaving ? 'Criando Sala VR...' : 'Criar e Salvar Sala VR' }}</span>
            </button>
          </div>

        </form>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { auth, database } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, get, push, set } from 'firebase/database'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const userData = ref({})

const gruposDisponiveis = ref([])
const alunosDisponiveis = ref([])

const feedbackMsg = ref('')
const feedbackType = ref('')

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
  const nome = userData.value.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const isFormValid = computed(() => {
  if (!form.targetId) return false
  if (!form.roomName.trim()) return false
  return true
})

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const shortId = user.uid.substring(0, 8).toUpperCase()
        const fullId = user.uid
        
        let dataEncontrada = null
        let idUsado = null
        let tipoConta = null

        const paths = [
          { ref: `usuarios/${shortId}`, typeFallback: null },
          { ref: `usuarios/${fullId}`, typeFallback: null },
          { ref: `instituicoes/${shortId}`, typeFallback: 'Instituicao' },
          { ref: `instituicoes/${fullId}`, typeFallback: 'Instituicao' }
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

        if (!dataEncontrada) {
          const instSnap = await get(dbRef(database, 'instituicoes'))
          if (instSnap.exists()) {
            const instituicoes = instSnap.val()
            for (const key in instituicoes) {
              if (instituicoes[key].email === user.email) {
                dataEncontrada = instituicoes[key]
                idUsado = key
                tipoConta = 'Instituicao'
                break
              }
            }
          }
        }

        if (!dataEncontrada) {
          const usersSnap = await get(dbRef(database, 'usuarios'))
          if (usersSnap.exists()) {
            const usuarios = usersSnap.val()
            for (const key in usuarios) {
              if (usuarios[key].email === user.email) {
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
          
          await fetchDependencias(dataEncontrada.instituicaoId, idUsado)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        isLoading.value = false
      }
    } else {
      router.push('/')
    }
  })
})

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

    // 2. Buscar Usuários/Alunos da Instituição
    const usersRef = dbRef(database, 'usuarios')
    const usersSnap = await get(usersRef)
    if (usersSnap.exists()) {
      const todosUsuarios = usersSnap.val()
      alunosDisponiveis.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.instituicaoId === instituicaoId && (u.tipoCadastro === 'Usuario' || u.tipo === 'Usuario'))
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    }
  } catch (error) {
    console.error("Erro ao buscar dependências:", error)
  }
}

const salvarConfiguracao = async () => {
  if (!isFormValid.value) return
  
  isSaving.value = true
  feedbackMsg.value = ''
  
  try {
    const configsRef = dbRef(database, 'classroom_configs')
    const novaConfigRef = push(configsRef)

    const payload = {
      roomName: form.roomName,
      targetType: form.targetType,
      targetId: form.targetId,
      instituicaoId: userData.value.instituicaoId,
      facilitadorId: userData.value.id,
      criadoEm: new Date().toISOString(),
      
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
    
    feedbackType.value = 'success'
    feedbackMsg.value = 'Sala VR configurada e criada com sucesso!'
    
    form.roomName = ''
    form.targetId = ''
    setTimeout(() => { 
      feedbackMsg.value = '' 
      router.push('/home')
    }, 1800)

  } catch (error) {
    console.error("Erro ao salvar sala:", error)
    feedbackType.value = 'error'
    feedbackMsg.value = 'Ocorreu um erro ao salvar a sala. Tente novamente.'
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

@media (max-width: 680px) {
  .target-type-selector { grid-template-columns: 1fr; }
  .grid-form-fields { grid-template-columns: 1fr; }
  .glass-form-card { padding: 22px; }
  .form-actions-footer { flex-direction: column; }
  .btn-submit-glass, .btn-cancel-glass { width: 100%; text-align: center; justify-content: center; }
}
</style>
