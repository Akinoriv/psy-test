import { defineStore } from 'pinia'
import TestRegistry from '../core/test-engine/TestRegistry.js'

export const useTestStore = defineStore('test', {
  state: () => ({
    availableTests: [
      {
        id: 'stress-burnout',
        title: 'Тест на стресс и выгорание',
        description: 'Оцените ваш уровень стресса и профессионального выгорания',
        duration: '10-15 минут',
        questionsCount: 'до 20 вопросов',
        category: 'Стресс и эмоциональное состояние',
      },
      // Новые тесты будут добавляться автоматически через TestRegistry
    ],
    currentTest: null,
    currentAnswers: {},
    currentQuestionIndex: 0,
    testProgress: 0,
  }),

  getters: {
    getCurrentTest: (state) => state.currentTest,
    getCurrentProgress: (state) => state.testProgress,
    getCurrentAnswers: (state) => state.currentAnswers,
    getAvailableTests: (state) => state.availableTests,
  },

  actions: {
    // НОВАЯ ФУНКЦИЯ: Загрузка доступных тестов из TestRegistry
    async loadAvailableTests() {
      console.log('📚 Loading available tests...')

      try {
        // Загружаем тесты через TestRegistry
        const registeredTests = await TestRegistry.discoverTests()

        // Обновляем список доступных тестов
        this.availableTests = registeredTests.map((testModule) => ({
          id: testModule.config.id,
          title: testModule.config.title,
          description: testModule.config.description,
          duration: testModule.config.estimatedTime || 'неизвестно',
          questionsCount: this.estimateQuestionCount(testModule.config),
          category: testModule.config.category || 'Общие',
        }))

        console.log(`✅ Loaded ${this.availableTests.length} tests`)
      } catch (error) {
        console.error('❌ Failed to load tests from registry:', error)
        console.log('📝 Using static test list')
        // Оставляем статический список из state
      }
    },

    // Приблизительный подсчет количества вопросов
    estimateQuestionCount(config) {
      let count = config.initialQuestions?.length || 0

      if (config.questionFlows) {
        // Берем среднее количество вопросов из всех потоков
        const flowCounts = Object.values(config.questionFlows).map((flow) => flow.length)

        if (flowCounts.length > 0) {
          const avgFlow = flowCounts.reduce((a, b) => a + b, 0) / flowCounts.length
          count += Math.round(avgFlow)
        }
      }

      return count > 0 ? `до ${count} вопросов` : 'переменное количество'
    },

    startTest(testId) {
      console.log('🚀 Starting test:', testId)

      this.currentTest = this.getTestById(testId)
      this.currentAnswers = {}
      this.currentQuestionIndex = 0
      this.testProgress = 0

      console.log('✅ Test started:', this.currentTest?.title)
    },

    getTestById(testId) {
      return this.availableTests.find((test) => test.id === testId)
    },

    saveAnswer(questionId, answer) {
      this.currentAnswers[questionId] = answer
      this.updateProgress()

      console.log('💾 Answer saved for question:', questionId)
    },

    updateProgress() {
      if (!this.currentTest) return

      const totalQuestions = this.getTotalQuestions()
      const answeredQuestions = Object.keys(this.currentAnswers).length
      this.testProgress = Math.round((answeredQuestions / totalQuestions) * 100)

      console.log(`📊 Progress updated: ${this.testProgress}%`)
    },

    getTotalQuestions() {
      // Для реактивных тестов это будет более сложная логика
      return this.currentTest?.questionsCount || 20
    },

    resetTest() {
      console.log('🔄 Resetting test state')

      this.currentTest = null
      this.currentAnswers = {}
      this.currentQuestionIndex = 0
      this.testProgress = 0
    },

    // НОВАЯ ФУНКЦИЯ: Получение статистики по тестам
    getTestStats() {
      return {
        totalTests: this.availableTests.length,
        categories: [...new Set(this.availableTests.map((t) => t.category))],
        mostPopular: this.availableTests[0]?.id || null, // Пока просто первый
      }
    },

    // НОВАЯ ФУНКЦИЯ: Поиск тестов по категории
    getTestsByCategory(category) {
      return this.availableTests.filter((test) => test.category === category)
    },

    // НОВАЯ ФУНКЦИЯ: Поиск тестов
    searchTests(query) {
      const lowerQuery = query.toLowerCase()
      return this.availableTests.filter(
        (test) =>
          test.title.toLowerCase().includes(lowerQuery) ||
          test.description.toLowerCase().includes(lowerQuery) ||
          test.category.toLowerCase().includes(lowerQuery),
      )
    },
  },
})
