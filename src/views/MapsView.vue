<template>
  <div class="space-y-6">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-yellow-400">挂机地图</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="map in maps"
          :key="map.id"
          :class="[
            'bg-gray-700 p-4 rounded-lg cursor-pointer transition-colors',
            currentMap?.id === map.id ? 'ring-2 ring-blue-400' : 'hover:bg-gray-600'
          ]"
          @click="selectMap(map)"
        >
          <h3 class="text-lg font-bold text-green-400">{{ map.name }}</h3>
          <p class="text-sm text-gray-400 mb-2">{{ map.description }}</p>
          <div class="text-sm">
            <div class="text-yellow-400">推荐等级: {{ map.recommendLevel }}</div>
            <div class="text-blue-400">经验奖励: {{ map.expReward }}</div>
            <div class="text-yellow-400">金币奖励: {{ map.goldReward }}</div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <button
          @click="toggleIdle"
          :class="[
            'px-8 py-3 rounded-lg font-bold text-lg transition-colors',
            isIdle
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          ]"
        >
          {{ isIdle ? '停止挂机' : '开始挂机' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game.js'
import { useIdleStore } from '@/stores/idle.js'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const idleStore = useIdleStore()

const { maps, currentMap, isIdle } = storeToRefs(gameStore)
const { selectMap, toggleIdle: gameToggleIdle } = gameStore

function toggleIdle() {
  if (!currentMap.value) {
    gameStore.addBattleLog('请先选择挂机地图！', 'error')
    return
  }

  if (isIdle.value) {
    idleStore.stopIdle()
  } else {
    idleStore.startIdle()
  }
  
  gameToggleIdle()
}
</script> 