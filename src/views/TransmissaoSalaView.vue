<template>
  <div class="transmissao-page-container" ref="transmissaoContainerRef">
    <!-- BARRA SUPERIOR LIMPA (BRANCO E CINZA) -->
    <header class="transmissao-header">
      <div class="header-left">
        <button 
          type="button" 
          class="btn-nav-back"
          @click="voltarAoConsole"
          title="Voltar ao console de controle"
        >
          <span class="back-arrow">←</span>
          <span>Voltar</span>
        </button>

        <div class="room-info-badge">
          <span class="room-icon">🥽</span>
          <strong class="room-title">{{ sala?.roomName || 'Transmissão da Sala Virtual' }}</strong>
        </div>

        <span class="transmission-status-tag">
          <span class="status-dot"></span>
          <span>Transmissão da Sala</span>
        </span>
      </div>

      <!-- Espaço reservado à direita para o seletor flutuante de idioma do sistema -->
      <div class="header-lang-spacer"></div>
    </header>

    <!-- ÁREA PRINCIPAL DO VÍDEO (VIEWPORT COM CONTROLES INFERIORES) -->
    <main class="transmissao-viewport">
      <div class="transmissao-player-card">
        
        <!-- TELA DO VÍDEO COM PLACEHOLDER LIMPO (BRANCO E CINZA) -->
        <div class="transmissao-screen">
          <div class="clean-placeholder-box">
            <div class="clean-placeholder-circle">
              <svg class="clean-placeholder-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                <path d="M23 7l-7 5 7 5V7z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <h2 class="clean-placeholder-title">Vídeo não encontrado</h2>
            <p class="clean-placeholder-sub">Nenhuma transmissão detectada no momento</p>
          </div>
        </div>

        <!-- BARRA INFERIOR DE CONTROLES: VOLUME (ESQ) E TELA CHEIA (DIR) -->
        <div class="transmissao-bottombar">
          <!-- CONTROLE DE VOLUME -->
          <div class="player-volume-wrap">
            <button 
              type="button" 
              class="player-ctrl-btn mini"
              @click="videoMutado = !videoMutado"
              :title="videoMutado ? 'Desmutar som' : 'Mutar som'"
            >
              <span>{{ videoMutado ? '🔇' : '🔊' }}</span>
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model="volumeVideo" 
              class="player-volume-slider" 
              :disabled="videoMutado"
              title="Ajustar volume"
            />
            <span class="player-volume-label">{{ videoMutado ? '0%' : volumeVideo + '%' }}</span>
          </div>

          <!-- BOTÃO TELA CHEIA -->
          <div class="player-actions-wrap">
            <button 
              type="button" 
              class="player-ctrl-btn"
              @click="toggleFullscreen"
              :title="isTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'"
            >
              <span class="btn-ctrl-icon">{{ isTelaCheia ? '⏹️' : '⛶' }}</span>
              <span>{{ isTelaCheia ? 'Sair da Tela Cheia' : 'Tela Cheia' }}</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { database } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'

const route = useRoute()
const router = useRouter()
const salaId = ref(route.params.id)
const sala = ref(null)

const transmissaoContainerRef = ref(null)
const volumeVideo = ref(80)
const videoMutado = ref(false)
const isTelaCheia = ref(false)

const carregarSala = async () => {
  if (!salaId.value) return
  try {
    const snap = await get(dbRef(database, `classroom_configs/${salaId.value}`))
    if (snap.exists()) {
      sala.value = snap.val()
    }
  } catch (err) {
    console.error('Erro ao carregar dados da sala:', err)
  }
}

const voltarAoConsole = () => {
  if (window.opener && !window.opener.closed) {
    window.close()
  } else {
    router.push(`/configurar-sala/${salaId.value}`)
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    const el = transmissaoContainerRef.value || document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => {
        isTelaCheia.value = true
      }).catch(err => {
        console.warn('Erro ao entrar em tela cheia:', err)
      })
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isTelaCheia.value = false
      })
    }
  }
}

const handleFsChange = () => {
  isTelaCheia.value = !!document.fullscreenElement
}

onMounted(() => {
  carregarSala()
  document.addEventListener('fullscreenchange', handleFsChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFsChange)
})
</script>

<style scoped>
.transmissao-page-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  color: #0f172a;
  overflow: hidden;
  font-family: inherit;
}

/* BARRA SUPERIOR */
.transmissao-header {
  height: 52px;
  background: #ffffff;
  border-bottom: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  padding-right: 120px; /* Garante que o botão de idioma flutuante do App.vue não sobreponha nada */
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-nav-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-nav-back:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.back-arrow {
  font-size: 0.9rem;
}

.room-info-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  border-radius: 8px;
}

.room-icon {
  font-size: 1rem;
}

.room-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
}

.transmission-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #0071e3;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0071e3;
}

.header-lang-spacer {
  width: 100px;
  flex-shrink: 0;
}

/* VIEWPORT PRINCIPAL */
.transmissao-viewport {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 14px 18px;
  overflow: hidden;
}

.transmissao-player-card {
  flex: 1;
  min-height: 0;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
}

/* TELA DO VÍDEO */
.transmissao-screen {
  flex: 1;
  min-height: 0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* PLACEHOLDER BRANCO E CINZA */
.clean-placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.clean-placeholder-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.clean-placeholder-svg {
  width: 32px;
  height: 32px;
  color: #94a3b8;
}

.clean-placeholder-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.2px;
}

.clean-placeholder-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* BARRA INFERIOR DE CONTROLES DO PLAYER (BRANCO E CINZA) */
.transmissao-bottombar {
  height: 48px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.player-volume-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-volume-slider {
  width: 85px;
  height: 4px;
  accent-color: #475569;
  cursor: pointer;
}

.player-volume-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  min-width: 32px;
}

.player-actions-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-ctrl-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.player-ctrl-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.player-ctrl-btn.mini {
  padding: 4px 6px;
  font-size: 0.9rem;
  background: transparent;
  border-color: transparent;
}

.player-ctrl-btn.mini:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.btn-ctrl-icon {
  font-size: 0.85rem;
  color: #475569;
}
</style>
