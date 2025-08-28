// src/tests/stress-burnout/interpreter.js
export default class StressInterpreter {
  constructor() {
    this.ranges = {
      minimal: { 
        min: 0, max: 12, 
        level: 'minimal',
        label: 'Минимальный уровень стресса',
        color: '#10b981',
        description: 'Ваш уровень стресса находится в норме. Вы хорошо справляетесь с жизненными вызовами.'
      },
      mild: { 
        min: 13, max: 25, 
        level: 'mild',
        label: 'Легкий уровень стресса',
        color: '#f59e0b',
        description: 'У вас есть некоторые признаки стресса, но они пока не критичны. Стоит обратить внимание на профилактику.'
      },
      moderate: { 
        min: 26, max: 40, 
        level: 'moderate',
        label: 'Умеренный уровень стресса',
        color: '#ea580c',
        description: 'Стресс начинает серьезно влиять на вашу жизнь. Рекомендуется принять активные меры.'
      },
      high: { 
        min: 41, max: 55, 
        level: 'high',
        label: 'Высокий уровень стресса',
        color: '#dc2626',
        description: 'Вы находитесь в состоянии значительного стресса, который требует немедленного внимания.'
      },
      critical: { 
        min: 56, max: 100, 
        level: 'critical',
        label: 'Критический уровень стресса',
        color: '#991b1b',
        description: 'Критически высокий уровень стресса. Настоятельно рекомендуется обратиться к специалисту.'
      }
    }
    
    this.recommendations = {
      minimal: [
        'Продолжайте поддерживать здоровый образ жизни',
        'Развивайте навыки стрессоустойчивости для профилактики',
        'Поддерживайте социальные связи',
        'Занимайтесь любимыми хобби'
      ],
      mild: [
        'Изучите техники релаксации (дыхательные упражнения, медитация)',
        'Улучшите качество сна - ложитесь спать в одно время',
        'Добавьте в распорядок регулярные физические упражнения',
        'Практикуйте осознанность в повседневной жизни',
        'Научитесь говорить "нет" избыточным обязательствам'
      ],
      moderate: [
        'Рассмотрите возможность снижения нагрузки или перераспределения обязанностей',
        'Обратитесь за поддержкой к близким людям',
        'Начните вести дневник стресса для выявления триггеров',
        'Изучите техники управления временем',
        'Рассмотрите консультацию с психологом для развития копинг-стратегий'
      ],
      high: [
        'Обязательно обратитесь к специалисту (психологу или психотерапевту)',
        'Рассмотрите временное снижение рабочей нагрузки',
        'Не принимайте важных жизненных решений в состоянии стресса',
        'Создайте поддерживающую среду дома и на работе',
        'При необходимости рассмотрите медикаментозную поддержку с врачом'
      ],
      critical: [
        'НЕМЕДЛЕННО обратитесь к специалисту - это приоритет номер один',
        'Рассмотрите временный отпуск или больничный',
        'Активируйте всю доступную социальную поддержку',
        'Не оставайтесь один на один с проблемами',
        'При мыслях о самоповреждении - обращайтесь на горячую линию психологической помощи'
      ]
    }
  }
  
  interpret(score) {
    console.log(`📊 Interpreting score: ${score}`)
    
    const range = this.getRange(score)
    
    const result = {
      score,
      level: range.level,
      label: range.label,
      color: range.color,
      description: range.description,
      range: { min: range.min, max: range.max },
      recommendations: this.recommendations[range.level] || []
    }
    
    console.log(`📊 Result: ${range.label} (${range.level})`)
    
    return result
  }
  
  generatePersonalizedNotes(score, demographics) {
    console.log('📝 Generating personalized notes...')
    
    const notes = []
    
    // Возрастные особенности
    const ageNotes = this.getAgeNotes(demographics.age)
    if (ageNotes) {
      notes.push(`Возрастные особенности: ${ageNotes}`)
    }
    
    // Гендерные особенности
    const genderNotes = this.getGenderNotes(demographics.gender)
    if (genderNotes) {
      notes.push(`Индивидуальные особенности: ${genderNotes}`)
    }
    
    // Профессиональные факторы
    if (demographics.occupation) {
      const occupationNotes = this.getOccupationNotes(demographics.occupation)
      if (occupationNotes) {
        notes.push(occupationNotes)
      }
    }
    
    console.log(`📝 Generated ${notes.length} personalized notes`)
    
    return notes
  }
  
  getRange(score) {
    for (const range of Object.values(this.ranges)) {
      if (score >= range.min && score <= range.max) {
        return range
      }
    }
    return this.ranges.moderate // По умолчанию
  }
  
  getAgeNotes(ageGroup) {
    const notes = {
      '18-25': 'Молодой возраст часто связан с адаптационным стрессом',
      '26-35': 'Период активного карьерного роста и создания семьи',
      '36-45': 'Пиковый период жизненных нагрузок',
      '46-55': 'Период переосмысления приоритетов',
      '56+': 'Более стабильный жизненный этап'
    }
    return notes[ageGroup]
  }
  
  getGenderNotes(gender) {
    const notes = {
      'female': 'Женщины чаще испытывают эмоциональный стресс',
      'male': 'Мужчины реже признают стресс, но чаще подвержены рабочему выгоранию',
      'other': 'Дополнительные социальные стрессоры'
    }
    return notes[gender]
  }
  
  getOccupationNotes(occupation) {
    const occupationMap = {
      'врач': 'Медицинские работники часто подвержены эмоциональному выгоранию',
      'учитель': 'Педагогическая деятельность связана с высоким эмоциональным напряжением',
      'программист': 'IT-специалисты склонны к переработкам и социальной изоляции',
      'менеджер': 'Управленческие позиции связаны с высокой ответственностью',
      'студент': 'Учебный процесс может создавать специфические стрессоры'
    }
    
    const occupationLower = occupation.toLowerCase()
    for (const [key, note] of Object.entries(occupationMap)) {
      if (occupationLower.includes(key)) {
        return `Профессиональные факторы: ${note}`
      }
    }
    
    return null
  }
}