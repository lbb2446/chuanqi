import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useCharacterStore } from './character.js'
import itemsData from './items.js'

export const useEquipmentStore = defineStore('equipment', () => {
  const characterStore = useCharacterStore()
  
  // 装备数据 - 新的装备栏位结构
  const equipment = ref({
    weapon: null,      // 武器
    helmet: null,      // 头部
    armor: null,       // 衣服
    bracelet1: null,   // 手部1
    bracelet2: null,   // 手部2
    ring1: null,       // 戒指1
    ring2: null,       // 戒指2
    necklace: null     // 项链
  })

  // 背包 - 400个格子
  const inventory = ref(Array(400).fill(null))

  // 计算总属性 - 从真实物品数据中提取属性
  const totalStats = computed(() => {
    // 安全检查，确保character存在
    if (!characterStore.character.value) {
      return {
        attack: 0,
        magicAttack: 0,
        defense: 0,
        maxDefense: 0,
        magicDefense: 0,
        dodge: 0,
        attackSpeed: 1000,
        agility: 0,
        luck: 0
      }
    }
    
    let stats = {
      attack: characterStore.character.value.baseAttack || 0,
      magicAttack: characterStore.character.value.baseMagicAttack || 0,
      defense: characterStore.character.value.baseDefense || 0,
      maxDefense: characterStore.character.value.baseMaxDefense || 0,
      magicDefense: characterStore.character.value.baseMagicDefense || 0,
      dodge: characterStore.character.value.baseDodge || 0,
      attackSpeed: characterStore.character.value.baseAttackSpeed || 1000,
      agility: characterStore.character.value.baseAgility || 0,
      luck: characterStore.character.value.baseLuck || 0
    }

    // 计算装备加成 - 从真实物品数据中提取AC、MAC、DC、MC、SC等属性
    Object.values(equipment.value).forEach(item => {
      if (item) {
        // 物理防御 (AC)
        if (item.Ac) stats.defense += parseInt(item.Ac) || 0
        if (item.AC2) stats.maxDefense += parseInt(item.AC2) || 0
        
        // 魔法防御 (MAC)
        if (item.Mac) stats.magicDefense += parseInt(item.Mac) || 0
        if (item.Mac2) stats.magicDefense += parseInt(item.Mac2) || 0
        
        // 物理攻击 (DC)
        if (item.Dc) stats.attack += parseInt(item.Dc) || 0
        if (item.Dc2) stats.attack += parseInt(item.Dc2) || 0
        
        // 魔法攻击 (MC)
        if (item.Mc) stats.magicAttack += parseInt(item.Mc) || 0
        if (item.Mc2) stats.magicAttack += parseInt(item.Mc2) || 0
        
        // 自然伤害/闪避 (SC)
        if (item.Sc) stats.dodge += parseInt(item.Sc) || 0
        if (item.Sc2) stats.dodge += parseInt(item.Sc2) || 0
        
        // 如果有自定义stats属性，也加上
        if (item.stats) {
          Object.keys(item.stats).forEach(stat => {
            if (stats[stat] !== undefined) {
              stats[stat] += item.stats[stat]
            }
          })
        }
      }
    })

    return stats
  })

  // 生成随机装备
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
    
    // 生成属性 - 与人物属性结构保持一致
    const stats = {}
    const statCount = quality === 'normal' ? 1 : quality === 'magic' ? 2 : quality === 'rare' ? 3 : 4
    
    const possibleStats = ['attack', 'magicAttack', 'defense', 'maxDefense', 'magicDefense', 'dodge', 'agility', 'luck']
    for (let i = 0; i < statCount; i++) {
      const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)]
      const value = Math.floor(Math.random() * 100) + 10
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

  // 添加物品到背包
  function addToInventory(item) {
    const emptySlot = inventory.value.findIndex(slot => slot === null)
    if (emptySlot !== -1) {
      inventory.value[emptySlot] = item
    }
  }

  // 装备物品
  function equipItem(item, inventoryIndex) {
    if (!item) return
    
    // 根据物品的StdMode判断装备栏位
    const stdMode = parseInt(item.StdMode || '0')
    let slot = null
    
    if (stdMode === 15) slot = 'helmet'        // 头盔
    else if (stdMode === 19 || stdMode === 20 || stdMode === 21) slot = 'necklace'  // 项链
    else if (stdMode === 24 || stdMode === 26) {
      // 手镯 - 优先装备到空的手镯栏位
      if (!equipment.value.bracelet1) slot = 'bracelet1'
      else if (!equipment.value.bracelet2) slot = 'bracelet2'
      else slot = 'bracelet1' // 如果都满了，替换第一个
    }
    else if (stdMode === 22 || stdMode === 23) {
      // 戒指 - 优先装备到空的戒指栏位
      if (!equipment.value.ring1) slot = 'ring1'
      else if (!equipment.value.ring2) slot = 'ring2'
      else slot = 'ring1' // 如果都满了，替换第一个
    }
    else if (stdMode === 10 || stdMode === 11) slot = 'armor'   // 衣服
    else if (stdMode === 5 || stdMode === 6) slot = 'weapon'    // 武器
    
    if (!slot) {
      return false // 无法装备
    }
    
    // 如果装备栏有装备，放回背包
    if (equipment.value[slot]) {
      inventory.value[inventoryIndex] = equipment.value[slot]
    } else {
      inventory.value[inventoryIndex] = null
    }
    
    equipment.value[slot] = item
    return true
  }
  
  // 获取装备栏位名称
  function getSlotName(slot) {
    const names = {
      weapon: '武器',
      helmet: '头部',
      armor: '衣服',
      bracelet1: '手部1',
      bracelet2: '手部2',
      ring1: '戒指1',
      ring2: '戒指2',
      necklace: '项链'
    }
    return names[slot] || slot
  }

  // 寻找空的背包格
  function findEmptyInventorySlot() {
    return inventory.value.findIndex(slot => slot === null)
  }

  // 脱下装备到背包
  function unequipSlot(slot) {
    const current = equipment.value[slot]
    if (!current) return false
    const empty = findEmptyInventorySlot()
    if (empty === -1) {
      return false // 背包已满
    }
    inventory.value[empty] = current
    equipment.value[slot] = null
    return true
  }

  // 出售背包中的物品
  function sellInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return false
    const price = parseInt(item.Price || '0') || 0
    characterStore.addGold(price)
    inventory.value[index] = null
    return { success: true, price }
  }

  // 丢弃背包物品
  function discardInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return false
    inventory.value[index] = null
    return true
  }

  // 使用背包中的物品（非装备类）
  function useInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return false
    const stdMode = parseInt(item.StdMode || '0')
    // 简单判定：装备类不允许使用
    const isEquip = [15,19,20,21,24,26,22,23,10,11,5,6].includes(stdMode)
    if (isEquip) {
      return { success: false, message: '装备类物品不能直接使用' }
    }

    let used = false
    const hpGain = parseInt(item.Ac || '0') || 0
    if (hpGain > 0) {
      characterStore.healHp(hpGain)
      used = true
    }
    const mpGain = parseInt(item.Mac || '0') || 0
    if (mpGain > 0) {
      characterStore.healMp(mpGain)
      used = true
    }

    if (!used) {
      return { success: true, message: '使用了物品' }
    }

    // 使用后移除
    inventory.value[index] = null
    return { success: true, message: '物品使用成功' }
  }

  // 重置装备状态
  function resetEquipment() {
    equipment.value = {
      weapon: null,
      helmet: null,
      armor: null,
      bracelet1: null,
      bracelet2: null,
      ring1: null,
      ring2: null,
      necklace: null
    }
    inventory.value = Array(400).fill(null)
  }

  return {
    // 状态
    equipment,
    inventory,
    totalStats,
    
    // 方法
    generateRandomEquipment,
    addToInventory,
    equipItem,
    getSlotName,
    findEmptyInventorySlot,
    unequipSlot,
    sellInventoryItem,
    discardInventoryItem,
    useInventoryItem,
    resetEquipment
  }
}) 