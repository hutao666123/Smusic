<template>
  <div class="mist-effect">
    <div 
      v-for="i in config.count" 
      :key="i" 
      class="mist-cloud" 
      :style="getMistStyle(i)"
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

const getMistStyle = (index) => {
  const { color, size, speed } = props.config
  const cloudSize = Math.random() * (size[1] - size[0]) + size[0]
  const delay = index * 3
  
  return {
    width: `${cloudSize}px`,
    height: `${cloudSize * 0.6}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: `radial-gradient(ellipse, ${color}, transparent)`,
    animationDuration: `${speed}s`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.mist-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.mist-cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: mist-drift linear infinite;
  pointer-events: none;
}

@keyframes mist-drift {
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100px);
    opacity: 0;
  }
}
</style>
