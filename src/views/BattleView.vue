<template>
  <div class="space-y-6">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-yellow-400">战斗记录</h2>
      <div class="bg-gray-900 p-4 rounded h-64 overflow-y-auto">
        <div
          v-for="(log, index) in battleLogs"
          :key="index"
          :class="[
            'text-sm mb-1',
            log.type === 'damage' ? 'text-red-400' :
            log.type === 'exp' ? 'text-blue-400' :
            log.type === 'gold' ? 'text-yellow-400' :
            log.type === 'item' ? 'text-green-400' : 'text-gray-300'
          ]"
        >
          {{ log.message }}
        </div>
      </div>
    </div>

    <div v-if="currentEnemy" class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4 text-red-400">当前敌人</h3>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-lg font-bold">{{ currentEnemy.name }}</div>
          <div class="text-sm text-gray-400">等级 {{ currentEnemy.level }}</div>
        </div>
        <div class="text-right">
          <div class="text-red-400">{{ currentEnemy.hp }}/{{ currentEnemy.maxHp }}</div>
          <div class="w-32 bg-gray-700 rounded-full h-2 mt-1">
            <div
              class="bg-red-500 h-2 rounded-full transition-all"
              :style="{ width: (currentEnemy.hp / currentEnemy.maxHp) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game.js'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { battleLogs, currentEnemy } = storeToRefs(gameStore)
</script> 