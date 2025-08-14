<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- 顶部导航 -->
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex space-x-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-3 font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto p-4">
      <!-- 人物数据页面 -->
      <div v-if="activeTab === 'character'" class="space-y-6">
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

      <!-- 装备页面 -->
      <div v-if="activeTab === 'equipment'" class="space-y-6">
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
      </div>

      <!-- 挂机地图页面 -->
      <div v-if="activeTab === 'maps'" class="space-y-6">
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

      <!-- 战斗页面 -->
      <div v-if="activeTab === 'battle'" class="space-y-6">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 游戏状态
const activeTab = ref('character')
const isIdle = ref(false)
const idleTime = ref(0)
const currentMap = ref(null)
const currentEnemy = ref(null)
const battleLogs = ref([])
const selectedEquipment = ref(null)

// 标签页配置
const tabs = [
  { id: 'character', name: '人物' },
  { id: 'equipment', name: '装备' },
  { id: 'maps', name: '地图' },
  { id: 'battle', name: '战斗' }
]

// 人物数据
const character = ref({
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  gold: 100,
  baseAttack: 10,
  baseDefense: 5,
  baseAgility: 5,
  baseLuck: 5
})

// 装备数据
const equipment = ref({
  weapon: null,
  helmet: null,
  armor: null,
  boots: null,
  ring: null
})

// 背包
const inventory = ref(Array(24).fill(null))

// 地图数据
const maps = [
  {
    id: 1,
    name: '新手村',
    description: '适合新手练级的安全区域',
    recommendLevel: 1,
    expReward: 10,
    goldReward: 5,
    monsters: ['史莱姆', '野兔', '小蛇']
  },
  {
    id: 2,
    name: '黑暗森林',
    description: '危险的森林，有更强的怪物',
    recommendLevel: 5,
    expReward: 25,
    goldReward: 15,
    monsters: ['森林狼', '树精', '黑熊']
  },
  {
    id: 3,
    name: '废弃矿洞',
    description: '深邃的矿洞，充满未知的危险',
    recommendLevel: 10,
    expReward: 50,
    goldReward: 30,
    monsters: ['骷髅战士', '地精', '石头人']
  }
]

// 装备品质颜色
const qualityColors = {
  normal: 'text-gray-300',
  magic: 'text-blue-400',
  rare: 'text-yellow-400',
  unique: 'text-orange-400'
}

// 计算总属性
const totalStats = computed(() => {
  let stats = {
    attack: character.value.baseAttack,
    defense: character.value.baseDefense,
    agility: character.value.baseAgility,
    luck: character.value.baseLuck
  }

  // 计算装备加成
  Object.values(equipment.value).forEach(item => {
    if (item && item.stats) {
      Object.keys(item.stats).forEach(stat => {
        if (stats[stat] !== undefined) {
          stats[stat] += item.stats[stat]
        }
      })
    }
  })

  return stats
})

// 定时器
let idleTimer = null

// 游戏方法
function selectMap(map) {
  currentMap.value = map
  saveGame()
}

function toggleIdle() {
  if (!currentMap.value) {
    addBattleLog('请先选择挂机地图！', 'error')
    return
  }

  isIdle.value = !isIdle.value
  
  if (isIdle.value) {
    startIdle()
    addBattleLog(`开始在${currentMap.value.name}挂机`, 'info')
  } else {
    stopIdle()
    addBattleLog('停止挂机', 'info')
  }
  
  saveGame()
}

function startIdle() {
  idleTimer = setInterval(() => {
    idleTime.value++
    
    // 每5秒进行一次战斗
    if (idleTime.value % 5 === 0) {
      battle()
    }
  }, 1000)
}

function stopIdle() {
  if (idleTimer) {
    clearInterval(idleTimer)
    idleTimer = null
  }
  currentEnemy.value = null
}

function battle() {
  if (!currentEnemy.value) {
    // 生成新敌人
    const monsters = currentMap.value.monsters
    const monsterName = monsters[Math.floor(Math.random() * monsters.length)]
    currentEnemy.value = generateEnemy(monsterName)
    addBattleLog(`遭遇了 ${currentEnemy.value.name}！`, 'info')
  }

  // 战斗逻辑
  const playerDamage = Math.max(1, totalStats.value.attack - currentEnemy.value.defense + Math.random() * 10)
  const enemyDamage = Math.max(1, currentEnemy.value.attack - totalStats.value.defense + Math.random() * 5)

  // 玩家攻击
  currentEnemy.value.hp -= Math.floor(playerDamage)
  addBattleLog(`对 ${currentEnemy.value.name} 造成了 ${Math.floor(playerDamage)} 点伤害`, 'damage')

  if (currentEnemy.value.hp <= 0) {
    // 敌人死亡
    const expGain = currentMap.value.expReward + Math.floor(Math.random() * 10)
    const goldGain = currentMap.value.goldReward + Math.floor(Math.random() * 5)
    
    character.value.exp += expGain
    character.value.gold += goldGain
    
    addBattleLog(`击败了 ${currentEnemy.value.name}！`, 'info')
    addBattleLog(`获得 ${expGain} 经验值`, 'exp')
    addBattleLog(`获得 ${goldGain} 金币`, 'gold')
    
    // 检查升级
    checkLevelUp()
    
    // 掉落装备
    if (Math.random() < 0.15) {
      const newItem = generateRandomEquipment()
      addToInventory(newItem)
      addBattleLog(`获得了 ${newItem.name}！`, 'item')
    }
    
    currentEnemy.value = null
  } else {
    // 敌人反击
    character.value.hp -= Math.floor(enemyDamage)
    addBattleLog(`${currentEnemy.value.name} 对你造成了 ${Math.floor(enemyDamage)} 点伤害`, 'damage')
    
    if (character.value.hp <= 0) {
      character.value.hp = 1
      addBattleLog('生命值过低，自动回血！', 'info')
      character.value.hp = character.value.maxHp
    }
  }
  
  saveGame()
}

function generateEnemy(name) {
  const baseLevel = currentMap.value.recommendLevel
  const level = baseLevel + Math.floor(Math.random() * 3)
  const hp = 50 + level * 20
  
  return {
    name: name,
    level: level,
    hp: hp,
    maxHp: hp,
    attack: 5 + level * 3,
    defense: 2 + level * 2
  }
}

function checkLevelUp() {
  while (character.value.exp >= character.value.maxExp) {
    character.value.exp -= character.value.maxExp
    character.value.level++
    character.value.maxExp = Math.floor(character.value.maxExp * 1.5)
    
    // 升级属性提升
    character.value.maxHp += 20
    character.value.maxMp += 10
    character.value.hp = character.value.maxHp
    character.value.mp = character.value.maxMp
    character.value.baseAttack += 2
    character.value.baseDefense += 1
    
    addBattleLog(`恭喜！升级到 ${character.value.level} 级！`, 'info')
  }
}

function generateRandomEquipment() {
  const types = ['weapon', 'helmet', 'armor', 'boots', 'ring']
  const type = types[Math.floor(Math.random() * types.length)]
  const qualities = ['normal', 'magic', 'rare', 'unique']
  const quality = qualities[Math.floor(Math.random() * qualities.length)]
  
  const baseNames = {
    weapon: ['短剑', '长剑', '战斧', '法杖'],
    helmet: ['皮帽', '铁盔', '战盔', '法师帽'],
    armor: ['布甲', '皮甲', '锁甲', '板甲'],
    boots: ['布靴', '皮靴', '铁靴', '战靴'],
    ring: ['戒指', '指环', '魔戒', '印章戒']
  }
  
  const baseName = baseNames[type][Math.floor(Math.random() * baseNames[type].length)]
  const qualityPrefix = {
    normal: '',
    magic: '魔法',
    rare: '稀有',
    unique: '传奇'
  }
  
  const name = qualityPrefix[quality] + baseName
  
  // 生成属性
  const stats = {}
  const statCount = quality === 'normal' ? 1 : quality === 'magic' ? 2 : quality === 'rare' ? 3 : 4
  
  const possibleStats = ['attack', 'defense', 'agility', 'luck']
  for (let i = 0; i < statCount; i++) {
    const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)]
    const value = Math.floor(Math.random() * 10) + 1
    stats[stat] = (stats[stat] || 0) + value
  }
  
  return {
    id: Date.now() + Math.random(),
    name: name,
    type: type,
    quality: quality,
    stats: stats
  }
}

function addToInventory(item) {
  const emptySlot = inventory.value.findIndex(slot => slot === null)
  if (emptySlot !== -1) {
    inventory.value[emptySlot] = item
  }
}

function equipItem(item, inventoryIndex) {
  if (!item) return
  
  const slot = item.type
  
  // 如果装备栏有装备，放回背包
  if (equipment.value[slot]) {
    inventory.value[inventoryIndex] = equipment.value[slot]
  } else {
    inventory.value[inventoryIndex] = null
  }
  
  equipment.value[slot] = item
  saveGame()
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

function addBattleLog(message, type = 'info') {
  battleLogs.value.unshift({
    message: `[${new Date().toLocaleTimeString()}] ${message}`,
    type: type
  })
  
  // 保持最多50条记录
  if (battleLogs.value.length > 50) {
    battleLogs.value = battleLogs.value.slice(0, 50)
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 数据持久化
function saveGame() {
  const gameData = {
    character: character.value,
    equipment: equipment.value,
    inventory: inventory.value,
    currentMap: currentMap.value,
    idleTime: idleTime.value,
    battleLogs: battleLogs.value.slice(0, 20)
  }
  localStorage.setItem('idleGame', JSON.stringify(gameData))
}

function loadGame() {
  const saved = localStorage.getItem('idleGame')
  if (saved) {
    try {
      const gameData = JSON.parse(saved)
      character.value = { ...character.value, ...gameData.character }
      equipment.value = { ...equipment.value, ...gameData.equipment }
      inventory.value = gameData.inventory || Array(24).fill(null)
      currentMap.value = gameData.currentMap
      idleTime.value = gameData.idleTime || 0
      battleLogs.value = gameData.battleLogs || []
    } catch (error) {
      console.error('加载游戏数据失败:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  loadGame()
  
  // 初始化一些装备到背包
  if (inventory.value.every(slot => slot === null)) {
    for (let i = 0; i < 5; i++) {
      addToInventory(generateRandomEquipment())
    }
  }
})

onUnmounted(() => {
  if (idleTimer) {
    clearInterval(idleTimer)
  }
  saveGame()
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
