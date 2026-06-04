<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <MenuLateral v-if="!isLoading" :user-data="userData" />

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
        <p>A carregar o ambiente...</p>
      </div>

      <div v-else class="welcome-card glass-effect stagger-in">
        
        <HomeInstituicao 
          v-if="tipoNormalizado === 'instituicao'" 
          :user-data="userData" 
        />
        
        <HomeFacilitador 
          v-else-if="tipoNormalizado === 'facilitador'" 
          :user-data="userData" 
        />
        
        <HomeUsuario 
          v-else-if="tipoNormalizado === 'usuario'" 
          :user-data="userData" 
        />

        <div v-else class="info-grid">
          <p style="color: #ff4444; width: 100%; font-weight: bold; background: rgba(255,0,0,0.1); padding: 10px; border-radius: 4px;">
            Erro: Tipo de conta não reconhecido ou dados inexistentes.
          </p>
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

// Não esqueça de importar o MenuLateral aqui nos scripts!
import MenuLateral from '../components/generic/MenuLateral.vue' 
import HomeInstituicao from '../components/instituicao/HomeInstituicao.vue'
import HomeFacilitador from '../components/facilitador/HomeFacilitador.vue'
import HomeUsuario from '../components/usuario/HomeUsuario.vue'

const router = useRouter()
const isLoading = ref(true)

const userData = ref({})

const tipoNormalizado = computed(() => {
  if (!userData.value.tipo) return 'indefinido'
  return String(userData.value.tipo)
    .trim() 
    .toLowerCase() 
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/g, "") 
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
            ...dataEncontrada,
            id: idUsado,
            tipo: tipoConta
          }
        } else {
          userData.value = { tipo: "erro" }
        }

      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        isLoading.value = false
      }
    } else {
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