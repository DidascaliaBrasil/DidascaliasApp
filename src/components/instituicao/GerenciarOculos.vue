<template>
  <div class="linkar-overlay" @click.self="$emit('fechar')">
    <div class="panel-content">
      
      <nav class="panel-navbar">
        <div class="logo-area">
          <img src="../../assets/Didas_Logo.png" alt="Didascalias Logo" class="main-logo" />
          <span class="brand-name">Didascalias</span>
        </div>
        <button class="btn-fechar" @click="$emit('fechar')">✖</button>
      </nav>

      <div class="scroll-area">
        <div class="header-section">
          <h2>Óculos VR Cadastrados</h2>
          <p class="subtitle">Gerencie, renomeie ou remova os óculos da instituição.</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando dispositivos cadastrados...</p>
        </div>

        <div v-else>
          <transition-group name="list" tag="div" class="cards-grid" v-if="devices.length > 0">
            <div v-for="device in devices" :key="device.id" class="device-card">
              
              <div class="card-header">
                <div class="icon-wrapper">
                  <span class="icon">🥽</span>
                </div>
                
                <div class="title-area">
                  <div v-if="editingId === device.id" class="edit-input-group">
                    <input 
                      v-model="editName" 
                      type="text" 
                      class="input-edit" 
                      @keyup.enter="saveRename(device.id)"
                      ref="editInput"
                    />
                    <div class="edit-actions">
                      <button class="btn-action save" @click="saveRename(device.id)">✔</button>
                      <button class="btn-action cancel" @click="cancelRename">✖</button>
                    </div>
                  </div>
                  
                  <div v-else class="view-title-group">
                    <h3>{{ device.modelo || 'Modelo Desconhecido' }}</h3>
                    <button class="btn-edit-title" @click="startRename(device)" title="Renomear">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-pencil">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <div class="info-row">
                  <span class="label">ID do Dispositivo:</span>
                  <span class="value code-text" :title="device.id">{{ device.id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Sincronizado em:</span>
                  <span class="value">{{ formatarData(device.dataRegistro) || 'N/A' }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn btn-delete" @click="deleteDevice(device.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-trash">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Remover Óculos
                </button>
              </div>
              
            </div>
          </transition-group>

          <div v-else class="empty-state">
            <div class="empty-icon">🏖️</div>
            <h3>Nenhum óculos ativo</h3>
            <p>Não existem óculos cadastrados para a sua instituição.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getDatabase, ref as dbRef, onValue, update, remove } from 'firebase/database';

const props = defineProps({
  instituicaoId: {
    type: String,
    required: true
  }
});

defineEmits(['fechar']);

const devices = ref([]);
const loading = ref(true);
const editingId = ref(null);
const editName = ref('');
const editInput = ref(null);

const db = getDatabase();
let unsubscribe = null;

const formatarData = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  // Configurado em minúsculo mapeando a sua base perfeitamente
  const oculosRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos`);
  
  unsubscribe = onValue(oculosRef, (snapshot) => {
    loading.value = true;
    const data = snapshot.val();
    const tempDevices = [];
    
    if (data) {
      for (const [id, info] of Object.entries(data)) {
        tempDevices.push({ id, ...info });
      }
    }
    
    devices.value = tempDevices;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const startRename = (device) => {
  editingId.value = device.id;
  editName.value = device.modelo || '';
  nextTick(() => {
    if (editInput.value && editInput.value[0]) {
      editInput.value[0].focus();
    }
  });
};

const cancelRename = () => {
  editingId.value = null;
  editName.value = '';
};

const saveRename = async (deviceId) => {
  if (!editName.value.trim()) return;
  try {
    const deviceRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${deviceId}`);
    await update(deviceRef, {
      modelo: editName.value.trim()
    });
    editingId.value = null;
  } catch (error) {
    console.error("Erro ao renomear dispositivo:", error);
  }
};

const deleteDevice = async (deviceId) => {
  if (confirm("Deseja realmente descadastrar este óculos VR de sua instituição?")) {
    try {
      const deviceRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${deviceId}`);
      await remove(deviceRef);
    } catch (error) {
      console.error("Erro ao deletar dispositivo:", error);
    }
  }
};
</script>

<style scoped>
/* Fundo escuro em overlay */
.linkar-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

/* Estrutura fixa do painel */
.panel-content {
  width: 450px;
  max-width: 100vw;
  height: 100%;
  background: #f8fafc;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Navbar fixa do painel */
.panel-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-logo { width: 32px; height: auto; }
.brand-name { font-size: 1.25rem; font-weight: 800; color: #0f172a; }

.btn-fechar {
  background: none; border: none;
  font-size: 1.2rem; color: #64748b;
  cursor: pointer; padding: 8px;
  transition: color 0.2s;
}
.btn-fechar:hover { color: #ef4444; }

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.header-section { margin-bottom: 24px; }
.header-section h2 { font-size: 1.6rem; margin: 0 0 4px 0; color: #1a252f; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column;
  align-items: center; padding: 40px 0;
}
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #f3f3f3; border-top: 3px solid #0066FF;
  border-radius: 50%; animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Grid e layout dos Cards */
.cards-grid {
  display: flex; flex-direction: column; gap: 16px;
}

.device-card {
  background: #ffffff; border-radius: 12px;
  padding: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex; align-items: flex-start;
  gap: 12px; margin-bottom: 16px;
}

.icon-wrapper {
  background: #f0f7ff; width: 40px; height: 40px;
  border-radius: 10px; display: flex;
  align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}

.title-area { flex: 1; min-width: 0; }
.view-title-group {
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
}
.view-title-group h3 {
  margin: 0; font-size: 1.1rem; font-weight: 600;
  color: #0f172a; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}

.btn-edit-title {
  background: none; border: none; color: #94a3b8;
  cursor: pointer; padding: 4px; display: flex;
}
.btn-edit-title:hover { color: #0066FF; }
.icon-pencil { width: 14px; height: 14px; }

/* Input Inline */
.edit-input-group { display: flex; flex-direction: column; gap: 6px; }
.input-edit {
  width: 100%; padding: 6px 10px; border: 2px solid #0066FF;
  border-radius: 8px; font-size: 0.95rem; font-weight: 600; outline: none;
}
.edit-actions { display: flex; gap: 4px; justify-content: flex-end; }
.btn-action { border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-action.save { background: #0066FF; color: #fff; }
.btn-action.cancel { background: #e2e8f0; color: #475569; }

/* Card Body */
.card-body {
  background: #f8fafc; border-radius: 8px;
  padding: 12px; margin-bottom: 16px;
}
.info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; }
.info-row:last-child { margin-bottom: 0; }
.label { color: #64748b; }
.value { color: #0f172a; font-weight: 600; }
.code-text {
  font-family: monospace; background: #e2e8f0;
  padding: 1px 4px; border-radius: 4px; font-size: 0.75rem;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Remover */
.btn-delete {
  width: 100%; background: #fef2f2; border: 1px solid #fca5a5;
  color: #ef4444; padding: 10px; border-radius: 10px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-delete:hover { background: #fee2e2; }
.icon-trash { width: 14px; height: 14px; }

/* Estado Vazio */
.empty-state {
  text-align: center; padding: 40px 20px;
  background: #ffffff; border-radius: 12px; border: 2px dashed #e2e8f0;
}
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.2rem; margin: 0 0 4px 0; }
.empty-state p { color: #64748b; font-size: 0.9rem; margin: 0; }

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }
.list-leave-active { position: absolute; }
</style>