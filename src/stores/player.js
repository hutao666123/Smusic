import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.3)

  const currentSong = computed(() => playlist.value[currentIndex.value])

  const play = () => {
    isPlaying.value = true
  }

  const pause = () => {
    isPlaying.value = false
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const next = () => {
    if (currentIndex.value < playlist.value.length - 1) {
      currentIndex.value++
    }
  }

  const prev = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const addToPlaylist = (song) => {
    playlist.value.push(song)
  }

  const clearPlaylist = () => {
    playlist.value = []
    currentIndex.value = 0
    isPlaying.value = false
  }

  const setCurrentTime = (time) => {
    currentTime.value = time
  }

  const setDuration = (dur) => {
    duration.value = dur
  }

  const setVolume = (vol) => {
    volume.value = vol
  }

  return {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentSong,
    play,
    pause,
    togglePlay,
    next,
    prev,
    addToPlaylist,
    clearPlaylist,
    setCurrentTime,
    setDuration,
    setVolume
  }
}, {
  persist: true
})
