<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nome }}</span>!</h1>
        <p class="welcome-subtitle">Painel do Professor.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3>Meus Grupos</h3>
    <div v-if="loadingGrupos" class="sub-loading">Carregando seus grupos...</div>
    <div v-else class="cards-grid">
      <div v-for="grupo in grupos" :key="grupo.id" class="info-box">
        <span class="label">Grupo</span>
        <span class="value">{{ grupo.nome }}</span>
        <span class="sub-value">Facilitador: {{ grupo.facilitadorNome }}</span>
      </div>
      <p v-if="grupos.length === 0">Você ainda não está vinculado a nenhum grupo.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { database } from '../../firebase' 
import { ref as dbRef, get } from 'firebase/database'

const props = defineProps({
  userData: { type: Object, required: true }
})

const grupos = ref([])
const loadingGrupos = ref(true)

const initials = computed(() => {
  const nome = props.userData.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  try {
    const gruposRef = dbRef(database, 'grupos')
    const snapshot = await get(gruposRef)
    if (snapshot.exists()) {
      const todosGrupos = snapshot.val()
      grupos.value = Object.keys(todosGrupos)
        .map(key => ({ id: key, ...todosGrupos[key] }))
        .filter(g => g.membros && g.membros[props.userData.id])
    }
  } catch (error) {
    console.error("Erro ao buscar grupos do professor:", error)
  } finally {
    loadingGrupos.value = false
  }
})
</script>

<style scoped>
.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.user-avatar { width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }
.welcome-title { margin: 0; font-size: 1.5rem; }
.welcome-subtitle { margin: 5px 0 0 0; color: #ccc; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }

.role-view { width: 100%; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
.info-box { display: flex; flex-direction: column; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; }
.sub-value { font-size: 0.8em; color: #ccc; margin-top: 5px; }
.sub-loading { color: #aaa; font-style: italic; margin-top: 15px; }
</style>