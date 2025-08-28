import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import { calculateTestResult, findQuestionById } from '../utils/testUtils.js'
import { useDemographics } from './useDemographics.js'

import SingleChoice from '../components/SingleChoice.vue'
import MultipleChoice from '../components/MultipleChoice.vue'
import ScaleQuestion from '../components/ScaleQuestion.vue'

export function useTestLogic() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const testStore = useTestStore()
  const { getUserDemographics, generatePersonalizedNotes } = useDemographics()

  // Состояние теста
  const testStarted = ref(false)
  const currentQuestionIndex = ref(0)
  const currentAnswer = ref(null)
  const questionsFlow = ref([])
  const answeredQuestions = ref({})
  const testData = ref(null)
  const isLoading = ref(false)

  // Вычисляемые свойства
  const currentTest = computed(() => testStore.getCurrentTest)

  const currentQuestion = computed(() => {
    if (questionsFlow.value.length === 0) return null
    return questionsFlow.value[currentQuestionIndex.value]
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

  // ИСПРАВЛЕНО: правильный расчет прогресса
  const testProgress = computed(() => {
    if (questionsFlow.value.length === 0) return 0

    const answeredCount = Object.keys(answeredQuestions.value).length
    if (answeredCount === 0) return 0

    // Прогресс основан на текущей позиции в потоке
    const currentProgress = ((currentQuestionIndex.value + 1) / questionsFlow.value.length) * 100
    return Math.min(95, Math.round(currentProgress))
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

  // Загрузка данных теста
  const loadTestData = async () => {
    try {
      isLoading.value = true

      switch (route.params.testId) {
        case 'stress-burnout':
          const { stressBurnoutTest } = await import('../data/stressTest.js')
          testData.value = stressBurnoutTest
          break
        default:
          throw new Error('Unknown test ID')
      }
    } catch (error) {
      console.error('Failed to load test data:', error)
      router.push('/dashboard')
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация потока вопросов
  const initializeQuestionFlow = () => {
    if (!testData.value?.initialQuestions) return

    questionsFlow.value = [...testData.value.initialQuestions]
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

  // Сохранение прогресса в localStorage
  const saveProgressToStorage = () => {
    const progressData = {
      testId: route.params.testId,
      currentQuestionIndex: currentQuestionIndex.value,
      answeredQuestions: answeredQuestions.value,
      questionsFlow: questionsFlow.value,
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem('test-progress', JSON.stringify(progressData))
  }

  // Определение следующих вопросов
  const getNextQuestions = (question, answer) => {
    if (!testData.value?.questionFlows) return []

    console.log('Getting next questions for:', {
      questionId: question.id,
      answer,
      type: question.type,
    })

    let nextQuestions = []

    if (question.type === 'single' && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === answer)
      if (selectedOption?.nextFlow) {
        nextQuestions = testData.value.questionFlows[selectedOption.nextFlow] || []
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
          nextQuestions = testData.value.questionFlows[config.nextFlow] || []
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
        nextQuestions = testData.value.questionFlows[selectedFlow] || []
        console.log('Multiple choice next flow:', selectedFlow, nextQuestions.length)
      }
    }

    return nextQuestions
  }

  // ИСПРАВЛЕНО: переход к следующему вопросу
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

  // Завершение теста
  const finishTest = () => {
    try {
      console.log('Finishing test with answers:', Object.keys(answeredQuestions.value).length)

      if (Object.keys(answeredQuestions.value).length === 0) {
        console.error('No answers to process')
        alert('Нет ответов для обработки. Попробуйте пройти тест заново.')
        return
      }

      const demographics = getUserDemographics()
      const result = calculateTestResult({
        testId: route.params.testId,
        answeredQuestions: answeredQuestions.value,
        testData: testData.value,
        demographics,
      })

      console.log('Test result calculated:', result)

      // Добавляем персонализированные заметки
      result.personalizedNotes = generatePersonalizedNotes(
        result.score,
        demographics,
        testData.value,
      )
      result.demographics = demographics

      userStore.saveTestResult(result)
      clearProgress()

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

  // Загрузка сохраненного прогресса
  const loadSavedProgress = () => {
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
    } catch (error) {
      console.error('Failed to load saved progress:', error)
      clearProgress()
    }
  }

  // Очистка прогресса
  const clearProgress = () => {
    localStorage.removeItem('test-progress')
  }

  // Инициализация
  const initialize = async () => {
    if (!userStore.isAuthenticated) {
      router.push('/')
      return
    }

    await loadTestData()
    loadSavedProgress()
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
    testData,
    isLoading,

    // Вычисляемые свойства
    currentTest,
    currentQuestion,
    currentQuestionComponent,
    testProgress,
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
