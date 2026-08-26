<template>
  <div class="timeline-chart-wrapper">
    <div v-if="series.length > 0" class="timeline-container">
      
      <!-- Summary Header with Static Height (Prevents Screen Jittering) -->
      <div class="timeline-summary-bar">
        <span class="timeline-total-sessions">
          <strong>{{ totalSess }}</strong> sessões em <strong>{{ series.length }}</strong> dia(s)
        </span>
        <div class="timeline-tooltip-slot">
          <span 
            class="timeline-tooltip-badge"
            :class="{ 'is-visible': !!hoveredPoint }"
          >
            📅 {{ hoveredPoint ? hoveredPoint.data : '' }}: <strong>{{ hoveredPoint ? hoveredPoint.sessoes : 0 }}</strong> sessões &bull; {{ hoveredPoint ? hoveredPoint.totalIntents : 0 }} ações
          </span>
        </div>
      </div>

      <!-- SVG Area Chart -->
      <div class="svg-timeline-box">
        <svg viewBox="0 0 500 160" class="timeline-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0071e3" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#0071e3" stop-opacity="0.01" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0071e3" />
              <stop offset="50%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#8b5cf6" />
            </linearGradient>
          </defs>

          <!-- Grid horizontal lines -->
          <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(226, 232, 240, 0.6)" stroke-dasharray="4 4" />
          <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(226, 232, 240, 0.6)" stroke-dasharray="4 4" />
          <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(226, 232, 240, 0.8)" />

          <!-- Filled Area Path -->
          <path :d="areaPathD" fill="url(#area-grad)" />

          <!-- Stroke Path -->
          <path :d="linePathD" fill="none" stroke="url(#line-grad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Data Points (Interactive Nodes) -->
          <g v-for="(pt, idx) in points" :key="idx">
            <!-- Vertical guide line on hover -->
            <line
              v-if="hoveredIndex === idx"
              :x1="pt.x"
              y1="10"
              :x2="pt.x"
              y2="130"
              stroke="#0071e3"
              stroke-width="1.5"
              stroke-dasharray="2 2"
            />
            
            <!-- Outer Circle -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              r="6"
              fill="#ffffff"
              stroke="#0071e3"
              stroke-width="2.5"
              class="point-circle"
              :class="{ 'is-active': hoveredIndex === idx }"
              @mouseenter="hoveredIndex = idx"
              @mouseleave="hoveredIndex = null"
            />
          </g>
        </svg>

        <!-- X-Axis Labels -->
        <div class="x-axis-labels">
          <span 
            v-for="(pt, idx) in points" 
            :key="idx" 
            class="axis-label"
            :class="{ 'is-highlight': hoveredIndex === idx }"
            :style="{ left: `${(pt.x / 500) * 100}%` }"
          >
            {{ pt.data }}
          </span>
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="empty-timeline-state">
      <span class="empty-icon">📅</span>
      <p>Ainda não há dados suficientes para gerar a linha do tempo de simulações.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  series: {
    type: Array,
    default: () => []
  }
})

const hoveredIndex = ref(null)

const totalSess = computed(() => {
  return props.series.reduce((acc, cur) => acc + (cur.sessoes || 0), 0)
})

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !props.series[hoveredIndex.value]) return null
  return props.series[hoveredIndex.value]
})

const maxSessoes = computed(() => {
  const max = Math.max(...props.series.map(s => s.sessoes || 0), 1)
  return max
})

const points = computed(() => {
  const len = props.series.length
  if (len === 0) return []
  if (len === 1) {
    return [{
      ...props.series[0],
      x: 250,
      y: 70
    }]
  }

  const paddingX = 30
  const widthUsable = 500 - (paddingX * 2)
  const stepX = widthUsable / (len - 1)
  const max = maxSessoes.value

  return props.series.map((item, idx) => {
    const val = item.sessoes || 0
    const ratio = val / max
    const y = 125 - (ratio * 95)
    const x = paddingX + (idx * stepX)
    return {
      ...item,
      x,
      y
    }
  })
})

const linePathD = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  if (pts.length === 1) {
    return `M ${pts[0].x - 40} ${pts[0].y} L ${pts[0].x + 40} ${pts[0].y}`
  }

  return pts.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`
    
    const prev = pts[idx - 1]
    const cpX1 = prev.x + (pt.x - prev.x) / 2
    const cpY1 = prev.y
    const cpX2 = prev.x + (pt.x - prev.x) / 2
    const cpY2 = pt.y
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`
  }, '')
})

const areaPathD = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  const lineD = linePathD.value
  const first = pts[0]
  const last = pts[pts.length - 1]

  if (pts.length === 1) {
    return `M ${first.x - 40} 130 L ${first.x - 40} ${first.y} L ${first.x + 40} ${first.y} L ${first.x + 40} 130 Z`
  }

  return `${lineD} L ${last.x} 130 L ${first.x} 130 Z`
})
</script>

<style scoped>
.timeline-chart-wrapper {
  width: 100%;
  overflow: hidden;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.82rem;
  color: #64748b;
  min-height: 30px; /* Fixed height prevents layout shaking */
}

.timeline-total-sessions {
  font-size: 0.82rem;
  color: #64748b;
}

.timeline-tooltip-slot {
  min-height: 26px;
  display: flex;
  align-items: center;
}

.timeline-tooltip-badge {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #0071e3;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.76rem;
  opacity: 0;
  transform: translateY(2px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.timeline-tooltip-badge.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.svg-timeline-box {
  position: relative;
  width: 100%;
  padding-bottom: 24px;
}

.timeline-svg {
  width: 100%;
  height: 150px;
  overflow: visible;
  display: block;
}

.point-circle {
  cursor: pointer;
  transition: stroke 0.2s ease, fill 0.2s ease;
}

.point-circle:hover,
.point-circle.is-active {
  stroke: #10b981;
  fill: #ecfdf5;
}

.x-axis-labels {
  position: relative;
  width: 100%;
  height: 20px;
  margin-top: 6px;
}

.axis-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.axis-label.is-highlight {
  color: #0071e3;
  font-weight: 800;
}

.empty-timeline-state {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .timeline-summary-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .timeline-svg {
    height: 120px;
  }
  .axis-label {
    font-size: 0.65rem;
  }
}
</style>
