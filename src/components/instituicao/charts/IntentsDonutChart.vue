<template>
  <div class="donut-chart-glass-wrapper">
    <div v-if="items.length > 0" class="donut-content-layout">
      
      <!-- SVG Donut Chart Area -->
      <div class="donut-svg-container">
        <svg viewBox="0 0 220 220" class="donut-svg">
          <!-- Background Track -->
          <circle
            cx="110"
            cy="110"
            r="70"
            fill="transparent"
            stroke="rgba(226, 232, 240, 0.6)"
            stroke-width="22"
          />

          <!-- Slices -->
          <circle
            v-for="(slice, index) in slices"
            :key="slice.label"
            cx="110"
            cy="110"
            r="70"
            fill="transparent"
            :stroke="slice.color"
            stroke-width="22"
            :stroke-dasharray="`${slice.strokeLength} ${circumference}`"
            :stroke-dashoffset="-slice.strokeOffset"
            stroke-linecap="round"
            class="donut-slice"
            :class="{ 'is-hovered': hoveredIndex === index, 'has-dimmed': hoveredIndex !== null && hoveredIndex !== index }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          />

          <!-- Center Summary (Static Layout) -->
          <g class="donut-center-group" pointer-events="none">
            <text x="110" y="102" text-anchor="middle" class="donut-center-val">
              {{ hoveredItem ? hoveredItem.quantidade : totalAcoes }}
            </text>
            <text x="110" y="122" text-anchor="middle" class="donut-center-lbl">
              {{ hoveredItem ? hoveredItem.label : 'Ações no VR' }}
            </text>
            <text x="110" y="138" text-anchor="middle" class="donut-center-pct" :fill="hoveredItem ? hoveredItem.color : '#0071e3'">
              {{ hoveredItem ? `${hoveredItem.percentual}% do total` : `${items.length} tipos de ação` }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Legend & Details List -->
      <div class="donut-legend-list">
        <div
          v-for="(item, idx) in items"
          :key="item.label"
          :class="['donut-legend-row', { 'is-active': hoveredIndex === idx }]"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        >
          <div class="legend-left">
            <span class="legend-icon-badge" :style="{ backgroundColor: item.bg, color: item.color }">
              {{ item.icon }}
            </span>
            <div class="legend-texts">
              <span class="legend-name">{{ item.label }}</span>
              <div class="legend-bar-track">
                <div 
                  class="legend-bar-fill"
                  :style="{ 
                    width: `${item.percentual}%`, 
                    backgroundColor: item.color 
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="legend-right">
            <span class="legend-count" :style="{ color: item.color }">{{ item.quantidade }}x</span>
            <span class="legend-pct">{{ item.percentual }}%</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="donut-empty-state">
      <span class="empty-icon">📊</span>
      <p>Nenhuma ação/intent foi registrada nas sessões VR até o momento.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  }
})

const hoveredIndex = ref(null)
const radius = 70
const circumference = 2 * Math.PI * radius // ~439.82

const totalAcoes = computed(() => {
  if (props.total > 0) return props.total
  return props.items.reduce((acc, cur) => acc + (cur.quantidade || 0), 0)
})

const hoveredItem = computed(() => {
  if (hoveredIndex.value === null || !props.items[hoveredIndex.value]) return null
  return props.items[hoveredIndex.value]
})

const slices = computed(() => {
  const tot = totalAcoes.value
  if (tot <= 0) return []

  let accumulatedOffset = 0
  return props.items.map((item) => {
    const ratio = (item.quantidade || 0) / tot
    const strokeLength = Math.max(0, ratio * circumference - 4)
    const sliceData = {
      ...item,
      strokeLength: strokeLength > 0 ? strokeLength : 0,
      strokeOffset: accumulatedOffset
    }
    accumulatedOffset += ratio * circumference
    return sliceData
  })
})
</script>

<style scoped>
.donut-chart-glass-wrapper {
  width: 100%;
}

.donut-content-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  align-items: center;
  gap: 24px;
}

@media (max-width: 768px) {
  .donut-content-layout {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 18px;
  }
}

.donut-svg-container {
  width: 200px;
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-slice {
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.donut-slice.is-hovered {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 113, 227, 0.4));
}

.donut-slice.has-dimmed {
  opacity: 0.4;
}

.donut-center-group {
  transform: rotate(90deg);
  transform-origin: 110px 110px;
}

.donut-center-val {
  font-size: 1.65rem;
  font-weight: 800;
  fill: #0f172a;
  letter-spacing: -0.5px;
}

.donut-center-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  fill: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.donut-center-pct {
  font-size: 0.72rem;
  font-weight: 800;
}

/* Legend List */
.donut-legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.donut-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.75);
  border: 1px solid rgba(226, 232, 240, 0.75);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.donut-legend-row:hover,
.donut-legend-row.is-active {
  background: #ffffff;
  border-color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.08);
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.legend-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.legend-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.legend-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-bar-track {
  width: 100%;
  max-width: 180px;
  height: 4px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 9999px;
  overflow: hidden;
}

.legend-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.legend-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 12px;
  flex-shrink: 0;
}

.legend-count {
  font-size: 0.92rem;
  font-weight: 800;
}

.legend-pct {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.donut-empty-state {
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
