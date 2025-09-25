import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    testResults: [],
  }),

  getters: {
    getUserId: (state) => state.user?.id,
    getUserName: (state) => state.user?.name,
    getTestResults: (state) => state.testResults,
  },

  actions: {
    async registerUser(userData) {
      console.log('👤 Registering new user:', userData.name)

      const user = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
      }

      this.user = user
      this.isAuthenticated = true

      // Сохраняем только в localStorage (убираем StorageManager конфликт)
      localStorage.setItem('psy-user', JSON.stringify(user))

      await this.loadTestResults()

      console.log('✅ User registered successfully')
      return user
    },

    async loadUser() {
      console.log('👤 Loading user data...')

      const savedUser = localStorage.getItem('psy-user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
        await this.loadTestResults()
        console.log('✅ User loaded:', this.user.name)
      } else {
        console.log('📝 No saved user found')
      }
    },

    // ИСПРАВЛЕНО: Простое сохранение без StorageManager
    async saveTestResult(result) {
      console.log('💾 Saving test result:', result.testId, 'Score:', result.score)

      if (!result.timestamp && !result.completedAt) {
        result.completedAt = new Date().toISOString()
      }

      // Добавляем к результатам в store
      this.testResults.push(result)

      // Сохраняем в localStorage
      try {
        let allResults = []
        
        try {
          const stored = localStorage.getItem('psy-test-results')
          if (stored) {
            const parsed = JSON.parse(stored)
            allResults = Array.isArray(parsed) ? parsed : []
          }
        } catch (error) {
          console.warn('Failed to parse existing results, starting fresh:', error)
          allResults = []
        }

        const resultToSave = {
          userId: this.user.id,
          ...result,
          savedAt: new Date().toISOString(),
        }

        allResults.push(resultToSave)
        localStorage.setItem('psy-test-results', JSON.stringify(allResults))

        console.log('✅ Test result saved successfully')
      } catch (error) {
        console.error('❌ Failed to save test result:', error)
        throw error
      }
    },

    // ИСПРАВЛЕНО: Простая загрузка без StorageManager
    async loadTestResults() {
      if (!this.user) {
        console.log('👤 No user, cannot load test results')
        return
      }

      console.log('📖 Loading test results...')

      try {
        let allResults = []
        
        try {
          const stored = localStorage.getItem('psy-test-results')
          if (stored) {
            const parsed = JSON.parse(stored)
            allResults = Array.isArray(parsed) ? parsed : []
          }
        } catch (error) {
          console.warn('Failed to parse test results, starting fresh:', error)
          allResults = []
        }

        this.testResults = allResults
          .filter((result) => result.userId === this.user.id)
          .sort((a, b) => new Date(b.completedAt || b.savedAt) - new Date(a.completedAt || a.savedAt))

        console.log(`✅ Loaded ${this.testResults.length} test results`)
      } catch (error) {
        console.error('❌ Error loading test results:', error)
        this.testResults = []
      }
    },

    // Получение последнего результата для конкретного теста  
    getLastTestResult(testId) {
      const results = this.testResults.filter((r) => r.testId === testId)
      if (results.length === 0) return null

      return results.sort((a, b) => new Date(b.completedAt || b.savedAt) - new Date(a.completedAt || a.savedAt))[0]
    },

    // НОВЫЙ МЕТОД: Получение результата по testId для страницы результатов
    getLatestTestResult(testId) {
      console.log('🔍 Getting latest result for:', testId)
      console.log('Available results:', this.testResults.map(r => ({ testId: r.testId, score: r.score })))
      
      const result = this.getLastTestResult(testId)
      
      if (result) {
        console.log('✅ Found result:', { testId: result.testId, score: result.score })
      } else {
        console.log('❌ No result found for:', testId)
      }
      
      return result
    },

    getUserStats() {
      if (this.testResults.length === 0) {
        return {
          totalTests: 0,
          averageScore: 0,
          lastTestDate: null,
          testsThisMonth: 0,
        }
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const testsThisMonth = this.testResults.filter(
        (r) => new Date(r.completedAt || r.savedAt) >= thisMonth,
      ).length

      const totalScore = this.testResults.reduce((sum, r) => sum + (r.score || 0), 0)
      const averageScore = Math.round(totalScore / this.testResults.length)

      const lastTest = this.testResults.sort(
        (a, b) => new Date(b.completedAt || b.savedAt) - new Date(a.completedAt || a.savedAt),
      )[0]

      return {
        totalTests: this.testResults.length,
        averageScore,
        lastTestDate: lastTest.completedAt || lastTest.savedAt,
        testsThisMonth,
      }
    },

    async logout() {
      console.log('👤 Logging out user')

      this.user = null
      this.isAuthenticated = false
      this.testResults = []

      localStorage.removeItem('psy-user')

      console.log('✅ User logged out')
    },

    async updateProfile(updates) {
      if (!this.user) return false

      console.log('👤 Updating user profile...')

      this.user = {
        ...this.user,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem('psy-user', JSON.stringify(this.user))
      console.log('✅ Profile updated')

      return true
    },
  },
})