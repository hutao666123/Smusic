<template>
  <div class="cyber-effect">
    <svg class="cyber-grid" :viewBox="`0 0 ${width} ${height}`">
      <defs>
        <pattern 
          id="grid" 
          :width="config.gridSize" 
          :height="config.gridSize" 
          patternUnits="userSpaceOnUse"
        >
          <path 
            :d="`M ${config.gridSize} 0 L 0 0 0 ${config.gridSize}`" 
            fill="none" 
            :stroke="config.lineColor" 
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    <div class="scan-line" :style="scanLineStyle"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const width = ref(1920)
const height = ref(1080)
const scanPosition = ref(0)
let animationId = null

const scanLineStyle = ref({
  top: '0%',
  background: `linear-gradient(180deg, transparent, ${props.config.lineColor.replace('0.3', '0.6')}, transparent)`,
  height: '3px',
  boxShadow: `0 0 20px ${props.config.lineColor.replace('0.3', '0.8')}`
})

const animate = () => {
  scanPosition.value += props.config.scanSpeed
  if (scanPosition.value > 100) {
    scanPosition.value = 0
  }
  scanLineStyle.value.top = `${scanPosition.value}%`
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  width.value = window.innerWidth
  height.value = window.innerHeight
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.cyber-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cyber-grid {
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>
