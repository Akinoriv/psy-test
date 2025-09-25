// composables/useTestLogic.js - Упрощенная логика без StorageManager
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import { useDemographics } from './useDemographics.js'

// Импорты компонентов
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
  const isFinishing = ref(false)

  // Вычисляемые свойства
  const testProgress = computed(() => {
    if (questionsFlow.value.length === 0) return 0
    return Math.min(95, Math.round(((currentQuestionIndex.value + 1) / questionsFlow.value.length) * 100))
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

  // =================== ЗАГРУЗКА ТЕСТА ===================

  const loadTestData = async () => {
    try {
      isLoading.value = true
      console.log('🔍 Loading test:', route.params.testId)

      // Загружаем тест через testStore
      const testModule = await testStore.loadTest(route.params.testId)

      if (!testModule) {
        throw new Error(`Test not found: ${route.params.testId}`)
      }

      currentTest.value = testModule
      console.log('✅ Test loaded:', testModule.config.title)
      
    } catch (error) {
      console.error('❌ Failed to load test:', error)
      alert('Не удалось загрузить тест. Попробуйте еще раз.')
      router.push('/dashboard')
    } finally {
      isLoading.value = false
    }
  }

  // =================== ПОТОК ВОПРОСОВ ===================

  const initializeQuestionFlow = () => {
    if (!currentTest.value?.config?.initialQuestions) {
      console.error('❌ No questions found in test')
      return
    }

    questionsFlow.value = [...currentTest.value.config.initialQuestions]
    loadSavedAnswer()
    
    console.log('✅ Question flow initialized:', questionsFlow.value.length, 'questions')
  }

  const loadSavedAnswer = () => {
    const questionId = currentQuestion.value?.id
    if (questionId && answeredQuestions.value[questionId]) {
      currentAnswer.value = answeredQuestions.value[questionId].answer
    } else {
      currentAnswer.value = currentQuestion.value?.type === 'multiple' ? [] : null
    }
  }

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

    console.log('💾 Answer saved:', questionId, answer)
  }

  // =================== НАВИГАЦИЯ ===================

  const getNextQuestions = (question, answer) => {
    if (!currentTest.value?.config?.questionFlows) return []

    let nextQuestions = []

    // Single choice
    if (question.type === 'single' && question.options) {
      const selectedOption = question.options.find(opt => opt.value === answer)
      if (selectedOption?.nextFlow) {
        nextQuestions = currentTest.value.config.questionFlows[selectedOption.nextFlow] || []
      }
    }

    // Scale question
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

    // Multiple choice
    if (question.type === 'multiple' && Array.isArray(answer) && question.options) {
      let maxWeight = 0
      let selectedFlow = null

      answer.forEach(answerValue => {
        const option = question.options.find(opt => opt.value === answerValue)
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

  const goToNextQuestion = () => {
    if (!isCurrentQuestionAnswered.value) return

    const nextQuestions = getNextQuestions(currentQuestion.value, currentAnswer.value)

    // Если это последний вопрос и нет следующих - завершаем тест
    if (currentQuestionIndex.value >= questionsFlow.value.length - 1 && nextQuestions.length === 0) {
      finishTest()
      return
    }

    // Добавляем следующие вопросы в поток
    if (nextQuestions.length > 0) {
      const insertIndex = currentQuestionIndex.value + 1
      questionsFlow.value.splice(insertIndex, 0, ...nextQuestions)
      console.log('➕ Added next questions:', nextQuestions.length)
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

  // =================== УПРАВЛЕНИЕ ТЕСТОМ ===================

  const startTest = () => {
    console.log('🚀 Starting test')
    testStarted.value = true
    initializeQuestionFlow()
  }

  const finishTest = async () => {
    if (isFinishing.value) return // Предотвращаем двойной вызов
    
    try {
      isFinishing.value = true
      console.log('🏁 Finishing test...', Object.keys(answeredQuestions.value).length, 'answers')

      if (Object.keys(answeredQuestions.value).length === 0) {
        throw new Error('No answers to process')
      }

      const demographics = getUserDemographics()

      // Расчет результата через calculator теста
      const result = currentTest.value.calculator.calculate(
        answeredQuestions.value,
        demographics,
        currentTest.value.config
      )

      // Интерпретация через interpreter
      let finalResult

      if (currentTest.value.interpreter.interpretWithSections) {
        // Новая система с секциями
        const interpretation = currentTest.value.interpreter.interpretWithSections(result)
        finalResult = {
          ...result,
          interpretation: interpretation.interpretation,
          sections: interpretation.sections,
          testType: interpretation.testType,
        }
      } else {
        // Старая система
        const interpretation = currentTest.value.interpreter.interpret(result.score)
        const personalizedNotes = currentTest.value.interpreter.generatePersonalizedNotes?.(
          result.score, 
          demographics
        ) || []

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
        hasInterpretation: !!finalResult.interpretation,
        hasSections: !!finalResult.sections
      })

      // Сохраняем через userStore
      await userStore.saveTestResult(finalResult)

      console.log('🧭 Navigating to results...')
      router.push(`/result/${route.params.testId}`)
      
    } catch (error) {
      console.error('❌ Failed to finish test:', error)
      alert(`Произошла ошибка: ${error.message}. Попробуйте еще раз.`)
    } finally {
      isFinishing.value = false
    }
  }

  const goBack = () => {
    const shouldExit = !testStarted.value || 
      confirm('Вы уверены, что хотите выйти? Прогресс теста будет потерян.')

    if (shouldExit) {
      router.push('/dashboard')
    }
  }

  // =================== ИНИЦИАЛИЗАЦИЯ ===================

  const initialize = async () => {
    if (!userStore.isAuthenticated) {
      console.log('👤 User not authenticated, redirecting...')
      router.push('/')
      return
    }

    await loadTestData()
  }

  // Автозагрузка ответа при смене вопроса
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
    isFinishing,

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