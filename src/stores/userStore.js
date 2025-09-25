// stores/userStore.js - Все в одном месте
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    testResults: [],
    isLoading: false,
  }),

  getters: {
    getUserId: (state) => state.user?.id,
    getUserName: (state) => state.user?.name,
    getTestResults: (state) => state.testResults,
    
    // Получение результатов по testId
    getTestResultsByTestId: (state) => (testId) => {
      return state.testResults
        .filter(result => result.testId === testId)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    },
    
    // Последний результат для конкретного теста
    getLatestTestResult: (state) => (testId) => {
      const results = state.testResults
        .filter(result => result.testId === testId)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      
      return results.length > 0 ? results[0] : null
    },

    // Статистика пользователя
    getUserStats: (state) => {
      if (state.testResults.length === 0) {
        return {
          totalTests: 0,
          averageScore: 0,
          lastTestDate: null,
          testsThisMonth: 0,
        }
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const testsThisMonth = state.testResults.filter(
        r => new Date(r.completedAt) >= thisMonth
      ).length

      const totalScore = state.testResults.reduce((sum, r) => sum + (r.score || 0), 0)
      const averageScore = Math.round(totalScore / state.testResults.length)

      const lastTest = [...state.testResults]
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]

      return {
        totalTests: state.testResults.length,
        averageScore,
        lastTestDate: lastTest.completedAt,
        testsThisMonth,
      }
    }
  },

  actions: {
    // =================== ПОЛЬЗОВАТЕЛЬ ===================
    
    async registerUser(userData) {
      console.log('👤 Registering user:', userData.name)

      const user = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      }

      this.user = user
      this.isAuthenticated = true

      // Сохраняем пользователя
      await this._saveUser(user)
      
      // Загружаем результаты
      await this.loadTestResults()

      console.log('✅ User registered:', user.name)
      return user
    },

    async loadUser() {
      console.log('👤 Loading user...')
      
      try {
        const userData = await this._loadUser()
        
        if (userData) {
          this.user = userData
          this.isAuthenticated = true
          await this.loadTestResults()
          console.log('✅ User loaded:', userData.name)
        }
      } catch (error) {
        console.error('❌ Failed to load user:', error)
      }
    },

    async updateProfile(updates) {
      if (!this.user) return false

      console.log('👤 Updating profile...')

      this.user = {
        ...this.user,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await this._saveUser(this.user)
      console.log('✅ Profile updated')
      
      return true
    },

    logout() {
      console.log('👤 Logging out...')
      
      this.user = null
      this.isAuthenticated = false
      this.testResults = []

      // Удаляем из localStorage
      localStorage.removeItem('psy-user')
      
      console.log('✅ Logged out')
    },

    // =================== РЕЗУЛЬТАТЫ ТЕСТОВ ===================
    
    async saveTestResult(result) {
      console.log('💾 Saving test result:', result.testId, 'Score:', result.score)

      try {
        // Добавляем метаданные
        const enrichedResult = {
          ...result,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          userId: this.user?.id,
          completedAt: result.completedAt || new Date().toISOString(),
          savedAt: new Date().toISOString(),
        }

        // Добавляем к локальному состоянию
        this.testResults.push(enrichedResult)

        // Сохраняем в storage
        await this._saveTestResults()

        // Будущее: отправка на сервер
        await this._syncToServer(enrichedResult)

        console.log('✅ Test result saved')
      } catch (error) {
        console.error('❌ Failed to save test result:', error)
        throw error
      }
    },

    async loadTestResults() {
      if (!this.user?.id) {
        console.log('👤 No user, skipping test results load')
        return
      }

      console.log('📖 Loading test results...')

      try {
        const results = await this._loadTestResults()
        this.testResults = results
        console.log(`✅ Loaded ${results.length} test results`)
      } catch (error) {
        console.error('❌ Failed to load test results:', error)
        this.testResults = []
      }
    },

    async deleteTestResult(resultId) {
      console.log('🗑️ Deleting test result:', resultId)
      
      this.testResults = this.testResults.filter(r => r.id !== resultId)
      await this._saveTestResults()
      
      console.log('✅ Test result deleted')
    },

    async clearAllResults() {
      console.log('🗑️ Clearing all test results')
      
      this.testResults = []
      await this._saveTestResults()
      
      console.log('✅ All results cleared')
    },

    // =================== ПРИВАТНЫЕ МЕТОДЫ STORAGE ===================
    
    async _saveUser(user) {
      try {
        localStorage.setItem('psy-user', JSON.stringify(user))
        console.log('💾 User saved to localStorage')
      } catch (error) {
        console.error('❌ Failed to save user to localStorage:', error)
        throw error
      }
    },

    async _loadUser() {
      try {
        const userData = localStorage.getItem('psy-user')
        return userData ? JSON.parse(userData) : null
      } catch (error) {
        console.error('❌ Failed to load user from localStorage:', error)
        return null
      }
    },

    async _saveTestResults() {
      try {
        // Сохраняем все результаты всех пользователей
        let allResults = []
        
        try {
          const stored = localStorage.getItem('psy-test-results')
          if (stored) {
            const parsed = JSON.parse(stored)
            allResults = Array.isArray(parsed) ? parsed : []
          }
        } catch (error) {
          console.warn('Failed to parse existing results, starting fresh')
          allResults = []
        }

        // Удаляем старые результаты текущего пользователя
        allResults = allResults.filter(result => result.userId !== this.user?.id)

        // Добавляем новые результаты
        allResults.push(...this.testResults)

        localStorage.setItem('psy-test-results', JSON.stringify(allResults))
        console.log('💾 Test results saved to localStorage')
      } catch (error) {
        console.error('❌ Failed to save test results:', error)
        throw error
      }
    },

    async _loadTestResults() {
      try {
        const stored = localStorage.getItem('psy-test-results')
        if (!stored) return []

        const allResults = JSON.parse(stored)
        if (!Array.isArray(allResults)) return []

        // Фильтруем результаты текущего пользователя
        return allResults
          .filter(result => result.userId === this.user?.id)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      } catch (error) {
        console.error('❌ Failed to load test results:', error)
        return []
      }
    },

    // Заготовка для синхронизации с сервером
    async _syncToServer(result) {
      // TODO: Реализовать когда будет готов API
      try {
        // const response = await fetch('/api/test-results', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(result)
        // })
        // 
        // if (!response.ok) {
        //   throw new Error('Server sync failed')
        // }
        
        console.log('🌐 Server sync ready (not implemented yet)')
      } catch (error) {
        console.warn('⚠️ Server sync failed, data saved locally only:', error.message)
      }
    },

    // Загрузка с сервера (для будущего)
    async _loadFromServer() {
      // TODO: Реализовать когда будет готов API
      try {
        // const response = await fetch(`/api/test-results?userId=${this.user.id}`)
        // const serverResults = await response.json()
        // 
        // return serverResults
        
        console.log('🌐 Server load ready (not implemented yet)')
        return []
      } catch (error) {
        console.warn('⚠️ Server load failed, using local data only:', error.message)
        return []
      }
    }
  }
})