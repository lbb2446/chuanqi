<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- 页面标题 -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
          挂机地图
        </h1>
        <p class="text-gray-400 mt-2">选择适合你当前实力的地图进行挂机</p>
      </div>

      <!-- 地图列表 -->
      <div :class="[
        'gap-4',
        currentLayout === 'mobile' 
          ? 'grid grid-cols-1' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      ]">
        <div
          v-for="map in maps"
          :key="map.id"
          :class="[
            'backdrop-blur-sm rounded-xl border border-gray-700/50 cursor-pointer shadow-lg transition-all duration-200',
            currentLayout === 'mobile' ? 'p-3' : 'p-4',
            currentMap?.id === map.id 
              ? 'border-blue-500 bg-blue-900/20 scale-105' 
              : 'hover:border-gray-500/50 hover:bg-gray-700/80 hover:scale-105'
          ]"
          @click="selectMap(map)"
        >
          <!-- 地图标题 -->
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-yellow-400 text-base">{{ map.name }}</h3>
            <div class="text-gray-400 text-xs">
              {{ map.description }}
            </div>
          </div>

          <!-- 战斗信息 -->
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div class="bg-gray-700/30 rounded-lg p-2 text-center">
              <div class="text-gray-400 text-xs">战斗步数</div>
              <div class="text-blue-400 font-bold text-sm">{{ map.steps[0] }}-{{ map.steps[1] }}</div>
            </div>
            
            <div class="bg-gray-700/30 rounded-lg p-2 text-center">
              <div class="text-gray-400 text-xs">怪物数量</div>
              <div class="text-green-400 font-bold text-sm">3-5只</div>
            </div>
          </div>

          <!-- 怪物信息 -->
          <div class="mb-3">
            <h4 class="font-semibold text-gray-300 mb-2 flex items-center text-xs">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              普通怪物
            </h4>
            <div class="grid grid-cols-2 gap-1">
              <div
                v-for="monsterName in map.monsters"
                :key="monsterName"
                class="bg-gray-700/20 rounded p-1.5 text-xs"
              >
                <div class="text-green-400 font-medium text-xs">{{ monsterName }}</div>
                <div class="text-gray-400 text-xs space-y-0.5">
                  <div>Lv:{{ getMonsterLevel(monsterName) }}</div>
                  <div>Exp:{{ getMonsterExp(monsterName) }}</div>
                  <div>HP:{{ getMonsterHp(monsterName) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boss信息 -->
          <div class="mb-3">
            <h4 class="font-semibold text-red-400 mb-2 flex items-center text-xs">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Boss
            </h4>
            <div class="bg-red-900/20 rounded p-2 border border-red-500/20">
              <div class="text-red-400 font-bold text-sm">{{ map.boss }}</div>
              <div class="grid grid-cols-2 gap-1 mt-1 text-xs">
                <div class="text-gray-300">Lv:{{ getMonsterLevel(map.boss) }}</div>
                <div class="text-gray-300">Exp:{{ getMonsterExp(map.boss) }}</div>
                <div class="text-gray-300">HP:{{ getMonsterHp(map.boss) }}</div>
                <div class="text-gray-300">ATK:{{ getMonsterAttack(map.boss) }}</div>
              </div>
            </div>
          </div>

          <!-- 掉落物品 -->
          <div class="mb-3">
            <h4 class="font-semibold text-purple-400 mb-2 flex items-center text-xs">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
              掉落物品
            </h4>
            <div class="space-y-1">
              <div
                v-for="(dropRate, itemIdx) in map.itemIndex"
                :key="itemIdx"
                class="flex justify-between items-center bg-gray-700/20 rounded px-1.5 py-0.5 text-xs"
              >
                <span class="text-gray-300 text-xs truncate">{{ getItemName(itemIdx) }}</span>
                <span class="text-purple-400 font-bold text-xs">{{ (parseFloat(dropRate) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- 推荐等级 -->
          <div class="text-center p-2 bg-gray-700/30 rounded">
            <div class="text-xs text-gray-400">推荐等级</div>
            <div class="font-bold text-yellow-400 text-sm">{{ getRecommendedLevel(map) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 挂机控制 -->
      <div class="text-center">
        <button
          @click="toggleIdle"
          :class="[
            'rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg border',
            currentLayout === 'mobile' ? 'px-4 py-2 text-base' : 'px-6 py-3 text-lg',
            isIdle
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
              : 'bg-green-600 hover:bg-green-700 text-white border-green-500'
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <svg v-if="!isIdle" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-2 0v4a1 1 0 002 0V7zm4 0a1 1 0 00-2 0v4a1 1 0 002 0V7z" clip-rule="evenodd"/>
            </svg>
            <span>{{ isIdle ? '停止挂机' : '开始挂机' }}</span>
          </div>
        </button>
        
        <div v-if="isIdle && currentMap" class="mt-3 text-center">
          <div class="text-green-400 font-medium text-sm">正在 {{ currentMap.name }} 挂机中...</div>
          <div class="text-gray-400 text-xs">战斗步数: {{ battleStep }}/{{ totalBattleSteps }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMapsStore } from '@/stores/maps.js'
import { useBattleStore } from '@/stores/battle.js'
import { useLayoutStore } from '@/stores/layout.js'
import { storeToRefs } from 'pinia'
import monsterData from '@/stores/monster.js'
import itemsData from '@/stores/items.js'

const mapsStore = useMapsStore()
const battleStore = useBattleStore()
const layoutStore = useLayoutStore()
const { maps, currentMap, isIdle } = storeToRefs(mapsStore)
const { battleStep, totalBattleSteps } = storeToRefs(battleStore)
const { currentLayout } = storeToRefs(layoutStore)
const { selectMap, toggleIdle } = mapsStore

// 获取怪物信息
function getMonsterLevel(name) {
  const monster = monsterData.data.find(m => m.Name === name)
  return monster ? monster.Lvl : '??'
}

function getMonsterExp(name) {
  const monster = monsterData.data.find(m => m.Name === name)
  return monster ? monster.Exp : '??'
}

function getMonsterHp(name) {
  const monster = monsterData.data.find(m => m.Name === name)
  return monster ? monster.HP : '??'
}

function getMonsterAttack(name) {
  const monster = monsterData.data.find(m => m.Name === name)
  return monster ? monster.AC : '??'
}

function getMonsterDefense(name) {
  const monster = monsterData.data.find(m => m.Name === name)
  return monster ? monster.DC : '??'
}

// 获取物品名称
function getItemName(itemIdx) {
  const item = itemsData.data.find(item => item.Idx === itemIdx)
  return item ? item.Name : `物品${itemIdx}`
}

// 计算推荐等级
function getRecommendedLevel(map) {
  // 基于Boss等级计算推荐等级
  const bossLevel = getMonsterLevel(map.boss)
  if (bossLevel === '??') return '1+'
  
  const level = parseInt(bossLevel)
  if (level <= 10) return '1+'
  if (level <= 20) return '5+'
  if (level <= 30) return '15+'
  if (level <= 40) return '25+'
  if (level <= 50) return '35+'
  return '50+'
}
</script> 