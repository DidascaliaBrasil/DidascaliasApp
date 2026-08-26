<template>
  <div class="engagement-list-wrapper">
    <div v-if="salas.length > 0" class="engagement-items-grid">
      <div
        v-for="sala in salasOrdenadas"
        :key="sala.id"
        class="engagement-card"
        @click="$emit('select-sala', sala)"
      >
        <!-- Top Info -->
        <div class="eng-top-row">
          <div class="eng-name-group">
            <span class="eng-badge-type">
              {{ sala.targetType === 'grupo' ? '👥 Turma' : '👤 Individual' }}
            </span>
            <h4 class="eng-room-name" :title="sala.roomName">{{ sala.roomName }}</h4>
          </div>

          <div class="eng-pct-pill" :class="getPctClass(sala.taxaConclusao)">
            <span>{{ sala.taxaConclusao }}%</span>
          </div>
        </div>

        <!-- Meta Facilitador & Turma -->
        <div class="eng-meta-row">
          <span class="eng-target-name">Alvo: <strong>{{ sala.nomeAlvo }}</strong></span>
          <span class="eng-fac-name">Orientador: {{ sala.facilitadorNome }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="eng-progress-track">
          <div
            class="eng-progress-fill"
            :style="{
              width: `${sala.taxaConclusao}%`,
              background: getProgressGradient(sala.taxaConclusao)
            }"
          ></div>
        </div>

        <!-- Bottom Stats -->
        <div class="eng-bottom-stats">
          <span class="eng-stat-text">
            <strong>{{ sala.participantesUnicosIds.length }}</strong> de {{ sala.alunosVinculados.length }} alunos jogaram
          </span>
          <span class="eng-sessions-count">
            {{ sala.totalSessoes }} sessão(ões) &bull; {{ sala.tempoTotalFormatado }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-engagement-state">
      <span class="empty-icon">🥽</span>
      <p>Nenhuma sala de aula VR configurada.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  salas: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select-sala'])

const salasOrdenadas = computed(() => {
  return [...props.salas].sort((a, b) => (b.taxaConclusao || 0) - (a.taxaConclusao || 0) || b.totalSessoes - a.totalSessoes)
})

const getPctClass = (pct) => {
  if (pct >= 80) return 'pct-high'
  if (pct >= 40) return 'pct-medium'
  return 'pct-low'
}

const getProgressGradient = (pct) => {
  if (pct >= 80) return 'linear-gradient(90deg, #10b981, #059669)'
  if (pct >= 40) return 'linear-gradient(90deg, #3b82f6, #0071e3)'
  return 'linear-gradient(90deg, #f59e0b, #d97706)'
}
</script>

<style scoped>
.engagement-list-wrapper {
  width: 100%;
}

.engagement-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.engagement-card {
  background: rgba(248, 250, 252, 0.75);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.engagement-card:hover {
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.08);
}

.eng-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.eng-name-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.eng-badge-type {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.eng-room-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eng-pct-pill {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.pct-high { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.pct-medium { background: #eff6ff; color: #0071e3; border: 1px solid #bfdbfe; }
.pct-low { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.eng-meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.76rem;
  color: #64748b;
}

.eng-target-name strong {
  color: #334155;
}

.eng-progress-track {
  width: 100%;
  height: 8px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 9999px;
  overflow: hidden;
}

.eng-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.eng-bottom-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.74rem;
}

.eng-stat-text {
  color: #475569;
}

.eng-stat-text strong {
  color: #0f172a;
}

.eng-sessions-count {
  color: #0071e3;
  font-weight: 700;
}

.empty-engagement-state {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}
</style>
