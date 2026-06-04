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

    <h3 class="section-title">Membros da Instituição</h3>
    <div v-if="loadingMembros" class="sub-loading">Carregando membros...</div>
    <div v-else class="cards-grid">
      <div v-for="membro in membros" :key="membro.id" class="info-box membro-card">
        <span class="label">{{ membro.tipoCadastro || membro.tipo }}</span>
        <span class="value">{{ membro.nome }}</span>
        <span class="sub-value">{{ membro.email }}</span>
      </div>
      <p v-if="membros.length === 0" class="empty-state">Nenhum membro vinculado encontrado.</p>
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

const initials = computed(() => {
  const nome = props.userData.nomeFaculdade || props.userData.nomeInstituicao || 'Gestor'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(async () => {
  try {
    const usersRef = dbRef(database, 'usuarios')
    const snapshot = await get(usersRef)
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
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #0066FF, #10b981);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2);
}

.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }

.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

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
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.membro-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.08);
  border-color: #bfdbfe;
}

.label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #10b981; letter-spacing: 0.5px; margin-bottom: 8px; }
.value { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sub-value { font-size: 0.85rem; color: #64748b; }

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>