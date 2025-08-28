// src/core/storage/StorageManager.js
class StorageManager {
  constructor() {
    this.version = '1.0.0'
    this.adapters = {
      local: new LocalStorageAdapter(),
      // indexed: new IndexedDBAdapter(), // для будущего использования
      // api: new APIAdapter() // для работы с сервером
    }
    this.currentAdapter = this.adapters.local
  }
  
  // Установка адаптера хранения
  setAdapter(adapterType) {
    if (this.adapters[adapterType]) {
      this.currentAdapter = this.adapters[adapterType]
      console.log(`📦 Storage adapter changed to: ${adapterType}`)
    } else {
      console.warn(`Unknown storage adapter: ${adapterType}`)
    }
  }
  
  // Сохранение результата теста
  async saveTestResult(userId, result) {
    const resultWithMetadata = {
      ...result,
      userId,
      version: this.version,
      savedAt: new Date().toISOString(),
      id: this.generateId()
    }
    
    console.log('💾 Saving test result:', resultWithMetadata.testId, 'Score:', resultWithMetadata.score)
    return await this.currentAdapter.save('test-results', resultWithMetadata)
  }
  
  // Загрузка результатов
  async loadTestResults(userId, testId = null) {
    const allResults = await this.currentAdapter.load('test-results') || []
    
    let userResults = allResults.filter(r => r.userId === userId)
    
    if (testId) {
      userResults = userResults.filter(r => r.testId === testId)
    }
    
    console.log(`📖 Loaded ${userResults.length} test results for user ${userId}`)
    return userResults.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }
  
  // Сохранение прогресса теста
  async saveProgress(userId, testId, progress) {
    const key = `progress-${userId}-${testId}`
    const progressWithMetadata = {
      ...progress,
      userId,
      testId,
      savedAt: new Date().toISOString()
    }
    
    console.log('💾 Saving progress:', testId, 'Question:', progress.currentQuestionIndex)
    return await this.currentAdapter.save(key, progressWithMetadata)
  }
  
  // Загрузка прогресса
  async loadProgress(userId, testId) {
    const key = `progress-${userId}-${testId}`
    const progress = await this.currentAdapter.load(key)
    
    if (progress) {
      console.log('📖 Loaded progress:', testId, 'Question:', progress.currentQuestionIndex)
    }
    
    return progress
  }
  
  // Очистка старого прогресса
  async clearProgress(userId, testId) {
    const key = `progress-${userId}-${testId}`
    console.log('🗑️ Clearing progress:', testId)
    return await this.currentAdapter.remove(key)
  }
  
  // Сохранение данных пользователя
  async saveUser(user) {
    console.log('💾 Saving user:', user.name)
    return await this.currentAdapter.save('user', user)
  }
  
  // Загрузка данных пользователя
  async loadUser() {
    const user = await this.currentAdapter.load('user')
    if (user) {
      console.log('📖 Loaded user:', user.name)
    }
    return user
  }
  
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Адаптер для localStorage (улучшенная версия)
class LocalStorageAdapter {
  async save(key, data) {
    try {
      const storageKey = `psy-${key}`
      
      if (key === 'test-results') {
        // Для результатов тестов - добавляем к существующему массиву
        const existing = this.load(key) || []
        const updated = [...existing, data]
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } else {
        // Для остальных данных - перезаписываем
        localStorage.setItem(storageKey, JSON.stringify(data))
      }
      
      return true
    } catch (error) {
      console.error('LocalStorage save error:', error)
      return false
    }
  }
  
  async load(key) {
    try {
      const storageKey = `psy-${key}`
      const item = localStorage.getItem(storageKey)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('LocalStorage load error:', error)
      return null
    }
  }
  
  async remove(key) {
    try {
      const storageKey = `psy-${key}`
      localStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error('LocalStorage remove error:', error)
      return false
    }
  }
  
  async clear() {
    try {
      // Очищаем только наши ключи
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('psy-')) {
          keys.push(key)
        }
      }
      
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('LocalStorage clear error:', error)
      return false
    }
  }
}

// Заглушки для будущих адаптеров
class IndexedDBAdapter extends LocalStorageAdapter {
  // TODO: Реализация IndexedDB для больших объемов данных
  constructor() {
    super()
    console.log('📊 IndexedDB adapter initialized (fallback to localStorage)')
  }
}

class APIAdapter extends LocalStorageAdapter {
  // TODO: Реализация для работы с сервером
  constructor() {
    super()
    console.log('🌐 API adapter initialized (fallback to localStorage)')
  }
}

export default StorageManager