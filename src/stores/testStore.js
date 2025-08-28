import { defineStore } from 'pinia'

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
    startTest(testId) {
      this.currentTest = this.getTestById(testId)
      this.currentAnswers = {}
      this.currentQuestionIndex = 0
      this.testProgress = 0
    },

    getTestById(testId) {
      return this.availableTests.find((test) => test.id === testId)
    },

    saveAnswer(questionId, answer) {
      this.currentAnswers[questionId] = answer
      this.updateProgress()
    },

    updateProgress() {
      if (!this.currentTest) return

      const totalQuestions = this.getTotalQuestions()
      const answeredQuestions = Object.keys(this.currentAnswers).length
      this.testProgress = Math.round((answeredQuestions / totalQuestions) * 100)
    },

    getTotalQuestions() {
      // Для реактивных тестов это будет более сложная логика
      return this.currentTest?.questionsCount || 20
    },

    resetTest() {
      this.currentTest = null
      this.currentAnswers = {}
      this.currentQuestionIndex = 0
      this.testProgress = 0
    },
  },
})
