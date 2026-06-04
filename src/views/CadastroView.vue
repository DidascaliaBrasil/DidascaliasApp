<style scoped src="../css/CadastroView.css"></style>
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
      
      <div class="auth-panel">
        <div class="auth-wrapper">
          
          <div class="auth-header stagger-in-2">
            <div class="logo-showcase">
              <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
              <h1 class="brand-name">Didascalias</h1>
            </div>
            <h2>Criar uma conta</h2>
            <p>Preencha os seus dados para se registar no sistema.</p>
          </div>

          <form @submit.prevent="handleCadastro" class="auth-form">
            
            <div class="role-selector stagger-in-3">
              <div 
                class="role-option" 
                :class="{ active: userType === 'Usuario' }"
                @click="userType = 'Usuario'"
              >
                Usuario
              </div>
              <div 
                class="role-option" 
                :class="{ active: userType === 'Facilitador' }"
                @click="userType = 'Facilitador'"
              >
                Facilitador
              </div>
            </div>

            <div class="form-grid stagger-in-4">
              
              <div class="input-group col-span-2">
                <label for="nome">Nome Completo</label>
                <div class="input-box">
                  <i class="icon-user">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </i>
                  <input type="text" id="nome" v-model="form.nome" placeholder="Seu nome completo" required :disabled="isLoading" />
                </div>
              </div>

              <div class="input-group">
                <label for="email">E-mail</label>
                <div class="input-box">
                  <i class="icon-mail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </i>
                  <input type="email" id="email" v-model="form.email" placeholder="nome@empresa.com" required :disabled="isLoading" />
                </div>
              </div>

              <div class="input-group">
                <label for="telefone">Telefone</label>
                <div class="input-box">
                  <i class="icon-phone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </i>
                  <input type="tel" id="telefone" v-model="form.telefone" placeholder="(00) 00000-0000" required :disabled="isLoading" />
                </div>
              </div>

              <div class="input-group">
                <label for="instituicao">ID da Instituição</label>
                <div class="input-box">
                  <i class="icon-hash">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                  </i>
                  <input type="text" id="instituicao" v-model="form.instituicaoId" placeholder="Ex: TRY9999" required :disabled="isLoading" />
                </div>
              </div>

              <div class="input-group">
                <label for="cargo">Cargo</label>
                <div class="input-box">
                  <i class="icon-briefcase">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </i>
                  <input type="text" id="cargo" v-model="form.cargo" placeholder="Seu cargo atual" required :disabled="isLoading" />
                </div>
              </div>

              <div class="input-group">
                <label for="password">Senha</label>
                <div class="input-box">
                  <i class="icon-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </i>
                  <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" placeholder="••••••••" required :disabled="isLoading" />
                  <button type="button" class="btn-eye" @click="showPassword = !showPassword">
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>

              <div class="input-group">
                <label for="confirmPassword">Confirmação de Senha</label>
                <div class="input-box">
                  <i class="icon-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </i>
                  <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="form.confirmPassword" placeholder="••••••••" required :disabled="isLoading" />
                  <button type="button" class="btn-eye" @click="showConfirmPassword = !showConfirmPassword">
                    <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>

            </div>

            <div class="btn-container stagger-in-5">
              <button type="submit" class="btn-glow" :disabled="isLoading">
                <span>{{ isLoading ? 'Processando...' : 'Finalizar Cadastro' }}</span>
                <div class="light-sweep"></div>
              </button>
            </div>
          </form>

          <div class="register-wrapper stagger-in-6">
            <div class="register-divider">
              <div class="line"></div>
              <span>Já possui uma conta?</span>
              <div class="line"></div>
            </div>
            
            <button type="button" class="register-button" @click="goToLogin" :disabled="isLoading">
              Entrar no sistema
            </button>
          </div>

        </div>
      </div>

      <div class="immersive-panel">
        <img src="../assets/Banner2.png" alt="Visual Didascalias" class="cinematic-bg" />
        <div class="glass-overlay">
          <div class="immersive-content stagger-in-1">
            <div class="badge">Junte-se a nós</div>
            <h1 class="hero-text">Comece a sua jornada<br/>hoje mesmo.</h1>
            <p class="hero-subtext">Crie a sua conta e acesse as melhores ferramentas de gestão educacional e conectividade.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { auth, database } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref as dbRef, get, set } from 'firebase/database'

const router = useRouter()

const userType = ref('Usuario')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const feedback = ref({ 
  show: false, 
  message: '', 
  type: '' 
})

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  instituicaoId: '',
  cargo: '',
  password: '',
  confirmPassword: ''
})

const goToLogin = () => {
  router.push('/')
}

const fecharPopup = () => {
  feedback.value.show = false
  if (feedback.value.type === 'success') {
    goToLogin()
  }
}

const showPopup = (msg, tipo) => {
  feedback.value = { show: true, message: msg, type: tipo }
}

const handleCadastro = async () => {
  if (form.password !== form.confirmPassword) {
    showPopup("As senhas não coincidem. Por favor, verifique e tente novamente.", 'error')
    return
  }

  isLoading.value = true

  try {
    // 1. Verifica se a Instituição existe
    const instituicaoRef = dbRef(database, `instituicoes/${form.instituicaoId}`)
    const snapshot = await get(instituicaoRef)

    if (!snapshot.exists()) {
      showPopup("O ID da Instituição informado não foi encontrado em nosso sistema.", 'error')
      isLoading.value = false
      return
    }

    // 2. Cria o usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
    const user = userCredential.user

    // 3. Define a pasta baseada no cargo (Usuarioes ou facilitadores) e gera ID curto
    const pastaCargo = userType.value === 'Usuario' ? 'Usuarioes' : 'facilitadores'
    const shortId = user.uid.substring(0, 8).toUpperCase()

    // 4. Monta o pacote de dados do usuário
    const dadosUsuario = {
      idCurto: shortId,
      authUid: user.uid,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      cargo: form.cargo,
      tipoCadastro: userType.value,
      instituicaoId: form.instituicaoId,
      criadoEm: new Date().toISOString()
    }

    // 5. Salva os dados na estrutura correta
    await Promise.all([
      // Apenas o ID dentro do nó da Instituição (registra como true para listar facilmente depois)
      set(dbRef(database, `instituicoes/${form.instituicaoId}/usuarios/${shortId}`), form.nome),
      
      // (Opcional, mas muito útil) Mantém um nó raiz "usuarios" para buscar qualquer um independente da faculdade
      set(dbRef(database, `usuarios/${shortId}`), dadosUsuario)
    ])

    showPopup("Seu cadastro foi realizado com sucesso! Você já pode acessar a plataforma.", 'success')

  } catch (error) {
    console.error("Erro no cadastro:", error)
    
    if (error.code === 'auth/email-already-in-use') {
      showPopup("Este e-mail já está sendo utilizado por outra conta.", 'error')
    } else if (error.code === 'auth/weak-password') {
      showPopup("A senha é muito fraca. Por favor, utilize pelo menos 6 caracteres.", 'error')
    } else {
      showPopup("Ocorreu um erro inesperado ao criar sua conta. Verifique sua conexão e tente novamente.", 'error')
    }
  } finally {
    isLoading.value = false
  }
}
</script>