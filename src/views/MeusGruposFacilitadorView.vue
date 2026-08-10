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
            <h1 class="welcome-title">Gerenciar Grupos</h1>
            <p class="welcome-subtitle">Crie grupos e selecione os participantes da sua instituição.</p>
          </div>
        </div>

        <div class="divider"></div>

        <div class="action-section">
          <div class="form-group">
            <input 
              v-model="novoGrupoNome" 
              type="text" 
              placeholder="Insira o Nome do Grupo" 
              class="input-field" 
            />
            <button 
              @click="criarGrupo" 
              class="btn-primary" 
              :disabled="isCreatingGroup || !novoGrupoNome.trim() || selectedMembers.length === 0"
            >
              {{ isCreatingGroup ? 'Salvando...' : 'Salvar Grupo' }}
            </button>
          </div>
          <p v-if="mensagemGrupo" :class="['feedback-msg', { 'error': mensagemGrupo.includes('Erro') || mensagemGrupo.includes('Selecione') }]">
            {{ mensagemGrupo }}
          </p>
        </div>

        <div class="search-section">
          <h3 class="section-title">Selecionar Participantes</h3>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Pesquisar por nome ou e-mail..." 
            class="input-field search-input" 
          />
        </div>

        <div v-if="loadingMembros" class="sub-loading">Carregando membros da instituição...</div>
        <div v-else class="cards-grid">
          <div 
            v-for="membro in membrosFiltrados" 
            :key="membro.id" 
            :class="['membro-card', { 'selected': isSelected(membro.id) }]"
            @click="toggleSelection(membro.id)"
          >
            <div class="card-header">
              <span class="label">{{ membro.tipoCadastro || membro.tipo }}</span>
              <div class="checkbox-indicator">
                <svg v-if="isSelected(membro.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <span class="value">{{ membro.nome }}</span>
            <span class="sub-value">{{ membro.email }}</span>
          </div>
          <p v-if="membrosFiltrados.length === 0" class="empty-state">Nenhum membro encontrado.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, database } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, get, push, set } from 'firebase/database'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const isLoading = ref(true)
const userData = ref({})

const membros = ref([])
const loadingMembros = ref(true)

const novoGrupoNome = ref('')
const searchQuery = ref('')
const selectedMembers = ref([])
const isCreatingGroup = ref(false)
const mensagemGrupo = ref('')

const initials = computed(() => {
  const nome = userData.value.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

const membrosFiltrados = computed(() => {
  if (!searchQuery.value) return membros.value
  const query = searchQuery.value.toLowerCase()
  return membros.value.filter(m => 
    (m.nome && m.nome.toLowerCase().includes(query)) || 
    (m.email && m.email.toLowerCase().includes(query))
  )
})

const isSelected = (id) => selectedMembers.value.includes(id)

const toggleSelection = (id) => {
  if (isSelected(id)) {
    selectedMembers.value = selectedMembers.value.filter(mId => mId !== id)
  } else {
    selectedMembers.value.push(id)
  }
}

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
          
          await fetchMembrosInstituicao(dataEncontrada.instituicaoId)
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

const fetchMembrosInstituicao = async (instituicaoId) => {
  if (!instituicaoId) {
    loadingMembros.value = false
    return
  }
  
  try {
    const usersRef = dbRef(database, 'usuarios')
    const snapshot = await get(usersRef)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      membros.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.instituicaoId === instituicaoId)
        // Opcional: ordenar pelo nome
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    }
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
  } finally {
    loadingMembros.value = false
  }
}

const criarGrupo = async () => {
  if (!novoGrupoNome.value.trim()) {
    mensagemGrupo.value = "O nome do grupo não pode estar vazio."
    return
  }
  if (selectedMembers.value.length === 0) {
    mensagemGrupo.value = "Selecione ao menos um participante."
    return
  }
  
  isCreatingGroup.value = true
  mensagemGrupo.value = "Salvando grupo..."

  try {
    const instituicaoId = userData.value.instituicaoId
    if (!instituicaoId) throw new Error("Instituição não vinculada.")

    const gruposRef = dbRef(database, `instituicoes/${instituicaoId}/grupos`)
    const novoGrupoRef = push(gruposRef)
    
    const participantesData = selectedMembers.value.map(id => {
      const m = membros.value.find(user => user.id === id)
      return {
        id: m.id,
        nome: m.nome,
        email: m.email,
        tipo: m.tipoCadastro || m.tipo
      }
    })

    await set(novoGrupoRef, {
      nome: novoGrupoNome.value,
      facilitadorId: userData.value.id,
      facilitadorNome: userData.value.nome,
      participantes: participantesData,
      criadoEm: new Date().toISOString()
    })

    mensagemGrupo.value = "Grupo salvo com sucesso!"
    novoGrupoNome.value = ""
    selectedMembers.value = []
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    mensagemGrupo.value = "Erro ao salvar o grupo."
  } finally {
    isCreatingGroup.value = false
    setTimeout(() => { mensagemGrupo.value = "" }, 4000)
  }
}
</script>

<style scoped>
.groups-section {
  width: 100%;
  max-width: 1200px;
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

.action-section { 
  margin-bottom: 32px; 
  padding: 24px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.form-group { display: flex; gap: 12px; }

.input-field { 
  flex: 1; 
  padding: 12px 16px; 
  border-radius: 12px; 
  border: 2px solid #e2e8f0; 
  background: #f8fafc; 
  color: #0f172a; 
  font-size: 0.95rem;
  transition: all 0.3s ease;
  outline: none;
}

.input-field:focus {
  border-color: #0066FF;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.search-input {
  max-width: 400px;
}

.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; }

.btn-primary { 
  padding: 12px 24px; 
  background-color: #0066FF; 
  color: white; 
  border: none; 
  border-radius: 12px; 
  font-weight: 600;
  cursor: pointer; 
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) { 
  background-color: #0052cc; 
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 102, 255, 0.2);
}

.btn-primary:disabled { 
  background-color: #94a3b8; 
  cursor: not-allowed; 
}

.feedback-msg { margin-top: 12px; font-size: 0.9rem; color: #10b981; font-weight: 500; }
.feedback-msg.error { color: #ef4444; }

.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 20px; 
}

.membro-card { 
  display: flex; 
  flex-direction: column; 
  padding: 20px; 
  background: #ffffff; 
  border: 2px solid #e2e8f0;
  border-radius: 16px; 
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.membro-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  border-color: #bfdbfe;
}

.membro-card.selected {
  border-color: #10b981;
  background: #ecfdf5;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-indicator {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.membro-card.selected .checkbox-indicator {
  background: #10b981;
  border-color: #10b981;
}

.label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
.membro-card.selected .label { color: #047857; }
.value { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sub-value { font-size: 0.85rem; color: #64748b; }

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; padding: 20px 0; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; grid-column: 1 / -1; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .form-group { flex-direction: column; }
  .btn-primary { width: 100%; }
}
</style>
