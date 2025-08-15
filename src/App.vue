<template>
  <div :class="[
    'min-h-screen bg-gray-900 text-white',
    currentLayout === 'mobile' ? 'layout-mobile' : 'layout-desktop'
  ]">
    <!-- 顶部导航 -->
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between">
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
          
          <!-- 全局布局切换按钮 -->
          <div class="flex items-center space-x-2">
            <button
              @click="setLayout('mobile')"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentLayout === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
              title="移动端布局 (375×667)"
            >
              375×667
            </button>
            <button
              @click="setLayout('desktop')"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentLayout === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
              title="桌面端布局 (1920×1080)"
            >
              1920×1080
            </button>
          </div>
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
import { useLayoutStore } from '@/stores/layout.js'
import { storeToRefs } from 'pinia'

// 标签页配置
const tabs = [
  { id: 'character', name: '人物', path: '/character' },
  { id: 'equipment', name: '装备', path: '/equipment' },
  { id: 'maps', name: '地图', path: '/maps' },
  { id: 'battle', name: '战斗', path: '/battle' }
]

const gameStore = useGameStore()
const layoutStore = useLayoutStore()

// 获取布局状态
const { currentLayout } = storeToRefs(layoutStore)
const { setLayout } = layoutStore

// 生命周期
onMounted(() => {
  gameStore.initGame()
  layoutStore.initLayout()
})

onUnmounted(() => {
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
