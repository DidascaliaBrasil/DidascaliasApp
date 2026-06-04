<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nome }}</span>!</h1>
        <p class="welcome-subtitle">Painel do Facilitador de Grupos.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">Instituição Vinculada: <span class="highlight-inst">{{ nomeInstituicao }}</span></h3>
    
    <div class="action-section">
      <h4 class="action-title">Criar Grupo de Professores</h4>
      <div class="form-group">
        <input v-model="novoGrupoNome" type="text" placeholder="Insira o Nome do Grupo" class="input-field" />
        <button @click="criarGrupo" class="btn-primary" :disabled="isCreatingGroup">
          {{ isCreatingGroup ? 'Criando...' : 'Criar Grupo' }}
        </button>
      </div>
      <p v-if="mensagemGrupo" :class="['feedback-msg', { 'error': mensagemGrupo.includes('Erro') || mensagemGrupo.includes('vazio') }]">
        {{ mensagemGrupo }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { database } from '../../firebase' 
import { ref as dbRef, get, set, push } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

const nomeInstituicao = ref('Carregando...')
const novoGrupoNome = ref('')
const isCreatingGroup = ref(false)
const mensagemGrupo = ref('')

const initials = computed(() => {
  const nome = props.userData.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  if (props.userData.instituicaoId) {
    try {
      const instRef = dbRef(database, `instituicoes/${props.userData.instituicaoId}`)
      const snapshot = await get(instRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        nomeInstituicao.value = data.nomeFaculdade || data.nomeInstituicao || 'Instituição'
      } else {
        nomeInstituicao.value = 'Instituição não encontrada'
      }
    } catch (error) {
      console.error("Erro ao buscar instituição do facilitador:", error)
    }
  }
})

const criarGrupo = async () => {
  if (!novoGrupoNome.value.trim()) {
    mensagemGrupo.value = "O nome do grupo não pode estar vazio."
    return
  }
  
  isCreatingGroup.value = true
  mensagemGrupo.value = "Criando grupo..."

  try {
    const gruposRef = dbRef(database, 'grupos')
    const novoGrupoRef = push(gruposRef)
    
    await set(novoGrupoRef, {
      nome: novoGrupoNome.value,
      facilitadorId: props.userData.id,
      facilitadorNome: props.userData.nome,
      instituicaoId: props.userData.instituicaoId,
      membros: {},
      criadoEm: new Date().toISOString()
    })

    mensagemGrupo.value = "Grupo criado com sucesso!"
    novoGrupoNome.value = ""
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    mensagemGrupo.value = "Erro ao criar grupo."
  } finally {
    isCreatingGroup.value = false
    setTimeout(() => { mensagemGrupo.value = "" }, 3000)
  }
}
</script>

<style scoped>
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.user-avatar { width: 65px; height: 65px; background: linear-gradient(135deg, #0066FF, #10b981); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2); }
.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.highlight-inst { color: #10b981; font-weight: 700; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 24px; }

/* Nova seção de ação */
.action-section { 
  margin-top: 20px; 
  padding: 24px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.action-title { font-size: 1.1rem; color: #0f172a; margin-bottom: 16px; font-weight: 600; }

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

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .form-group { flex-direction: column; }
  .btn-primary { width: 100%; }
}
</style>