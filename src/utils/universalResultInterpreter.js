// utils/universalResultInterpreter.js
// Универсальный интерпретатор для любых тестов

export class UniversalResultInterpreter {
  /**
   * Создает интерпретацию результата для любого теста
   * @param {Object} testResult - результат теста
   * @param {Object} testConfig - конфигурация теста (опционально)
   * @returns {Object} интерпретация результата
   */
  static interpret(testResult, testConfig = null) {
    // Если уже есть интерпретация - используем её
    if (testResult.interpretation) {
      return testResult.interpretation
    }

    const score = testResult.score
    const testId = testResult.testId
    
    // Определяем тип теста по ID или конфигурации
    const testType = this.detectTestType(testId, testConfig, testResult)
    
    return this.createInterpretation(score, testType, testResult)
  }

  /**
   * Определяет тип теста
   */
  static detectTestType(testId, testConfig, testResult) {
    // По ID теста
    if (testId?.includes('stress') || testId?.includes('burnout')) return 'stress'
    if (testId?.includes('readiness') || testId?.includes('compatibility')) return 'compatibility'
    if (testId?.includes('personality')) return 'personality'
    if (testId?.includes('depression')) return 'depression'
    if (testId?.includes('anxiety')) return 'anxiety'
    if (testId?.includes('iq')) return 'intelligence'
    
    // По наличию специфических полей
    if (testResult.selectedTraits || testResult.relationshipGoal) return 'compatibility'
    if (testResult.personalityTraits) return 'personality'
    
    // По диапазону баллов
    if (score >= 0 && score <= 100) return 'percentage'
    if (score >= 0 && score <= 200) return 'scale'
    
    return 'generic'
  }

  /**
   * Создает интерпретацию на основе типа теста
   */
  static createInterpretation(score, testType, testResult) {
    switch (testType) {
      case 'stress':
        return this.interpretStress(score)
      case 'compatibility':
        return this.interpretCompatibility(score, testResult)
      case 'personality':
        return this.interpretPersonality(score, testResult)
      case 'depression':
        return this.interpretDepression(score)
      case 'anxiety':
        return this.interpretAnxiety(score)
      case 'intelligence':
        return this.interpretIntelligence(score)
      case 'percentage':
        return this.interpretPercentage(score)
      case 'scale':
        return this.interpretScale(score)
      default:
        return this.interpretGeneric(score)
    }
  }

  // Интерпретации для разных типов тестов
  static interpretStress(score) {
    if (score <= 12) {
      return {
        emoji: '😌',
        label: 'Минимальный уровень стресса',
        description: 'Ваш уровень стресса находится в норме. Вы хорошо справляетесь с жизненными вызовами.',
        color: '#10b981'
      }
    } else if (score <= 25) {
      return {
        emoji: '😐',
        label: 'Легкий уровень стресса',
        description: 'У вас есть некоторые признаки стресса, но они пока не критичны.',
        color: '#f59e0b'
      }
    } else if (score <= 40) {
      return {
        emoji: '😟',
        label: 'Умеренный уровень стресса',
        description: 'Стресс начинает серьезно влиять на вашу жизнь. Рекомендуется принять активные меры.',
        color: '#ea580c'
      }
    } else if (score <= 55) {
      return {
        emoji: '😰',
        label: 'Высокий уровень стресса',
        description: 'Вы находитесь в состоянии значительного стресса, который требует немедленного внимания.',
        color: '#dc2626'
      }
    } else {
      return {
        emoji: '🚨',
        label: 'Критический уровень стресса',
        description: 'Критически высокий уровень стресса. Настоятельно рекомендуется обратиться к специалисту.',
        color: '#991b1b'
      }
    }
  }

  static interpretCompatibility(score, testResult) {
    if (score >= 80) {
      return {
        emoji: '💕',
        label: 'Отличная совместимость!',
        description: 'У вас есть все качества для гармоничных отношений.',
        color: '#10b981',
        probability: Math.min(95, score)
      }
    } else if (score >= 60) {
      return {
        emoji: '😊',
        label: 'Хорошие перспективы',
        description: 'Есть хороший потенциал для развития отношений.',
        color: '#f59e0b',
        probability: Math.min(75, score)
      }
    } else if (score >= 40) {
      return {
        emoji: '🤔',
        label: 'Нужно поработать над собой',
        description: 'У вас есть хорошие качества, но стоит больше развиваться.',
        color: '#ea580c',
        probability: Math.min(50, score)
      }
    } else {
      return {
        emoji: '😅',
        label: 'Пока не готов',
        description: 'Стоит еще поработать над собой перед серьезными отношениями.',
        color: '#dc2626',
        probability: Math.min(30, score)
      }
    }
  }

  static interpretPersonality(score, testResult) {
    return {
      emoji: '🎭',
      label: 'Анализ личности',
      description: 'Ваш результат отражает уникальные особенности вашей личности.',
      color: '#6366f1'
    }
  }

  static interpretDepression(score) {
    if (score <= 10) {
      return {
        emoji: '😊',
        label: 'Нормальное настроение',
        description: 'Признаков депрессии не обнаружено.',
        color: '#10b981'
      }
    } else if (score <= 20) {
      return {
        emoji: '😔',
        label: 'Легкая депрессия',
        description: 'Некоторые симптомы депрессии присутствуют.',
        color: '#f59e0b'
      }
    } else {
      return {
        emoji: '😞',
        label: 'Выраженная депрессия',
        description: 'Рекомендуется обратиться к специалисту.',
        color: '#dc2626'
      }
    }
  }

  static interpretAnxiety(score) {
    if (score <= 15) {
      return {
        emoji: '😌',
        label: 'Низкий уровень тревожности',
        description: 'Ваш уровень тревожности в пределах нормы.',
        color: '#10b981'
      }
    } else if (score <= 30) {
      return {
        emoji: '😰',
        label: 'Умеренная тревожность',
        description: 'Некоторые признаки повышенной тревожности.',
        color: '#f59e0b'
      }
    } else {
      return {
        emoji: '😨',
        label: 'Высокий уровень тревожности',
        description: 'Рекомендуется обратиться за помощью.',
        color: '#dc2626'
      }
    }
  }

  static interpretIntelligence(score) {
    if (score >= 130) {
      return {
        emoji: '🧠',
        label: 'Высокий интеллект',
        description: 'Ваш результат значительно выше среднего.',
        color: '#6366f1'
      }
    } else if (score >= 115) {
      return {
        emoji: '🤓',
        label: 'Интеллект выше среднего',
        description: 'Ваш результат выше среднего уровня.',
        color: '#10b981'
      }
    } else if (score >= 85) {
      return {
        emoji: '😊',
        label: 'Средний интеллект',
        description: 'Ваш результат соответствует среднему уровню.',
        color: '#f59e0b'
      }
    } else {
      return {
        emoji: '🤔',
        label: 'Интеллект ниже среднего',
        description: 'Рекомендуется развивать когнитивные способности.',
        color: '#ea580c'
      }
    }
  }

  static interpretPercentage(score) {
    if (score >= 80) {
      return {
        emoji: '🎉',
        label: 'Отличный результат!',
        description: 'Ваш результат значительно выше среднего.',
        color: '#10b981'
      }
    } else if (score >= 60) {
      return {
        emoji: '👍',
        label: 'Хороший результат',
        description: 'Ваш результат выше среднего уровня.',
        color: '#f59e0b'
      }
    } else if (score >= 40) {
      return {
        emoji: '👌',
        label: 'Средний результат',
        description: 'Ваш результат соответствует среднему уровню.',
        color: '#ea580c'
      }
    } else {
      return {
        emoji: '💪',
        label: 'Есть над чем работать',
        description: 'Рекомендуется уделить внимание развитию.',
        color: '#dc2626'
      }
    }
  }

  static interpretScale(score) {
    const percentage = Math.round((score / 200) * 100)
    return this.interpretPercentage(percentage)
  }

  static interpretGeneric(score) {
    return {
      emoji: '📊',
      label: 'Результат обработан',
      description: 'Ваш результат успешно рассчитан и сохранен.',
      color: '#6366f1'
    }
  }

  /**
   * Генерирует стандартные рекомендации
   */
  static generateRecommendations(testResult, testType) {
    if (testResult.recommendations) {
      return testResult.recommendations
    }

    switch (testType) {
      case 'stress':
        return this.getStressRecommendations(testResult.score)
      case 'compatibility':
        return this.getCompatibilityRecommendations(testResult)
      case 'depression':
        return this.getDepressionRecommendations(testResult.score)
      default:
        return []
    }
  }

  static getStressRecommendations(score) {
    if (score <= 12) {
      return [
        'Продолжайте поддерживать здоровый образ жизни',
        'Развивайте навыки стрессоустойчивости для профилактики',
        'Поддерживайте социальные связи'
      ]
    } else if (score <= 25) {
      return [
        'Изучите техники релаксации (дыхательные упражнения, медитация)',
        'Улучшите качество сна - ложитесь спать в одно время',
        'Добавьте в распорядок регулярные физические упражнения'
      ]
    } else if (score <= 40) {
      return [
        'Рассмотрите возможность снижения нагрузки',
        'Обратитесь за поддержкой к близким людям',
        'Рассмотрите консультацию с психологом'
      ]
    } else {
      return [
        'ОБЯЗАТЕЛЬНО обратитесь к специалисту',
        'Рассмотрите временное снижение рабочей нагрузки',
        'Активируйте всю доступную социальную поддержку'
      ]
    }
  }

  static getCompatibilityRecommendations(testResult) {
    const recommendations = []
    
    if (testResult.score < 60) {
      recommendations.push('Работайте над развитием эмоционального интеллекта')
      recommendations.push('Улучшайте навыки коммуникации')
    }
    
    if (testResult.selectedTraits?.length < 5) {
      recommendations.push('Развивайте уверенность в себе')
    }
    
    recommendations.push('Помните: важно быть собой в отношениях')
    
    return recommendations
  }

  static getDepressionRecommendations(score) {
    if (score <= 10) {
      return ['Поддерживайте текущий образ жизни']
    } else if (score <= 20) {
      return [
        'Уделите внимание физической активности',
        'Поддерживайте социальные связи',
        'Соблюдайте режим сна'
      ]
    } else {
      return [
        'Обратитесь к психологу или психотерапевту',
        'Рассмотрите возможность групповой терапии',
        'Не оставайтесь наедине со своими переживаниями'
      ]
    }
  }
}