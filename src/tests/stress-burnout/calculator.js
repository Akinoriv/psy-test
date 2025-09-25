// src/tests/stress-burnout/calculator.js
export default class StressCalculator {
  calculate(answers, demographics, config) {
    console.log('🧮 Calculating test result...')
    
    let totalScore = 0
    let questionCount = 0
    const detailedScoring = []
    
    // Подсчитываем базовый балл для каждого ответа
    Object.entries(answers).forEach(([questionId, qa]) => {
      questionCount++
      let questionScore = 0
      
      const question = this.findQuestion(questionId, config)
      if (!question) {
        console.warn(`Question not found: ${questionId}`)
        return
      }
      
      // Расчет баллов в зависимости от типа вопроса
      switch (question.type) {
        case 'scale':
          questionScore = this.calculateScaleScore(qa.answer, question, demographics)
          break
        case 'multiple':
          questionScore = this.calculateMultipleChoiceScore(qa.answer, question)
          break
        case 'single':
          questionScore = this.calculateSingleChoiceScore(qa.answer, question)
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
        type: question.type
      })
    })
    
    console.log(`Base score: ${totalScore} from ${questionCount} questions`)
    
    // Применяем демографические модификаторы
    const originalScore = totalScore
    totalScore = this.applyDemographicModifiers(totalScore, demographics)
    
    console.log(`Final score: ${totalScore} (was ${originalScore})`)
    
    return {
      testId: config.id,
      score: Math.max(0, totalScore), // Не может быть отрицательным
      rawScore: originalScore,
      detailedScoring,
      completedAt: new Date().toISOString(),
      questionCount
    }
  }
  
  calculateScaleScore(answer, question, demographics) {
    let score = Number(answer) || 0
    
    // Можно добавить демографические веса для scale вопросов
    if (question.weights?.demographic) {
      const ageWeight = question.weights.demographic.age?.[demographics.age] || 1
      const genderWeight = question.weights.demographic.gender?.[demographics.gender] || 1
      score = score * (ageWeight * genderWeight)
    }
    
    return score
  }
  
  calculateSingleChoiceScore(answer, question) {
    if (!question.options) return 2
    
    const option = question.options.find(opt => opt.value === answer)
    return option?.stress || option?.weight || 2
  }
  
  calculateMultipleChoiceScore(answers, question) {
    if (!Array.isArray(answers) || !question.options) return 0
    
    let totalScore = 0
    answers.forEach(answerValue => {
      const option = question.options.find(opt => opt.value === answerValue)
      if (option) {
        totalScore += option.weight || 2
      }
    })
    
    return totalScore
  }
  
  applyDemographicModifiers(score, demographics) {
    // Применяем возрастные и гендерные модификаторы
    const ageMultiplier = this.getAgeMultiplier(demographics.age)
    const genderMultiplier = this.getGenderMultiplier(demographics.gender)
    
    const finalScore = Math.round(score * ageMultiplier * genderMultiplier)
    
    console.log(`Demographic modifiers - Age: ${ageMultiplier}, Gender: ${genderMultiplier}`)
    
    return finalScore
  }
  
  getAgeMultiplier(ageGroup) {
    const multipliers = {
      '18-25': 0.9,
      '26-35': 1.1, 
      '36-45': 1.2,
      '46-55': 1.0,
      '56+': 0.8
    }
    return multipliers[ageGroup] || 1.0
  }
  
  getGenderMultiplier(gender) {
    const multipliers = {
      'female': 1.1,
      'male': 0.95,
      'other': 1.15
    }
    return multipliers[gender] || 1.0
  }
  
  findQuestion(questionId, config) {
    // Ищем в начальных вопросах
    let question = config.initialQuestions.find(q => q.id === questionId)
    
    if (!question && config.questionFlows) {
      // Ищем во всех потоках
      for (const flow of Object.values(config.questionFlows)) {
        question = flow.find(q => q.id === questionId)
        if (question) break
      }
    }
    
    return question
  }
}