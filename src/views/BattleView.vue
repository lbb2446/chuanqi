<template>
  <div class="space-y-4">
    <!-- 人物状态 -->
    <div class="bg-gray-800 rounded-lg p-4">
      <h2 class="text-xl font-bold mb-3 text-blue-400">人物状态</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">等级</div>
          <div class="text-lg font-bold text-blue-400">{{ character.level }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">经验</div>
          <div class="text-lg font-bold text-blue-400">{{ character.exp }}/{{ character.maxExp }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">生命值</div>
          <div class="text-lg font-bold text-red-400">{{ character.hp }}/{{ character.maxHp }}</div>
          <div class="w-full bg-gray-600 rounded-full h-1.5 mt-1">
            <div
              class="bg-red-500 h-1.5 rounded-full transition-all"
              :style="{ width: (character.hp / character.maxHp) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">魔法值</div>
          <div class="text-lg font-bold text-purple-400">{{ character.mp }}/{{ character.maxMp }}</div>
          <div class="w-full bg-gray-600 rounded-full h-1.5 mt-1">
            <div
              class="bg-purple-500 h-1.5 rounded-full transition-all"
              :style="{ width: (character.mp / character.maxMp) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 属性面板 - 合并显示 -->
      <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">物理攻击</div>
          <div class="text-base font-bold text-orange-400">{{ totalStats.attack }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">魔法攻击</div>
          <div class="text-base font-bold text-purple-400">{{ totalStats.magicAttack }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">物理防御</div>
          <div class="text-base font-bold text-green-400">{{ totalStats.defense }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">魔法防御</div>
          <div class="text-base font-bold text-cyan-400">{{ totalStats.magicDefense }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">闪避能力</div>
          <div class="text-base font-bold text-yellow-400">{{ totalStats.dodge }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">攻击速度</div>
          <div class="text-base font-bold text-blue-400">{{ totalStats.attackSpeed }}ms</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">敏捷</div>
          <div class="text-base font-bold text-indigo-400">{{ totalStats.agility }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">幸运</div>
          <div class="text-base font-bold text-pink-400">{{ totalStats.luck }}</div>
        </div>
      </div>
    </div>

    <!-- 战斗状态 -->
    <div v-if="currentMap" class="bg-gray-800 rounded-lg p-4">
      <h3 class="text-lg font-bold mb-3 text-green-400">战斗状态</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">当前地图</div>
          <div class="text-base font-bold text-green-400">{{ currentMap.name }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">战斗步数</div>
          <div class="text-base font-bold text-green-400">{{ battleStep }}/{{ totalBattleSteps }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">怪物数量</div>
          <div class="text-base font-bold text-red-400">{{ currentBattleMonsters.length }}</div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">战斗类型</div>
          <div class="text-base font-bold" :class="isBossBattle ? 'text-purple-400' : 'text-blue-400'">
            {{ isBossBattle ? 'Boss战' : '普通战' }}
          </div>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <div class="text-xs text-gray-400">完成循环</div>
          <div class="text-base font-bold text-yellow-400">{{ completedCycles }}</div>
        </div>
      </div>
      
      <!-- 恢复状态 -->
      <div class="bg-gray-700 p-2 rounded">
        <div class="text-xs text-gray-400">恢复状态</div>
        <div class="text-base font-bold" :class="canRecover ? 'text-green-400' : 'text-red-400'">
          {{ canRecover ? '可以恢复' : '战斗中无法恢复' }}
        </div>
      </div>
    </div>

    <!-- 当前怪物群 -->
    <div v-if="currentBattleMonsters.length > 0" class="bg-gray-800 rounded-lg p-4">
      <h3 class="text-lg font-bold mb-3 text-red-400">
        当前怪物群 ({{ currentBattleMonsters.length }}只)
        <span v-if="isBossBattle" class="text-purple-400 ml-2">[Boss战]</span>
      </h3>
      
      <div class="space-y-3">
        <div
          v-for="(monster, index) in currentBattleMonsters"
          :key="index"
          class="bg-gray-700 p-3 rounded border-l-4"
          :class="index === 0 ? 'border-red-500' : 'border-gray-500'"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="text-base font-bold text-red-400">
                  {{ monster.name }}
                  <span v-if="index === 0" class="text-yellow-400 text-xs">[当前目标]</span>
                </div>
                <div class="text-xs text-gray-400">等级 {{ monster.level }}</div>
              </div>
              
              <!-- 怪物属性 - 简化显示 -->
              <div class="grid grid-cols-4 gap-2 mt-2 text-xs">
                <div class="bg-gray-600 p-1 rounded">
                  <div class="text-gray-400">攻击</div>
                  <div class="text-orange-400 font-bold">{{ monster.attack }}</div>
                </div>
                <div class="bg-gray-600 p-1 rounded">
                  <div class="text-gray-400">防御</div>
                  <div class="text-green-400 font-bold">{{ monster.defense }}</div>
                </div>
                <div class="bg-gray-600 p-1 rounded">
                  <div class="text-gray-400">魔攻</div>
                  <div class="text-purple-400 font-bold">{{ monster.magicAttack }}</div>
                </div>
                <div class="bg-gray-600 p-1 rounded">
                  <div class="text-gray-400">魔防</div>
                  <div class="text-cyan-400 font-bold">{{ monster.magicDefense }}</div>
                </div>
              </div>
            </div>
            
            <div class="text-right ml-3">
              <div class="text-red-400 font-bold text-base">{{ monster.hp }}/{{ monster.maxHp }}</div>
              <div class="w-24 bg-gray-600 rounded-full h-1.5 mt-1">
                <div
                  class="bg-red-500 h-1.5 rounded-full transition-all"
                  :style="{ width: (monster.hp / monster.maxHp) * 100 + '%' }"
                ></div>
              </div>
              <div class="text-xs text-gray-400 mt-1">经验: {{ monster.exp }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 战斗记录 -->
    <div class="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-yellow-400 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
          </svg>
          战斗记录
        </h3>
        <button
          @click="clearBattleLogs"
          class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
          title="清空所有战斗记录"
        >
          清空日志
        </button>
      </div>
      
      <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
        <div
          v-for="(log, index) in battleLogs"
          :key="index"
          class="text-xs p-2 rounded"
          :class="getLogClass(log.type)"
        >
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game.js'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { 
  battleLogs, 
  character, 
  totalStats, 
  currentMap, 
  battleStep, 
  totalBattleSteps, 
  currentBattleMonsters, 
  isBossBattle, 
  canRecover,
  completedCycles
} = storeToRefs(gameStore)

const getLogClass = (type) => {
  switch (type) {
    case 'damage':
      return 'text-red-400 bg-red-900/20'
    case 'exp':
      return 'text-blue-400 bg-blue-900/20'
    case 'gold':
      return 'text-yellow-400 bg-yellow-900/20'
    case 'item':
      return 'text-green-400 bg-green-900/20'
    case 'warning':
      return 'text-orange-400 bg-orange-900/20'
    case 'success':
      return 'text-green-400 bg-green-900/20'
    case 'skill':
      return 'text-cyan-400 font-bold bg-cyan-900/20'
    default:
      return 'text-gray-300 bg-gray-900/20'
  }
}

const clearBattleLogs = () => {
  gameStore.clearBattleLogs()
}
</script> 