<template>
  <div class="aurora-effect">
    <div 
      v-for="i in config.count" 
      :key="i" 
      class="aurora-band" 
      :style="getAuroraStyle(i)"
    ></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const getAuroraStyle = (index) => {
  const { colors, width } = props.config
  const colorIndex = index % colors.length
  const left = (index - 1) * 20 + Math.random() * 10
  const delay = index * 0.5
  
  return {
    left: `${left}%`,
    width: `${width}px`,
    background: `linear-gradient(180deg, transparent, ${colors[colorIndex]}, transparent)`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.aurora-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.aurora-band {
  position: absolute;
  top: -10%;
  height: 120%;
  opacity: 0.6;
  filter: blur(40px);
  animation: aurora-wave 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes aurora-wave {
  0%, 100% {
    transform: translateX(-20px) skewX(-5deg);
    opacity: 0.4;
  }
  50% {
    transform: translateX(20px) skewX(5deg);
    opacity: 0.8;
  }
}
</style>
