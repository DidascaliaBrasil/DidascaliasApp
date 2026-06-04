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

    <h3>Instituição Vinculada: <span class="highlight">{{ nomeInstituicao }}</span></h3>
    
    <div class="action-section">
      <h4>Criar Grupo de Professores</h4>
      <div class="form-group">
        <input v-model="novoGrupoNome" type="text" placeholder="Nome do Grupo" class="input-field" />
        <button @click="criarGrupo" class="btn-primary" :disabled="isCreatingGroup">Criar Grupo</button>
      </div>
      <p v-if="mensagemGrupo" class="feedback-msg">{{ mensagemGrupo }}</p>
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
.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.user-avatar { width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }
.welcome-title { margin: 0; font-size: 1.5rem; }
.welcome-subtitle { margin: 5px 0 0 0; color: #ccc; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }

.role-view { width: 100%; }
.action-section { margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; }
.form-group { display: flex; gap: 10px; margin-top: 10px; }
.input-field { flex: 1; padding: 10px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.2); background: transparent; color: white; }
.btn-primary { padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-primary:disabled { background-color: #555; cursor: not-allowed; }
.feedback-msg { margin-top: 10px; font-size: 0.9em; color: #4CAF50; }
</style>