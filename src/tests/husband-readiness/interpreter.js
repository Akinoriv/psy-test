// src/tests/husband-readiness/interpreter.js
export default class HusbandReadinessInterpreter {
  constructor() {
    this.ranges = {
      perfect: {
        min: 300,
        level: 'perfect',
        label: 'Идеальный муженёк!',
        emoji: '💯',
        color: '#4caf50',
        description: 'Можно сразу к ЗАГСу бежать! Ты практически идеален для меня!',
        probability: 99,
      },
      excellent: {
        min: 250,
        level: 'excellent',
        label: 'Отличный кандидат!',
        emoji: '💖',
        color: '#8bc34a',
        description: 'Мама будет в восторге! У нас есть все шансы на счастливые отношения!',
        probability: 85,
      },
      good: {
        min: 200,
        level: 'good',
        label: 'Хороший потенциал!',
        emoji: '💕',
        color: '#ff9800',
        description: 'Есть над чем работать, но перспективы отличные! Главное желание развиваться!',
        probability: 70,
      },
      mixed: {
        min: 150,
        level: 'mixed',
        label: 'Есть и плюсы, и минусы',
        emoji: '🤔',
        color: '#ff5722',
        description: 'Может, стоит подумать? Некоторые вещи можно исправить, но не все...',
        probability: 45,
      },
      challenging: {
        min: 100,
        level: 'challenging',
        label: 'Нужно сильно постараться!',
        emoji: '😅',
        color: '#f44336',
        description: 'Или найти кого похуже... Но если действительно хочешь - работай над собой!',
        probability: 25,
      },
      friends: {
        min: 50,
        level: 'friends',
        label: 'Лучше остаться друзьями',
        emoji: '😬',
        color: '#e91e63',
        description: 'Серьёзно. Дружба - это тоже прекрасно, не стоит всё усложнять.',
        probability: 10,
      },
      runaway: {
        min: 0,
        level: 'runaway',
        label: 'RUN, FOREST, RUN!',
        emoji: '🚩',
        color: '#d32f2f',
        description: 'Это красные флаги размером с парус! Беги, пока можешь!',
        probability: 1,
      },
    }

    this.recommendations = {
      perfect: [
        'Продолжай быть таким замечательным!',
        'Предлагай романтические свидания',
        'Думай о совместном будущем',
        'Знакомься с моими родителями',
      ],
      excellent: [
        'Работай над мелкими недостатками',
        'Проявляй больше заботы и внимания',
        'Планируй совместные путешествия',
        'Изучай мои интересы и увлечения',
      ],
      good: [
        'Развивай эмоциональный интеллект',
        'Работай над стабильностью в отношениях',
        'Больше общения о планах на будущее',
        'Участвуй в моих интересах',
      ],
      mixed: [
        'Серьезно подумай о своих приоритетах',
        'Работай над негативными чертами характера',
        'Больше времени уделяй отношениям',
        'Подумай о личностном росте',
      ],
      challenging: [
        'Кардинально пересмотри свой подход к отношениям',
        'Работай с психологом над личными проблемами',
        'Развивай ответственность и зрелость',
        'Учись быть надежным партнером',
      ],
      friends: [
        'Сосредоточься на дружбе, она тоже ценна',
        'Работай над собой как личностью',
        'Найди того, кто подходит тебе больше',
        'Не принимай это близко к сердцу',
      ],
      runaway: [
        'Серьезно пересмотри свою жизнь',
        'Обратись к специалистам за помощью',
        'Работай над базовыми человеческими качествами',
        'Возможно, тебе нужно время на себя',
      ],
    }
  }

  interpret(score, requiredTraitsCount = 0, hasMinimumRequired = false) {
    console.log(`💕 Interpreting husband readiness score: ${score}`)

    // Определяем диапазон результата
    let range = this.ranges.runaway // по умолчанию

    for (const rangeKey of Object.keys(this.ranges)) {
      const rangeData = this.ranges[rangeKey]
      if (score >= rangeData.min) {
        range = rangeData
        break
      }
    }

    // Если не хватает обязательных качеств, понижаем результат
    if (!hasMinimumRequired && range.level !== 'runaway') {
      console.log(`⚠️ Not enough required traits (${requiredTraitsCount}/6), downgrading result`)

      // Переводим в более низкий уровень
      const levels = ['perfect', 'excellent', 'good', 'mixed', 'challenging', 'friends', 'runaway']
      const currentIndex = levels.indexOf(range.level)
      const newIndex = Math.min(currentIndex + 2, levels.length - 1) // понижаем на 2 уровня
      const newLevel = levels[newIndex]
      range = this.ranges[newLevel]
    }

    const result = {
      score,
      level: range.level,
      label: range.label,
      emoji: range.emoji,
      color: range.color,
      description: range.description,
      probability: range.probability,
      range: { min: range.min, max: range.min + 49 }, // примерный диапазон
      recommendations: this.recommendations[range.level] || [],
      requiredTraitsCount,
      hasMinimumRequired,
    }

    console.log(`💕 Result: ${range.emoji} ${range.label} (${range.probability}% вероятность)`)

    return result
  }

  generatePersonalizedNotes(score, selectedTraits, hasMinimumRequired) {
    console.log('💌 Generating personalized notes...')

    const notes = []

    // Заметки по обязательным качествам
    if (!hasMinimumRequired) {
      notes.push('❗ Не хватает обязательных качеств для серьезных отношений')
    } else {
      notes.push('✅ Все основные требования выполнены!')
    }

    // Анализ положительных качеств
    if (selectedTraits.positive) {
      const highValueTraits = selectedTraits.positive.filter((trait) => trait.weight >= 25)
      if (highValueTraits.length > 0) {
        notes.push(`🌟 Особенно ценные качества: ${highValueTraits.map((t) => t.label).join(', ')}`)
      }

      const requiredTraits = selectedTraits.positive.filter((trait) => trait.required)
      if (requiredTraits.length > 0) {
        notes.push(
          `⭐ Обязательные качества в наличии: ${requiredTraits.map((t) => t.label).join(', ')}`,
        )
      }
    }

    // Анализ негативных качеств
    if (selectedTraits.negative && selectedTraits.negative.length > 0) {
      const criticalNegatives = selectedTraits.negative.filter((trait) => trait.weight <= -40)
      if (criticalNegatives.length > 0) {
        notes.push(`🚩 Критические проблемы: ${criticalNegatives.map((t) => t.label).join(', ')}`)
      }

      const minorNegatives = selectedTraits.negative.filter((trait) => trait.weight > -25)
      if (minorNegatives.length > 0) {
        notes.push(`⚠️ Мелкие недостатки: ${minorNegatives.map((t) => t.label).join(', ')}`)
      }
    } else {
      notes.push('😇 Никаких негативных качеств не выявлено (или скрываешь?)')
    }

    // Общий совет по баллам
    if (score >= 250) {
      notes.push('💍 Готов к предложению руки и сердца!')
    } else if (score >= 150) {
      notes.push('💪 Есть потенциал, продолжай работать над собой!')
    } else if (score >= 50) {
      notes.push('🤝 Может, начнем с дружбы?')
    } else {
      notes.push('🏃‍♂️ Время подумать о смене жизненного курса...')
    }

    console.log(`💌 Generated ${notes.length} personalized notes`)

    return notes
  }

  // Получение забавных комментариев в зависимости от результата
  getFunnyComment(level) {
    const comments = {
      perfect: [
        'Мама, я выхожу замуж! 💒',
        'Наконец-то достойный кандидат!',
        'Где ты был всю мою жизнь?! 😍',
      ],
      excellent: [
        'Почти идеально! Осталось чуть-чуть поработать над собой 💪',
        'Мои подруги будут завидовать! 😏',
        'Кажется, я нашла своего принца! 👑',
      ],
      good: [
        'Неплохо, неплохо... Посмотрим что дальше 🤨',
        'Есть потенциал, но нужно развиваться! 📈',
        'Может быть... если очень постараешься 🤔',
      ],
      mixed: [
        'Хм... 50 на 50. Как повезет! 🎰',
        'То густо, то пусто... Непонятно с тобой 🤷‍♀️',
        'Сложный случай, надо подумать 🧐',
      ],
      challenging: [
        'Ну... если других вариантов нет... 😅',
        'Возможно, в параллельной вселенной мы подходим друг другу 🌌',
        'Надо же, кто-то и такой результат умудрился получить! 😂',
      ],
      friends: [
        'Дружба - это святое! Не будем портить 🤝',
        'Ты хороший, но не для меня... 👋',
        'Лучше синица в руках, чем журавль в небе! (ты синица) 🐦',
      ],
      runaway: [
        'МАМОЧКИ! Что это было?! 😱',
        'Кто-то здесь явно что-то путает... 🤯',
        'Такой результат даже обсуждать не будем! 🙈',
      ],
    }

    const levelComments = comments[level] || comments.runaway
    return levelComments[Math.floor(Math.random() * levelComments.length)]
  }
}
