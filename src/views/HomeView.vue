<style scoped src="../css/HomeView.css"></style>

<template>
  <div class="home-layout">
    <div class="animated-background"></div>

    <MenuLateral 
      v-if="!isLoading" 
      :user-data="userData" 
      @abrir-linkar-oculos="isLinkarOculosOpen = true"
      @abrir-gerenciar-oculos="isGerenciarOculosOpen = true"
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

      <div v-else class="welcome-section stagger-in-2">
        <HomeInstituicao 
          v-if="tipoNormalizado === 'instituicao'" 
          :user-data="userData" 
          @abrir-linkar-oculos="isLinkarOculosOpen = true"
          @abrir-gerenciar-oculos="isGerenciarOculosOpen = true"
        />
        
        <HomeFacilitador 
          v-else-if="tipoNormalizado === 'facilitador'" 
          :user-data="userData" 
        />
        
        <HomeUsuario 
          v-else-if="tipoNormalizado === 'usuario'" 
          :user-data="userData" 
        />

        <div v-else class="error-box">
          <p>Erro: Tipo de conta não reconhecido ou dados inexistentes.</p>
        </div>
      </div>
    </main>

    <Transition name="slide-side">
      <LinkarOculos 
        v-if="isLinkarOculosOpen && tipoNormalizado === 'instituicao'" 
        :instituicaoId="userData.id"
        @fechar="isLinkarOculosOpen = false"
      />
    </Transition>

    <Transition name="slide-side">
      <GerenciarOculos 
        v-if="isGerenciarOculosOpen && tipoNormalizado === 'instituicao'" 
        :instituicaoId="userData.id"
        @fechar="isGerenciarOculosOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, database } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, get } from 'firebase/database'

import MenuLateral from '../components/generic/MenuLateral.vue' 
import HomeInstituicao from '../components/instituicao/HomeInstituicao.vue'
import HomeFacilitador from '../components/facilitador/HomeFacilitador.vue'
import HomeUsuario from '../components/usuario/HomeUsuario.vue'

// Importações dos painéis deslizantes de gerenciamento de dispositivos VR
import LinkarOculos from '../components/instituicao/LinkarOculos.vue'
import GerenciarOculos from '../components/instituicao/GerenciarOculos.vue'

const router = useRouter()
const isLoading = ref(true)
const userData = ref({})

// Estados reativos para controlar a exibição dos painéis laterais de óculos
const isLinkarOculosOpen = ref(false)
const isGerenciarOculosOpen = ref(false)

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
            email: user.email, 
            ...dataEncontrada,
            id: idUsado,
            tipo: tipoConta
          }
        } else {
          userData.value = { email: user.email, tipo: "erro" }
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
</script>

<style scoped>
/* CSS para gerenciar a animação de entrada e saída dos painéis laterais à direita */
.slide-side-enter-active,
.slide-side-leave-active {
  transition: opacity 0.3s ease;
}

.slide-side-enter-active :deep(.panel-content),
.slide-side-leave-active :deep(.panel-content) {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-side-enter-from { opacity: 0; }
.slide-side-leave-to { opacity: 0; }

.slide-side-enter-from :deep(.panel-content) { transform: translateX(100%); }
.slide-side-leave-to :deep(.panel-content) { transform: translateX(100%); }
</style>