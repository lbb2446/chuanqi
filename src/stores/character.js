import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import levelData from './level.js'

export const useCharacterStore = defineStore('character', () => {
  // 人物数据
  const character = ref({
    level: 1,
    exp: 0,
    maxExp: 50, // 使用level.js中的经验表
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    gold: 100,
    // 基础属性
    baseAttack: 1,         // 物理攻击力
    baseMagicAttack: 1,    // 魔法攻击力
    baseDefense: 1,        // 物理防御
    baseMaxDefense: 1,     // 最大物理防御
    baseMagicDefense: 1,   // 魔法防御
    baseDodge: 1,          // 闪避能力
    baseAttackSpeed: 1000, // 攻击速度（毫秒）
    baseAgility: 1,        // 敏捷
    baseLuck: 1            // 幸运
  })

  // 计算总属性
  const totalStats = computed(() => {
    return {
      attack: character.value.baseAttack,
      magicAttack: character.value.baseMagicAttack,
      defense: character.value.baseDefense,
      maxDefense: character.value.baseMaxDefense,
      magicDefense: character.value.baseMagicDefense,
      dodge: character.value.baseDodge,
      attackSpeed: character.value.baseAttackSpeed,
      agility: character.value.baseAgility,
      luck: character.value.baseLuck
    }
  })

  // 升级检查
  function checkLevelUp() {
    while (character.value.exp >= character.value.maxExp) {
      character.value.exp -= character.value.maxExp
      character.value.level++
      
      // 使用level.js中的经验表获取下一级所需经验
      const nextLevel = character.value.level + 1
      const nextLevelKey = `Level${nextLevel}`
      character.value.maxExp = levelData.data[nextLevelKey] || 999999999
      
      // 升级属性提升 - 每次升级提升1点攻击，1点防御，20点生命，20点魔法值
      character.value.maxHp += 20
      character.value.maxMp += 20
      character.value.hp = character.value.maxHp
      character.value.mp = character.value.maxMp
      character.value.baseAttack += 1
      character.value.baseMagicAttack += 1
      character.value.baseDefense += 1
      character.value.baseMaxDefense += 1
      character.value.baseMagicDefense += 1
      character.value.baseDodge += 1
      character.value.baseAgility += 1
      character.value.baseLuck += 1
    }
  }

  // 恢复生命值
  function healHp(amount) {
    character.value.hp = Math.min(character.value.maxHp, character.value.hp + amount)
  }

  // 恢复魔法值
  function healMp(amount) {
    character.value.mp = Math.min(character.value.maxMp, character.value.mp + amount)
  }

  // 消耗魔法值
  function consumeMp(amount) {
    character.value.mp = Math.max(0, character.value.mp - amount)
  }

  // 增加经验值
  function addExp(amount) {
    character.value.exp += amount
    checkLevelUp()
  }

  // 增加金币
  function addGold(amount) {
    character.value.gold += amount
  }

  // 重置人物状态
  function resetCharacter() {
    character.value.hp = character.value.maxHp
    character.value.mp = character.value.maxMp
  }

  // 重置升级状态
  function resetLevel() {
    character.value.level = 1
    character.value.exp = 0
    character.value.maxExp = 50
    character.value.maxHp = 100
    character.value.maxMp = 100
    character.value.hp = 100
    character.value.mp = 100
    character.value.baseAttack = 1
    character.value.baseMagicAttack = 1
    character.value.baseDefense = 1
    character.value.baseMaxDefense = 1
    character.value.baseMagicDefense = 1
    character.value.baseDodge = 1
    character.value.baseAgility = 1
    character.value.baseLuck = 1
    character.value.gold = 100
  }

  return {
    // 状态
    character,
    totalStats,
    
    // 方法
    checkLevelUp,
    healHp,
    healMp,
    consumeMp,
    addExp,
    addGold,
    resetCharacter,
    resetLevel
  }
}) 