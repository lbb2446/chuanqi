import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  // 当前布局模式
  const currentLayout = ref('desktop') // 'mobile' | 'desktop'
  
  // 布局配置
  const layoutConfig = {
    mobile: {
      name: 'mobile',
      width: 375,
      height: 667,
      maxWidth: '375px',
      gridCols: 1,
      padding: 'p-4',
      textSizes: {
        h1: 'text-2xl',
        h2: 'text-xl',
        h3: 'text-lg',
        h4: 'text-sm',
        body: 'text-sm',
        small: 'text-xs'
      },
      spacing: 'space-y-4',
      buttonSizes: {
        large: 'px-6 py-3 text-lg',
        medium: 'px-4 py-2 text-base',
        small: 'px-3 py-1 text-sm'
      }
    },
    desktop: {
      name: 'desktop',
      width: 1920,
      height: 1080,
      maxWidth: '1920px',
      gridCols: 2,
      padding: 'p-6',
      textSizes: {
        h1: 'text-3xl',
        h2: 'text-2xl',
        h3: 'text-xl',
        h4: 'text-base',
        body: 'text-base',
        small: 'text-sm'
      },
      spacing: 'space-y-6',
      buttonSizes: {
        large: 'px-8 py-4 text-xl',
        medium: 'px-6 py-3 text-lg',
        small: 'px-4 py-2 text-base'
      }
    }
  }
  
  // 设置布局
  function setLayout(layout) {
    if (layoutConfig[layout]) {
      currentLayout.value = layout
      // 保存到本地存储
      localStorage.setItem('gameLayout', layout)
    }
  }
  
  // 获取当前布局配置
  function getCurrentLayoutConfig() {
    return layoutConfig[currentLayout.value]
  }
  
  // 获取文本尺寸
  function getTextSize(type) {
    return layoutConfig[currentLayout.value].textSizes[type] || 'text-base'
  }
  
  // 获取按钮尺寸
  function getButtonSize(size) {
    return layoutConfig[currentLayout.value].buttonSizes[size] || 'px-4 py-2 text-base'
  }
  
  // 获取网格列数
  function getGridCols() {
    return layoutConfig[currentLayout.value].gridCols
  }
  
  // 获取间距
  function getSpacing() {
    return layoutConfig[currentLayout.value].spacing
  }
  
  // 获取内边距
  function getPadding() {
    return layoutConfig[currentLayout.value].padding
  }
  
  // 初始化布局（从本地存储恢复）
  function initLayout() {
    const savedLayout = localStorage.getItem('gameLayout')
    if (savedLayout && layoutConfig[savedLayout]) {
      currentLayout.value = savedLayout
    }
  }
  
  return {
    currentLayout,
    layoutConfig,
    setLayout,
    getCurrentLayoutConfig,
    getTextSize,
    getButtonSize,
    getGridCols,
    getSpacing,
    getPadding,
    initLayout
  }
}) 