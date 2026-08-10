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
          <h2>Sincronizar VR</h2>
          <p class="subtitle">Gerencie os óculos da instituição.</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando dispositivos...</p>
        </div>
        
        <div v-else>
          <transition-group name="list" tag="div" class="cards-grid" v-if="pendingDevices.length > 0">
            <div v-for="device in pendingDevices" :key="device.id" class="device-card">
              <div class="card-header">
                <div class="icon-wrapper">
                  <span class="icon">🥽</span>
                </div>
                <h3>{{ device.modelo || 'Modelo Desconhecido' }}</h3>
              </div>
              
              <div class="card-body">
                <div class="info-row">
                  <span class="label">ID:</span>
                  <span class="value" style="font-size: 0.75rem;">{{ device.id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Registro:</span>
                  <span class="value">{{ formatarData(device.dataRegistro) || 'N/A' }}</span>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="btn btn-deny" @click="denyDevice(device.id)">Negar</button>
                <button class="btn btn-accept" @click="acceptDevice(device)">Aceitar</button>
              </div>
            </div>
          </transition-group>
          
          <div v-else class="empty-state">
            <div class="empty-icon">✨</div>
            <h3>Tudo limpo!</h3>
            <p>Nenhum óculos pendente.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getDatabase, ref as dbRef, onValue, set, remove } from 'firebase/database';

const props = defineProps({
  instituicaoId: {
    type: String,
    required: true
  }
});

defineEmits(['fechar']);

const pendingDevices = ref([]);
const loading = ref(true);
const db = getDatabase();
let unsubscribe = null;

// Função extra para deixar a data do Firebase mais legível
const formatarData = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  // Busca diretamente os pedidos da instituição atual
  const dispositivosRef = dbRef(db, `pedidos_registro/${props.instituicaoId}`);
  
  unsubscribe = onValue(dispositivosRef, (snapshot) => {
    loading.value = true;
    const data = snapshot.val();
    const tempDevices = [];
    
    if (data) {
      for (const [id, info] of Object.entries(data)) {
        tempDevices.push({ id, ...info });
      }
    }
    
    pendingDevices.value = tempDevices;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const acceptDevice = async (device) => {
  try {
    const oculosInstituicaoRef = dbRef(db, `instituicoes/${props.instituicaoId}/oculos/${device.id}`);
    const dispositivoVrRef = dbRef(db, `pedidos_registro/${props.instituicaoId}/${device.id}`);

    await set(oculosInstituicaoRef, {
      dataRegistro: device.dataPedido || '',
      modelo: device.modelo || '',
      instituicaoId: props.instituicaoId,
      Oculos_id: device.id
    });

    await remove(dispositivoVrRef);
  } catch (error) {
    console.error("Erro ao aceitar dispositivo:", error);
  }
};

const denyDevice = async (deviceId) => {
  try {
    const dispositivoVrRef = dbRef(db, `pedidos_registro/${props.instituicaoId}/${deviceId}`);
    await remove(dispositivoVrRef);
  } catch (error) {
    console.error("Erro ao negar dispositivo:", error);
  }
};
</script>

<style scoped>
/* Fundo escuro cobrindo a tela toda */
.linkar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

/* Painel lateral */
.panel-content {
  width: 450px;
  max-width: 100vw;
  height: 100%;
  background: #f8fafc;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Header Navbar do Painel */
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

.main-logo {
  width: 32px;
  height: auto;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-fechar {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
}

.btn-fechar:hover {
  color: #ef4444;
}

/* Área rolável (Scroll) */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.header-section {
  margin-bottom: 24px;
}

.header-section h2 {
  font-size: 1.6rem;
  margin: 0 0 4px 0;
  color: #1a252f;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.spinner {
  width: 30px; height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0066FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.icon-wrapper {
  background: #f0f7ff;
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.4rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.card-body {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.info-row:last-child { margin-bottom: 0; }
.label { color: #64748b; }
.value { color: #0f172a; font-weight: 600; }

.card-actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
}

.btn-deny { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }
.btn-deny:hover { background: #fee2e2; }

.btn-accept { background: #0066FF; color: white; }
.btn-accept:hover { background: #005ce6; }

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.2rem; margin: 0 0 4px 0; }
.empty-state p { color: #64748b; font-size: 0.9rem; margin: 0; }

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }
.list-leave-active { position: absolute; }
</style>