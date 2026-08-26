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

      <div v-else class="groups-section stagger-in-2">
        <!-- Header Hero Glass -->
        <div class="profile-hero-glass">
          <div class="profile-header-content">
            <div class="user-avatar-glass">{{ initials }}</div>
            <div class="welcome-texts">
              <div class="badge-role-tag">
                <span class="pulse-dot"></span>
                <span>Painel Institucional</span>
              </div>
              <h1 class="welcome-title">Grupos da Instituição</h1>
              <p class="welcome-subtitle">Acompanhe todos os grupos e turmas criados pelos facilitadores da sua instituição.</p>
            </div>
          </div>
        </div>

        <!-- Seção de Listagem de Grupos -->
        <section class="content-section">
          <div class="section-header">
            <div class="section-title-group">
              <h3 class="section-title">Turmas e Grupos Ativos</h3>
              <span class="count-badge">{{ grupos.length }}</span>
            </div>
          </div>

          <div v-if="loadingGrupos" class="sub-loading-glass">
            <div class="mini-spinner"></div>
            <span>Carregando grupos da instituição...</span>
          </div>

          <div v-else class="cards-grid">
            <div 
              v-for="grupo in grupos" 
              :key="grupo.id" 
              class="glass-card grupo-card"
            >
              <div class="card-top">
                <div class="group-icon-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span class="member-count-badge">
                  {{ grupo.participantes ? grupo.participantes.length : 0 }} participante(s)
                </span>
              </div>

              <h4 class="grupo-title">{{ grupo.nome }}</h4>
              
              <div class="facilitador-info-pill">
                <span class="f-label">Facilitador Responsável:</span>
                <span class="f-name">{{ grupo.facilitadorNome || 'Não informado' }}</span>
              </div>

              <!-- Mini lista de participantes -->
              <div class="participantes-preview" v-if="grupo.participantes && grupo.participantes.length > 0">
                <div 
                  v-for="(part, idx) in grupo.participantes.slice(0, 4)" 
                  :key="idx" 
                  class="preview-avatar"
                  :title="part.nome || part.email"
                >
                  {{ (part.nome || 'U').charAt(0).toUpperCase() }}
                </div>
                <span v-if="grupo.participantes.length > 4" class="more-count">
                  +{{ grupo.participantes.length - 4 }}
                </span>
              </div>
            </div>

            <div v-if="grupos.length === 0" class="empty-state-glass">
              <span class="empty-emoji">👥</span>
              <h3>Nenhum grupo cadastrado</h3>
              <p>Os facilitadores da instituição ainda não criaram nenhum grupo de alunos.</p>
            </div>
          </div>
        </section>
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
  const nome = userData.value.nomeFaculdade || userData.value.nomeInstituicao || userData.value.nome || '?'
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
  margin-bottom: 32px;
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

.content-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.count-badge {
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  padding: 2px 8px;
  border-radius: 9999px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.glass-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px rgba(0, 113, 227, 0.1);
  border-color: rgba(191, 219, 254, 0.8);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.group-icon-pill {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  border: 1px solid #bfdbfe;
}

.group-icon-pill svg {
  width: 20px;
  height: 20px;
}

.member-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #a7f3d0;
}

.grupo-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.facilitador-info-pill {
  background: rgba(248, 250, 252, 0.85);
  border-radius: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.f-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.f-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.participantes-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
}

.preview-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.74rem;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.more-count {
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  margin-left: 6px;
}

.sub-loading-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #64748b;
  font-weight: 500;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid rgba(0, 113, 227, 0.2);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state-glass {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 2px dashed rgba(203, 213, 225, 0.8);
  border-radius: 24px;
  color: #64748b;
}

.empty-emoji { font-size: 3rem; display: block; margin-bottom: 12px; }
</style>
