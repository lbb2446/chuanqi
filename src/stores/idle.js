import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useGameStore } from './game.js'

export const useIdleStore = defineStore('idle', () => {
  let idleTimer = null
  const gameStore = useGameStore()

  // 开始挂机
  function startIdle() {
    if (idleTimer) {
      clearInterval(idleTimer)
    }
    
    idleTimer = setInterval(() => {
      gameStore.idleTime++
      
      // 每5秒进行一次战斗
      if (gameStore.idleTime % 5 === 0) {
        gameStore.battle()
      }
    }, 1000)
  }

  // 停止挂机
  function stopIdle() {
    if (idleTimer) {
      clearInterval(idleTimer)
      idleTimer = null
    }
    gameStore.currentEnemy = null
  }

  // 清理定时器
  function cleanup() {
    if (idleTimer) {
      clearInterval(idleTimer)
      idleTimer = null
    }
  }

  return {
    startIdle,
    stopIdle,
    cleanup
  }
}) 