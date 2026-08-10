<style scoped src="../css/LoginView.css"></style>
<style scoped src="../css/Popup.css"></style>

<template>
  
  <div class="master-layout">
    <div class="animated-background"></div>

    <Transition name="popup">
      <div v-if="feedback.show" class="popup-overlay" @click="fecharPopup">
        <div :class="['popup-card', feedback.type]" @click.stop>
          
          <div class="popup-icon">
            <svg v-if="feedback.type === 'success'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-if="feedback.type === 'error'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h3>{{ feedback.type === 'success' ? 'Sucesso!' : 'Ops, algo deu errado' }}</h3>
          <p>{{ feedback.message }}</p>

          <button class="popup-btn" @click="fecharPopup">
            {{ feedback.type === 'success' ? 'Continuar' : 'Tentar Novamente' }}
          </button>
        </div>
      </div>
    </Transition>

    <div class="premium-card">
      
      <div class="immersive-panel">
        <img src="../assets/Banner1.png" alt="Visual Didascalias" class="cinematic-bg" />
        <div class="glass-overlay">
          <div class="immersive-content stagger-in-1">
            <div class="badge">Inovação</div>
            <h1 class="hero-text">Transforme a sua visão em<br/>resultados.</h1>
            <p class="hero-subtext">A plataforma definitiva para uma gestão inteligente e conectada. O seu universo num só lugar.</p>
          </div>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-wrapper">
          
          <div class="auth-header stagger-in-2">
            <div class="logo-showcase">
              <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
              <h1 class="brand-name">Didascalias</h1>
            </div>
            <h2>Bem-vindo!</h2>
            <p>Introduza as suas credenciais para acessar o sistema.</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            
            <div class="input-group stagger-in-3">
              <label for="email">E-mail</label>
              <div class="input-box">
                <i class="icon-mail">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </i>
                <input type="email" id="email" v-model="email" placeholder="nome@empresa.com" required :disabled="isLoading" />
              </div>
            </div>

            <div class="input-group stagger-in-4">
              <div class="label-row">
                <label for="password">Palavra-passe</label>
                <a href="#" class="link-forgot">Esqueceu a senha?</a>
              </div>
              <div class="input-box">
                <i class="icon-lock">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </i>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="••••••••" required :disabled="isLoading" />
                <button type="button" class="btn-eye" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>

            <div class="checkbox-group stagger-in-5">
              <div class="cyber-checkbox" @click="manterSessao = !manterSessao">
                <span class="box" :style="manterSessao ? 'background-color: #0066FF; border-color: #0066FF;' : ''">
                  <svg v-if="manterSessao" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                Manter sessão iniciada
              </div>
            </div>

            <div class="btn-container stagger-in-6">
              <button type="submit" class="btn-glow" :disabled="isLoading">
                <span>{{ isLoading ? 'Autenticando...' : 'Acessar' }}</span>
                <div class="light-sweep"></div>
              </button>
            </div>
          </form>

          <div class="register-wrapper stagger-in-6">
            <div class="register-divider">
              <div class="line"></div>
              <span>Novo por aqui?</span>
              <div class="line"></div>
            </div>
            
            <button type="button" class="register-button" @click="goToCadastro" :disabled="isLoading">
              Criar uma conta
            </button>
          </div>

          <div class="partners-section stagger-in-7">
            <p class="partners-title">Parceiros do Didascalias</p>
            <div class="partners-grid">
              <div class="partner-logo-wrapper"><img src="../assets/Affect.png" alt="Affect" class="partner-img" onerror="this.style.opacity='0'; this.parentElement.classList.add('fallback-box');" /></div>
              <div class="partner-logo-wrapper"><img src="../assets/Agora.png" alt="Agora" class="partner-img" onerror="this.style.opacity='0'; this.parentElement.classList.add('fallback-box');" /></div>
              <div class="partner-logo-wrapper"><img src="../assets/UAB.png" alt="UAB" class="partner-img" onerror="this.style.opacity='0'; this.parentElement.classList.add('fallback-box');" /></div>
              <div class="partner-logo-wrapper"><img src="../assets/UCM.png" alt="UCM" class="partner-img" onerror="this.style.opacity='0'; this.parentElement.classList.add('fallback-box');" /></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const manterSessao = ref(false)

// Estado do Pop-up
const feedback = ref({ 
  show: false, 
  message: '', 
  type: '' 
})

// Função para fechar o popup
const fecharPopup = () => {
  feedback.value.show = false
}

// Função auxiliar para exibir o popup
const showPopup = (msg, tipo) => {
  feedback.value = { show: true, message: msg, type: tipo }
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    showPopup("Por favor, preencha o e-mail e a palavra-passe.", 'error')
    return
  }

  isLoading.value = true

  try {
    // Define a persistência baseada na escolha do usuário
    const persistenceType = manterSessao.value ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);

    // Tenta autenticar o usuário no Firebase
    await signInWithEmailAndPassword(auth, email.value, password.value)
    
    // Se der certo, redireciona para a página principal (Home)
    router.push('/home')

  } catch (error) {
    console.error("Erro no login:", error)
    
    // Tratamento de erros comuns do Firebase para exibir mensagens amigáveis
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      showPopup("E-mail ou palavra-passe incorretos. Verifique e tente novamente.", 'error')
    } else if (error.code === 'auth/too-many-requests') {
      showPopup("Muitas tentativas sem sucesso. Por favor, tente novamente mais tarde.", 'error')
    } else if (error.code === 'auth/invalid-email') {
      showPopup("O formato do e-mail inserido é inválido.", 'error')
    } else {
      showPopup("Ocorreu um erro inesperado ao fazer login. Verifique sua conexão e tente novamente.", 'error')
    }
  } finally {
    isLoading.value = false
  }
}

const goToCadastro = () => {
  router.push('/cadastro')
}
</script>