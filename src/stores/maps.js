import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useBattleStore } from './battle.js'
import { useCharacterStore } from './character.js'
import mapsData from './mapsData.js'

export const useMapsStore = defineStore('maps', () => {
  const battleStore = useBattleStore()
  const characterStore = useCharacterStore()
  
  // 地图状态
  const currentMap = ref(null)
  const isIdle = ref(false)
  const idleTime = ref(0)
  let idleTimer = null // 挂机定时器

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

  // 选择地图
  function selectMap(map) {
    // 如果当前有地图且正在战斗中，先停止挂机
    if (currentMap.value && isIdle.value) {
      isIdle.value = false
      battleStore.addBattleLog('切换地图，自动停止挂机', 'info')
    }
    
    currentMap.value = map
    battleStore.resetBattleState()
    
    battleStore.addBattleLog(`选择了${map.name}地图，战斗步数：${map.steps[0]}-${map.steps[1]}`, 'info')
  }

  // 切换挂机状态
  function toggleIdle() {
    if (!currentMap.value) {
      battleStore.addBattleLog('请先选择挂机地图！', 'error')
      return
    }

    isIdle.value = !isIdle.value
    
    if (isIdle.value) {
      battleStore.addBattleLog(`开始在${currentMap.value.name}挂机`, 'info')
      battleStore.startBattleSequence(currentMap.value)
      
      // 启动挂机定时器
      startIdleTimer()
    } else {
      battleStore.addBattleLog('停止挂机', 'info')
      // 停止挂机后，重置整个战斗状态
      stopIdleTimer()
      battleStore.resetBattleState()
    }
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
        battleStore.addBattleLog(`挂机时间：${idleTime.value}秒，准备战斗`, 'info')
        
        // 每次战斗都必定有怪物，直接进行战斗
        battleStore.addBattleLog(`开始第${Math.floor(idleTime.value / 5)}场战斗`, 'info')
        battle()
      }
    }, 1000)
    
    battleStore.addBattleLog('挂机定时器已启动，每5秒进行一次战斗', 'info')
  }

  // 停止挂机定时器
  function stopIdleTimer() {
    if (idleTimer) {
      clearInterval(idleTimer)
      idleTimer = null
      battleStore.addBattleLog('挂机定时器已停止', 'info')
    }
  }

  // 战斗逻辑
  function battle() {
    // 添加调试日志
    battleStore.addBattleLog(`战斗状态: 步数${battleStore.battleStep.value}/${battleStore.totalBattleSteps.value}, 当前怪物${battleStore.currentBattleMonsters.value.length}只, Boss战${battleStore.isBossBattle.value}`, 'info')
    
    // 如果没有怪物，需要生成新的怪物群
    if (!battleStore.currentBattleMonsters.value || battleStore.currentBattleMonsters.value.length === 0) {
      if (battleStore.isBossBattle.value) {
        // Boss战结束，完成整个战斗序列
        battleStore.addBattleLog('Boss战结束，完成战斗序列', 'info')
        battleStore.completeBattleSequence()
        
        // 检查是否应该继续挂机循环
        if (isIdle.value) {
          battleStore.addBattleLog('战斗序列完成，准备开始新的战斗循环！', 'success')
          
          // 延迟1秒后开始新的战斗序列，给玩家一点时间看到完成信息
          setTimeout(() => {
            if (isIdle.value) { // 再次检查是否仍在挂机状态
              battleStore.addBattleLog(`开始第${battleStore.completedCycles.value + 1}个战斗循环...`, 'info')
              battleStore.startBattleSequence(currentMap.value)
            }
          }, 1000)
        }
        return
      } else {
        // 当前怪物群已清空，递增战斗步数并生成下一群
        battleStore.battleStep.value++
        battleStore.addBattleLog(`当前怪物群已清空，战斗步数增加到${battleStore.battleStep.value}`, 'info')
        
        if (battleStore.battleStep.value >= battleStore.totalBattleSteps.value) {
          // 所有普通战斗完成，开始Boss战
          battleStore.addBattleLog('所有普通战斗完成，开始Boss战', 'info')
          battleStore.startBossBattle(currentMap.value)
        } else {
          // 生成下一群怪物
          battleStore.addBattleLog(`生成第${battleStore.battleStep.value}群怪物`, 'info')
          battleStore.generateMonsterGroup(currentMap.value)
        }
        return
      }
    }

    // 战斗逻辑
    if (!battleStore.currentBattleMonsters.value || battleStore.currentBattleMonsters.value.length === 0) {
      return
    }
    
    const currentMonster = battleStore.currentBattleMonsters.value[0]
    
    // 调试信息
    battleStore.addBattleLog(`开始与 ${currentMonster.name} 战斗，怪物HP: ${currentMonster.hp}/${currentMonster.maxHp}`, 'info')

    // 随机使用技能（若可用），否则普通攻击
    let acted = false
    if (battleStore.selectedActiveSkills && battleStore.selectedActiveSkills.value.length) {
      // 50% 概率尝试释放技能
      if (Math.random() < 0.5) {
        acted = battleStore.useRandomSelectedSkill(currentMonster, battleStore.totalStats, battleStore.addBattleLog)
      }
    }

    if (!acted) {
      // 玩家普通攻击 - 使用物理攻击和魔法攻击
      const playerPhysicalDamage = Math.max(1, battleStore.totalStats.value.attack - currentMonster.defense + Math.floor(Math.random() * 10))
      const playerMagicDamage = Math.max(1, battleStore.totalStats.value.magicAttack - currentMonster.magicDefense + Math.floor(Math.random() * 10))
      const totalPlayerDamage = playerPhysicalDamage + playerMagicDamage
      
      const monsterHpBefore = currentMonster.hp
      currentMonster.hp -= Math.floor(totalPlayerDamage)
      
      battleStore.addBattleLog(`⚔️ 普通攻击 ${currentMonster.name}`, 'info')
      battleStore.addBattleLog(`   → 物理伤害: ${Math.floor(playerPhysicalDamage)} 点`, 'damage')
      battleStore.addBattleLog(`   → 魔法伤害: ${Math.floor(playerMagicDamage)} 点`, 'damage')
      battleStore.addBattleLog(`   → 总伤害: ${Math.floor(totalPlayerDamage)} 点 (${monsterHpBefore} → ${currentMonster.hp})`, 'damage')
    }

    if (currentMonster.hp <= 0) {
      // 怪物死亡
      const expGain = currentMonster.exp
      const goldGain = Math.floor(Math.random() * 10) + 5
      
      characterStore.addExp(expGain)
      characterStore.addGold(goldGain)
      
      battleStore.addBattleLog(`💀 击败了 ${currentMonster.name}！`, 'success')
      battleStore.addBattleLog(`   → 获得 ${expGain} 经验值`, 'exp')
      battleStore.addBattleLog(`   → 获得 ${goldGain} 金币`, 'gold')
      
      // 掉落物品
      battleStore.checkItemDrop(currentMap.value)
      
      // 从怪物群中移除
      battleStore.currentBattleMonsters.value.shift()
      battleStore.addBattleLog(`剩余怪物数量: ${battleStore.currentBattleMonsters.value ? battleStore.currentBattleMonsters.value.length : 0}`, 'info')
    } else {
      // 怪物反击 - 考虑闪避
      const dodgeChance = battleStore.totalStats.value.dodge / 1000 // 闪避概率
      if (Math.random() < dodgeChance) {
        battleStore.addBattleLog(`✨ 闪避了 ${currentMonster.name} 的攻击！`, 'success')
      } else {
        const enemyPhysicalDamage = Math.max(1, currentMonster.attack - battleStore.totalStats.value.defense + Math.floor(Math.random() * 5))
        const enemyMagicDamage = Math.max(1, currentMonster.magicAttack - battleStore.totalStats.value.magicDefense + Math.floor(Math.random() * 5))
        const totalEnemyDamage = enemyPhysicalDamage + enemyMagicDamage
        
        const playerHpBefore = characterStore.character.value.hp
        characterStore.character.value.hp -= Math.floor(totalEnemyDamage)
        battleStore.addBattleLog(`🛡️ ${currentMonster.name} 反击`, 'warning')
        battleStore.addBattleLog(`   → 物理伤害: ${Math.floor(enemyPhysicalDamage)} 点`, 'damage')
        battleStore.addBattleLog(`   → 魔法伤害: ${Math.floor(enemyMagicDamage)} 点`, 'damage')
        battleStore.addBattleLog(`   → 总伤害: ${Math.floor(totalEnemyDamage)} 点 (${playerHpBefore} → ${characterStore.character.value.hp})`, 'damage')
        
        // 检查生命值是否过低，如果过低则战斗失败
        if (characterStore.character.value.hp <= 0) {
          battleStore.addBattleLog('生命值耗尽，战斗失败！', 'error')
          battleStore.battleFailed()
          return
        }
      }
    }
  }

  // 重置地图状态
  function resetMaps() {
    currentMap.value = null
    isIdle.value = false
    idleTime.value = 0
    stopIdleTimer()
  }

  return {
    // 状态
    currentMap,
    isIdle,
    idleTime,
    maps,
    
    // 方法
    selectMap,
    toggleIdle,
    startIdleTimer,
    stopIdleTimer,
    battle,
    resetMaps
  }
})
