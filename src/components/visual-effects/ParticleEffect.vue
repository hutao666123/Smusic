<template>
  <div class="particle-effect">
    <div 
      v-for="i in config.count" 
      :key="i" 
      class="particle" 
      :style="getParticleStyle(i)"
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

const getParticleStyle = (index) => {
  const { color, size, speed } = props.config
  const particleSize = Math.random() * (size[1] - size[0]) + size[0]
  const duration = Math.random() * (speed[1] - speed[0]) + speed[0]
  const delay = Math.random() * 5
  
  return {
    width: `${particleSize}px`,
    height: `${particleSize}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: color,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.particle-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float linear infinite;
  pointer-events: none;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}
</style>
