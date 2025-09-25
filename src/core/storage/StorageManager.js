// src/core/storage/StorageManager.js - ИСПРАВЛЕНО!

class StorageManager {
  constructor() {
    this.version = '1.0.0'
    this.adapters = {
      local: new LocalStorageAdapter(),
    }
    this.currentAdapter = this.adapters.local
  }
  
  setAdapter(adapterType) {
    if (this.adapters[adapterType]) {
      this.currentAdapter = this.adapters[adapterType]
      console.log(`📦 Storage adapter changed to: ${adapterType}`)
    } else {
      console.warn(`Unknown storage adapter: ${adapterType}`)
    }
  }
  
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
  
  async loadTestResults(userId, testId = null) {
    const allResults = await this.currentAdapter.load('test-results') || []
    
    let userResults = allResults.filter(r => r.userId === userId)
    
    if (testId) {
      userResults = userResults.filter(r => r.testId === testId)
    }
    
    console.log(`📖 Loaded ${userResults.length} test results for user ${userId}`)
    return userResults.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }
  
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
  
  async loadProgress(userId, testId) {
    const key = `progress-${userId}-${testId}`
    const progress = await this.currentAdapter.load(key)
    
    if (progress) {
      console.log('📖 Loaded progress:', testId, 'Question:', progress.currentQuestionIndex)
    }
    
    return progress
  }
  
  async clearProgress(userId, testId) {
    const key = `progress-${userId}-${testId}`
    console.log('🗑️ Clearing progress:', testId)
    return await this.currentAdapter.remove(key)
  }
  
  async saveUser(user) {
    console.log('💾 Saving user:', user.name)
    return await this.currentAdapter.save('user', user)
  }
  
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

// ИСПРАВЛЕННЫЙ LocalStorageAdapter
class LocalStorageAdapter {
  async save(key, data) {
    try {
      const storageKey = `psy-${key}`
      
      if (key === 'test-results') {
        // ИСПРАВЛЕНО: Безопасная загрузка массива
        let existing = []
        try {
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            existing = Array.isArray(parsed) ? parsed : []
          }
        } catch (error) {
          console.warn('Failed to parse existing results, starting fresh:', error)
          existing = []
        }
        
        existing.push(data)
        localStorage.setItem(storageKey, JSON.stringify(existing))
      } else {
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
      
      if (!item) {
        // ИСПРАВЛЕНО: Для test-results возвращаем пустой массив
        return key === 'test-results' ? [] : null
      }
      
      const parsed = JSON.parse(item)
      
      // ИСПРАВЛЕНО: Проверяем что test-results это массив
      if (key === 'test-results' && !Array.isArray(parsed)) {
        console.warn('test-results is not an array, resetting...')
        return []
      }
      
      return parsed
    } catch (error) {
      console.error('LocalStorage load error:', error)
      // ИСПРАВЛЕНО: Возвращаем пустой массив для test-results при ошибке
      return key === 'test-results' ? [] : null
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

export default StorageManager