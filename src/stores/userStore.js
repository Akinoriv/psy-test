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

      return user
    },

    loadUser() {
      const savedUser = localStorage.getItem('psy-user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
      }
    },

    saveTestResult(result) {
      this.testResults.push(result)

      // Сохраняем результаты в localStorage
      const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')
      allResults.push({
        userId: this.user.id,
        ...result,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('psy-test-results', JSON.stringify(allResults))
    },

    loadTestResults() {
      if (!this.user) return

      const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')
      this.testResults = allResults.filter((result) => result.userId === this.user.id)
    },
  },
})
