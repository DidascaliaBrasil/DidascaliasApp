<template>
  <div class="linkar-overlay" @click.self="$emit('fechar')">
    <div class="panel-content-glass">
      
      <!-- Navbar do Painel Glass -->
      <nav class="panel-navbar">
        <div class="logo-area">
          <img src="../../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
          <div class="brand-text-group">
            <span class="brand-name notranslate" translate="no">Didascalias</span>
            <span class="panel-tag">VR DEVICE MANAGER</span>
          </div>
        </div>
        <button class="btn-fechar-panel" @click="$emit('fechar')" aria-label="Fechar painel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </nav>

      <!-- Área com Scroll -->
      <div class="scroll-area">
        <div class="header-section">
          <div class="header-badge">
            <span class="active-dot"></span>
            <span>Dispositivos Registrados</span>
          </div>
          <h2 class="panel-heading">Óculos VR Cadastrados</h2>
          <p class="subtitle">Gerencie, renomeie os modelos e desvincule óculos da sua instituição.</p>
        </div>

        <div v-if="loading" class="loading-state-glass">
          <div class="spinner-glass"></div>
          <p>Buscando dispositivos cadastrados...</p>
        </div>

        <div v-else>
          <transition-group name="list-anim" tag="div" class="cards-stack" v-if="devices.length > 0">
            <div v-for="device in devices" :key="device.id" class="device-card-glass">
              
              <div class="card-head">
                <div class="device-icon-wrapper">
                  <span class="vr-icon">🥽</span>
                </div>
                
                <div class="title-area-glass">
                  <!-- Modo Edição de Nome -->
                  <div v-if="editingId === device.id" class="edit-box-glass">
                    <input 
                      v-model="editName" 
                      type="text" 
                      class="input-edit-glass" 
                      @keyup.enter="saveRename(device.id)"
                      ref="editInput"
                      placeholder="Nome do dispositivo"
                    />
                    <div class="edit-actions-row">
                      <button class="btn-action-save" @click="saveRename(device.id)" title="Salvar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <button class="btn-action-cancel" @click="cancelRename" title="Cancelar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Modo Visualização de Nome -->
                  <div v-else class="view-title-row">
                    <h3 class="device-name-text">{{ device.modelo || 'Óculos VR Cadastrado' }}</h3>
                    <button class="btn-rename-pill" @click="startRename(device)" title="Renomear dispositivo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-pencil">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-meta-glass">
                <div class="info-row">
                  <span class="meta-label">ID do Dispositivo:</span>
                  <span class="meta-value code-chip" :title="device.id">{{ device.id }}</span>
                </div>
                <div class="info-row">
                  <span class="meta-label">Sincronizado em:</span>
                  <span class="meta-value">{{ formatarData(device.dataRegistro) || 'Registrado' }}</span>
                </div>
              </div>

              <div class="card-footer-delete">
                <button class="btn-delete-glass" @click="deleteDevice(device.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-trash">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Desvincular da Instituição
                </button>
              </div>
              
            </div>
          </transition-group>

          <div v-else class="empty-state-panel">
            <div class="empty-emoji-ring">🏝️</div>
            <h3>Nenhum óculos ativo</h3>
            <p>Não há óculos cadastrados para esta instituição no momento.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getDatabase, ref as dbRef, onValue, update, remove } from 'firebase/database'

const props = defineProps({
  instituicaoId: {
    type: String,
    required: true
  }
})

defineEmits(['fechar'])

const devices = ref([])
const loading = ref(true)
const editingId = ref(null)
const editName = ref('')
const editInput = ref(null)

const db = getDatabase()
let unsubscribe = null

const formatarData = (dataIso) => {
  if (!dataIso) return ''
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  const oculosRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos`)
  
  unsubscribe = onValue(oculosRef, (snapshot) => {
    loading.value = true
    const data = snapshot.val()
    const tempDevices = []
    
    if (data) {
      for (const [id, info] of Object.entries(data)) {
        tempDevices.push({ id, ...info })
      }
    }
    
    devices.value = tempDevices
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const startRename = (device) => {
  editingId.value = device.id
  editName.value = device.modelo || ''
  nextTick(() => {
    if (editInput.value && editInput.value[0]) {
      editInput.value[0].focus()
    }
  })
}

const cancelRename = () => {
  editingId.value = null
  editName.value = ''
}

const saveRename = async (deviceId) => {
  if (!editName.value.trim()) return
  try {
    const deviceRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${deviceId}`)
    await update(deviceRef, {
      modelo: editName.value.trim()
    })
    editingId.value = null
  } catch (error) {
    console.error("Erro ao renomear dispositivo:", error)
  }
}

const deleteDevice = async (deviceId) => {
  if (confirm("Deseja realmente descadastrar este óculos VR da instituição?")) {
    try {
      const deviceRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${deviceId}`)
      await remove(deviceRef)
    } catch (error) {
      console.error("Erro ao deletar dispositivo:", error)
    }
  }
}
</script>

<style scoped>
.linkar-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
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

.main-logo { width: 34px; height: auto; }

.brand-text-group { display: flex; flex-direction: column; }
.brand-name { font-size: 1.2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; }
.panel-tag { font-size: 0.68rem; font-weight: 700; color: #0071e3; letter-spacing: 0.8px; }

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

.btn-fechar-panel svg { width: 18px; height: 18px; }

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.header-section { margin-bottom: 24px; }

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(236, 253, 245, 0.9);
  border: 1px solid rgba(167, 243, 208, 0.9);
  color: #059669;
  font-size: 0.74rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.panel-heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin: 0 0 6px 0;
}

.subtitle { color: #64748b; font-size: 0.9rem; margin: 0; }

/* Loading State */
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
  flex-shrink: 0;
}

.title-area-glass {
  flex: 1;
  min-width: 0;
}

.view-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.device-name-text {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-rename-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(203, 213, 225, 0.8);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-rename-pill:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #0071e3;
}

.icon-pencil { width: 13px; height: 13px; }

/* Edit Box Inline */
.edit-box-glass {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-edit-glass {
  flex: 1;
  padding: 6px 10px;
  border: 1.5px solid #0071e3;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  background: #ffffff;
  color: #0f172a;
  outline: none;
}

.edit-actions-row {
  display: flex;
  gap: 4px;
}

.btn-action-save, .btn-action-cancel {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-save { background: #10b981; color: white; }
.btn-action-save:hover { background: #059669; }
.btn-action-save svg { width: 15px; height: 15px; }

.btn-action-cancel { background: #e2e8f0; color: #475569; }
.btn-action-cancel:hover { background: #cbd5e1; }
.btn-action-cancel svg { width: 15px; height: 15px; }

/* Meta */
.card-meta-glass {
  background: rgba(248, 250, 252, 0.85);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 14px;
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
  font-size: 0.74rem;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 6px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Delete Button */
.card-footer-delete {
  display: flex;
}

.btn-delete-glass {
  width: 100%;
  background: rgba(254, 242, 242, 0.7);
  border: 1px solid rgba(254, 202, 202, 0.8);
  color: #ef4444;
  padding: 9px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-delete-glass:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.icon-trash { width: 15px; height: 15px; }

/* Empty State */
.empty-state-panel {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  border: 2px dashed rgba(203, 213, 225, 0.8);
}

.empty-emoji-ring { font-size: 3rem; margin-bottom: 12px; }
.empty-state-panel h3 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
.empty-state-panel p { color: #64748b; font-size: 0.9rem; margin: 0; }

/* Transitions */
.list-anim-enter-active, .list-anim-leave-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.list-anim-enter-from, .list-anim-leave-to { opacity: 0; transform: translateY(16px) scale(0.97); }
.list-anim-leave-active { position: absolute; width: 100%; }
</style>