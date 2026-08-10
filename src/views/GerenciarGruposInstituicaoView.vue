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
            <h1 class="welcome-title">Grupos da Instituição</h1>
            <p class="welcome-subtitle">Visualize os grupos criados pelos facilitadores da sua instituição.</p>
          </div>
        </div>

        <div class="divider"></div>

        <h3 class="section-title">Todos os Grupos</h3>
        <div v-if="loadingGrupos" class="sub-loading">Carregando grupos...</div>
        <div v-else class="cards-grid">
          <div v-for="grupo in grupos" :key="grupo.id" class="info-box">
            <div class="box-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="box-content">
              <span class="label">Grupo</span>
              <span class="value">{{ grupo.nome }}</span>
              <span class="sub-value">Facilitador: <strong>{{ grupo.facilitadorNome || 'Não informado' }}</strong></span>
              <span class="sub-value" style="margin-top: 4px;">{{ grupo.participantes ? grupo.participantes.length : 0 }} participante(s)</span>
            </div>
          </div>
          <p v-if="grupos.length === 0" class="empty-state">Nenhum grupo foi criado pelos facilitadores ainda.</p>
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
import { ref as dbRef, get } from 'firebase/database'

import MenuLateral from '../components/generic/MenuLateral.vue' 

const router = useRouter()
const isLoading = ref(true)
const userData = ref({})

const grupos = ref([])
const loadingGrupos = ref(true)

const initials = computed(() => {
  const nome = userData.value.nome || '?'
  const nomes = nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
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

        // Tenta buscar como instituição primeiro, já que esta é a view de instituição
        const paths = [
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
          // Busca em todos para encontrar por e-mail, caso precise
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

        if (dataEncontrada) {
          userData.value = {
            email: user.email, 
            ...dataEncontrada,
            id: idUsado,
            tipo: tipoConta
          }
          
          await fetchGrupos(idUsado)
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

const fetchGrupos = async (instituicaoId) => {
  if (!instituicaoId) {
    loadingGrupos.value = false
    return
  }
  
  try {
    const gruposRef = dbRef(database, `instituicoes/${instituicaoId}/grupos`)
    const snapshot = await get(gruposRef)
    if (snapshot.exists()) {
      const todosGrupos = snapshot.val()
      grupos.value = Object.keys(todosGrupos)
        .map(key => ({ id: key, ...todosGrupos[key] }))
    }
  } catch (error) {
    console.error("Erro ao buscar grupos:", error)
  } finally {
    loadingGrupos.value = false
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
