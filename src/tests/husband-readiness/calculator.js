// src/tests/husband-readiness/calculator.js
export default class HusbandReadinessCalculator {
  calculate(answers, demographics, config) {
    console.log('💕 Calculating husband readiness score...')

    let totalScore = 0
    let requiredTraitsCount = 0
    const detailedScoring = []

    // Обрабатываем положительные качества
    const positiveAnswers = answers['positive_traits']?.answer || []
    const positiveQuestion = config.initialQuestions.find((q) => q.id === 'positive_traits')

    if (Array.isArray(positiveAnswers) && positiveQuestion) {
      positiveAnswers.forEach((answerValue) => {
        const option = positiveQuestion.options.find((opt) => opt.value === answerValue)
        if (option) {
          totalScore += option.weight

          if (option.required) {
            requiredTraitsCount++
          }

          detailedScoring.push({
            questionId: 'positive_traits',
            traitName: option.label,
            answer: answerValue,
            score: option.weight,
            type: 'positive',
            required: option.required,
          })

          console.log(
            `➕ ${option.label}: +${option.weight} баллов${option.required ? ' (обязательное)' : ''}`,
          )
        }
      })
    }

    // Обрабатываем негативные качества
    const negativeAnswers = answers['negative_traits']?.answer || []
    const negativeQuestion = config.initialQuestions.find((q) => q.id === 'negative_traits')

    if (Array.isArray(negativeAnswers) && negativeQuestion) {
      negativeAnswers.forEach((answerValue) => {
        const option = negativeQuestion.options.find((opt) => opt.value === answerValue)
        if (option) {
          totalScore += option.weight // уже отрицательное число

          detailedScoring.push({
            questionId: 'negative_traits',
            traitName: option.label,
            answer: answerValue,
            score: option.weight,
            type: 'negative',
          })

          console.log(`➖ ${option.label}: ${option.weight} баллов`)
        }
      })
    }

    console.log(
      `📊 Base score: ${totalScore}, Required traits: ${requiredTraitsCount}/${config.requiredMinimum}`,
    )

    // Проверяем минимальные требования
    const hasMinimumRequired = requiredTraitsCount >= config.requiredMinimum

    // Если не хватает обязательных качеств, сильно снижаем балл
    if (!hasMinimumRequired) {
      const missingRequired = config.requiredMinimum - requiredTraitsCount
      const penalty = missingRequired * 50 // жесткий штраф за отсутствие обязательных качеств
      totalScore -= penalty

      console.log(`⚠️ Missing ${missingRequired} required traits, penalty: -${penalty}`)
    }

    // Минимальный балл не может быть меньше 0
    const finalScore = Math.max(0, totalScore)

    console.log(`💯 Final score: ${finalScore}`)

    return {
      testId: config.id,
      score: finalScore,
      rawScore: totalScore,
      requiredTraitsCount,
      hasMinimumRequired,
      detailedScoring,
      completedAt: new Date().toISOString(),
      questionCount: 2, // у нас всего 2 вопроса
    }
  }

  // Вспомогательная функция для получения всех обязательных качеств
  getRequiredTraits(config) {
    const positiveQuestion = config.initialQuestions.find((q) => q.id === 'positive_traits')
    if (!positiveQuestion) return []

    return positiveQuestion.options
      .filter((option) => option.required)
      .map((option) => ({
        value: option.value,
        label: option.label,
        weight: option.weight,
      }))
  }

  // Получение списка выбранных качеств для отображения
  getSelectedTraits(answers, config, type = 'both') {
    const selected = { positive: [], negative: [] }

    if (type === 'both' || type === 'positive') {
      const positiveAnswers = answers['positive_traits']?.answer || []
      const positiveQuestion = config.initialQuestions.find((q) => q.id === 'positive_traits')

      if (positiveQuestion) {
        selected.positive = positiveAnswers
          .map((value) => {
            const option = positiveQuestion.options.find((opt) => opt.value === value)
            return option
              ? {
                  label: option.label,
                  weight: option.weight,
                  required: option.required,
                }
              : null
          })
          .filter(Boolean)
      }
    }

    if (type === 'both' || type === 'negative') {
      const negativeAnswers = answers['negative_traits']?.answer || []
      const negativeQuestion = config.initialQuestions.find((q) => q.id === 'negative_traits')

      if (negativeQuestion) {
        selected.negative = negativeAnswers
          .map((value) => {
            const option = negativeQuestion.options.find((opt) => opt.value === value)
            return option
              ? {
                  label: option.label,
                  weight: option.weight,
                }
              : null
          })
          .filter(Boolean)
      }
    }

    return selected
  }
}
