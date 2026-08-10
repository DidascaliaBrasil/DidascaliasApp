<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 15% 15%, #dbeafe 0%, transparent 45%), radial-gradient(circle at 85% 85%, #a7f3d0 0%, transparent 45%); z-index: 0; pointer-events: none;"></div>

    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
    />

    <nav class="navbar">
      <div class="logo-area stagger-in">
        <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
        <span class="brand-name">Didascalias</span>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="isLoading" class="loading-state stagger-in">
        <div class="spinner"></div>
        <p>A carregar o ambiente...</p>
      </div>

      <div v-else class="groups-section stagger-in-2">
        <div class="profile-header">
          <div class="user-avatar">{{ initials }}</div>
          <div class="welcome-texts">
            <h1 class="welcome-title">Criar Sala VR</h1>
            <p class="welcome-subtitle">Configure o ambiente virtual e defina o público-alvo (Grupo ou Aluno).</p>
          </div>
        </div>

        <div class="divider"></div>

        <form @submit.prevent="salvarConfiguracao" class="config-form">
          
          <!-- Seção de Público-Alvo -->
          <div class="form-section">
            <h3 class="section-title">1. Público-Alvo</h3>
            
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="form.targetType" value="grupo" />
                <span>Para um Grupo</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.targetType" value="aluno" />
                <span>Para um Aluno Individual</span>
              </label>
            </div>

            <!-- Seleção de Grupo -->
            <div v-if="form.targetType === 'grupo'" class="target-selection">
              <label class="input-label">Selecione o Grupo</label>
              <select v-model="form.targetId" class="input-field" required>
                <option value="" disabled>Escolha um grupo...</option>
                <option v-for="grupo in gruposDisponiveis" :key="grupo.id" :value="grupo.id">
                  {{ grupo.nome }} ({{ grupo.participantes ? grupo.participantes.length : 0 }} participantes)
                </option>
              </select>
              <p v-if="gruposDisponiveis.length === 0" class="empty-msg">Nenhum grupo encontrado. Crie um grupo primeiro.</p>
            </div>

            <!-- Seleção de Aluno -->
            <div v-if="form.targetType === 'aluno'" class="target-selection">
              <label class="input-label">Selecione o Aluno</label>
              <select v-model="form.targetId" class="input-field" required>
                <option value="" disabled>Escolha um aluno...</option>
                <option v-for="aluno in alunosDisponiveis" :key="aluno.id" :value="aluno.id">
                  {{ aluno.nome }} ({{ aluno.email }})
                </option>
              </select>
              <p v-if="alunosDisponiveis.length === 0" class="empty-msg">Nenhum aluno encontrado na instituição.</p>
            </div>
          </div>

          <!-- Seção de Configuração da Sala -->
          <div class="form-section">
            <h3 class="section-title">2. Parâmetros do Ambiente VR</h3>
            
            <div class="input-group full-width">
              <label class="input-label">Nome da Sala <span class="hint">(Para identificação)</span></label>
              <input type="text" v-model="form.roomName" class="input-field" placeholder="Ex: Sala de Matemática Avançada" required />
            </div>

            <div class="grid-inputs">
              <div class="input-group">
                <label class="input-label">Formato da Sala (Shape)</label>
                <select v-model.number="form.shape" class="input-field" required>
                  <option value="0">0 - Padrão / Retangular</option>
                  <option value="1">1 - Semicírculo</option>
                  <option value="2">2 - Circular</option>
                  <!-- Ajuste conforme necessidade do Unity -->
                </select>
              </div>

              <div class="input-group">
                <label class="input-label">Meninos (numBoys)</label>
                <input type="number" v-model.number="form.numBoys" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Meninas (numGirls)</label>
                <input type="number" v-model.number="form.numGirls" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Mesas (numDesks)</label>
                <input type="number" v-model.number="form.numDesks" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Fileiras (rows)</label>
                <input type="number" v-model.number="form.rows" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Colunas (cols)</label>
                <input type="number" v-model.number="form.cols" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Raio (radius)</label>
                <input type="number" step="0.1" v-model.number="form.radius" class="input-field" min="0" required />
              </div>

              <div class="input-group">
                <label class="input-label">Max. Mesas Semicírculo</label>
                <input type="number" v-model.number="form.maxDesksInSemiCircle" class="input-field" min="0" required />
              </div>
            </div>
          </div>

          <div class="feedback-area" v-if="feedbackMsg">
            <p :class="['feedback-msg', feedbackType]">{{ feedbackMsg }}</p>
          </div>

          <div class="action-footer">
            <button type="submit" class="btn-primary" :disabled="isSaving || !isFormValid">
              {{ isSaving ? 'Salvando Sala...' : 'Criar Sala VR' }}
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
    // Referência global "classroom_configs" conforme especificado
    const configsRef = dbRef(database, 'classroom_configs')
    const novaConfigRef = push(configsRef)

    // Montando o payload
    const payload = {
      roomName: form.roomName,
      targetType: form.targetType,
      targetId: form.targetId,
      instituicaoId: userData.value.instituicaoId,
      facilitadorId: userData.value.id,
      criadoEm: new Date().toISOString(),
      
      // Parâmetros da VR
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
    feedbackMsg.value = 'Sala VR configurada e salva com sucesso!'
    
    // Reset form parameters (keeping some logical defaults)
    form.roomName = ''
    form.targetId = ''
    setTimeout(() => { 
      feedbackMsg.value = '' 
      router.push('/home')
    }, 2000)

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
.groups-section {
  width: 100%;
  max-width: 900px; /* Mais contido para um formulário focado */
  margin: 0 auto;
  padding: 24px;
  background: transparent;
  animation: fadeUp 0.5s ease both;
}

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.user-avatar { width: 65px; height: 65px; background: linear-gradient(135deg, #0066FF, #10b981); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2); }
.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }

.config-form {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 8px;
  margin: 0;
}

.radio-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #0066FF;
}

.target-selection {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
}

.grid-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  width: 100%;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.hint {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.8rem;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
}

.input-field:focus {
  border-color: #0066FF;
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}

.empty-msg {
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: 8px;
  font-style: italic;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-primary { 
  padding: 14px 32px; 
  background-color: #0066FF; 
  color: white; 
  border: none; 
  border-radius: 12px; 
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
}

.btn-primary:hover:not(:disabled) { 
  background-color: #0052cc; 
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 102, 255, 0.3);
}

.btn-primary:disabled { 
  background-color: #94a3b8; 
  cursor: not-allowed; 
  box-shadow: none;
  transform: none;
}

.feedback-area {
  margin-top: -16px;
}

.feedback-msg {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
}

.feedback-msg.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.feedback-msg.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .grid-inputs { grid-template-columns: 1fr; }
  .config-form { padding: 20px; }
  .btn-primary { width: 100%; }
}
</style>
