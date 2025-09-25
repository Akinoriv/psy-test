// src/core/test-engine/TestRegistry.js (ОБНОВЛЕННЫЙ)
class TestRegistry {
  static tests = new Map()

  // Регистрация теста
  static register(testModule) {
    const { config, calculator, interpreter } = testModule

    if (!this.validate(config)) {
      throw new Error(`Invalid questionnaire config: ${config.id}`)
    }

    this.tests.set(config.id, {
      config,
      calculator,
      interpreter,
      loadedAt: new Date(),
    })

    console.log(`✅ Questionnaire registered: ${config.id}`)
  }

  // Автоматическое обнаружение тестов
  static async discoverTests() {
    // Список всех опросов - добавляйте сюда новые опросы
    const testIds = [
      'stress-burnout',
      'husband-readiness', // 🆕 ДОБАВЛЕН НОВЫЙ ОПРОС
      // 'anxiety-test',     // раскомментировать при добавлении
      // 'depression-test'   // раскомментировать при добавлении
    ]

    for (const testId of testIds) {
      try {
        const module = await import(`../../tests/${testId}/index.js`)
        this.register(module.default)
      } catch (error) {
        console.warn(`Failed to load questionnaire ${testId}:`, error)
      }
    }

    return Array.from(this.tests.values())
  }

  // Получение теста
  static get(testId) {
    return this.tests.get(testId)
  }

  // Получение всех тестов
  static getAll() {
    return Array.from(this.tests.values())
  }

  // Валидация конфигурации теста
  static validate(config) {
    const required = ['id', 'title', 'initialQuestions']

    for (const field of required) {
      if (!config[field]) {
        console.error(`Missing required field: ${field}`)
        return false
      }
    }

    if (!Array.isArray(config.initialQuestions)) {
      console.error('initialQuestions must be an array')
      return false
    }

    return true
  }

  // Очистка всех тестов (для тестирования)
  static clear() {
    this.tests.clear()
  }
}

export default TestRegistry
