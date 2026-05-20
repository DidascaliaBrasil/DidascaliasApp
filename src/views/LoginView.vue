<style scoped src="../css/LoginView.css"></style>

<template>
  
  <div class="master-layout">
    <!-- Fundo Dinâmico com Gradiente Suave -->
    <div class="animated-background"></div>

    <div class="premium-card">
      
      <!-- LADO ESQUERDO: Painel Imersivo (Banner) -->
      <div class="immersive-panel">
        <img src="../assets/Banner.png" alt="Visual Didascalias" class="cinematic-bg" />
        <div class="glass-overlay">
          <div class="immersive-content stagger-in-1">
            <div class="badge">Inovação</div>
            <h1 class="hero-text">Transforme a sua visão em<br/>resultados.</h1>
            <p class="hero-subtext">A plataforma definitiva para uma gestão inteligente e conectada. O seu universo num só lugar.</p>
          </div>
        </div>
      </div>

      <!-- LADO DIREITO: Área de Autenticação (Branca) -->
      <div class="auth-panel">
        <div class="auth-wrapper">
          
          <!-- Logo e Boas-vindas -->
          <div class="auth-header stagger-in-2">
            <div class="logo-showcase">
              <img src="../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
              <h1 class="brand-name">Didascalias</h1>
            </div>
            <h2>Bem-vindo!</h2>
            <p>Introduza as suas credenciais para acessar o sistema.</p>
          </div>

          <!-- Formulário -->
          <form @submit.prevent="handleLogin" class="auth-form">
            
            <!-- Campo E-mail -->
            <div class="input-group stagger-in-3">
              <label for="email">E-mail</label>
              <div class="input-box">
                <i class="icon-mail">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </i>
                <input type="email" id="email" v-model="email" placeholder="nome@empresa.com" required />
              </div>
            </div>

            <!-- Campo Palavra-passe -->
            <div class="input-group stagger-in-4">
              <div class="label-row">
                <label for="password">Palavra-passe</label>
                <a href="#" class="link-forgot">Esqueceu a senha?</a>
              </div>
              <div class="input-box">
                <i class="icon-lock">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </i>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="••••••••" required />
                <button type="button" class="btn-eye" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>

            <div class="checkbox-group stagger-in-5">
              <label class="cyber-checkbox">
                <input type="checkbox" />
                <span class="box"></span>
                Manter sessão iniciada
              </label>
            </div>

            <!-- Botão Inovador -->
            <div class="btn-container stagger-in-6">
              <button type="submit" class="btn-glow">
                <span>Acessar</span>
                <div class="light-sweep"></div>
              </button>
            </div>

          </form>

          <!-- Secção de Parceiros (Novidade) -->
          <div class="partners-section stagger-in-7">
            <p class="partners-title">Parceiros do Didascalias</p>
            <div class="partners-grid">
              <!-- Substitua os SRCs pelos nomes reais dos seus ficheiros -->
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

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = () => {
  console.log('A autenticar:', email.value)
  // Lógica de Login Aqui
}
</script>