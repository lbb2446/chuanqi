import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import mapsData from './maps.js'
import monsterData from './monster.js'
import itemsData from './items.js'
import skillsData from './skills.js'

export const useGameStore = defineStore('game', () => {
  // 游戏状态
  const isIdle = ref(false)
  const idleTime = ref(0)
  const currentMap = ref(null)
  const currentEnemy = ref(null)
  const battleLogs = ref([])
  let idleTimer = null // 挂机定时器
  
  // 战斗状态
  const battleStep = ref(0) // 当前战斗步数
  const totalBattleSteps = ref(0) // 总战斗步数
  const currentBattleMonsters = ref([]) // 当前战斗中的怪物群
  const isBossBattle = ref(false) // 是否在Boss战中
  const canRecover = ref(true) // 是否可以恢复生命值
  const completedCycles = ref(0) // 已完成的战斗循环数

  // 技能系统
  const allSkills = computed(() => skillsData.data || [])
  // 仅允许勾选主动技能（EffectType != 0）最多3个
  const selectedActiveSkills = ref([]) // 存MagID字符串数组
  const skillProficiency = ref({}) // { [MagID]: number }
  const skillCooldownUntil = ref(0) // 时间戳，早于此时间才能再次释放任意技能

  // 人物数据 - 优化属性结构，与怪物属性保持一致
  const character = ref({
    level: 1,
    exp: 0,
    maxExp: 1000,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    gold: 100,
    // 基础属性
    baseAttack: 15,        // 物理攻击力
    baseMagicAttack: 10,   // 魔法攻击力
    baseDefense: 8,        // 物理防御
    baseMaxDefense: 12,    // 最大物理防御
    baseMagicDefense: 5,   // 魔法防御
    baseDodge: 20,         // 闪避能力
    baseAttackSpeed: 1000, // 攻击速度（毫秒）
    baseAgility: 15,       // 敏捷
    baseLuck: 10           // 幸运
  })

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

  // 地图数据 - 从maps.js导入
  const maps = computed(() => {
    return mapsData.data.map(map => ({
      id: map.Name,
      name: map.Name,
      description: `${map.Name}地图`,
      monsters: map.Monster,
      boss: map.Boss,
      steps: map.steps,
      itemIndex: map.ItemIdex
    }))
  })

  // 计算总属性 - 从真实物品数据中提取属性
  const totalStats = computed(() => {
    let stats = {
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
    if (character.value.level < needLevel1) return 0
    
    // 至少1级
    let lvl = 1
    
    // 检查更高等级
    for (let i = 2; i <= maxLv; i++) {
      const needLevel = parseInt(skill[`NeedL${i}`] || '0') || 0
      const needTrain = parseInt(skill[`L${i}Train`] || '0') || 0
      if (character.value.level >= needLevel && (skillProficiency.value[magId] || 0) >= needTrain) {
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
    saveGame()
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
      return Math.max(0, Math.floor(hook({ totalStats: totalStatsSnapshot, skill, skillLevel, character: character.value })))
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

  function useRandomSelectedSkill(currentMonster) {
    const now = Date.now()
    if (now < skillCooldownUntil.value) return false
    if (!selectedActiveSkills.value.length) return false
    const skillId = selectedActiveSkills.value[Math.floor(Math.random() * selectedActiveSkills.value.length)]
    const skill = getSkillById(skillId)
    if (!skill) return false
    const skillLevel = getSkillLevel(skillId)
    if (skillLevel <= 0) return false
    const mpCost = getSkillMpCost(skill, skillLevel)
    if (character.value.mp < mpCost) return false

    // 执行技能
    const damage = calculateSkillDamage(totalStats.value, skill, skillLevel)
    currentMonster.hp -= damage
    character.value.mp -= mpCost
    
    // 详细的技能使用日志
    addBattleLog(`🎯 施放技能【${skill.MagName}】Lv${skillLevel}`, 'skill')
    addBattleLog(`   → 对 ${currentMonster.name} 造成 ${damage} 点伤害`, 'damage')
    addBattleLog(`   → 消耗魔法值 ${mpCost}，剩余MP: ${character.value.mp}/${character.value.maxMp}`, 'info')
    addBattleLog(`   → 技能冷却: ${parseInt(skill.Delay || '0') * 10}ms`, 'info')
    
    addSkillProficiency(skillId, 1)
    const delayMs = (parseInt(skill.Delay || '0') || 0) * 10 // 源表 Delay 单位不明确，按描述毫秒，这里保守乘10防过快
    skillCooldownUntil.value = now + Math.max(0, delayMs)
    return true
  }

  // 游戏方法
  function selectMap(map) {
    // 如果当前有地图且正在战斗中，先停止挂机
    if (currentMap.value && isIdle.value) {
      isIdle.value = false
      addBattleLog('切换地图，自动停止挂机', 'info')
    }
    
    currentMap.value = map
    battleStep.value = 0
    totalBattleSteps.value = Math.floor(Math.random() * (map.steps[1] - map.steps[0] + 1)) + map.steps[0]
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = true // 选择新地图时可以恢复
    
    addBattleLog(`选择了${map.name}地图，战斗步数：${totalBattleSteps.value}`, 'info')
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
      canRecover.value = false // 开始战斗后无法恢复
      startBattleSequence()
      
      // 确保战斗状态正确
      if (currentBattleMonsters.value.length === 0) {
        addBattleLog('警告：战斗开始但怪物群为空，重新生成怪物', 'warning')
        generateMonsterGroup()
      }
      
      // 启动挂机定时器
      startIdleTimer()
    } else {
      addBattleLog('停止挂机', 'info')
      // 停止挂机后，重置整个战斗状态
      stopIdleTimer()
      resetBattleState()
    }
    
    saveGame()
  }

  // 启动挂机定时器
  function startIdleTimer() {
    if (idleTimer) {
      clearInterval(idleTimer)
    }
    
    idleTimer = setInterval(() => {
      idleTime.value++
      
      // 每5秒进行一次战斗
      if (idleTime.value % 5 === 0) {
        addBattleLog(`挂机时间：${idleTime.value}秒，准备战斗`, 'info')
        
        // 检查是否有怪物可以战斗
        if (currentBattleMonsters.value.length > 0) {
          addBattleLog(`开始第${Math.floor(idleTime.value / 5)}场战斗`, 'info')
          battle()
        } else {
          addBattleLog('没有怪物可以战斗，跳过本次战斗', 'warning')
        }
      }
    }, 1000)
    
    addBattleLog('挂机定时器已启动，每5秒进行一次战斗', 'info')
  }

  // 停止挂机定时器
  function stopIdleTimer() {
    if (idleTimer) {
      clearInterval(idleTimer)
      idleTimer = null
      addBattleLog('挂机定时器已停止', 'info')
    }
  }

  // 重置战斗状态
  function resetBattleState() {
    battleStep.value = 0
    totalBattleSteps.value = 0
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = true
    skillCooldownUntil.value = 0
    
    // 重置循环计数
    completedCycles.value = 0
    
    // 恢复人物状态
    character.value.hp = character.value.maxHp
    character.value.mp = character.value.maxMp
    
    // 停止挂机定时器
    stopIdleTimer()
    
    addBattleLog('战斗状态已重置，人物状态已恢复！', 'info')
  }

  // 开始战斗序列
  function startBattleSequence() {
    // 重置战斗状态
    battleStep.value = 0
    totalBattleSteps.value = Math.floor(Math.random() * (currentMap.value.steps[1] - currentMap.value.steps[0] + 1)) + currentMap.value.steps[0]
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = false
    
    addBattleLog(`开始新的战斗序列，总步数：${totalBattleSteps.value}`, 'info')
    
    // 生成第一群怪物
    generateMonsterGroup()
    
    // 调试信息
    addBattleLog(`战斗序列初始化完成，怪物数量：${currentBattleMonsters.value.length}`, 'info')
    if (currentBattleMonsters.value.length > 0) {
      addBattleLog(`第一个怪物：${currentBattleMonsters.value[0].name}，HP: ${currentBattleMonsters.value[0].hp}`, 'info')
    }
  }

  // 生成怪物群
  function generateMonsterGroup() {
    const monsterCount = Math.floor(Math.random() * 3) + 3 // 3-5只怪物
    const mapMonsters = currentMap.value.monsters
    currentBattleMonsters.value = []

    addBattleLog(`准备生成${monsterCount}只怪物，地图怪物列表：${mapMonsters.join(', ')}`, 'info')

    for (let i = 0; i < monsterCount; i++) {
      const monsterName = mapMonsters[Math.floor(Math.random() * mapMonsters.length)]
      addBattleLog(`尝试生成怪物：${monsterName}`, 'info')
      
      const monster = generateEnemy(monsterName)
      if (monster) {
        currentBattleMonsters.value.push(monster)
        addBattleLog(`成功生成怪物：${monster.name}，HP: ${monster.hp}`, 'info')
      } else {
        addBattleLog(`警告：无法生成怪物 ${monsterName}`, 'warning')
      }
    }

    addBattleLog(`遭遇了${currentBattleMonsters.value.length}只怪物！`, 'info')
    
    // 如果没有成功生成怪物，记录错误
    if (currentBattleMonsters.value.length === 0) {
      addBattleLog('错误：未能生成任何怪物！', 'error')
    }
  }

  // 开始Boss战
  function startBossBattle() {
    isBossBattle.value = true
    const bossName = currentMap.value.boss
    const boss = generateEnemy(bossName)
    currentBattleMonsters.value = [boss]
    addBattleLog(`Boss战开始！遭遇了${bossName}！`, 'warning')
  }

  function battle() {
    // 添加调试日志
    addBattleLog(`战斗状态: 步数${battleStep.value}/${totalBattleSteps.value}, 怪物数量${currentBattleMonsters.value.length}, Boss战${isBossBattle.value}`, 'info')
    
    // 如果没有怪物，需要生成新的怪物群
    if (currentBattleMonsters.value.length === 0) {
      if (isBossBattle.value) {
        // Boss战结束，完成整个战斗序列
        addBattleLog('Boss战结束，完成战斗序列', 'info')
        completeBattleSequence()
        return
      } else {
        // 当前怪物群已清空，递增战斗步数并生成下一群
        battleStep.value++
        addBattleLog(`当前怪物群已清空，战斗步数增加到${battleStep.value}`, 'info')
        
        if (battleStep.value >= totalBattleSteps.value) {
          // 所有普通战斗完成，开始Boss战
          addBattleLog('所有普通战斗完成，开始Boss战', 'info')
          startBossBattle()
        } else {
          // 生成下一群怪物
          addBattleLog(`生成第${battleStep.value}群怪物`, 'info')
          generateMonsterGroup()
        }
        return
      }
    }

    // 战斗逻辑
    const currentMonster = currentBattleMonsters.value[0]
    
    // 调试信息
    addBattleLog(`开始与 ${currentMonster.name} 战斗，怪物HP: ${currentMonster.hp}/${currentMonster.maxHp}`, 'info')

    // 随机使用技能（若可用），否则普通攻击
    let acted = false
    if (selectedActiveSkills.value.length) {
      // 50% 概率尝试释放技能
      if (Math.random() < 0.5) {
        acted = useRandomSelectedSkill(currentMonster)
      }
    }

    if (!acted) {
      // 玩家普通攻击 - 使用物理攻击和魔法攻击
      const playerPhysicalDamage = Math.max(1, totalStats.value.attack - currentMonster.defense + Math.floor(Math.random() * 10))
      const playerMagicDamage = Math.max(1, totalStats.value.magicAttack - currentMonster.magicDefense + Math.floor(Math.random() * 10))
      const totalPlayerDamage = playerPhysicalDamage + playerMagicDamage
      
      currentMonster.hp -= Math.floor(totalPlayerDamage)
      addBattleLog(`对 ${currentMonster.name} 造成了 ${Math.floor(totalPlayerDamage)} 点伤害 (物理:${Math.floor(playerPhysicalDamage)}, 魔法:${Math.floor(playerMagicDamage)})`, 'damage')
    }

    if (currentMonster.hp <= 0) {
      // 怪物死亡
      const expGain = currentMonster.exp
      const goldGain = Math.floor(Math.random() * 10) + 5
      
      character.value.exp += expGain
      character.value.gold += goldGain
      
      addBattleLog(`击败了 ${currentMonster.name}！`, 'info')
      addBattleLog(`获得 ${expGain} 经验值`, 'exp')
      addBattleLog(`获得 ${goldGain} 金币`, 'gold')
      
      // 检查升级
      checkLevelUp()
      
      // 掉落物品
      checkItemDrop()
      
      // 从怪物群中移除
      currentBattleMonsters.value.shift()
      addBattleLog(`剩余怪物数量: ${currentBattleMonsters.value.length}`, 'info')
    } else {
      // 怪物反击 - 考虑闪避
      const dodgeChance = totalStats.value.dodge / 1000 // 闪避概率
      if (Math.random() < dodgeChance) {
        addBattleLog(`闪避了 ${currentMonster.name} 的攻击！`, 'info')
      } else {
        const enemyPhysicalDamage = Math.max(1, currentMonster.attack - totalStats.value.defense + Math.floor(Math.random() * 5))
        const enemyMagicDamage = Math.max(1, currentMonster.magicAttack - totalStats.value.magicDefense + Math.floor(Math.random() * 5))
        const totalEnemyDamage = enemyPhysicalDamage + enemyMagicDamage
        
        character.value.hp -= Math.floor(totalEnemyDamage)
        addBattleLog(`${currentMonster.name} 对你造成了 ${Math.floor(totalEnemyDamage)} 点伤害 (物理:${Math.floor(enemyPhysicalDamage)}, 魔法:${Math.floor(enemyMagicDamage)})`, 'damage')
        
        // 检查生命值是否过低，如果过低则战斗失败
        if (character.value.hp <= 0) {
          addBattleLog('生命值耗尽，战斗失败！', 'error')
          battleFailed()
          return
        }
      }
    }
    
    saveGame()
  }

  // 战斗失败处理
  function battleFailed() {
    addBattleLog('战斗失败，所有战斗进度已重置！', 'error')
    
    // 重置战斗状态
    battleStep.value = 0
    totalBattleSteps.value = 0
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = true
    skillCooldownUntil.value = 0
    
    // 恢复人物状态
    character.value.hp = character.value.maxHp
    character.value.mp = character.value.maxMp
    
    // 停止挂机
    isIdle.value = false
    stopIdleTimer()
    
    addBattleLog('人物状态已恢复，可以重新开始战斗', 'info')
    saveGame()
  }

  // 检查物品掉落
  function checkItemDrop() {
    if (!currentMap.value || !currentMap.value.itemIndex) return
    
    Object.entries(currentMap.value.itemIndex).forEach(([itemIdx, dropRate]) => {
      if (Math.random() < dropRate) {
        const item = findItemById(itemIdx)
        if (item) {
          addToInventory(item)
          addBattleLog(`获得了 ${item.Name}！`, 'item')
        }
      }
    })
  }

  // 根据ID查找物品
  function findItemById(idx) {
    return itemsData.data.find(item => item.Idx === idx)
  }

  // 完成整个战斗序列
  function completeBattleSequence() {
    // 增加完成的循环数
    completedCycles.value++
    
    addBattleLog(`恭喜！完成了第${completedCycles.value}个战斗循环！`, 'success')
    
    // 恢复生命值和魔法值
    character.value.hp = character.value.maxHp
    character.value.mp = character.value.maxMp
    canRecover.value = true
    skillCooldownUntil.value = 0
    
    // 重置战斗状态
    battleStep.value = 0
    totalBattleSteps.value = 0
    currentBattleMonsters.value = []
    isBossBattle.value = false
    
    // 检查是否应该继续挂机循环
    if (isIdle.value) {
      addBattleLog('战斗序列完成，准备开始新的战斗循环！', 'success')
      addBattleLog('生命值和魔法值已完全恢复！', 'info')
      
      // 延迟1秒后开始新的战斗序列，给玩家一点时间看到完成信息
      setTimeout(() => {
        if (isIdle.value) { // 再次检查是否仍在挂机状态
          addBattleLog(`开始第${completedCycles.value + 1}个战斗循环...`, 'info')
          startBattleSequence()
        }
      }, 1000)
    } else {
      // 如果不在挂机状态，停止定时器
      stopIdleTimer()
      addBattleLog('战斗序列完成，挂机已停止', 'success')
    }
    
    saveGame()
  }

  function generateEnemy(name) {
    // 从monster.js中查找怪物数据
    const monster = monsterData.data.find(m => m.Name === name)
    
    if (monster) {
      return {
        name: monster.Name,
        level: parseInt(monster.Lvl),
        hp: parseInt(monster.HP),
        maxHp: parseInt(monster.HP),
        mp: parseInt(monster.MP),
        attack: parseInt(monster.AC),
        magicAttack: parseInt(monster.MAC),
        defense: parseInt(monster.DC),
        maxDefense: parseInt(monster.DCMAX),
        magicDefense: parseInt(monster.MC),
        dodge: parseInt(monster.SC),
        attackSpeed: parseInt(monster.ATTACK_SPD),
        exp: parseInt(monster.Exp)
      }
    }
    
    // 如果找不到数据，使用默认值
    return {
      name: name,
      level: 1,
      hp: 50,
      maxHp: 50,
      mp: 0,
      attack: 5,
      magicAttack: 0,
      defense: 2,
      maxDefense: 5,
      magicDefense: 0,
      dodge: 0,
      attackSpeed: 2000,
      exp: 10
    }
  }

  function checkLevelUp() {
    while (character.value.exp >= character.value.maxExp) {
      character.value.exp -= character.value.maxExp
      character.value.level++
      character.value.maxExp = Math.floor(character.value.maxExp * 1.5)
      
      // 升级属性提升
      character.value.maxHp += 100
      character.value.maxMp += 100
      character.value.hp = character.value.maxHp
      character.value.mp = character.value.maxMp
      character.value.baseAttack += 50
      character.value.baseMagicAttack += 50
      character.value.baseDefense += 30
      character.value.baseMaxDefense += 30
      character.value.baseMagicDefense += 30
      character.value.baseDodge += 20
      character.value.baseAgility += 20
      character.value.baseLuck += 20
      
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

  function addToInventory(item) {
    const emptySlot = inventory.value.findIndex(slot => slot === null)
    if (emptySlot !== -1) {
      inventory.value[emptySlot] = item
    }
  }

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
      addBattleLog(`无法装备 ${item.Name}，不支持的物品类型`, 'warning')
      return
    }
    
    // 如果装备栏有装备，放回背包
    if (equipment.value[slot]) {
      inventory.value[inventoryIndex] = equipment.value[slot]
    } else {
      inventory.value[inventoryIndex] = null
    }
    
    equipment.value[slot] = item
    addBattleLog(`装备了 ${item.Name} 到 ${getSlotName(slot)}`, 'info')
    saveGame()
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
    if (!current) return
    const empty = findEmptyInventorySlot()
    if (empty === -1) {
      addBattleLog('背包已满，无法脱下装备', 'warning')
      return
    }
    inventory.value[empty] = current
    equipment.value[slot] = null
    addBattleLog(`脱下 ${current.Name} 放入背包`, 'info')
    saveGame()
  }

  // 出售背包中的物品
  function sellInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return
    const price = parseInt(item.Price || '0') || 0
    character.value.gold += price
    inventory.value[index] = null
    addBattleLog(`出售 ${item.Name} 获得 ${price} 金币`, 'gold')
    saveGame()
  }

  // 丢弃背包物品
  function discardInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return
    inventory.value[index] = null
    addBattleLog(`丢弃 ${item.Name}`, 'warning')
    saveGame()
  }

  // 使用背包中的物品（非装备类）
  function useInventoryItem(index) {
    const item = inventory.value[index]
    if (!item) return
    const stdMode = parseInt(item.StdMode || '0')
    // 简单判定：装备类不允许使用
    const isEquip = [15,19,20,21,24,26,22,23,10,11,5,6].includes(stdMode)
    if (isEquip) {
      addBattleLog(`${item.Name} 为装备，不能直接使用`, 'warning')
      return
    }

    let used = false
    const hpGain = parseInt(item.Ac || '0') || 0
    if (hpGain > 0) {
      character.value.hp = Math.min(character.value.maxHp, character.value.hp + hpGain)
      addBattleLog(`使用 ${item.Name}，恢复生命 ${hpGain}`, 'success')
      used = true
    }
    const mpGain = parseInt(item.Mac || '0') || 0
    if (mpGain > 0) {
      character.value.mp = Math.min(character.value.maxMp, character.value.mp + mpGain)
      addBattleLog(`使用 ${item.Name}，恢复魔法 ${mpGain}`, 'success')
      used = true
    }

    if (!used) {
      addBattleLog(`使用了 ${item.Name}`, 'info')
    }

    // 使用后移除
    inventory.value[index] = null
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

  // 清空战斗日志
  function clearBattleLogs() {
    battleLogs.value = []
    saveGame()
  }

  // 数据持久化
  function saveGame() {
    const gameData = {
      character: character.value,
      equipment: equipment.value,
      inventory: inventory.value,
      currentMap: currentMap.value,
      idleTime: idleTime.value,
      battleLogs: battleLogs.value.slice(0, 20),
      battleStep: battleStep.value,
      totalBattleSteps: totalBattleSteps.value,
      currentBattleMonsters: currentBattleMonsters.value,
      isBossBattle: isBossBattle.value,
      canRecover: canRecover.value,
      completedCycles: completedCycles.value,
      selectedActiveSkills: selectedActiveSkills.value,
      skillProficiency: skillProficiency.value,
      skillCooldownUntil: skillCooldownUntil.value
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
        battleStep.value = gameData.battleStep || 0
        totalBattleSteps.value = gameData.totalBattleSteps || 0
        currentBattleMonsters.value = gameData.currentBattleMonsters || []
        isBossBattle.value = gameData.isBossBattle || false
        canRecover.value = gameData.canRecover !== undefined ? gameData.canRecover : true
        completedCycles.value = gameData.completedCycles || 0
        selectedActiveSkills.value = gameData.selectedActiveSkills || []
        skillProficiency.value = gameData.skillProficiency || {}
        skillCooldownUntil.value = gameData.skillCooldownUntil || 0
      } catch (error) {
        console.error('加载游戏数据失败:', error)
      }
    }
  }

  // 初始化游戏
  function initGame() {
    loadGame()
    
    // 页面刷新时确保战斗状态正确
    if (isIdle.value && (!currentMap.value || currentBattleMonsters.value.length === 0)) {
      // 如果状态异常，重置战斗状态
      isIdle.value = false
      resetBattleState()
      addBattleLog('页面刷新，战斗状态已重置', 'info')
    }
    
    // 确保挂机定时器被清理
    if (idleTimer) {
      stopIdleTimer()
    }
    
    // 初始化一些真实物品到背包
    if (inventory.value.every(slot => slot === null)) {
      // 添加一些基础装备
      const starterItems = [
        itemsData.data.find(item => item.Name === '木剑'),
        itemsData.data.find(item => item.Name === '布衣(男)'),
        itemsData.data.find(item => item.Name === '古铜戒指'),
        itemsData.data.find(item => item.Name === '金项链')
      ].filter(Boolean)
      
      starterItems.forEach((item, index) => {
        if (index < 5) {
          inventory.value[index] = item
        }
      })
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
    battleStep,
    totalBattleSteps,
    currentBattleMonsters,
    isBossBattle,
    canRecover,
    completedCycles,
    allSkills,
    selectedActiveSkills,
    skillProficiency,
    skillCooldownUntil,
    
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
    initGame,
    startBattleSequence,
    generateMonsterGroup,
    startBossBattle,
    completeBattleSequence,
    checkItemDrop,
    resetBattleState,
    battleFailed,
    // 挂机定时器方法
    startIdleTimer,
    stopIdleTimer,
    // 技能方法
    getSkillById,
    getSkillLevel,
    canSelectSkill,
    toggleSelectSkill,
    getSkillMpCost,
    // 装备方法
    getSlotName,
    unequipSlot,
    sellInventoryItem,
    discardInventoryItem,
    useInventoryItem,
    // 战斗日志方法
    clearBattleLogs
  }
}) 