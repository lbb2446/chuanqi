import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useCharacterStore } from './character.js'
import skillsData from './skillsData.js'

export const useSkillsStore = defineStore('skills', () => {
  const characterStore = useCharacterStore()
  
  // 技能系统
  const allSkills = computed(() => skillsData.data || [])
  const selectedActiveSkills = ref([]) // 存MagID字符串数组
  const skillProficiency = ref({}) // { [MagID]: number }
  const skillCooldownUntil = ref(0) // 时间戳，早于此时间才能再次释放任意技能

  // 技能工具函数
  function getSkillById(magId) {
    return allSkills.value.find(s => s.MagID === String(magId))
  }

  function getSkillLevel(magId) {
    const skill = getSkillById(magId)
    if (!skill) return 0
    const maxLv = parseInt(skill.MaxTrainLv || '0') || 0
    if (maxLv <= 0) return 0
    
    // 检查是否至少满足1级要求
    const needLevel1 = parseInt(skill.NeedL1 || '0') || 0
    if (characterStore.character.value.level < needLevel1) return 0
    
    // 至少1级
    let lvl = 1
    
    // 检查更高等级
    for (let i = 2; i <= maxLv; i++) {
      const needLevel = parseInt(skill[`NeedL${i}`] || '0') || 0
      const needTrain = parseInt(skill[`L${i}Train`] || '0') || 0
      if (characterStore.character.value.level >= needLevel && (skillProficiency.value[magId] || 0) >= needTrain) {
        lvl = i
      } else {
        break
      }
    }
    return lvl
  }

  function canSelectSkill(magId) {
    const skill = getSkillById(magId)
    if (!skill) return false
    const isActive = parseInt(skill.EffectType || '0') !== 0
    const already = selectedActiveSkills.value.includes(String(magId))
    if (!isActive) return false // 被动技能不可勾选
    if (already) return true
    return selectedActiveSkills.value.length < 3
  }

  function toggleSelectSkill(magId) {
    const id = String(magId)
    if (!canSelectSkill(id)) return
    const idx = selectedActiveSkills.value.indexOf(id)
    if (idx >= 0) {
      selectedActiveSkills.value.splice(idx, 1)
    } else {
      selectedActiveSkills.value.push(id)
    }
  }

  function addSkillProficiency(magId, amount = 1) {
    const id = String(magId)
    skillProficiency.value[id] = (skillProficiency.value[id] || 0) + amount
  }

  // 技能伤害接口（可扩展EffectType钩子）
  const skillHooks = {
    // key: EffectType (string or number)
  }
  
  function calculateSkillDamage(totalStatsSnapshot, skill, skillLevel) {
    if (!skill || skillLevel <= 0) return 0
    const hook = skillHooks[String(skill.EffectType)] || null
    if (hook && typeof hook === 'function') {
      return Math.max(0, Math.floor(hook({ totalStats: totalStatsSnapshot, skill, skillLevel, character: characterStore.character.value })))
    }
    const basePower = parseInt(skill.Power || '0') || 0
    const defPower = parseInt(skill.DefPower || '0') || 0
    const dmg = skillLevel * defPower + basePower
    return Math.max(0, Math.floor(dmg))
  }

  function getSkillMpCost(skill, skillLevel) {
    const base = parseInt(skill.Spell || '0') || 0
    const def = parseInt(skill.DefSpell || '0') || 0
    return Math.max(0, base + (skillLevel - 1) * def)
  }

  function useRandomSelectedSkill(currentMonster, totalStats, addBattleLog) {
    const now = Date.now()
    if (now < skillCooldownUntil.value) return false
    if (!selectedActiveSkills.value.length) return false
    const skillId = selectedActiveSkills.value[Math.floor(Math.random() * selectedActiveSkills.value.length)]
    const skill = getSkillById(skillId)
    if (!skill) return false
    const skillLevel = getSkillLevel(skillId)
    if (skillLevel <= 0) return false
    const mpCost = getSkillMpCost(skill, skillLevel)
    if (characterStore.character.value.mp < mpCost) return false

    // 执行技能
    const damage = calculateSkillDamage(totalStats, skill, skillLevel)
    const monsterHpBefore = currentMonster.hp
    currentMonster.hp -= damage
    characterStore.consumeMp(mpCost)
    
    // 详细的技能使用日志
    addBattleLog(`🎯 施放技能【${skill.MagName}】Lv${skillLevel}`, 'skill')
    addBattleLog(`   → 目标: ${currentMonster.name} (Lv${currentMonster.level})`, 'info')
    addBattleLog(`   → 伤害: ${damage} 点 (${monsterHpBefore} → ${currentMonster.hp})`, 'damage')
    addBattleLog(`   → MP消耗: ${mpCost} (剩余: ${characterStore.character.value.mp}/${characterStore.character.value.maxMp})`, 'info')
    addBattleLog(`   → 冷却时间: ${parseInt(skill.Delay || '0') * 10}ms`, 'info')
    addBattleLog(`   → 熟练度: +1 (当前: ${(skillProficiency.value[skillId] || 0) + 1})`, 'exp')
    
    addSkillProficiency(skillId, 1)
    const delayMs = (parseInt(skill.Delay || '0') || 0) * 10
    skillCooldownUntil.value = now + Math.max(0, delayMs)
    return true
  }

  // 重置技能状态
  function resetSkills() {
    selectedActiveSkills.value = []
    skillProficiency.value = {}
    skillCooldownUntil.value = 0
  }

  return {
    // 状态
    allSkills,
    selectedActiveSkills,
    skillProficiency,
    skillCooldownUntil,
    
    // 方法
    getSkillById,
    getSkillLevel,
    canSelectSkill,
    toggleSelectSkill,
    addSkillProficiency,
    calculateSkillDamage,
    getSkillMpCost,
    useRandomSelectedSkill,
    resetSkills
  }
})