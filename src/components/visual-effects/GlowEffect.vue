<template>
  <div class="glow-effect">
    <div 
      v-for="i in config.count" 
      :key="i" 
      class="glow-orb" 
      :style="getGlowStyle(i)"
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

const getGlowStyle = (index) => {
  const { color, size, speed } = props.config
  const orbSize = Math.random() * (size[1] - size[0]) + size[0]
  const delay = index * 2
  
  return {
    width: `${orbSize}px`,
    height: `${orbSize}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: `radial-gradient(circle, ${color}, transparent)`,
    animationDuration: `${speed}s`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.glow-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: glow-float linear infinite;
  pointer-events: none;
}

@keyframes glow-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(30px, -30px) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translate(20px, 30px) scale(1.1);
    opacity: 0.9;
  }
}
</style>
