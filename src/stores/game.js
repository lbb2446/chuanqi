import { defineStore } from 'pinia'
import { useCharacterStore } from './character.js'
import { useBattleStore } from './battle.js'
import { useSkillsStore } from './skills.js'
import { useEquipmentStore } from './equipment.js'
import { useMapsStore } from './maps.js'
import itemsData from './items.js'

export const useGameStore = defineStore('game', () => {
  // 导入所有子store
  const characterStore = useCharacterStore()
  const battleStore = useBattleStore()
  const skillsStore = useSkillsStore()
  const equipmentStore = useEquipmentStore()
  const mapsStore = useMapsStore()

  // 数据持久化
  function saveGame() {
    const gameData = {
      character: characterStore.character.value,
      equipment: equipmentStore.equipment.value,
      inventory: equipmentStore.inventory.value,
      currentMap: mapsStore.currentMap.value,
      idleTime: mapsStore.idleTime.value,
      battleLogs: battleStore.battleLogs.value.slice(0, 20),
      battleStep: battleStore.battleStep.value,
      totalBattleSteps: battleStore.totalBattleSteps.value,
      currentBattleMonsters: battleStore.currentBattleMonsters.value,
      isBossBattle: battleStore.isBossBattle.value,
      canRecover: battleStore.canRecover.value,
      completedCycles: battleStore.completedCycles.value,
      selectedActiveSkills: skillsStore.selectedActiveSkills.value,
      skillProficiency: skillsStore.skillProficiency.value,
      skillCooldownUntil: skillsStore.skillCooldownUntil.value
    }
    localStorage.setItem('idleGame', JSON.stringify(gameData))
  }

  function loadGame() {
    const saved = localStorage.getItem('idleGame')
    if (saved) {
      try {
        const gameData = JSON.parse(saved)
        
        // 加载人物数据
        if (gameData.character) {
          Object.assign(characterStore.character.value, gameData.character)
        }
        
        // 加载装备数据
        if (gameData.equipment) {
          Object.assign(equipmentStore.equipment.value, gameData.equipment)
        }
        
        // 加载背包数据
        if (gameData.inventory) {
          equipmentStore.inventory.value = gameData.inventory || Array(400).fill(null)
        }
        
        // 加载地图数据
        if (gameData.currentMap) {
          mapsStore.currentMap.value = gameData.currentMap
        }
        
        // 加载挂机时间
        if (gameData.idleTime !== undefined) {
          mapsStore.idleTime.value = gameData.idleTime || 0
        }
        
        // 加载战斗日志
        if (gameData.battleLogs) {
          battleStore.battleLogs.value = gameData.battleLogs || []
        }
        
        // 加载战斗状态
        if (gameData.battleStep !== undefined) {
          battleStore.battleStep.value = gameData.battleStep || 0
        }
        if (gameData.totalBattleSteps !== undefined) {
          battleStore.totalBattleSteps.value = gameData.totalBattleSteps || 0
        }
        if (gameData.currentBattleMonsters) {
          battleStore.currentBattleMonsters.value = gameData.currentBattleMonsters || []
        }
        if (gameData.isBossBattle !== undefined) {
          battleStore.isBossBattle.value = gameData.isBossBattle || false
        }
        if (gameData.canRecover !== undefined) {
          battleStore.canRecover.value = gameData.canRecover !== undefined ? gameData.canRecover : true
        }
        if (gameData.completedCycles !== undefined) {
          battleStore.completedCycles.value = gameData.completedCycles || 0
        }
        
        // 加载技能数据
        if (gameData.selectedActiveSkills) {
          skillsStore.selectedActiveSkills.value = gameData.selectedActiveSkills || []
        }
        if (gameData.skillProficiency) {
          skillsStore.skillProficiency.value = gameData.skillProficiency || {}
        }
        if (gameData.skillCooldownUntil !== undefined) {
          skillsStore.skillCooldownUntil.value = gameData.skillCooldownUntil || 0
        }
      } catch (error) {
        console.error('加载游戏数据失败:', error)
        // 如果加载失败，重置游戏
        resetGame()
      }
    }
  }

  // 初始化游戏
  function initGame() {
    loadGame()
    
    // 页面刷新时确保战斗状态正确
    if (mapsStore.isIdle.value && !mapsStore.currentMap.value) {
      // 如果没有地图，重置战斗状态
      mapsStore.isIdle.value = false
      battleStore.resetBattleState()
      battleStore.addBattleLog('页面刷新，没有选择地图，战斗状态已重置', 'info')
    }
    
    // 确保挂机定时器被清理
    if (mapsStore.idleTimer) {
      mapsStore.stopIdleTimer()
    }
    
    // 初始化一些真实物品到背包
    if (equipmentStore.inventory.value && equipmentStore.inventory.value.every(slot => slot === null)) {
      // 添加一些基础装备
      const starterItems = [
        itemsData.data.find(item => item.Name === '木剑'),
        itemsData.data.find(item => item.Name === '布衣(男)'),
        itemsData.data.find(item => item.Name === '古铜戒指'),
        itemsData.data.find(item => item.Name === '金项链')
      ].filter(Boolean)
      
      starterItems.forEach((item, index) => {
        if (index < 5) {
          equipmentStore.inventory.value[index] = item
        }
      })
    }
  }

  // 重置整个游戏
  function resetGame() {
    characterStore.resetLevel()
    characterStore.resetCharacter()
    battleStore.resetBattleState()
    skillsStore.resetSkills()
    equipmentStore.resetEquipment()
    mapsStore.resetMaps()
    
    // 清空战斗日志
    battleStore.clearBattleLogs()
    
    // 清除本地存储
    localStorage.removeItem('idleGame')
    
    battleStore.addBattleLog('游戏已重置！', 'info')
  }

  return {
    // 子store
    characterStore,
    battleStore,
    skillsStore,
    equipmentStore,
    mapsStore,
    
    // 核心方法
    saveGame,
    loadGame,
    initGame,
    resetGame
  }
}) 