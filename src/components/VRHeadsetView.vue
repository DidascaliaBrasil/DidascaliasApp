<template>
  <div class="vr-view-card" ref="cardRef">
    <!-- BARRA SUPERIOR DO PLAYER VR -->
    <div class="vr-header">
      <div class="header-info">
        <span class="status-indicator" :class="statusClass"></span>
        <div class="title-wrap">
          <h3 class="vr-title">Visão do Óculos VR (Headset)</h3>
          <span class="status-label">{{ statusLabel }}</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- BADGE DO PIN (ESTRATÉGIA B) -->
        <div 
          v-if="cleanRoomId" 
          class="pin-badge" 
          @click="copiarPin" 
          :title="'Clique para copiar o PIN: ' + cleanRoomId"
        >
          <span class="pin-tag">PIN VR</span>
          <strong class="pin-number">{{ cleanRoomId }}</strong>
          <span class="copy-icon">{{ pinCopiado ? '✓' : '📋' }}</span>
        </div>

        <button 
          v-if="!isLive && !isConnecting" 
          type="button" 
          class="btn-icon-reload" 
          @click="conectar" 
          title="Reconectar ao servidor de transmissão"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- ÁREA PRINCIPAL DO VÍDEO -->
    <div class="video-container" ref="videoContainerRef">
      <video 
        ref="videoRef" 
        autoplay 
        playsinline 
        :muted="isMuted"
        class="vr-video-element"
      ></video>

      <!-- OVERLAY QUANDO NÃO ESTÁ AO VIVO -->
      <div v-if="!isLive" class="placeholder-overlay">
        <div class="overlay-center-box">
          <div class="spinner" v-if="isConnecting"></div>
          
          <div v-else class="disconnected-icon-circle">
            <svg class="headset-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7z"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="8" cy="15" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
            </svg>
          </div>

          <h4 class="overlay-title">{{ statusTitle }}</h4>
          <p class="overlay-message">{{ statusMessage }}</p>

          <div v-if="cleanRoomId" class="overlay-pin-helper">
            <span class="helper-text">Insira no óculos VR o PIN:</span>
            <span class="helper-pin-pill">{{ cleanRoomId }}</span>
          </div>

          <button 
            v-if="!isConnecting" 
            type="button" 
            @click="conectar" 
            class="btn-retry"
          >
            <span>Reconectar Transmissão</span>
          </button>
        </div>
      </div>

      <!-- BADGE FLUTUANTE AO VIVO -->
      <div v-if="isLive" class="live-pill-badge">
        <span class="live-pulse-dot"></span>
        <span>AO VIVO</span>
      </div>

      <!-- BARRA DE CONTROLES INFERIORES -->
      <div class="video-controls-bar">
        <!-- CONTROLE DE ÁUDIO -->
        <div class="volume-control-group">
          <button 
            type="button" 
            class="ctrl-btn-sound" 
            @click="toggleMute"
            :title="isMuted ? 'Desmutar áudio' : 'Mutar áudio'"
          >
            <span>{{ isMuted ? '🔇' : (volumeLevel > 50 ? '🔊' : '🔉') }}</span>
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="volumeLevel" 
            @input="ajustarVolume"
            class="volume-slider" 
            :disabled="isMuted"
            title="Ajustar volume"
          />
          <span class="volume-text">{{ isMuted ? '0%' : volumeLevel + '%' }}</span>
        </div>

        <!-- AÇÕES À DIREITA: FULLSCREEN -->
        <div class="right-controls-group">
          <button 
            type="button" 
            class="ctrl-btn-fs" 
            @click="toggleFullscreen"
            :title="isEmTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'"
          >
            <span class="fs-icon">{{ isEmTelaCheia ? '⏹️' : '⛶' }}</span>
            <span class="fs-label">{{ isEmTelaCheia ? 'Reduzir' : 'Tela Cheia' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  },
  serverUrl: {
    type: String,
    default: 'wss://cyclops-dev.uab.cat/cast-wss/'
  }
})

const emit = defineEmits(['status-change', 'live-change'])

const cardRef = ref(null)
const videoContainerRef = ref(null)
const videoRef = ref(null)

const statusMessage = ref('Aguardando conexão com o óculos VR...')
const isLive = ref(false)
const isConnecting = ref(false)
const pinCopiado = ref(false)
const isMuted = ref(true)
const volumeLevel = ref(80)
const isEmTelaCheia = ref(false)

let pc = null
let ws = null
let pendingCandidates = []

// Limpa e formata o ID da sala para 4 dígitos (Estratégia B)
const cleanRoomId = computed(() => {
  if (!props.roomId) return ''
  const str = String(props.roomId).trim()
  return str
})

const statusClass = computed(() => {
  if (isLive.value) return 'status-live'
  if (isConnecting.value) return 'status-connecting'
  return 'status-disconnected'
})

const statusLabel = computed(() => {
  if (isLive.value) return 'Ao Vivo (WebRTC)'
  if (isConnecting.value) return 'Sincronizando...'
  return 'Aguardando Dispositivo'
})

const statusTitle = computed(() => {
  if (isConnecting.value) return 'Conectando ao Servidor de Sinalização'
  return 'Óculos VR Desconectado'
})

function copiarPin() {
  if (!cleanRoomId.value) return
  try {
    navigator.clipboard.writeText(cleanRoomId.value)
    pinCopiado.value = true
    setTimeout(() => {
      pinCopiado.value = false
    }, 2000)
  } catch (e) {
    console.warn('Erro ao copiar PIN:', e)
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value
    if (!isMuted.value) {
      videoRef.value.volume = volumeLevel.value / 100
    }
  }
}

function ajustarVolume() {
  if (videoRef.value) {
    if (isMuted.value) isMuted.value = false
    videoRef.value.muted = false
    videoRef.value.volume = volumeLevel.value / 100
  }
}

function toggleFullscreen() {
  const el = videoContainerRef.value || cardRef.value
  if (!el) return

  if (!document.fullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => {
        isEmTelaCheia.value = true
      }).catch(err => {
        console.warn('Erro ao entrar em tela cheia:', err)
      })
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isEmTelaCheia.value = false
      })
    }
  }
}

function onFullscreenChange() {
  isEmTelaCheia.value = !!document.fullscreenElement
}

function cleanup() {
  if (pc) {
    try {
      pc.ontrack = null
      pc.onicecandidate = null
      pc.close()
    } catch (e) {}
    pc = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  if (ws) {
    try {
      ws.onopen = null
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.close()
    } catch (e) {}
    ws = null
  }

  isLive.value = false
  isConnecting.value = false
  pendingCandidates = []
  emit('live-change', false)
  emit('status-change', 'disconnected')
}

async function conectar() {
  const pin = cleanRoomId.value
  if (!pin) {
    statusMessage.value = 'Nenhum PIN de sala especificado.'
    return
  }

  cleanup()
  isConnecting.value = true
  statusMessage.value = 'Conectando ao servidor de transmissão...'
  emit('status-change', 'connecting')

  try {
    // Na Estratégia B, conecta como browser usando o PIN numérico de 4 dígitos
    const wsUrl = `${props.serverUrl}?type=browser&id=${encodeURIComponent(pin)}`
    ws = new WebSocket(wsUrl)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      isConnecting.value = true
      statusMessage.value = 'Aguardando o óculos VR iniciar a transmissão...'
      console.log(`[VRHeadsetView] WebSocket aberto com sucesso. Aguardando Unity no PIN: ${pin}`)
    }

    ws.onmessage = async (event) => {
      try {
        let raw = event.data instanceof ArrayBuffer
          ? new TextDecoder().decode(event.data)
          : event.data

        const msg = JSON.parse(raw)

        // Desconexão do Unity (type 2)
        if (msg.type === 2) {
          cleanup()
          statusMessage.value = 'O óculos encerrou a transmissão.'
          return
        }

        // Oferta SDP vinda do Unity (type 3)
        if (msg.type === 3) {
          const sdpData = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body
          
          pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          })

          pc.ontrack = (trackEvent) => {
            const stream = (trackEvent.streams && trackEvent.streams[0]) 
              ? trackEvent.streams[0] 
              : new MediaStream([trackEvent.track])

            if (videoRef.value) {
              videoRef.value.srcObject = stream
              videoRef.value.play().catch(e => {
                console.warn('[VRHeadsetView] Autoplay bloqueado pelo navegador, necessita clique:', e)
              })
            }

            isLive.value = true
            isConnecting.value = false
            statusMessage.value = 'Ao Vivo'
            emit('live-change', true)
            emit('status-change', 'live')
          }

          pc.onicecandidate = (candEvent) => {
            if (candEvent.candidate && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 4,
                body: JSON.stringify({
                  candidate: candEvent.candidate.candidate,
                  sdpMid: candEvent.candidate.sdpMid,
                  sdpMLineIndex: candEvent.candidate.sdpMLineIndex
                })
              }))
            }
          }

          await pc.setRemoteDescription({ type: 'offer', sdp: sdpData.sdp })

          // Processa candidatos ICE que tenham chegado antes da oferta
          for (const cand of pendingCandidates) {
            await pc.addIceCandidate(cand).catch(console.warn)
          }
          pendingCandidates = []

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 3,
              body: JSON.stringify({ type: 'answer', sdp: answer.sdp })
            }))
            console.log('[VRHeadsetView] Resposta SDP (Answer) enviada para o servidor.')
          }
        }

        // Candidatos ICE vindos do Unity (type 4)
        else if (msg.type === 4) {
          const iceData = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body
          const candidate = {
            candidate: iceData.candidate,
            sdpMid: iceData.sdpMid,
            sdpMLineIndex: iceData.sdpMLineIndex
          }

          if (!pc || !pc.remoteDescription) {
            pendingCandidates.push(candidate)
          } else {
            await pc.addIceCandidate(candidate).catch(console.warn)
          }
        }
      } catch (err) {
        console.error('[VRHeadsetView] Erro ao processar mensagem do signaling:', err)
      }
    }

    ws.onerror = (e) => {
      console.warn('[VRHeadsetView] Erro no WebSocket de sinalização:', e)
      isConnecting.value = false
      statusMessage.value = 'Erro ao conectar ao servidor de sinalização.'
      emit('status-change', 'disconnected')
    }

    ws.onclose = () => {
      isConnecting.value = false
      isLive.value = false
      statusMessage.value = 'Sessão desconectada. Clique para tentar novamente.'
      emit('live-change', false)
      emit('status-change', 'disconnected')
    }

  } catch (error) {
    console.error('[VRHeadsetView] Falha ao iniciar WebSocket:', error)
    isConnecting.value = false
    statusMessage.value = 'Falha ao estabelecer conexão com o servidor.'
  }
}

watch(() => props.roomId, (novoPin) => {
  if (novoPin) {
    conectar()
  } else {
    cleanup()
  }
})

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  if (cleanRoomId.value) {
    conectar()
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  cleanup()
})
</script>

<style scoped>
.vr-view-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* BARRA SUPERIOR */
.vr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.vr-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1.2;
}

.status-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-live {
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e, 0 0 20px rgba(34, 197, 94, 0.4);
  animation: pulseLive 2s infinite;
}

.status-connecting {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
  animation: pulseConnecting 1.5s infinite;
}

.status-disconnected {
  background: #64748b;
}

@keyframes pulseLive {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}

@keyframes pulseConnecting {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* AÇÕES DO HEADER E BADGE DO PIN */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.pin-badge:hover {
  background: rgba(59, 130, 246, 0.28);
  border-color: #60a5fa;
  transform: translateY(-1px);
}

.pin-tag {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #93c5fd;
  text-transform: uppercase;
}

.pin-number {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.1em;
  font-family: monospace;
}

.copy-icon {
  font-size: 0.78rem;
  color: #93c5fd;
}

.btn-icon-reload {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-icon-reload:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* CONTAINER DE VÍDEO */
.video-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 240px;
  background: #020617;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vr-video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* OVERLAY QUANDO NÃO AO VIVO */
.placeholder-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.98) 100%);
  z-index: 10;
  padding: 20px;
}

.overlay-center-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 360px;
  gap: 12px;
}

.disconnected-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  margin-bottom: 4px;
}

.headset-svg {
  width: 32px;
  height: 32px;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3.5px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.overlay-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.overlay-message {
  font-size: 0.84rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.overlay-pin-helper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 8px;
  margin-top: 4px;
}

.helper-text {
  font-size: 0.78rem;
  color: #cbd5e1;
}

.helper-pin-pill {
  font-size: 1rem;
  font-weight: 800;
  color: #38bdf8;
  font-family: monospace;
  letter-spacing: 0.12em;
}

.btn-retry {
  margin-top: 8px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transition: all 0.2s ease;
}

.btn-retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5);
}

/* BADGE FLUTUANTE AO VIVO */
.live-pill-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 12;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(220, 38, 38, 0.88);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.5);
  backdrop-filter: blur(8px);
}

.live-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  animation: pulseDot 1.2s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* BARRA DE CONTROLES INFERIORES */
.video-controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  height: 44px;
  padding: 0 16px;
  background: linear-gradient(to top, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0));
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0.88;
  transition: opacity 0.25s ease;
}

.video-container:hover .video-controls-bar {
  opacity: 1;
}

.volume-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn-sound {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 72px;
  height: 4px;
  accent-color: #38bdf8;
  cursor: pointer;
}

.volume-text {
  font-size: 0.72rem;
  color: #94a3b8;
  font-family: monospace;
  min-width: 30px;
}

.right-controls-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ctrl-btn-fs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f1f5f9;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ctrl-btn-fs:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}

.fs-icon {
  font-size: 0.82rem;
}
</style>
