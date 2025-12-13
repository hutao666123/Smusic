<template>
  <div class="ripple-effect">
    <div 
      v-for="(ripple, index) in ripples" 
      :key="ripple.id"
      class="ripple"
      :style="getRippleStyle(ripple)"
    ></div>
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

const ripples = ref([])
let rippleId = 0
let intervalId = null

const createRipple = () => {
  ripples.value.push({
    id: rippleId++,
    x: 50,
    y: 50,
    createdAt: Date.now()
  })
  
  // 清理旧的波纹
  setTimeout(() => {
    ripples.value.shift()
  }, 4000)
}

const getRippleStyle = (ripple) => {
  const elapsed = (Date.now() - ripple.createdAt) / 1000
  const radius = elapsed * props.config.maxRadius / 4
  
  return {
    left: `${ripple.x}%`,
    top: `${ripple.y}%`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    border: `2px solid ${props.config.color}`,
    opacity: Math.max(0, 1 - elapsed / 4)
  }
}

onMounted(() => {
  createRipple()
  intervalId = setInterval(createRipple, props.config.interval)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.ripple-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: ripple-expand 4s ease-out;
}

@keyframes ripple-expand {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
