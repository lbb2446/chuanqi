import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  // 游戏状态
  const isIdle = ref(false)
  const idleTime = ref(0)
  const currentMap = ref(null)
  const currentEnemy = ref(null)
  const battleLogs = ref([])

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
      addBattleLog(`开始在${currentMap.value.name}挂机`, 'info')
    } else {
      addBattleLog('停止挂机', 'info')
    }
    
    saveGame()
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

  // 初始化游戏
  function initGame() {
    loadGame()
    
    // 初始化一些装备到背包
    if (inventory.value.every(slot => slot === null)) {
      for (let i = 0; i < 5; i++) {
        addToInventory(generateRandomEquipment())
      }
    }
  }

  return {
    // 状态
    isIdle,
    idleTime,
    currentMap,
    currentEnemy,
    battleLogs,
    character,
    equipment,
    inventory,
    maps,
    totalStats,
    
    // 方法
    selectMap,
    toggleIdle,
    battle,
    generateEnemy,
    checkLevelUp,
    generateRandomEquipment,
    addToInventory,
    equipItem,
    addBattleLog,
    saveGame,
    loadGame,
    initGame
  }
}) 