<template>
  <div class="space-y-6">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-yellow-400">人物信息</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400">等级</div>
          <div class="text-xl font-bold text-green-400">{{ character.level }}</div>
        </div>
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400">经验值</div>
          <div class="text-xl font-bold text-blue-400">{{ character.exp }}/{{ character.maxExp }}</div>
        </div>
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400">金币</div>
          <div class="text-xl font-bold text-yellow-400">{{ character.gold }}</div>
        </div>
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400">挂机时间</div>
          <div class="text-xl font-bold text-purple-400">{{ formatTime(idleTime) }}</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4 text-yellow-400">属性</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">生命值</div>
          <div class="text-lg font-bold text-red-400">{{ character.hp }}/{{ character.maxHp }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">魔法值</div>
          <div class="text-lg font-bold text-blue-400">{{ character.mp }}/{{ character.maxMp }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">攻击力</div>
          <div class="text-lg font-bold text-orange-400">{{ totalStats.attack }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">防御力</div>
          <div class="text-lg font-bold text-green-400">{{ totalStats.defense }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">敏捷</div>
          <div class="text-lg font-bold text-yellow-400">{{ totalStats.agility }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">幸运</div>
          <div class="text-lg font-bold text-purple-400">{{ totalStats.luck }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game.js'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { character, idleTime, totalStats } = storeToRefs(gameStore)

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script> 