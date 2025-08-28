import { defineStore } from 'pinia'
import StorageManager from '../core/storage/StorageManager'
import TestRegistry from '../core/test-engine/TestRegistry'

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

      // В реальном приложении здесь был бы API вызов
      const user = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
      }

      this.user = user
      this.isAuthenticated = true

      // Сохраняем через новую систему
      const storageManager = new StorageManager()
      await storageManager.saveUser(user)

      // Также сохраняем в старый формат для совместимости
      localStorage.setItem('psy-user', JSON.stringify(user))

      // Загружаем результаты после регистрации
      await this.loadTestResults()

      console.log('✅ User registered successfully')
      return user
    },

    async loadUser() {
      console.log('👤 Loading user data...')

      // Пробуем новую систему
      try {
        const storageManager = new StorageManager()
        const user = await storageManager.loadUser()

        if (user) {
          this.user = user
          this.isAuthenticated = true
          await this.loadTestResults()
          console.log('✅ User loaded from new system:', user.name)
          return
        }
      } catch (error) {
        console.warn('⚠️ New storage system failed, trying legacy...')
      }

      // Fallback на старую систему
      const savedUser = localStorage.getItem('psy-user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
        await this.loadTestResults()
        console.log('✅ User loaded from legacy system:', this.user.name)
      } else {
        console.log('📝 No saved user found')
      }
    },

    // НОВАЯ СИСТЕМА: Сохранение результата теста
    async saveTestResult(result) {
      console.log('💾 Saving test result:', result.testId, 'Score:', result.score)

      // Добавляем timestamp если его нет
      if (!result.timestamp) {
        result.timestamp = new Date().toISOString()
      }

      // Добавляем к результатам в store
      this.testResults.push(result)

      // Сохраняем через новую систему
      try {
        const storageManager = new StorageManager()
        await storageManager.saveTestResult(this.user.id, result)

        console.log('✅ Test result saved via new storage system')
      } catch (error) {
        console.error('❌ New storage failed, using legacy:', error)

        // Fallback на старую систему
        const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')

        const resultToSave = {
          userId: this.user.id,
          ...result,
          timestamp: result.timestamp,
        }

        allResults.push(resultToSave)
        localStorage.setItem('psy-test-results', JSON.stringify(allResults))

        console.log('✅ Test result saved via legacy system')
      }
    },

    // НОВАЯ СИСТЕМА: Загрузка результатов
    async loadTestResults() {
      if (!this.user) {
        console.log('👤 No user, cannot load test results')
        return
      }

      console.log('📖 Loading test results...')

      try {
        // Пробуем новую систему
        const storageManager = new StorageManager()
        const results = await storageManager.loadTestResults(this.user.id)

        if (results && results.length > 0) {
          this.testResults = results
          console.log(`✅ Loaded ${results.length} results from new storage system`)
          return
        }
      } catch (error) {
        console.warn('⚠️ New storage system failed, trying legacy...')
      }

      // Fallback на старую систему
      try {
        const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')
        this.testResults = allResults.filter((result) => result.userId === this.user.id)
        console.log(`✅ Loaded ${this.testResults.length} results from legacy system`)
      } catch (error) {
        console.error('❌ Error loading test results:', error)
        this.testResults = []
      }
    },

    // Получение последнего результата для конкретного теста
    getLastTestResult(testId) {
      const results = this.testResults.filter((r) => r.testId === testId)
      if (results.length === 0) return null

      return results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]
    },

    // НОВАЯ ФУНКЦИЯ: Получение статистики пользователя
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
        (r) => new Date(r.completedAt) >= thisMonth,
      ).length

      const totalScore = this.testResults.reduce((sum, r) => sum + (r.score || 0), 0)
      const averageScore = Math.round(totalScore / this.testResults.length)

      const lastTest = this.testResults.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
      )[0]

      return {
        totalTests: this.testResults.length,
        averageScore,
        lastTestDate: lastTest.completedAt,
        testsThisMonth,
      }
    },

    // Очистка всех данных
    async logout() {
      console.log('👤 Logging out user')

      this.user = null
      this.isAuthenticated = false
      this.testResults = []

      // Очищаем новую систему
      try {
        const storageManager = new StorageManager()
        // Не удаляем результаты тестов - они могут понадобиться
        // Только очищаем данные сессии
      } catch (error) {
        console.warn('⚠️ Could not clear new storage system:', error)
      }

      // Очищаем старую систему
      localStorage.removeItem('psy-user')
      // Не удаляем результаты тестов - они могут понадобиться

      console.log('✅ User logged out')
    },

    // НОВАЯ ФУНКЦИЯ: Обновление профиля пользователя
    async updateProfile(updates) {
      if (!this.user) return false

      console.log('👤 Updating user profile...')

      this.user = {
        ...this.user,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      // Сохраняем через новую систему
      try {
        const storageManager = new StorageManager()
        await storageManager.saveUser(this.user)
        console.log('✅ Profile updated via new storage system')
      } catch (error) {
        console.error('❌ New storage failed, using legacy:', error)
        localStorage.setItem('psy-user', JSON.stringify(this.user))
        console.log('✅ Profile updated via legacy system')
      }

      return true
    },
  },
})
