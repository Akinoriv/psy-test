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
      // В реальном приложении здесь был бы API вызов
      const user = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
      }

      this.user = user
      this.isAuthenticated = true
      // Сохраняем в localStorage для MVP
      localStorage.setItem('psy-user', JSON.stringify(user))

      // Загружаем результаты после регистрации
      this.loadTestResults()

      return user
    },

    loadUser() {
      const savedUser = localStorage.getItem('psy-user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
        this.loadTestResults() // Загружаем результаты сразу
      }
    },

    // ИСПРАВЛЕНО: Сохранение результата теста
    saveTestResult(result) {
      console.log('Saving test result:', result)

      // Добавляем timestamp если его нет
      if (!result.timestamp) {
        result.timestamp = new Date().toISOString()
      }

      // Добавляем к результатам в store
      this.testResults.push(result)

      // Сохраняем результаты в localStorage
      const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')

      const resultToSave = {
        userId: this.user.id,
        ...result,
        timestamp: result.timestamp,
      }

      allResults.push(resultToSave)
      localStorage.setItem('psy-test-results', JSON.stringify(allResults))

      console.log('Test result saved to localStorage:', resultToSave)
      console.log('All results in localStorage:', allResults)
    },

    // ИСПРАВЛЕНО: Загрузка результатов
    async loadTestResults() {
      if (!this.user) {
        console.log('No user, cannot load test results')
        return
      }

      try {
        const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')
        console.log('Loading test results from localStorage:', allResults)

        this.testResults = allResults.filter((result) => result.userId === this.user.id)
        console.log('Filtered test results for user:', this.testResults)
      } catch (error) {
        console.error('Error loading test results:', error)
        this.testResults = []
      }
    },

    // Получение последнего результата для конкретного теста
    getLastTestResult(testId) {
      const results = this.testResults.filter((r) => r.testId === testId)
      if (results.length === 0) return null

      return results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]
    },

    // Очистка всех данных
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.testResults = []
      localStorage.removeItem('psy-user')
      // Не удаляем результаты тестов - они могут понадобиться
    },
  },
})
