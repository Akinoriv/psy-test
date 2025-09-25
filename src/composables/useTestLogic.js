import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import TestRegistry from '../core/test-engine/TestRegistry'
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

  const isLastQuestion = computed(() => {
    if (currentQuestionIndex.value < questionsFlow.value.length - 1) {
      return false
    }

    if (currentQuestion.value && isCurrentQuestionAnswered.value) {
      const nextQuestions = getNextQuestions(currentQuestion.value, currentAnswer.value)
      return nextQuestions.length === 0
    }

    return false
  })

  const isCurrentQuestionAnswered = computed(() => {
    if (currentAnswer.value === null || currentAnswer.value === '') return false
    if (Array.isArray(currentAnswer.value)) return currentAnswer.value.length > 0
    return true
  })

  // Загрузка теста через TestRegistry
  const loadTestData = async () => {
    try {
      isLoading.value = true
      console.log('🔍 Loading test data for:', route.params.testId)

      await TestRegistry.discoverTests()
      const testModule = TestRegistry.get(route.params.testId)

      if (!testModule) {
        console.error(`❌ Test not found: ${route.params.testId}`)
        router.push('/dashboard')
        return
      }

      currentTest.value = testModule
      console.log('✅ Test loaded:', testModule.config.title)
    } catch (error) {
      console.error('❌ Failed to load test:', error)
      router.push('/dashboard')
    } finally {
      isLoading.value = false
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
  }

  // Определение следующих вопросов
  const getNextQuestions = (question, answer) => {
    if (!currentTest.value?.config?.questionFlows) return []

    let nextQuestions = []

    if (question.type === 'single' && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === answer)
      if (selectedOption?.nextFlow) {
        nextQuestions = currentTest.value.config.questionFlows[selectedOption.nextFlow] || []
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
      }
    }

    return nextQuestions
  }

  // Переход к следующему вопросу
  const goToNextQuestion = () => {
    if (!isCurrentQuestionAnswered.value) return

    const nextQuestions = getNextQuestions(currentQuestion.value, currentAnswer.value)

    if (
      currentQuestionIndex.value >= questionsFlow.value.length - 1 &&
      nextQuestions.length === 0
    ) {
      finishTest()
      return
    }

    if (nextQuestions.length > 0) {
      const insertIndex = currentQuestionIndex.value + 1
      questionsFlow.value.splice(insertIndex, 0, ...nextQuestions)
    }

    currentQuestionIndex.value++
    loadSavedAnswer()
  }

  const goToPreviousQuestion = () => {
    if (canGoToPrevious.value) {
      currentQuestionIndex.value--
      loadSavedAnswer()
    }
  }

  const startTest = () => {
    testStarted.value = true
    initializeQuestionFlow()
  }

  // ИСПРАВЛЕНО: Простое завершение теста без StorageManager
  const finishTest = async () => {
    try {
      console.log('🏁 Finishing test with answers:', Object.keys(answeredQuestions.value).length)

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
      let finalResult

      if (currentTest.value.interpreter.interpretWithSections) {
        // Новая система с секциями
        const fullInterpretation = currentTest.value.interpreter.interpretWithSections(result)
        finalResult = {
          ...result,
          interpretation: fullInterpretation.interpretation,
          sections: fullInterpretation.sections,
          testType: fullInterpretation.testType
        }
      } else {
        // Старая система
        const interpretation = currentTest.value.interpreter.interpret(result.score)
        const personalizedNotes = currentTest.value.interpreter.generatePersonalizedNotes
          ? currentTest.value.interpreter.generatePersonalizedNotes(result.score, demographics)
          : []

        finalResult = {
          ...result,
          interpretation,
          personalizedNotes,
        }
      }

      // Добавляем общие поля
      finalResult.demographics = demographics
      finalResult.completedAt = new Date().toISOString()
      finalResult.testId = route.params.testId

      console.log('✅ Test result calculated:', {
        testId: finalResult.testId,
        score: finalResult.score,
        hasInterpretation: !!finalResult.interpretation
      })

      // ИСПРАВЛЕНО: Сохраняем только через userStore (без StorageManager)
      await userStore.saveTestResult(finalResult)

      console.log('🧭 Navigating to results page...')
      router.push(`/result/${route.params.testId}`)
    } catch (error) {
      console.error('❌ Failed to finish test:', error)
      alert('Произошла ошибка при завершении теста. Попробуйте еще раз.')
    }
  }

  const goBack = () => {
    const shouldExit =
      !testStarted.value || confirm('Вы уверены, что хотите выйти? Прогресс будет потерян.')

    if (shouldExit) {
      router.push('/dashboard')
    }
  }

  // Инициализация
  const initialize = async () => {
    if (!userStore.isAuthenticated) {
      router.push('/')
      return
    }

    await loadTestData()
  }

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