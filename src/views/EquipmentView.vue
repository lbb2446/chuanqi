<template>
  <div class="space-y-6">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-yellow-400">装备栏</h2>
      <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <!-- 装备格子 -->
        <div></div>
        <div class="equipment-slot" @click="showEquipmentDetails('helmet')">
          <div v-if="equipment.helmet" :class="getQualityColor(equipment.helmet.quality)">
            {{ equipment.helmet.name }}
          </div>
          <div v-else class="text-gray-500">头盔</div>
        </div>
        <div></div>
        
        <div class="equipment-slot" @click="showEquipmentDetails('weapon')">
          <div v-if="equipment.weapon" :class="getQualityColor(equipment.weapon.quality)">
            {{ equipment.weapon.name }}
          </div>
          <div v-else class="text-gray-500">武器</div>
        </div>
        
        <div class="equipment-slot" @click="showEquipmentDetails('armor')">
          <div v-if="equipment.armor" :class="getQualityColor(equipment.armor.quality)">
            {{ equipment.armor.name }}
          </div>
          <div v-else class="text-gray-500">护甲</div>
        </div>
        
        <div class="equipment-slot" @click="showEquipmentDetails('boots')">
          <div v-if="equipment.boots" :class="getQualityColor(equipment.boots.quality)">
            {{ equipment.boots.name }}
          </div>
          <div v-else class="text-gray-500">靴子</div>
        </div>
        
        <div></div>
        
        <div class="equipment-slot" @click="showEquipmentDetails('ring')">
          <div v-if="equipment.ring" :class="getQualityColor(equipment.ring.quality)">
            {{ equipment.ring.name }}
          </div>
          <div v-else class="text-gray-500">戒指</div>
        </div>
        
        <div></div>
      </div>
    </div>

    <!-- 背包 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4 text-yellow-400">背包</h3>
      <div class="grid grid-cols-6 gap-2">
        <div
          v-for="(item, index) in inventory"
          :key="index"
          class="equipment-slot cursor-pointer"
          @click="equipItem(item, index)"
        >
          <div v-if="item" :class="getQualityColor(item.quality)" class="text-xs">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 装备详情弹窗 -->
    <div v-if="selectedEquipment" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeEquipmentDetails">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" :class="getQualityColor(selectedEquipment.quality)">
            {{ selectedEquipment.name }}
          </h3>
          <button @click="closeEquipmentDetails" class="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-400">品质:</span>
            <span :class="getQualityColor(selectedEquipment.quality)">{{ getQualityName(selectedEquipment.quality) }}</span>
          </div>
          
          <hr class="border-gray-600">
          
          <div class="space-y-1">
            <div class="text-sm font-bold text-yellow-400">属性:</div>
            <div v-for="(value, stat) in selectedEquipment.stats" :key="stat" class="text-sm flex justify-between">
              <span class="text-gray-400">{{ getStatName(stat) }}:</span>
              <span class="text-green-400">+{{ value }}</span>
            </div>
          </div>
          
          <hr class="border-gray-600">
          
          <div class="flex space-x-2">
            <button
              @click="closeEquipmentDetails"
              class="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold"
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
import { ref } from 'vue'
import { useGameStore } from '@/stores/game.js'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { equipment, inventory } = storeToRefs(gameStore)
const { equipItem } = gameStore

const selectedEquipment = ref(null)

// 装备品质颜色
const qualityColors = {
  normal: 'text-gray-300',
  magic: 'text-blue-400',
  rare: 'text-yellow-400',
  unique: 'text-orange-400'
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

function getQualityColor(quality) {
  return qualityColors[quality] || 'text-gray-300'
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
</script>

<style scoped>
.equipment-slot {
  @apply bg-gray-700 border-2 border-gray-600 rounded-lg p-3 min-h-[60px] flex items-center justify-center text-center text-sm font-medium transition-colors hover:border-gray-500;
}

.equipment-slot:hover {
  @apply bg-gray-600;
}
</style> 