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

    <h3 class="section-title">Meus Grupos</h3>
    <div v-if="loadingGrupos" class="sub-loading">Carregando seus grupos...</div>
    <div v-else class="cards-grid">
      <div v-for="grupo in grupos" :key="grupo.id" class="info-box">
        <div class="box-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="box-content">
          <span class="label">Grupo</span>
          <span class="value">{{ grupo.nome }}</span>
          <span class="sub-value">Facilitador: <strong>{{ grupo.facilitadorNome }}</strong></span>
        </div>
      </div>
      <p v-if="grupos.length === 0" class="empty-state">Você ainda não está vinculado a nenhum grupo.</p>
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
.role-view { width: 100%; animation: fadeUp 0.5s ease both; }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.user-avatar { width: 65px; height: 65px; background: linear-gradient(135deg, #0066FF, #10b981); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 102, 255, 0.2); }
.welcome-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
.highlight { color: #0066FF; }
.welcome-subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem; }

.divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
.section-title { font-size: 1.2rem; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 20px; 
}

/* Cartões com layout de Ícone + Texto */
.info-box { 
  display: flex; 
  align-items: center;
  gap: 16px;
  padding: 20px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0;
  border-radius: 16px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.info-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.08);
  border-color: #bfdbfe;
}

.box-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #0066FF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.box-icon svg { width: 24px; height: 24px; }

.box-content { display: flex; flex-direction: column; }

.label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #0066FF; letter-spacing: 0.5px; margin-bottom: 4px; }
.value { font-size: 1.15rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sub-value { font-size: 0.85rem; color: #64748b; }
.sub-value strong { color: #0f172a; font-weight: 500; }

.sub-loading { color: #64748b; font-style: italic; font-size: 0.95rem; }
.empty-state { color: #64748b; font-size: 0.95rem; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #cbd5e1; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>