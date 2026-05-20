<style scoped src="../css/CadastroView.css"></style>

<template>
  <div class="master-layout">
    <div class="animated-background"></div>

    <div class="premium-card">
      
      <!-- Painel Esquerdo (Formulário de Cadastro) -->
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
            
            <!-- Switch Button: Facilitador / Professor -->
            <div class="role-selector stagger-in-3">
              <div 
                class="role-option" 
                :class="{ active: userType === 'Facilitador' }"
                @click="userType = 'Facilitador'"
              >
                Facilitador
              </div>
              <div 
                class="role-option" 
                :class="{ active: userType === 'Professor' }"
                @click="userType = 'Professor'"
              >
                Professor
              </div>
            </div>

            <!-- Grid de Campos -->
            <div class="form-grid stagger-in-4">
              
              <!-- Nome Completo (Ocupa 2 colunas) -->
              <div class="input-group col-span-2">
                <label for="nome">Nome Completo</label>
                <div class="input-box">
                  <i class="icon-user">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </i>
                  <input type="text" id="nome" v-model="form.nome" placeholder="Seu nome completo" required />
                </div>
              </div>

              <!-- E-mail -->
              <div class="input-group">
                <label for="email">E-mail</label>
                <div class="input-box">
                  <i class="icon-mail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </i>
                  <input type="email" id="email" v-model="form.email" placeholder="nome@empresa.com" required />
                </div>
              </div>

              <!-- Telefone -->
              <div class="input-group">
                <label for="telefone">Telefone</label>
                <div class="input-box">
                  <i class="icon-phone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </i>
                  <input type="tel" id="telefone" v-model="form.telefone" placeholder="(00) 00000-0000" required />
                </div>
              </div>

              <!-- ID da Instituição -->
              <div class="input-group">
                <label for="instituicao">ID da Instituição</label>
                <div class="input-box">
                  <i class="icon-hash">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                  </i>
                  <input type="text" id="instituicao" v-model="form.instituicaoId" placeholder="Ex: INST-1234" required />
                </div>
              </div>

              <!-- Cargo -->
              <div class="input-group">
                <label for="cargo">Cargo</label>
                <div class="input-box">
                  <i class="icon-briefcase">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </i>
                  <input type="text" id="cargo" v-model="form.cargo" placeholder="Seu cargo atual" required />
                </div>
              </div>

              <!-- Senha -->
              <div class="input-group">
                <label for="password">Senha</label>
                <div class="input-box">
                  <i class="icon-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </i>
                  <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" placeholder="••••••••" required />
                  <button type="button" class="btn-eye" @click="showPassword = !showPassword">
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>

              <!-- Confirmar Senha -->
              <div class="input-group">
                <label for="confirmPassword">Confirmação de Senha</label>
                <div class="input-box">
                  <i class="icon-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </i>
                  <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="form.confirmPassword" placeholder="••••••••" required />
                  <button type="button" class="btn-eye" @click="showConfirmPassword = !showConfirmPassword">
                    <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>

            </div> <!-- Fim Grid -->

            <div class="btn-container stagger-in-5">
              <button type="submit" class="btn-glow">
                <span>Finalizar Cadastro</span>
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
            
            <button type="button" class="register-button" @click="goToLogin">
              Entrar no sistema
            </button>
          </div>

        </div>
      </div>

      <!-- Painel Direito (Banner Oculto em Mobile) -->
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

const router = useRouter()

// Controle do Switch
const userType = ref('Professor') // Valor inicial ('Facilitador' ou 'Professor')

// Campos do Formulário
const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  instituicaoId: '',
  cargo: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleCadastro = () => {
  if (form.password !== form.confirmPassword) {
    alert("As senhas não coincidem!")
    return
  }

  console.log('A registar novo utilizador:', {
    tipo: userType.value,
    ...form
  })
  // Lógica de Cadastro Aqui
}

const goToLogin = () => {
  router.push('/')
}
</script>