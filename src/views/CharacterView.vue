<template>
  <div class="space-y-6">
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
          <!-- 经验进度条 -->
          <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all"
              :style="{ width: Math.min(100, (character.exp / character.maxExp) * 100) + '%' }"
            ></div>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            进度: {{ Math.floor((character.exp / character.maxExp) * 100) }}%
          </div>
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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">生命值</div>
          <div class="text-lg font-bold text-red-400">{{ character.hp }}/{{ character.maxHp }}</div>
          <div class="w-full bg-gray-600 rounded-full h-1.5 mt-1">
            <div
              class="bg-red-500 h-1.5 rounded-full transition-all"
              :style="{ width: (character.hp / character.maxHp) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">魔法值</div>
          <div class="text-lg font-bold text-blue-400">{{ character.mp }}/{{ character.maxMp }}</div>
          <div class="w-full bg-gray-600 rounded-full h-1.5 mt-1">
            <div
              class="bg-blue-500 h-1.5 rounded-full transition-all"
              :style="{ width: (character.mp / character.maxMp) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">物理攻击</div>
          <div class="text-lg font-bold text-orange-400">{{ totalStats.attack }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">魔法攻击</div>
          <div class="text-lg font-bold text-purple-400">{{ totalStats.magicAttack }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">物理防御</div>
          <div class="text-lg font-bold text-green-400">{{ totalStats.defense }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">魔法防御</div>
          <div class="text-lg font-bold text-cyan-400">{{ totalStats.magicDefense }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">闪避能力</div>
          <div class="text-lg font-bold text-yellow-400">{{ totalStats.dodge }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <div class="text-sm text-gray-400">攻击速度</div>
          <div class="text-lg font-bold text-indigo-400">{{ totalStats.attackSpeed }}ms</div>
        </div>
      </div>
    </div>

    <!-- 升级信息 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4 text-green-400">升级信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400 mb-2">当前等级</div>
          <div class="text-2xl font-bold text-green-400 mb-2">{{ character.level }}</div>
          <div class="text-xs text-gray-300">
            升级后属性提升:
          </div>
          <div class="text-xs text-gray-300 mt-1">
            • 生命值 +20
          </div>
          <div class="text-xs text-gray-300">
            • 魔法值 +20
          </div>
          <div class="text-xs text-gray-300">
            • 攻击力 +1
          </div>
          <div class="text-xs text-gray-300">
            • 防御力 +1
          </div>
        </div>
        <div class="bg-gray-700 p-4 rounded">
          <div class="text-sm text-gray-400 mb-2">升级进度</div>
          <div class="text-lg font-bold text-blue-400 mb-2">
            {{ character.exp }}/{{ character.maxExp }}
          </div>
          <div class="w-full bg-gray-600 rounded-full h-3 mb-2">
            <div
              class="bg-blue-500 h-3 rounded-full transition-all"
              :style="{ width: Math.min(100, (character.exp / character.maxExp) * 100) + '%' }"
            ></div>
          </div>
          <div class="text-sm text-gray-300">
            进度: {{ Math.floor((character.exp / character.maxExp) * 100) }}%
          </div>
          <div class="text-xs text-gray-400 mt-2">
            还需要: {{ character.maxExp - character.exp }} 经验值
          </div>
        </div>
      </div>
    </div>

    <!-- 技能选择与熟练度 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-yellow-400">技能系统</h3>
        <div class="text-sm text-gray-300">
          已选择主动技能: <span class="text-green-400 font-bold">{{ selectedActiveSkills.length }}</span>/3
        </div>
      </div>

      <!-- 当前勾选的技能状态 -->
      <div v-if="selectedActiveSkills.length > 0" class="mb-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
        <h4 class="text-lg font-bold text-green-400 mb-3">🎯 当前战斗技能</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="skillId in selectedActiveSkills"
            :key="skillId"
            class="bg-green-800/30 p-3 rounded border border-green-500/50"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-base font-bold text-green-300">{{ getSkillById(skillId)?.MagName }}</div>
                <div class="text-xs text-green-400">
                  等级: Lv{{ getSkillLevel(skillId) }} · 
                  冷却: {{ getSkillById(skillId)?.Delay || 0 }}ms
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-green-400">MP消耗</div>
                <div class="text-sm font-bold text-green-300">{{ getSkillMpCost(getSkillById(skillId), getSkillLevel(skillId)) }}</div>
              </div>
            </div>
            <!-- 技能冷却状态 -->
            <div class="mt-2">
              <div class="text-xs text-green-400 mb-1">冷却状态</div>
              <div class="w-full bg-green-900/50 rounded-full h-2">
                <div
                  class="bg-green-400 h-2 rounded-full transition-all"
                  :style="{ width: getSkillCooldownProgress(skillId) + '%' }"
                ></div>
              </div>
              <div class="text-xs text-green-300 mt-1">
                {{ getSkillCooldownText(skillId) }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 text-xs text-green-300">
          💡 战斗中会随机使用这些技能（50%概率），每次使用增加1点熟练度
        </div>
      </div>

      <!-- 所有技能列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="skill in allSkills"
          :key="skill.MagID"
          class="bg-gray-700 rounded p-4 border-l-4"
          :class="{
            'border-green-500': selectedActiveSkills.includes(String(skill.MagID)),
            'border-gray-600': !selectedActiveSkills.includes(String(skill.MagID))
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="form-checkbox h-4 w-4 text-yellow-400"
                  :checked="selectedActiveSkills.includes(String(skill.MagID))"
                  :disabled="!canSelectSkill(skill.MagID) && !selectedActiveSkills.includes(String(skill.MagID))"
                  @change="toggleSelectSkill(skill.MagID)"
                />
                <div class="text-lg font-bold text-gray-100">{{ skill.MagName }}</div>
                <span
                  class="text-xs px-2 py-0.5 rounded"
                  :class="parseInt(skill.EffectType) === 0 ? 'bg-gray-500 text-gray-100' : 'bg-blue-600 text-white'"
                >
                  {{ parseInt(skill.EffectType) === 0 ? '被动' : '主动' }}
                </span>
                <span
                  v-if="selectedActiveSkills.includes(String(skill.MagID))"
                  class="text-xs px-2 py-0.5 rounded bg-green-600 text-white"
                >
                  已选择
                </span>
              </div>
              <div class="text-xs text-gray-300 mt-1">
                MagID: {{ skill.MagID }} · 职业: {{ jobName(skill.Job) }} · 消耗MP: {{ skill.Spell }}(+{{ skill.DefSpell }}/级) · 冷却: {{ skill.Delay }}ms
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">技能等级</div>
              <div class="text-xl font-bold text-green-400">Lv{{ getSkillLevel(skill.MagID) }}</div>
            </div>
          </div>

          <div class="mt-3">
            <div class="text-xs text-gray-400 mb-1">
              伤害: {{ skill.Power }}~{{ skill.MaxPower }} (+每级 {{ skill.DefPower }}~{{ skill.DefMaxPower }})
            </div>
            <div class="text-xs text-gray-400 mb-1">
              升1级需求: 人物等级≥{{ skill.NeedL1 }}, 熟练度≥{{ skill.L1Train }}（最高{{ skill.MaxTrainLv }}级）
            </div>

            <!-- 熟练度进度 -->
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-300 mb-1">
                <span>熟练度：{{ proficiencyOf(skill.MagID) }}</span>
                <span>
                  <template v-if="nextTrainOf(skill) > 0">
                    下一等级需要：Lv≥{{ nextNeedLevelOf(skill) }} / 熟练度 {{ nextTrainOf(skill) }}
                  </template>
                  <template v-else>
                    已达上限
                  </template>
                </span>
              </div>
              <div class="w-full bg-gray-600 rounded-full h-2">
                <div
                  class="bg-yellow-400 h-2 rounded-full"
                  :style="{ width: profProgress(skill) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/stores/character.js'
import { useEquipmentStore } from '@/stores/equipment.js'
import { useSkillsStore } from '@/stores/skills.js'
import { useMapsStore } from '@/stores/maps.js'
import { storeToRefs } from 'pinia'

const characterStore = useCharacterStore()
const equipmentStore = useEquipmentStore()
const skillsStore = useSkillsStore()
const mapsStore = useMapsStore()

const { character, idleTime } = storeToRefs(characterStore)
const { totalStats } = storeToRefs(equipmentStore)
const { allSkills, selectedActiveSkills, skillProficiency, skillCooldownUntil } = storeToRefs(skillsStore)

const { getSkillLevel, canSelectSkill, toggleSelectSkill, getSkillById, getSkillMpCost } = skillsStore

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function jobName(job) {
  const j = parseInt(job)
  if (j === 0) return '战士'
  if (j === 1) return '法师'
  if (j === 2) return '道士'
  return '未知'
}

function proficiencyOf(magId) {
  return skillProficiency.value[String(magId)] || 0
}

function nextTrainOf(skill) {
  const maxLv = parseInt(skill.MaxTrainLv || '0') || 0
  const curLv = getSkillLevel(skill.MagID)
  const nextLv = curLv + 1
  if (nextLv > maxLv) return 0
  const needTrain = parseInt(skill[`L${nextLv}Train`] || '0') || 0
  return needTrain
}

function nextNeedLevelOf(skill) {
  const maxLv = parseInt(skill.MaxTrainLv || '0') || 0
  const curLv = getSkillLevel(skill.MagID)
  const nextLv = curLv + 1
  if (nextLv > maxLv) return 0
  return parseInt(skill[`NeedL${nextLv}`] || '0') || 0
}

function profProgress(skill) {
  const curLv = getSkillLevel(skill.MagID)
  const nextTrain = nextTrainOf(skill)
  if (nextTrain <= 0) return 100
  const prof = proficiencyOf(skill.MagID)
  const prevTrain = curLv > 0 ? (parseInt(skill[`L${curLv}Train`] || '0') || 0) : 0
  const span = Math.max(1, nextTrain - prevTrain)
  const val = Math.max(0, Math.min(span, prof - prevTrain))
  return Math.floor((val / span) * 100)
}

// 获取技能冷却进度百分比
function getSkillCooldownProgress(skillId) {
  const now = Date.now()
  const cooldownUntil = skillCooldownUntil.value
  if (now >= cooldownUntil) return 100 // 冷却完成
  
  const skill = getSkillById(skillId)
  if (!skill) return 100
  
  const delayMs = (parseInt(skill.Delay || '0') || 0) * 10
  if (delayMs <= 0) return 100
  
  const elapsed = now - (cooldownUntil - delayMs)
  const progress = Math.min(100, Math.max(0, (elapsed / delayMs) * 100))
  return Math.floor(progress)
}

// 获取技能冷却状态文本
function getSkillCooldownText(skillId) {
  const now = Date.now()
  const cooldownUntil = skillCooldownUntil.value
  if (now >= cooldownUntil) return '可以使用'
  
  const skill = getSkillById(skillId)
  if (!skill) return '可以使用'
  
  const delayMs = (parseInt(skill.Delay || '0') || 0) * 10
  if (delayMs <= 0) return '可以使用'
  
  const remaining = cooldownUntil - now
  const remainingSeconds = Math.ceil(remaining / 1000)
  return `冷却中 (${remainingSeconds}s)`
}
</script> 