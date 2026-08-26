<template>
  <div class="linkar-overlay" @click.self="$emit('fechar')">
    <div class="panel-content-glass">
      
      <!-- Navbar do Painel Glass -->
      <nav class="panel-navbar">
        <div class="logo-area">
          <img src="../../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
          <div class="brand-text-group">
            <span class="brand-name notranslate" translate="no">Didascalias</span>
            <span class="panel-tag">VR DEVICE SYNC</span>
          </div>
        </div>
        <button class="btn-fechar-panel" @click="$emit('fechar')" aria-label="Fechar painel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </nav>

      <!-- Conteúdo com Scroll Suave -->
      <div class="scroll-area">
        <div class="header-section">
          <div class="header-badge">
            <span class="pulse-indicator"></span>
            <span>Aguardando Aprovação</span>
          </div>
          <h2 class="panel-heading">Sincronizar Novos Óculos</h2>
          <p class="subtitle">Aprove ou rejeite os pedidos de registro de óculos VR para sua instituição.</p>
        </div>

        <div v-if="loading" class="loading-state-glass">
          <div class="spinner-glass"></div>
          <p>Buscando dispositivos pendentes...</p>
        </div>
        
        <div v-else>
          <transition-group name="list-anim" tag="div" class="cards-stack" v-if="pendingDevices.length > 0">
            <div v-for="device in pendingDevices" :key="device.id" class="device-card-glass">
              
              <div class="card-head">
                <div class="device-icon-wrapper">
                  <span class="vr-icon">🥽</span>
                </div>
                <div class="device-title-info">
                  <h3 class="device-model">{{ device.modelo || 'Óculos VR Desconhecido' }}</h3>
                  <span class="device-status">Pendente de Aceite</span>
                </div>
              </div>
              
              <div class="card-meta-glass">
                <div class="info-row">
                  <span class="meta-label">ID do Dispositivo:</span>
                  <span class="meta-value code-chip" :title="device.id">{{ device.id }}</span>
                </div>
                <div class="info-row">
                  <span class="meta-label">Solicitado em:</span>
                  <span class="meta-value">{{ formatarData(device.dataRegistro || device.dataPedido) || 'Recentemente' }}</span>
                </div>
              </div>
              
              <div class="card-actions-row">
                <button class="btn-deny-glass" @click="denyDevice(device.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Recusar
                </button>
                <button class="btn-accept-glass" @click="acceptDevice(device)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Aprovar Óculos
                </button>
              </div>
            </div>
          </transition-group>
          
          <div v-else class="empty-state-panel">
            <div class="empty-emoji-ring">✨</div>
            <h3>Tudo pronto por aqui!</h3>
            <p>Nenhum óculos aguardando autorização no momento.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getDatabase, ref as dbRef, onValue, set, remove } from 'firebase/database'

const props = defineProps({
  instituicaoId: {
    type: String,
    required: true
  }
})

defineEmits(['fechar'])

const pendingDevices = ref([])
const loading = ref(true)
const db = getDatabase()
let unsubscribe = null

const formatarData = (dataIso) => {
  if (!dataIso) return ''
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  const dispositivosRef = dbRef(db, `pedidos_registro/${props.instituicaoId}`)
  
  unsubscribe = onValue(dispositivosRef, (snapshot) => {
    loading.value = true
    const data = snapshot.val()
    const tempDevices = []
    
    if (data) {
      for (const [id, info] of Object.entries(data)) {
        tempDevices.push({ id, ...info })
      }
    }
    
    pendingDevices.value = tempDevices
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const acceptDevice = async (device) => {
  try {
    const oculosInstituicaoRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${device.id}`)
    const dispositivoVrRef = dbRef(db, `pedidos_registro/${props.instituicaoId}/${device.id}`)

    await set(oculosInstituicaoRef, {
      dataRegistro: device.dataPedido || new Date().toISOString(),
      modelo: device.modelo || 'Óculos VR',
      instituicaoId: props.instituicaoId,
      Oculos_id: device.id
    })

    await remove(dispositivoVrRef)
  } catch (error) {
    console.error("Erro ao aceitar dispositivo:", error)
  }
}

const denyDevice = async (deviceId) => {
  try {
    const dispositivoVrRef = dbRef(db, `pedidos_registro/${props.instituicaoId}/${deviceId}`)
    await remove(dispositivoVrRef)
  } catch (error) {
    console.error("Erro ao negar dispositivo:", error)
  }
}
</script>

<style scoped>
.linkar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

.panel-content-glass {
  width: 480px;
  max-width: 100vw;
  height: 100%;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
  border-left: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: -20px 0 60px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
}

.panel-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-logo {
  width: 34px;
  height: auto;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
}

.panel-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #0071e3;
  letter-spacing: 0.8px;
}

.btn-fechar-panel {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-fechar-panel:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.btn-fechar-panel svg {
  width: 18px;
  height: 18px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.header-section {
  margin-bottom: 24px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(254, 243, 199, 0.9);
  border: 1px solid rgba(253, 230, 138, 0.9);
  color: #b45309;
  font-size: 0.74rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.panel-heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin: 0 0 6px 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

/* Loading Glass */
.loading-state-glass {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 16px;
  color: #64748b;
  font-weight: 500;
}

.spinner-glass {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(0, 113, 227, 0.15);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

/* Cards Stack */
.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-card-glass {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
}

.device-card-glass:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 113, 227, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.device-icon-wrapper {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid #bfdbfe;
}

.device-title-info {
  display: flex;
  flex-direction: column;
}

.device-model {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.device-status {
  font-size: 0.74rem;
  font-weight: 600;
  color: #d97706;
}

.card-meta-glass {
  background: rgba(248, 250, 252, 0.85);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.84rem;
}

.info-row:last-child { margin-bottom: 0; }
.meta-label { color: #64748b; font-weight: 500; }
.meta-value { color: #0f172a; font-weight: 600; }

.code-chip {
  font-family: monospace;
  font-size: 0.76rem;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 6px;
}

.card-actions-row {
  display: flex;
  gap: 10px;
}

.btn-deny-glass, .btn-accept-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-icon { width: 16px; height: 16px; }

.btn-deny-glass {
  background: rgba(254, 242, 242, 0.85);
  color: #ef4444;
  border: 1px solid rgba(254, 202, 202, 0.9);
}

.btn-deny-glass:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

.btn-accept-glass {
  background: linear-gradient(135deg, #0071e3, #0056b3);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.25);
}

.btn-accept-glass:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 113, 227, 0.35);
}

/* Empty State */
.empty-state-panel {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  border: 2px dashed rgba(203, 213, 225, 0.8);
}

.empty-emoji-ring {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-state-panel h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.empty-state-panel p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

/* List Transitions */
.list-anim-enter-active, .list-anim-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-anim-enter-from, .list-anim-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
.list-anim-leave-active {
  position: absolute;
  width: 100%;
}
</style>