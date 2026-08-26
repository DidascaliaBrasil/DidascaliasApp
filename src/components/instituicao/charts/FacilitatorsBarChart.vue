<template>
  <div class="fac-bar-chart-wrapper">
    <!-- Top Filter Metric Selector -->
    <div class="chart-controls-bar">
      <div class="metric-tabs">
        <button
          :class="['m-tab', { active: activeMetric === 'sessoes' }]"
          @click="activeMetric = 'sessoes'"
        >
          🎮 Sessões VR
        </button>
        <button
          :class="['m-tab', { active: activeMetric === 'salas' }]"
          @click="activeMetric = 'salas'"
        >
          🥽 Salas Criadas
        </button>
        <button
          :class="['m-tab', { active: activeMetric === 'tempo' }]"
          @click="activeMetric = 'tempo'"
        >
          ⏱️ Tempo em VR
        </button>
        <button
          :class="['m-tab', { active: activeMetric === 'acoes' }]"
          @click="activeMetric = 'acoes'"
        >
          ⚡ Total Ações
        </button>
      </div>

      <span class="chart-hint-pill">Clique para filtrar</span>
    </div>

    <!-- Bars Grid Display -->
    <div v-if="facilitadores.length > 0" class="bars-container">
      <div
        v-for="fac in chartItems"
        :key="fac.id"
        class="bar-row-item"
        @click="$emit('select-facilitador', fac)"
      >
        <!-- Facilitator Info -->
        <div class="bar-user-col">
          <div class="bar-avatar">
            {{ (fac.nome || 'F').charAt(0).toUpperCase() }}
          </div>
          <div class="bar-user-meta">
            <span class="bar-user-name" :title="fac.nome">{{ fac.nome }}</span>
            <span class="bar-user-sub">{{ fac.salasCriadas }} sala(s) &bull; {{ fac.sessoesExecutadas }} sessão(ões)</span>
          </div>
        </div>

        <!-- Bar Track & Clean Fill (No inner text collisions) -->
        <div class="bar-track-col">
          <div class="bar-track-bg">
            <div
              class="bar-fill-dynamic"
              :style="{
                width: `${fac.percentual}%`,
                background: getBarGradient(fac.index)
              }"
            ></div>
          </div>
        </div>

        <!-- Numerical Display with Proper Margins -->
        <div class="bar-value-col">
          <span class="bar-final-val">{{ fac.displayValue }}</span>
          <span class="bar-drill-arrow">&rarr;</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-chart-state">
      <span class="empty-icon">👨‍🏫</span>
      <p>Nenhum facilitador com salas ou sessões vinculadas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatarDuracao } from '../../../services/resultadosService'

const props = defineProps({
  facilitadores: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select-facilitador'])

const activeMetric = ref('sessoes') // 'sessoes' | 'salas' | 'tempo' | 'acoes'

const chartItems = computed(() => {
  if (!props.facilitadores || props.facilitadores.length === 0) return []

  const rawList = [...props.facilitadores].map((f, idx) => {
    let rawValue = 0
    let displayValue = ''

    if (activeMetric.value === 'sessoes') {
      rawValue = f.sessoesExecutadas || 0
      displayValue = `${rawValue} sessão${rawValue !== 1 ? 'ões' : ''}`
    } else if (activeMetric.value === 'salas') {
      rawValue = f.salasCriadas || 0
      displayValue = `${rawValue} sala${rawValue !== 1 ? 's' : ''}`
    } else if (activeMetric.value === 'tempo') {
      rawValue = f.tempoTotalSegundos || 0
      displayValue = formatarDuracao(rawValue)
    } else if (activeMetric.value === 'acoes') {
      rawValue = f.totalIntents || 0
      displayValue = `${rawValue} ações`
    }

    return {
      ...f,
      index: idx,
      rawValue,
      displayValue
    }
  })

  rawList.sort((a, b) => b.rawValue - a.rawValue)

  const maxVal = Math.max(...rawList.map(r => r.rawValue), 1)

  return rawList.map(item => ({
    ...item,
    percentual: Math.max(5, Math.round((item.rawValue / maxVal) * 100))
  }))
})

const getBarGradient = (idx) => {
  const gradients = [
    'linear-gradient(90deg, #0071e3 0%, #3b82f6 100%)',
    'linear-gradient(90deg, #059669 0%, #10b981 100%)',
    'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)',
    'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
    'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)'
  ]
  return gradients[idx % gradients.length]
}
</script>

<style scoped>
.fac-bar-chart-wrapper {
  width: 100%;
}

.chart-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.metric-tabs {
  display: flex;
  flex-wrap: wrap;
  background: rgba(241, 245, 249, 0.8);
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.m-tab {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.m-tab.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-hint-pill {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
}

/* Bars list */
.bars-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-row-item {
  display: grid;
  grid-template-columns: 200px 1fr 130px;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.75);
  border: 1px solid rgba(226, 232, 240, 0.75);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.bar-row-item:hover {
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 4px 16px rgba(0, 113, 227, 0.08);
}

.bar-user-col {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.bar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0071e3, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.bar-user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bar-user-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-user-sub {
  font-size: 0.72rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track-col {
  width: 100%;
}

.bar-track-bg {
  width: 100%;
  height: 14px;
  background: rgba(226, 232, 240, 0.85);
  border-radius: 9999px;
  overflow: hidden;
}

.bar-fill-dynamic {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.2);
}

.bar-value-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.bar-final-val {
  font-size: 0.84rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
}

.bar-drill-arrow {
  color: #0071e3;
  font-weight: 800;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .bar-row-item {
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
  .bar-track-col {
    grid-column: 1 / -1;
  }
  .chart-controls-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .metric-tabs {
    width: 100%;
  }
  .m-tab {
    flex: 1;
    text-align: center;
  }
}

.empty-chart-state {
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
