import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import TestRegistry from '../core/test-engine/TestRegistry'
import StorageManager from '../core/storage/StorageManager'
import { useDemographics } from './useDemographics.js'

// ИМПОРТЫ КОМПОНЕНТОВ НУЖНЫ - оставляем их!
import SingleChoice from '../components/SingleChoice.vue'
import MultipleChoice from '../components/MultipleChoice.vue'
import ScaleQuestion from '../components/ScaleQuestion.vue'

export function useTestLogic() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const testStore = useTestStore()
  const storageManager = new StorageManager()
  const { getUserDemographics } = useDemographics()

  // Состояние теста
  const testStarted = ref(false)
  const currentQuestionIndex = ref(0)
  const currentAnswer = ref(null)
  const questionsFlow = ref([])
  const answeredQuestions = ref({})
  const currentTest = ref(null)
  const isLoading = ref(false)

  // Вычисляемые свойства
  const testProgress = computed(() => {
    if (questionsFlow.value.length === 0) return 0

    const answeredCount = Object.keys(answeredQuestions.value).length
    if (answeredCount === 0) return 0

    // Прогресс основан на текущей позиции в потоке
    const currentProgress = ((currentQuestionIndex.value + 1) / questionsFlow.value.length) * 100
    return Math.min(95, Math.round(currentProgress))
  })

  const currentQuestion = computed(() => {
    return questionsFlow.value[currentQuestionIndex.value] || null
  })

  const currentQuestionComponent = computed(() => {
    if (!currentQuestion.value) return null

    const componentMap = {
      single: SingleChoice,
      multiple: MultipleChoice,
      scale: ScaleQuestion,
    }

    return componentMap[currentQuestion.value.type] || SingleChoice
  })

  const currentQuestionNumber = computed(() => currentQuestionIndex.value + 1)
  const totalQuestions = computed(() => questionsFlow.value.length || 1)
  const canGoToPrevious = computed(() => currentQuestionIndex.value > 0)
  const canGoToNext = computed(() => currentQuestionIndex.value < questionsFlow.value.length)

  // ИСПРАВЛЕНО: правильная логика определения последнего вопроса
  const isLastQuestion = computed(() => {
    console.log('Checking isLastQuestion:', {
      currentIndex: currentQuestionIndex.value,
      flowLength: questionsFlow.value.length,
      isAnswered: isCurrentQuestionAnswered.value,
      currentQuestionId: currentQuestion.value?.id,
    })

    // Если это НЕ последний вопрос в текущем потоке - точно не последний
    if (currentQuestionIndex.value < questionsFlow.value.length - 1) {
      console.log('Not last question - more questions in current flow')
      return false
    }

    // Если это последний вопрос в потоке И есть ответ - проверяем следующие вопросы
    if (currentQuestion.value && isCurrentQuestionAnswered.value) {
      const nextQuestions = getNextQuestions(currentQuestion.value, currentAnswer.value)
      console.log('Checking next questions:', nextQuestions.length)
      return nextQuestions.length === 0
    }

    // Если нет ответа - не можем определить, показываем как не последний
    console.log('No answer yet, treating as not last')
    return false
  })

  const isCurrentQuestionAnswered = computed(() => {
    if (currentAnswer.value === null || currentAnswer.value === '') return false
    if (Array.isArray(currentAnswer.value)) return currentAnswer.value.length > 0
    return true
  })

  // НОВАЯ СИСТЕМА: Загрузка теста через TestRegistry
  const loadTestData = async () => {
    try {
      isLoading.value = true
      console.log('🔍 Loading test data for:', route.params.testId)

      // Автоматически загружаем все доступные тесты
      await TestRegistry.discoverTests()

      // Получаем конкретный тест
      const testModule = TestRegistry.get(route.params.testId)

      if (!testModule) {
        console.error(`❌ Test not found: ${route.params.testId}`)

        // Fallback на старую систему для совместимости
        console.log('⚠️ Trying legacy system...')
        await loadTestDataLegacy()
        return
      }

      currentTest.value = testModule
      console.log('✅ Test loaded:', testModule.config.title)
    } catch (error) {
      console.error('❌ Failed to load test:', error)

      // Fallback на старую систему
      try {
        await loadTestDataLegacy()
      } catch (legacyError) {
        console.error('❌ Legacy system also failed:', legacyError)
        router.push('/dashboard')
      }
    } finally {
      isLoading.value = false
    }
  }

  // Fallback на старую систему для совместимости
  const loadTestDataLegacy = async () => {
    console.log('🔄 Using legacy test loading system')

    switch (route.params.testId) {
      case 'stress-burnout':
        const { stressBurnoutTest } = await import('../data/stressTest.js')

        // Создаем wrapper для старых данных
        currentTest.value = {
          config: stressBurnoutTest,
          calculator: {
            calculate: async (answers, demographics, config) => {
              // Используем старую функцию
              const { calculateTestResult } = await import('../utils/testUtils.js')
              return calculateTestResult({
                testId: config.id,
                answeredQuestions: answers,
                testData: config,
                demographics,
              })
            },
          },
          interpreter: {
            interpret: async (score) => {
              // Используем старую функцию
              const { getResultInterpretation } = await import('../utils/testUtils.js')
              return getResultInterpretation(score, currentTest.value.config)
            },
            generatePersonalizedNotes: (score, demographics) => {
              const { generatePersonalizedNotes } = useDemographics()
              return generatePersonalizedNotes(score, demographics, currentTest.value.config)
            },
          },
        }
        break
      default:
        throw new Error(`Unknown test ID: ${route.params.testId}`)
    }
  }

  // Инициализация потока вопросов
  const initializeQuestionFlow = () => {
    if (!currentTest.value?.config?.initialQuestions) return

    questionsFlow.value = [...currentTest.value.config.initialQuestions]
    loadSavedAnswer()
  }

  // Загрузка сохраненного ответа
  const loadSavedAnswer = () => {
    const questionId = currentQuestion.value?.id
    if (questionId && answeredQuestions.value[questionId]) {
      currentAnswer.value = answeredQuestions.value[questionId].answer
    } else {
      currentAnswer.value = currentQuestion.value?.type === 'multiple' ? [] : null
    }
  }

  // Обработка изменения ответа
  const handleAnswerChange = (answer) => {
    currentAnswer.value = answer

    const questionId = currentQuestion.value.id
    answeredQuestions.value[questionId] = {
      questionId,
      question: currentQuestion.value.question,
      answer: answer,
      timestamp: new Date().toISOString(),
      type: currentQuestion.value.type,
    }

    saveProgressToStorage()
  }

  // НОВАЯ СИСТЕМА: Сохранение прогресса через StorageManager
  const saveProgressToStorage = async () => {
    const progress = {
      testId: route.params.testId,
      currentQuestionIndex: currentQuestionIndex.value,
      answeredQuestions: answeredQuestions.value,
      questionsFlow: questionsFlow.value,
    }

    await storageManager.saveProgress(userStore.user.id, route.params.testId, progress)
  }

  // Определение следующих вопросов
  const getNextQuestions = (question, answer) => {
    if (!currentTest.value?.config?.questionFlows) return []

    console.log('Getting next questions for:', {
      questionId: question.id,
      answer,
      type: question.type,
    })

    let nextQuestions = []

    if (question.type === 'single' && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === answer)
      if (selectedOption?.nextFlow) {
        nextQuestions = currentTest.value.config.questionFlows[selectedOption.nextFlow] || []
        console.log('Single choice next flow:', selectedOption.nextFlow, nextQuestions.length)
      }
    }

    if (question.type === 'scale' && question.conditions) {
      for (const [conditionName, config] of Object.entries(question.conditions)) {
        let meetsCondition = false

        if (config.min && config.max) {
          meetsCondition = answer >= config.min && answer <= config.max
        } else if (config.min) {
          meetsCondition = answer >= config.min
        } else if (config.max) {
          meetsCondition = answer <= config.max
        }

        if (meetsCondition && config.nextFlow) {
          nextQuestions = currentTest.value.config.questionFlows[config.nextFlow] || []
          console.log('Scale condition met:', conditionName, config, nextQuestions.length)
          break
        }
      }
    }

    if (question.type === 'multiple' && Array.isArray(answer) && question.options) {
      let maxWeight = 0
      let selectedFlow = null

      answer.forEach((answerValue) => {
        const option = question.options.find((opt) => opt.value === answerValue)
        if (option && option.weight > maxWeight && option.nextFlow) {
          maxWeight = option.weight
          selectedFlow = option.nextFlow
        }
      })

      if (selectedFlow) {
        nextQuestions = currentTest.value.config.questionFlows[selectedFlow] || []
        console.log('Multiple choice next flow:', selectedFlow, nextQuestions.length)
      }
    }

    return nextQuestions
  }

  // Переход к следующему вопросу
  const goToNextQuestion = () => {
    if (!isCurrentQuestionAnswered.value) return

    console.log('Going to next question, current index:', currentQuestionIndex.value)
    console.log('Current flow length:', questionsFlow.value.length)

    // Проверяем есть ли следующие вопросы ПЕРЕД переходом
    const nextQuestions = getNextQuestions(currentQuestion.value, currentAnswer.value)

    // Если мы на последнем вопросе в потоке И нет следующих вопросов - завершаем тест
    if (
      currentQuestionIndex.value >= questionsFlow.value.length - 1 &&
      nextQuestions.length === 0
    ) {
      console.log('Finishing test - no more questions')
      finishTest()
      return
    }

    // Добавляем дополнительные вопросы если есть
    if (nextQuestions.length > 0) {
      const insertIndex = currentQuestionIndex.value + 1
      questionsFlow.value.splice(insertIndex, 0, ...nextQuestions)
      console.log(
        'Added next questions:',
        nextQuestions.length,
        'New flow length:',
        questionsFlow.value.length,
      )
    }

    currentQuestionIndex.value++
    console.log('New question index:', currentQuestionIndex.value)
    loadSavedAnswer()
  }

  // Переход к предыдущему вопросу
  const goToPreviousQuestion = () => {
    if (canGoToPrevious.value) {
      currentQuestionIndex.value--
      loadSavedAnswer()
    }
  }

  // Начало теста
  const startTest = () => {
    testStarted.value = true
    initializeQuestionFlow()
  }

  // НОВАЯ СИСТЕМА: Завершение теста
  const finishTest = async () => {
    try {
      console.log('Finishing test with answers:', Object.keys(answeredQuestions.value).length)

      if (Object.keys(answeredQuestions.value).length === 0) {
        console.error('No answers to process')
        alert('Нет ответов для обработки. Попробуйте пройти тест заново.')
        return
      }

      const demographics = getUserDemographics()

      // Используем calculator из модуля теста
      const result = currentTest.value.calculator.calculate(
        answeredQuestions.value,
        demographics,
        currentTest.value.config,
      )

      // Используем interpreter для получения интерпретации
      const interpretation = currentTest.value.interpreter.interpret(result.score)
      const personalizedNotes = currentTest.value.interpreter.generatePersonalizedNotes(
        result.score,
        demographics,
      )

      const finalResult = {
        testId: route.params.testId,
        ...result,
        interpretation,
        personalizedNotes,
        demographics,
        completedAt: new Date().toISOString(),
      }

      console.log('Test result calculated:', finalResult)

      // Сохраняем через StorageManager
      await storageManager.saveTestResult(userStore.user.id, finalResult)
      await storageManager.clearProgress(userStore.user.id, route.params.testId)

      // Также сохраняем в старый формат для совместимости
      userStore.saveTestResult(finalResult)

      console.log('Navigating to results page...')
      router.push(`/result/${route.params.testId}`)
    } catch (error) {
      console.error('Failed to finish test:', error)
      alert('Произошла ошибка при завершении теста. Попробуйте еще раз.')
    }
  }

  // Возврат на дашборд
  const goBack = () => {
    const shouldExit =
      !testStarted.value || confirm('Вы уверены, что хотите выйти? Прогресс будет сохранен.')

    if (shouldExit) {
      router.push('/dashboard')
    }
  }

  // НОВАЯ СИСТЕМА: Загрузка сохраненного прогресса
  const loadSavedProgress = async () => {
    try {
      const progress = await storageManager.loadProgress(userStore.user.id, route.params.testId)

      if (progress) {
        currentQuestionIndex.value = progress.currentQuestionIndex || 0
        answeredQuestions.value = progress.answeredQuestions || {}
        questionsFlow.value = progress.questionsFlow || []
        testStarted.value = questionsFlow.value.length > 0

        if (testStarted.value) {
          loadSavedAnswer()
        }

        console.log('✅ Loaded saved progress')
      } else {
        console.log('📝 No saved progress found')
      }
    } catch (error) {
      console.error('❌ Failed to load saved progress:', error)
      // Fallback на старую систему
      try {
        const saved = localStorage.getItem('test-progress')
        if (!saved) return

        const progress = JSON.parse(saved)
        if (progress.testId !== route.params.testId) return

        currentQuestionIndex.value = progress.currentQuestionIndex || 0
        answeredQuestions.value = progress.answeredQuestions || {}
        questionsFlow.value = progress.questionsFlow || []
        testStarted.value = questionsFlow.value.length > 0

        if (testStarted.value) {
          loadSavedAnswer()
        }

        console.log('✅ Loaded progress from legacy system')
      } catch (legacyError) {
        console.error('❌ Failed to load legacy progress:', legacyError)
      }
    }
  }

  // Инициализация
  const initialize = async () => {
    if (!userStore.isAuthenticated) {
      router.push('/')
      return
    }

    await loadTestData()
    await loadSavedProgress()
  }

  // Watcher для автосохранения ответов
  watch(() => currentQuestionIndex.value, loadSavedAnswer)

  return {
    // Состояние
    testStarted,
    currentQuestionIndex,
    currentAnswer,
    questionsFlow,
    answeredQuestions,
    currentTest,
    isLoading,

    // Вычисляемые свойства
    testProgress,
    currentQuestion,
    currentQuestionComponent,
    currentQuestionNumber,
    totalQuestions,
    canGoToPrevious,
    canGoToNext,
    isLastQuestion,
    isCurrentQuestionAnswered,

    // Методы
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion,
    startTest,
    finishTest,
    goBack,
    initialize,
  }
}
