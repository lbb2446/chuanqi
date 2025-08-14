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
        'gap-6',
        currentLayout === 'mobile' 
          ? 'grid grid-cols-1' 
          : 'grid grid-cols-1 lg:grid-cols-2'
      ]">
        <div
          v-for="map in maps"
          :key="map.id"
          :class="[
            'backdrop-blur-sm rounded-2xl border-2 cursor-pointer shadow-2xl',
            currentLayout === 'mobile' ? 'p-4' : 'p-6',
            currentMap?.id === map.id 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-gray-700/50 hover:border-gray-500/50 hover:bg-gray-700/80'
          ]"
          @click="selectMap(map)"
        >
          <!-- 地图标题 -->
          <div class="flex items-center justify-between mb-4">
            <h3 :class="[
              'font-bold text-yellow-400',
              currentLayout === 'mobile' ? 'text-lg' : 'text-xl'
            ]">{{ map.name }}</h3>
            <div :class="[
              'text-gray-400',
              currentLayout === 'mobile' ? 'text-xs' : 'text-sm'
            ]">
              {{ map.description }}
            </div>
          </div>

          <!-- 战斗信息 -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span class="text-gray-400">战斗步数:</span>
              <span class="text-blue-400 font-bold">{{ map.steps[0] }}-{{ map.steps[1] }} 场</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span class="text-gray-400">怪物数量:</span>
              <span class="text-green-400 font-bold">每场 3-5 只</span>
            </div>
          </div>

          <!-- 怪物信息 -->
          <div class="mb-4">
            <h4 :class="[
              'font-semibold text-gray-300 mb-2 flex items-center',
              currentLayout === 'mobile' ? 'text-xs' : 'text-sm'
            ]">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              普通怪物
            </h4>
            <div :class="[
              'gap-2',
              currentLayout === 'mobile' ? 'grid grid-cols-1' : 'grid grid-cols-2'
            ]">
              <div
                v-for="monsterName in map.monsters"
                :key="monsterName"
                class="bg-gray-700/30 rounded-lg p-2 text-xs"
              >
                <div class="text-green-400 font-medium">{{ monsterName }}</div>
                <div class="text-gray-400 text-xs">
                  <div>等级: {{ getMonsterLevel(monsterName) }}</div>
                  <div>经验: {{ getMonsterExp(monsterName) }}</div>
                  <div>生命: {{ getMonsterHp(monsterName) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boss信息 -->
          <div class="mb-4">
            <h4 :class="[
              'font-semibold text-red-400 mb-2 flex items-center',
              currentLayout === 'mobile' ? 'text-xs' : 'text-sm'
            ]">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Boss
            </h4>
            <div class="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
              <div :class="[
                'text-red-400 font-bold',
                currentLayout === 'mobile' ? 'text-base' : 'text-lg'
              ]">{{ map.boss }}</div>
              <div class="text-gray-300 text-sm mt-1">
                <div>等级: {{ getMonsterLevel(map.boss) }}</div>
                <div>经验: {{ getMonsterExp(map.boss) }}</div>
                <div>生命: {{ getMonsterHp(map.boss) }}</div>
                <div>攻击: {{ getMonsterAttack(map.boss) }}</div>
                <div>防御: {{ getMonsterDefense(map.boss) }}</div>
              </div>
            </div>
          </div>

          <!-- 掉落物品 -->
          <div class="mb-4">
            <h4 :class="[
              'font-semibold text-purple-400 mb-2 flex items-center',
              currentLayout === 'mobile' ? 'text-xs' : 'text-sm'
            ]">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
              掉落物品
            </h4>
            <div class="space-y-1">
              <div
                v-for="(dropRate, itemIdx) in map.itemIndex"
                :key="itemIdx"
                class="flex justify-between items-center bg-gray-700/30 rounded px-2 py-1 text-xs"
              >
                <span class="text-gray-300">{{ getItemName(itemIdx) }}</span>
                <span class="text-purple-400 font-bold">{{ (parseFloat(dropRate) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- 推荐等级 -->
          <div class="text-center p-3 bg-gray-700/50 rounded-lg">
            <div class="text-sm text-gray-400">推荐等级</div>
            <div :class="[
              'font-bold text-yellow-400',
              currentLayout === 'mobile' ? 'text-base' : 'text-lg'
            ]">{{ getRecommendedLevel(map) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 挂机控制 -->
      <div class="text-center">
        <button
          @click="toggleIdle"
          :class="[
            'rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl border-2',
            currentLayout === 'mobile' ? 'px-6 py-3 text-lg' : 'px-8 py-4 text-xl',
            isIdle
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
              : 'bg-green-600 hover:bg-green-700 text-white border-green-500'
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <svg v-if="!isIdle" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-2 0v4a1 1 0 002 0V7zm4 0a1 1 0 00-2 0v4a1 1 0 002 0V7z" clip-rule="evenodd"/>
            </svg>
            <span>{{ isIdle ? '停止挂机' : '开始挂机' }}</span>
          </div>
        </button>
        
        <div v-if="isIdle && currentMap" class="mt-4 text-center">
          <div class="text-green-400 font-medium">正在 {{ currentMap.name }} 挂机中...</div>
          <div class="text-gray-400 text-sm">战斗步数: {{ battleStep }}/{{ totalBattleSteps }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game.js'
import { useLayoutStore } from '@/stores/layout.js'
import { storeToRefs } from 'pinia'
import monsterData from '@/stores/monster.js'
import itemsData from '@/stores/items.js'

const gameStore = useGameStore()
const layoutStore = useLayoutStore()
const { maps, currentMap, isIdle, battleStep, totalBattleSteps } = storeToRefs(gameStore)
const { currentLayout } = storeToRefs(layoutStore)
const { selectMap, toggleIdle } = gameStore

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