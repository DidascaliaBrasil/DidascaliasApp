<template>
  <div class="role-view">
    
    <div class="profile-header">
      <div class="user-avatar">{{ initials }}</div>
      <div class="welcome-texts">
        <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nomeFaculdade || userData.nomeInstituicao || 'Gestor' }}</span>!</h1>
        <p class="welcome-subtitle">Painel de Administração da Instituição.</p>
      </div>
    </div>

    <div class="divider"></div>

    <h3>Membros da Instituição</h3>
    <div v-if="loadingMembros" class="sub-loading">Carregando membros...</div>
    <div v-else class="cards-grid">
      <div v-for="membro in membros" :key="membro.id" class="info-box membro-card">
        <span class="label">{{ membro.tipoCadastro || membro.tipo }}</span>
        <span class="value">{{ membro.nome }}</span>
        <span class="sub-value">{{ membro.email }}</span>
      </div>
      <p v-if="membros.length === 0">Nenhum membro vinculado encontrado.</p>
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

const membros = ref([])
const loadingMembros = ref(true)

// Calcula as iniciais baseadas no nome da faculdade
const initials = computed(() => {
  const nome = props.userData.nomeFaculdade || props.userData.nomeInstituicao || 'Gestor'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  try {
    const usersRef = dbRef(database, 'usuarios')
    const snapshot = await await get(usersRef)
    if (snapshot.exists()) {
      const todosUsuarios = snapshot.val()
      membros.value = Object.keys(todosUsuarios)
        .map(key => ({ id: key, ...todosUsuarios[key] }))
        .filter(u => u.instituicaoId === props.userData.id && 
          (u.tipoCadastro === 'Facilitador' || u.tipoCadastro === 'Usuario' || 
           u.tipo === 'Facilitador' || u.tipo === 'Usuario')
        )
    }
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
  } finally {
    loadingMembros.value = false
  }
})
</script>

<style scoped>
/* O layout do header foi movido para cá, você pode precisar ajustar classes no seu CSS global se necessário */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.user-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.welcome-title { margin: 0; font-size: 1.5rem; }
.welcome-subtitle { margin: 5px 0 0 0; color: #ccc; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }

.role-view { width: 100%; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
.membro-card { display: flex; flex-direction: column; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; }
.sub-value { font-size: 0.8em; color: #ccc; margin-top: 5px; }
.sub-loading { color: #aaa; font-style: italic; margin-top: 15px; }
</style>