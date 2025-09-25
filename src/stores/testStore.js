// stores/testStore.js - Реестр тестов в store
import { defineStore } from 'pinia'

export const useTestStore = defineStore('tests', {
  state: () => ({
    availableTests: [],
    loadedTests: new Map(), // Кеш загруженных тестов
    isLoading: false,
  }),

  getters: {
    getAllTests: (state) => state.availableTests,
    
    getTestById: (state) => (testId) => {
      return state.availableTests.find(test => test.id === testId) || null
    },

    getTestsByCategory: (state) => (category) => {
      return state.availableTests.filter(test => test.category === category)
    },

    isTestLoaded: (state) => (testId) => {
      return state.loadedTests.has(testId)
    },

    getLoadedTest: (state) => (testId) => {
      return state.loadedTests.get(testId) || null
    }
  },

  actions: {
    // =================== ИНИЦИАЛИЗАЦИЯ ===================
    
    async initializeTests() {
      console.log('🧪 Initializing test registry...')
      
      try {
        this.isLoading = true
        
        // Регистрируем все доступные тесты
        await this._registerAllTests()
        
        console.log(`✅ Initialized ${this.availableTests.length} tests`)
      } catch (error) {
        console.error('❌ Failed to initialize tests:', error)
      } finally {
        this.isLoading = false
      }
    },

    // =================== ЗАГРУЗКА ТЕСТОВ ===================
    
    async loadTest(testId) {
      console.log('📖 Loading test:', testId)

      // Проверяем кеш
      if (this.loadedTests.has(testId)) {
        console.log('✨ Test loaded from cache:', testId)
        return this.loadedTests.get(testId)
      }

      try {
        let testModule = null

        // Динамическая загрузка тестов
        switch (testId) {
          case 'husband-readiness':
            testModule = await import('../tests/husband-readiness/index.js')
            break
            
          case 'stress-burnout':
            testModule = await import('../tests/stress-burnout/index.js')
            break
            
          default:
            throw new Error(`Unknown test: ${testId}`)
        }

        // Кешируем загруженный тест
        const loadedTest = testModule.default
        this.loadedTests.set(testId, loadedTest)

        console.log('✅ Test loaded:', testId, loadedTest.config.title)
        return loadedTest
      } catch (error) {
        console.error('❌ Failed to load test:', testId, error)
        throw error
      }
    },

    // =================== ПРИВАТНЫЕ МЕТОДЫ ===================
    
    async _registerAllTests() {
      // Статический реестр тестов (в будущем можно загружать с сервера)
      this.availableTests = [
        {
          id: 'husband-readiness',
          title: 'Готовность к серьезным отношениям',
          description: 'Определите, готовы ли вы к серьезным отношениям и созданию семьи',
          category: 'relationships',
          duration: 5,
          difficulty: 'easy',
          tags: ['отношения', 'любовь', 'семья'],
          icon: '💕',
          color: '#10b981',
          isAvailable: true,
          createdAt: '2024-01-01',
        },
        {
          id: 'stress-burnout',
          title: 'Уровень стресса и выгорания',
          description: 'Оцените ваш текущий уровень стресса и риск профессионального выгорания',
          category: 'wellbeing',
          duration: 8,
          difficulty: 'medium',
          tags: ['стресс', 'работа', 'здоровье'],
          icon: '🧘',
          color: '#6366f1',
          isAvailable: true,
          createdAt: '2024-01-01',
        },
        // Заготовки для будущих тестов
        {
          id: 'personality-type',
          title: 'Тип личности',
          description: 'Определите ваш психологический тип личности',
          category: 'personality',
          duration: 12,
          difficulty: 'medium',
          tags: ['личность', 'характер', 'психотип'],
          icon: '🎭',
          color: '#f59e0b',
          isAvailable: false, // Пока не готов
          createdAt: '2024-02-01',
        },
        {
          id: 'anxiety-level',
          title: 'Уровень тревожности',
          description: 'Измерьте ваш уровень тревожности и получите рекомендации',
          category: 'wellbeing',
          duration: 10,
          difficulty: 'easy',
          tags: ['тревожность', 'психология', 'здоровье'],
          icon: '😰',
          color: '#ef4444',
          isAvailable: false, // Пока не готов
          createdAt: '2024-02-15',
        }
      ]

      console.log('📋 Registered tests:', this.availableTests.map(t => t.id))
    },

    // Добавление нового теста (для админки в будущем)
    async addTest(testConfig) {
      console.log('➕ Adding new test:', testConfig.id)
      
      this.availableTests.push({
        ...testConfig,
        createdAt: new Date().toISOString(),
      })
      
      console.log('✅ Test added to registry')
    },

    // Обновление статуса теста
    async updateTestStatus(testId, isAvailable) {
      const test = this.availableTests.find(t => t.id === testId)
      
      if (test) {
        test.isAvailable = isAvailable
        console.log(`✅ Test ${testId} status updated:`, isAvailable)
      }
    },

    // Получение статистики тестов
    getTestsStats() {
      const totalTests = this.availableTests.length
      const availableTests = this.availableTests.filter(t => t.isAvailable).length
      const categories = [...new Set(this.availableTests.map(t => t.category))]
      
      return {
        totalTests,
        availableTests,
        inDevelopment: totalTests - availableTests,
        categories: categories.length,
        categoriesList: categories
      }
    },

    // Поиск тестов
    searchTests(query) {
      const searchQuery = query.toLowerCase().trim()
      
      return this.availableTests.filter(test => {
        return test.title.toLowerCase().includes(searchQuery) ||
               test.description.toLowerCase().includes(searchQuery) ||
               test.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      })
    },

    // Очистка кеша (для разработки)
    clearCache() {
      this.loadedTests.clear()
      console.log('🗑️ Test cache cleared')
    }
  }
})