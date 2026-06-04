<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <nav class="navbar glass-effect">
      <div class="logo-area">
        <div class="logo-icon">D</div>
        <span class="brand-name">Didascalias</span>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-logout"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        Sair da Conta
      </button>
    </nav>

    <main class="main-content">
      
      <div v-if="isLoading" class="loading-state glass-effect">
        <div class="spinner"></div>
        <p>A carregar as suas informações...</p>
      </div>

      <div v-else class="welcome-card glass-effect stagger-in">
        <div class="profile-header">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="welcome-texts">
            <h1 class="welcome-title">Bem-vindo(a), <span class="highlight">{{ userData.nome }}</span>!</h1>
            <p class="welcome-subtitle">É bom ter você de volta à plataforma.</p>
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-grid">
          <div class="info-box">
            <span class="label">Cargo</span>
            <span class="value">{{ userData.cargo || 'Não definido' }}</span>
          </div>
          <div class="info-box">
            <span class="label">Perfil</span>
            <span class="value">{{ userData.tipo || 'Não definido' }}</span>
          </div>
          <div class="info-box">
            <span class="label">Instituição</span>
            <span class="value">{{ userData.instituicaoId || 'Não definida' }}</span>
          </div>
          <div class="info-box">
            <span class="label">E-mail</span>
            <span class="value">{{ userData.email || 'Não definido' }}</span>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, database } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref as dbRef, get } from 'firebase/database'

const router = useRouter()
const isLoading = ref(true)

// Dados reativos do usuário
const userData = ref({
  nome: '',
  email: '',
  cargo: '',
  tipo: '',
  instituicaoId: ''
})

// Computa as iniciais do nome para o Avatar (ex: William Fagundes -> WF)
const userInitials = computed(() => {
  if (!userData.value.nome) return '?'
  const nomes = userData.value.nome.trim().split(' ')
  if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase()
  return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
})

onMounted(() => {
  // Ouve mudanças de autenticação
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuário logado: vamos buscar os dados dele no Realtime Database
      try {
        const shortId = user.uid.substring(0, 8).toUpperCase()
        const userRef = dbRef(database, `usuarios/${shortId}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          userData.value = snapshot.val()
        } else {
          console.warn("Dados do usuário não encontrados no banco.")
          userData.value.nome = "Usuário"
          userData.value.email = user.email
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        isLoading.value = false
      }
    } else {
      // Se não tiver usuário, manda pro login
      router.push('/login')
    }
  })
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error("Erro ao sair:", error)
  }
}
</script>
