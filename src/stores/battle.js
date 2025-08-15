import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCharacterStore } from './character.js'
import monsterData from './monster.js'
import itemsData from './items.js'

export const useBattleStore = defineStore('battle', () => {
  const characterStore = useCharacterStore()
  
  // 战斗状态
  const battleStep = ref(0) // 当前战斗步数
  const totalBattleSteps = ref(0) // 总战斗步数
  const currentBattleMonsters = ref([]) // 当前战斗中的怪物群
  const isBossBattle = ref(false) // 是否在Boss战中
  const canRecover = ref(true) // 是否可以恢复生命值
  const completedCycles = ref(0) // 已完成的战斗循环数
  const battleLogs = ref([]) // 战斗日志

  // 生成敌人
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

  // 生成怪物群
  function generateMonsterGroup(currentMap) {
    if (!currentMap || !currentMap.monsters) {
      addBattleLog('错误：地图数据不完整，无法生成怪物', 'error')
      return
    }
    
    const monsterCount = Math.floor(Math.random() * 3) + 3 // 3-5只怪物
    const mapMonsters = currentMap.monsters
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
        addBattleLog(`警告：无法生成怪物 ${monsterName}，使用默认怪物`, 'warning')
        // 如果无法生成指定怪物，使用默认怪物
        const defaultMonster = {
          name: monsterName,
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
        currentBattleMonsters.value.push(defaultMonster)
        addBattleLog(`使用默认怪物：${defaultMonster.name}，HP: ${defaultMonster.hp}`, 'info')
      }
    }

    addBattleLog(`遭遇了${currentBattleMonsters.value.length}只怪物！`, 'info')
  }

  // 开始Boss战
  function startBossBattle(currentMap) {
    if (!currentMap || !currentMap.boss) {
      addBattleLog('错误：地图数据不完整，无法开始Boss战', 'error')
      return
    }
    
    isBossBattle.value = true
    const bossName = currentMap.boss
    const boss = generateEnemy(bossName)
    currentBattleMonsters.value = [boss]
    addBattleLog(`Boss战开始！遭遇了${bossName}！`, 'warning')
  }

  // 开始战斗序列
  function startBattleSequence(currentMap) {
    if (!currentMap || !currentMap.steps || !Array.isArray(currentMap.steps) || currentMap.steps.length < 2) {
      addBattleLog('错误：地图数据不完整，无法开始战斗序列', 'error')
      return
    }
    
    // 重置战斗状态
    battleStep.value = 0
    totalBattleSteps.value = Math.floor(Math.random() * (currentMap.steps[1] - currentMap.steps[0] + 1)) + currentMap.steps[0]
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = false
    
    addBattleLog(`开始新的战斗序列，总步数：${totalBattleSteps.value}`, 'info')
    
    // 生成第一群怪物
    generateMonsterGroup(currentMap)
    
    // 调试信息
    addBattleLog(`战斗序列初始化完成，怪物数量：${currentBattleMonsters.value ? currentBattleMonsters.value.length : 0}`, 'info')
    if (currentBattleMonsters.value && currentBattleMonsters.value.length > 0) {
      addBattleLog(`第一个怪物：${currentBattleMonsters.value[0].name}，HP: ${currentBattleMonsters.value[0].hp}`, 'info')
    }
  }

  // 完成整个战斗序列
  function completeBattleSequence() {
    // 增加完成的循环数
    completedCycles.value++
    
    addBattleLog(`恭喜！完成了第${completedCycles.value}个战斗循环！`, 'success')
    
    // 恢复生命值和魔法值
    characterStore.resetCharacter()
    canRecover.value = true
    
    // 重置战斗状态
    battleStep.value = 0
    totalBattleSteps.value = 0
    currentBattleMonsters.value = []
    isBossBattle.value = false
    
    addBattleLog('生命值和魔法值已完全恢复！', 'info')
    addBattleLog('战斗序列完成，挂机已自动停止', 'success')
  }

  // 重置战斗状态
  function resetBattleState() {
    battleStep.value = 0
    totalBattleSteps.value = 0
    currentBattleMonsters.value = []
    isBossBattle.value = false
    canRecover.value = true
    
    // 重置循环计数
    completedCycles.value = 0
    
    // 恢复人物状态
    characterStore.resetCharacter()
    
    addBattleLog('战斗状态已重置，人物状态已恢复！', 'info')
  }

  // 战斗失败处理
  function battleFailed() {
    addBattleLog('战斗失败，所有战斗进度已重置！', 'error')
    
    // 重置战斗状态
    resetBattleState()
    
    addBattleLog('人物状态已恢复，可以重新开始战斗', 'info')
  }

  // 检查物品掉落
  function checkItemDrop(currentMap) {
    if (!currentMap || !currentMap.itemIndex) return
    
    Object.entries(currentMap.itemIndex).forEach(([itemIdx, dropRate]) => {
      if (Math.random() < dropRate) {
        const item = findItemById(itemIdx)
        if (item) {
          addBattleLog(`获得了 ${item.Name}！`, 'item')
        }
      }
    })
  }

  // 根据ID查找物品
  function findItemById(idx) {
    return itemsData.data.find(item => item.Idx === idx)
  }

  // 添加战斗日志
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
  }

  return {
    // 状态
    battleStep,
    totalBattleSteps,
    currentBattleMonsters,
    isBossBattle,
    canRecover,
    completedCycles,
    battleLogs,
    
    // 方法
    generateEnemy,
    generateMonsterGroup,
    startBossBattle,
    startBattleSequence,
    completeBattleSequence,
    resetBattleState,
    battleFailed,
    checkItemDrop,
    findItemById,
    addBattleLog,
    clearBattleLogs
  }
}) 