<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- 页面标题 -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
          装备管理
        </h1>
        <p class="text-gray-400 mt-2">管理你的装备和背包物品</p>
      </div>

      <!-- 上部分：装备栏 -->
      <div class="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-yellow-400 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              装备栏
            </h2>
            
        <!-- 装备栏位 -->
        <div class="grid grid-cols-4 gap-4">
          <!-- 头部 -->
          <div class="equipment-slot helmet-slot group relative" @click="showEquipmentDetails('helmet')" :title="equipment.helmet ? equipment.helmet.name + ' ' + formatItemStats(equipment.helmet) : ''">
                    <div v-if="equipment.helmet" class="equipment-item" :class="getQualityColor(equipment.helmet.quality)">
                      <div class="equipment-icon">🪖</div>
                      <div class="equipment-name">{{ equipment.helmet.name }}</div>
                    </div>
                    <div v-else class="empty-slot">
                      <div class="empty-icon">🪖</div>
              <div class="empty-text">头部</div>
                    </div>
            <div v-if="equipment.helmet" class="context-menu right" @click.stop>
              <button @click="onUnequip('helmet')">脱下</button>
                  </div>
                </div>
                
          <!-- 手部1 -->
          <div class="equipment-slot bracelet1-slot group relative" @click="showEquipmentDetails('bracelet1')" :title="equipment.bracelet1 ? equipment.bracelet1.name + ' ' + formatItemStats(equipment.bracelet1) : ''">
            <div v-if="equipment.bracelet1" class="equipment-item" :class="getQualityColor(equipment.bracelet1.quality)">
              <div class="equipment-icon">💪</div>
              <div class="equipment-name">{{ equipment.bracelet1.name }}</div>
                    </div>
                    <div v-else class="empty-slot">
              <div class="empty-icon">💪</div>
              <div class="empty-text">手部1</div>
                    </div>
            <div v-if="equipment.bracelet1" class="context-menu right" @click.stop>
              <button @click="onUnequip('bracelet1')">脱下</button>
                  </div>
                </div>
                
          <!-- 手部2 -->
          <div class="equipment-slot bracelet2-slot group relative" @click="showEquipmentDetails('bracelet2')" :title="equipment.bracelet2 ? equipment.bracelet2.name + ' ' + formatItemStats(equipment.bracelet2) : ''">
            <div v-if="equipment.bracelet2" class="equipment-item" :class="getQualityColor(equipment.bracelet2.quality)">
              <div class="equipment-icon">💪</div>
              <div class="equipment-name">{{ equipment.bracelet2.name }}</div>
            </div>
            <div v-else class="empty-slot">
              <div class="empty-icon">💪</div>
              <div class="empty-text">手部2</div>
            </div>
            <div v-if="equipment.bracelet2" class="context-menu right" @click.stop>
              <button @click="onUnequip('bracelet2')">脱下</button>
            </div>
          </div>
          
          <!-- 戒指1 -->
          <div class="equipment-slot ring1-slot group relative" @click="showEquipmentDetails('ring1')" :title="equipment.ring1 ? equipment.ring1.name + ' ' + formatItemStats(equipment.ring1) : ''">
            <div v-if="equipment.ring1" class="equipment-item" :class="getQualityColor(equipment.ring1.quality)">
              <div class="equipment-icon">💍</div>
              <div class="equipment-name">{{ equipment.ring1.name }}</div>
            </div>
            <div v-else class="empty-slot">
              <div class="empty-icon">💍</div>
              <div class="empty-text">戒指1</div>
            </div>
            <div v-if="equipment.ring1" class="context-menu right" @click.stop>
              <button @click="onUnequip('ring1')">脱下</button>
            </div>
          </div>
          
          <!-- 戒指2 -->
          <div class="equipment-slot ring2-slot group relative" @click="showEquipmentDetails('ring2')" :title="equipment.ring2 ? equipment.ring2.name + ' ' + formatItemStats(equipment.ring2) : ''">
            <div v-if="equipment.ring2" class="equipment-item" :class="getQualityColor(equipment.ring2.quality)">
              <div class="equipment-icon">💍</div>
              <div class="equipment-name">{{ equipment.ring2.name }}</div>
            </div>
            <div v-else class="empty-slot">
              <div class="empty-icon">💍</div>
              <div class="empty-text">戒指2</div>
            </div>
            <div v-if="equipment.ring2" class="context-menu right" @click.stop>
              <button @click="onUnequip('ring2')">脱下</button>
            </div>
          </div>
          
          <!-- 衣服 -->
          <div class="equipment-slot armor-slot group relative" @click="showEquipmentDetails('armor')" :title="equipment.armor ? equipment.armor.name + ' ' + formatItemStats(equipment.armor) : ''">
                    <div v-if="equipment.armor" class="equipment-item" :class="getQualityColor(equipment.armor.quality)">
                      <div class="equipment-icon">🛡️</div>
                      <div class="equipment-name">{{ equipment.armor.name }}</div>
                    </div>
                    <div v-else class="empty-slot">
                      <div class="empty-icon">🛡️</div>
              <div class="empty-text">衣服</div>
                    </div>
            <div v-if="equipment.armor" class="context-menu right" @click.stop>
              <button @click="onUnequip('armor')">脱下</button>
                  </div>
                </div>
                
          <!-- 武器 -->
          <div class="equipment-slot weapon-slot group relative" @click="showEquipmentDetails('weapon')" :title="equipment.weapon ? equipment.weapon.name + ' ' + formatItemStats(equipment.weapon) : ''">
            <div v-if="equipment.weapon" class="equipment-item" :class="getQualityColor(equipment.weapon.quality)">
              <div class="equipment-icon">⚔️</div>
              <div class="equipment-name">{{ equipment.weapon.name }}</div>
                    </div>
                    <div v-else class="empty-slot">
              <div class="empty-icon">⚔️</div>
              <div class="empty-text">武器</div>
                    </div>
            <div v-if="equipment.weapon" class="context-menu right" @click.stop>
              <button @click="onUnequip('weapon')">脱下</button>
                  </div>
                </div>
                
          <!-- 项链 -->
          <div class="equipment-slot necklace-slot group relative" @click="showEquipmentDetails('necklace')" :title="equipment.necklace ? equipment.necklace.name + ' ' + formatItemStats(equipment.necklace) : ''">
            <div v-if="equipment.necklace" class="equipment-item" :class="getQualityColor(equipment.necklace.quality)">
              <div class="equipment-icon">📿</div>
              <div class="equipment-name">{{ equipment.necklace.name }}</div>
                    </div>
                    <div v-else class="empty-slot">
              <div class="empty-icon">📿</div>
              <div class="empty-text">项链</div>
                    </div>
            <div v-if="equipment.necklace" class="context-menu right" @click.stop>
              <button @click="onUnequip('necklace')">脱下</button>
                </div>
              </div>
            </div>
            
            <!-- 装备统计 -->
        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="stat-card">
                <div class="stat-icon">⚔️</div>
                <div class="stat-value">{{ getTotalStat('attack') }}</div>
                <div class="stat-label">攻击力</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🛡️</div>
                <div class="stat-value">{{ getTotalStat('defense') }}</div>
                <div class="stat-label">防御力</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🏃</div>
                <div class="stat-value">{{ getTotalStat('agility') }}</div>
                <div class="stat-label">敏捷</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🍀</div>
                <div class="stat-value">{{ getTotalStat('luck') }}</div>
                <div class="stat-label">幸运</div>
            </div>
          </div>
        </div>

      <!-- 下部分：背包 -->
          <div class="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-yellow-400 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
              背包 ({{ inventory.length }}/{{ maxInventorySize }})
            </h3>
            
          <!-- 搜索框 -->
          <div class="flex items-center space-x-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索物品名称..."
              class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            />
            <button
              @click="clearSearch"
              class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              清除
            </button>
          </div>
        </div>
        
        <!-- 物品网格 - 400个格子 -->
        <div class="grid grid-cols-20 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
              <div
            v-for="(item, index) in filteredInventory"
                :key="index"
            class="inventory-slot cursor-pointer group relative"
                @click="equipItem(item, index)"
              >
                <div v-if="item" class="inventory-item" :class="getQualityColor(item.quality)">
              <div class="inventory-icon">{{ getItemIcon(item.StdMode) }}</div>
              <div class="inventory-name">{{ item.Name }}</div>
                  <div class="inventory-quality">{{ getQualityName(item.quality) }}</div>
                </div>
                <div v-else class="empty-inventory-slot">
                  <div class="empty-inventory-text">+</div>
                </div>

            <div v-if="item" class="tooltip">{{ item.Name }}<br/>{{ formatItemStats(item) }}</div>
            <div v-if="item" class="context-menu right" @click.stop>
              <template v-if="isEquipItem(item)">
                <button @click="equipItem(item, index)">穿上</button>
              </template>
              <template v-else>
                <button @click="useInventoryItem(index)">使用</button>
              </template>
              <button @click="sellInventoryItem(index)">出售</button>
              <button @click="discardInventoryItem(index)" class="danger">丢弃</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装备详情弹窗 -->
    <div v-if="selectedEquipment" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeEquipmentDetails">
      <div class="bg-gray-800/95 rounded-2xl p-6 max-w-md w-full border border-gray-600/50 shadow-2xl" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" :class="getQualityColor(selectedEquipment.quality)">
            {{ selectedEquipment.name }}
          </h3>
          <button @click="closeEquipmentDetails" class="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
            <span class="text-gray-400">品质:</span>
            <span :class="getQualityColor(selectedEquipment.quality)" class="font-bold">
              {{ getQualityName(selectedEquipment.quality) }}
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="text-base font-bold text-yellow-400">属性加成:</div>
            <div v-for="(value, stat) in selectedEquipment.stats" :key="stat" class="flex justify-between items-center p-2 bg-gray-700/30 rounded">
              <span class="text-gray-300">{{ getStatName(stat) }}:</span>
              <span class="text-green-400 font-bold">+{{ value }}</span>
            </div>
          </div>
          
          <div class="flex space-x-3 pt-3">
            <button
              @click="closeEquipmentDetails"
              class="flex-1 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game.js'
import { storeToRefs } from 'pinia'
import itemsData from '@/stores/items.js'

const gameStore = useGameStore()
const { equipment, inventory } = storeToRefs(gameStore)
const { equipItem, unequipSlot, sellInventoryItem, discardInventoryItem, useInventoryItem } = gameStore

const selectedEquipment = ref(null)
const maxInventorySize = 400
const searchQuery = ref('')

// 过滤后的物品列表
const filteredInventory = computed(() => {
  if (!searchQuery.value) return inventory.value
  
  return inventory.value.filter(item => {
    if (!item) return false
    return item.Name && item.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

// 装备品质颜色
const qualityColors = {
  normal: 'border-gray-400 text-gray-300 bg-gray-600/50',
  magic: 'border-blue-400 text-blue-300 bg-blue-600/20',
  rare: 'border-yellow-400 text-yellow-300 bg-yellow-600/20',
  unique: 'border-orange-400 text-orange-300 bg-orange-600/20'
}

// 计算总属性
const getTotalStat = (stat) => {
  let total = 0
  Object.values(equipment.value).forEach(item => {
    if (item && item.stats && item.stats[stat]) {
      total += item.stats[stat]
    }
  })
  return total
}

function showEquipmentDetails(slot) {
  const item = equipment.value[slot]
  if (item) {
    selectedEquipment.value = item
  }
}

function closeEquipmentDetails() {
  selectedEquipment.value = null
}

function clearSearch() {
  searchQuery.value = ''
}

function formatStats(stats) {
  if (!stats) return ''
  return Object.keys(stats).map(k => `${getStatName(k)}:+${stats[k]}`).join(' ')
}

function formatItemStats(item) {
  const parts = []
  if (item.Ac) parts.push(`物防+${item.Ac}`)
  if (item.AC2) parts.push(`最大物防+${item.AC2}`)
  if (item.Mac) parts.push(`魔防+${item.Mac}`)
  if (item.Mac2) parts.push(`魔防+${item.Mac2}`)
  if (item.Dc) parts.push(`物攻+${item.Dc}`)
  if (item.Dc2) parts.push(`物攻+${item.Dc2}`)
  if (item.Mc) parts.push(`魔攻+${item.Mc}`)
  if (item.Mc2) parts.push(`魔攻+${item.Mc2}`)
  if (item.Sc) parts.push(`自然+${item.Sc}`)
  if (item.Sc2) parts.push(`自然+${item.Sc2}`)
  return parts.join(' ')
}

function isEquipItem(item) {
  const stdMode = parseInt(item.StdMode || '0')
  return [15,19,20,21,24,26,22,23,10,11,5,6].includes(stdMode)
}

function onUnequip(slot) {
  unequipSlot(slot)
}

function getQualityColor(quality) {
  return qualityColors[quality] || 'border-gray-400 text-gray-300 bg-gray-600/50'
}

function getQualityName(quality) {
  const names = {
    normal: '普通',
    magic: '魔法',
    rare: '稀有',
    unique: '传奇'
  }
  return names[quality] || '未知'
}

function getStatName(stat) {
  const names = {
    attack: '攻击力',
    defense: '防御力',
    agility: '敏捷',
    luck: '幸运'
  }
  return names[stat] || stat
}

function getItemIcon(stdMode) {
  const mode = parseInt(stdMode)
  if (mode === 15) return '🪖' // 头盔
  if (mode === 19 || mode === 20 || mode === 21) return '📿' // 项链
  if (mode === 24 || mode === 26) return '💪' // 手镯
  if (mode === 22 || mode === 23) return '💍' // 戒指
  if (mode === 10 || mode === 11) return '🛡️' // 衣服
  if (mode === 5 || mode === 6) return '⚔️' // 武器
  if (mode === 30) return '🕯️' // 蜡烛类
  if (mode === 22) return '🧪' // 毒药，符类
  if (mode === 42) return '🔧' // 制作原料
  return '📦' // 默认
}
</script>

<style scoped>
.equipment-slot {
  @apply w-20 h-20 bg-gray-700/80 border-2 border-gray-600 rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm;
}

.equipment-slot:hover {
  @apply border-gray-400 bg-gray-600/80 transform scale-105 shadow-lg;
}

.helmet-slot { @apply border-blue-500/50; }
.bracelet1-slot { @apply border-green-500/50; }
.bracelet2-slot { @apply border-green-500/50; }
.ring1-slot { @apply border-yellow-500/50; }
.ring2-slot { @apply border-yellow-500/50; }
.armor-slot { @apply border-purple-500/50; }
.weapon-slot { @apply border-red-500/50; }
.necklace-slot { @apply border-cyan-500/50; }

.equipment-item {
  @apply w-full h-full flex flex-col items-center justify-center text-center text-xs font-medium;
}

.equipment-icon {
  @apply text-lg mb-1;
}

.equipment-name {
  @apply text-xs leading-tight;
}

.empty-slot {
  @apply w-full h-full flex flex-col items-center justify-center text-gray-500;
}

.empty-icon {
  @apply text-lg mb-1 opacity-50;
}

.empty-text {
  @apply text-xs opacity-70;
}

.stat-card {
  @apply bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600/50 hover:border-gray-500/50 transition-colors;
}

.stat-icon {
  @apply text-xl mb-2;
}

.stat-value {
  @apply text-xl font-bold text-yellow-400 mb-1;
}

.stat-label {
  @apply text-xs text-gray-400;
}

.inventory-slot {
  @apply w-8 h-8 bg-gray-700/50 border border-gray-600/50 rounded transition-all duration-200;
}

.inventory-slot:hover {
  @apply border-gray-400 bg-gray-600/50 transform scale-110;
}

.inventory-item {
  @apply w-full h-full flex flex-col items-center justify-center text-center text-xs p-0.5;
}

.inventory-icon {
  @apply text-sm mb-0.5;
}

.inventory-name {
  @apply text-xs leading-tight font-medium;
}

.inventory-quality {
  @apply text-xs opacity-70;
}

.empty-inventory-slot {
  @apply w-full h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-600/50;
}

.empty-inventory-text {
  @apply text-sm opacity-50;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #4B5563 #1F2937;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1F2937;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4B5563;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}

/* 20列网格 */
.grid-cols-20 {
  grid-template-columns: repeat(20, minmax(0, 1fr));
}

/* 新增样式 */
.tooltip {
  @apply absolute z-10 hidden group-hover:block left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-pre;
}
.context-menu {
  @apply absolute hidden group-hover:flex flex-col space-y-1 px-2 py-2 bg-gray-900/95 border border-gray-700 rounded shadow-xl;
}
.context-menu.right { @apply right-0 top-0; }
.context-menu button { @apply text-xs text-white px-2 py-1 hover:bg-gray-700 rounded text-left; }
.context-menu button.danger { @apply text-red-400 hover:bg-red-900/40; }
</style> 