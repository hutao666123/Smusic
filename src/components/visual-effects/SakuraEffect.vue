<template>
  <div class="sakura-effect">
    <div 
      v-for="i in config.count" 
      :key="i" 
      class="sakura-petal" 
      :style="getPetalStyle(i)"
    >
      <svg viewBox="0 0 20 20" :fill="config.color">
        <path d="M10,0 Q15,5 10,10 Q5,5 10,0 M10,10 Q15,15 10,20 Q5,15 10,10 M10,10 Q5,5 0,10 Q5,15 10,10 M10,10 Q15,5 20,10 Q15,15 10,10" />
      </svg>
    </div>
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

const getPetalStyle = (index) => {
  const { size, speed } = props.config
  const petalSize = Math.random() * (size[1] - size[0]) + size[0]
  const duration = Math.random() * (speed[1] - speed[0]) + speed[0]
  const delay = Math.random() * 5
  const swayAmount = Math.random() * 100 - 50
  
  return {
    width: `${petalSize}px`,
    height: `${petalSize}px`,
    left: `${Math.random() * 100}%`,
    top: `-${petalSize}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    '--sway-amount': `${swayAmount}px`
  }
}
</script>

<style scoped>
.sakura-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.sakura-petal {
  position: absolute;
  animation: sakura-fall linear infinite;
  pointer-events: none;
  opacity: 0.8;
}

.sakura-petal svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 2px rgba(255, 179, 217, 0.5));
}

@keyframes sakura-fall {
  0% {
    transform: translateY(-20px) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) translateX(var(--sway-amount)) rotate(360deg);
    opacity: 0;
  }
}
</style>
