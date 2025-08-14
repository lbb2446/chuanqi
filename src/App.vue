<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- 顶部导航 -->
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex space-x-1">
          <router-link
            v-for="tab in tabs"
            :key="tab.id"
            :to="tab.path"
            :class="[
              'px-6 py-3 font-medium transition-colors',
              $route.path === tab.path
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            ]"
          >
            {{ tab.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto p-4">
      <!-- 路由视图 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game.js'
import { useIdleStore } from '@/stores/idle.js'

// 标签页配置
const tabs = [
  { id: 'character', name: '人物', path: '/character' },
  { id: 'equipment', name: '装备', path: '/equipment' },
  { id: 'maps', name: '地图', path: '/maps' },
  { id: 'battle', name: '战斗', path: '/battle' }
]

const gameStore = useGameStore()
const idleStore = useIdleStore()

// 生命周期
onMounted(() => {
  gameStore.initGame()
})

onUnmounted(() => {
  idleStore.cleanup()
  gameStore.saveGame()
})
</script>

<style scoped>
.equipment-slot {
  @apply bg-gray-700 border-2 border-gray-600 rounded-lg p-3 min-h-[60px] flex items-center justify-center text-center text-sm font-medium transition-colors hover:border-gray-500;
}

.equipment-slot:hover {
  @apply bg-gray-600;
}
</style>
