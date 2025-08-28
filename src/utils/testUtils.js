// Поиск вопроса по ID во всех потоках теста
export function findQuestionById(questionId, testData) {
  if (!testData) return null

  // Ищем в начальных вопросах
  let question = testData.initialQuestions?.find((q) => q.id === questionId)
  if (question) return question

  // Ищем во всех потоках
  if (testData.questionFlows) {
    for (const flow of Object.values(testData.questionFlows)) {
      question = flow.find((q) => q.id === questionId)
      if (question) return question
    }
  }

  return null
}

// ИСПРАВЛЕНО: подсчет результата теста с учетом демографии
export function calculateTestResult({ testId, answeredQuestions, testData, demographics }) {
  console.log('Calculating test result for:', {
    testId,
    questionsCount: Object.keys(answeredQuestions).length,
  })

  let totalScore = 0
  let questionCount = 0
  const detailedScoring = []

  // Подсчитываем базовый балл
  Object.entries(answeredQuestions).forEach(([questionId, qa]) => {
    questionCount++
    let questionScore = 0

    const question = findQuestionById(questionId, testData)
    if (!question) {
      console.warn('Question not found:', questionId)
      return
    }

    // Расчет баллов в зависимости от типа вопроса
    switch (question.type) {
      case 'scale':
        questionScore = calculateScaleScore(qa.answer, question, demographics)
        break
      case 'multiple':
        questionScore = calculateMultipleChoiceScore(qa.answer, question)
        break
      case 'single':
        questionScore = calculateSingleChoiceScore(qa.answer, question)
        break
      default:
        questionScore = 2 // дефолтное значение
    }

    totalScore += questionScore

    detailedScoring.push({
      questionId,
      question: qa.question,
      answer: qa.answer,
      score: questionScore,
      type: question.type,
    })
  })

  console.log('Base score calculated:', totalScore)

  // Применяем общие демографические модификаторы
  if (testData?.resultCalculation?.demographicModifiers) {
    const modifiers = testData.resultCalculation.demographicModifiers
    const ageModifier = modifiers.age?.[demographics.age]?.multiplier || 1
    const genderModifier = modifiers.gender?.[demographics.gender]?.multiplier || 1
    const originalScore = totalScore
    totalScore = Math.round(totalScore * ageModifier * genderModifier)
    console.log('Score after demographics:', {
      originalScore,
      ageModifier,
      genderModifier,
      finalScore: totalScore,
    })
  }

  const result = {
    testId,
    score: Math.max(0, totalScore), // Не может быть отрицательным
    rawScore: totalScore,
    answers: answeredQuestions,
    detailedScoring,
    completedAt: new Date().toISOString(),
    questionCount,
  }

  console.log('Final test result:', result)
  return result
}

// Подсчет баллов для шкалы
function calculateScaleScore(answer, question, demographics) {
  let score = answer || 0

  // Применяем демографические веса если есть
  if (question.weights?.demographic) {
    const ageWeight = question.weights.demographic.age?.[demographics.age] || 1
    const genderWeight = question.weights.demographic.gender?.[demographics.gender] || 1
    score = score * (ageWeight * genderWeight)
  }

  return score
}

// Подсчет баллов для множественного выбора
function calculateMultipleChoiceScore(answers, question) {
  if (!Array.isArray(answers) || !question.options) return 0

  let totalScore = 0

  answers.forEach((answerValue) => {
    const option = question.options.find((opt) => opt.value === answerValue)
    if (option) {
      totalScore += option.weight || 2
    }
  })

  return totalScore
}

// Подсчет баллов для одиночного выбора
function calculateSingleChoiceScore(answer, question) {
  if (!question.options) return 2

  const option = question.options.find((opt) => opt.value === answer)
  return option?.stress || option?.weight || 2
}

// Определение уровня результата
export function getResultLevel(score, ranges) {
  if (!ranges) return 'moderate'

  for (const [key, range] of Object.entries(ranges)) {
    if (score >= range.min && score <= range.max) {
      return key
    }
  }

  return 'moderate'
}

// Получение интерпретации результата
export function getResultInterpretation(score, testData) {
  if (!testData?.resultCalculation) {
    return {
      label: 'Результат',
      range: { min: 0, max: 100 },
      recommendations: [],
      color: '#6b7280',
      description: 'Данные не найдены',
      level: 'moderate',
    }
  }

  const ranges = testData.resultCalculation.ranges
  const recommendations = testData.resultCalculation.recommendations
  const level = getResultLevel(score, ranges)
  const range = ranges[level]

  return {
    label: range?.label || 'Результат',
    range: range || { min: 0, max: 100 },
    color: range?.color || '#6b7280',
    description: range?.description || '',
    recommendations: recommendations[level] || [],
    level,
  }
}

// Валидация ответа
export function validateAnswer(answer, questionType) {
  switch (questionType) {
    case 'single':
      return answer !== null && answer !== undefined && answer !== ''
    case 'multiple':
      return Array.isArray(answer) && answer.length > 0
    case 'scale':
      return typeof answer === 'number' && answer >= 1
    default:
      return answer !== null && answer !== undefined
  }
}
