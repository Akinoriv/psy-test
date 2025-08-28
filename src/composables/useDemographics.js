import { computed } from 'vue'
import { useUserStore } from '../stores/userStore.js'

export function useDemographics() {
  const userStore = useUserStore()

  // Получение демографических данных пользователя
  const getUserDemographics = () => {
    const user = userStore.user
    if (!user) return { age: '26-35', gender: 'other' }

    // Определяем возрастную группу
    let ageGroup = '26-35'
    if (user.age <= 25) ageGroup = '18-25'
    else if (user.age <= 35) ageGroup = '26-35'
    else if (user.age <= 45) ageGroup = '36-45'
    else if (user.age <= 55) ageGroup = '46-55'
    else ageGroup = '56+'

    return {
      age: ageGroup,
      gender: user.gender || 'other',
      rawAge: user.age,
      occupation: user.occupation,
    }
  }

  // Генерация персонализированных заметок
  const generatePersonalizedNotes = (score, demographics, testData) => {
    if (!testData?.resultCalculation?.demographicModifiers) return []

    const notes = []
    const modifiers = testData.resultCalculation.demographicModifiers

    // Возрастные заметки
    const ageInfo = modifiers.age?.[demographics.age]
    if (ageInfo?.note) {
      notes.push(`Возрастные особенности: ${ageInfo.note}`)
    }

    // Гендерные заметки
    const genderInfo = modifiers.gender?.[demographics.gender]
    if (genderInfo?.note) {
      notes.push(`Индивидуальные особенности: ${genderInfo.note}`)
    }

    if (genderInfo?.specificRisks?.length > 0) {
      notes.push(`Факторы риска: ${genderInfo.specificRisks.join(', ')}`)
    }

    // Дополнительные заметки по профессии
    if (demographics.occupation) {
      const occupationNotes = getOccupationNotes(demographics.occupation, score)
      notes.push(...occupationNotes)
    }

    return notes
  }

  // Заметки по профессиям
  const getOccupationNotes = (occupation, score) => {
    const notes = []
    const occupationLower = occupation.toLowerCase()

    const occupationMap = {
      врач: 'Медицинские работники часто подвержены эмоциональному выгоранию',
      учитель: 'Педагогическая деятельность связана с высоким эмоциональным напряжением',
      программист: 'IT-специалисты склонны к переработкам и социальной изоляции',
      менеджер: 'Управленческие позиции связаны с высокой ответственностью',
      студент: 'Учебный процесс может создавать специфические стрессоры',
    }

    for (const [key, note] of Object.entries(occupationMap)) {
      if (occupationLower.includes(key)) {
        notes.push(`Профессиональные факторы: ${note}`)
        break
      }
    }

    return notes
  }

  // Получение демографических модификаторов
  const getDemographicModifiers = (demographics, testData) => {
    if (!testData?.resultCalculation?.demographicModifiers) {
      return { age: 1, gender: 1 }
    }

    const modifiers = testData.resultCalculation.demographicModifiers
    const ageMultiplier = modifiers.age?.[demographics.age]?.multiplier || 1
    const genderMultiplier = modifiers.gender?.[demographics.gender]?.multiplier || 1

    return {
      age: ageMultiplier,
      gender: genderMultiplier,
      combined: ageMultiplier * genderMultiplier,
    }
  }

  // Получение возрастных рекомендаций
  const getAgeSpecificRecommendations = (ageGroup) => {
    const recommendations = {
      '18-25': [
        'Изучите техники управления учебным и социальным стрессом',
        'Развивайте навыки планирования и тайм-менеджмента',
        'Не стесняйтесь обращаться за помощью к старшим',
        'Поддерживайте здоровый режим сна и питания',
      ],
      '26-35': [
        'Найдите баланс между карьерой и личной жизнью',
        'Инвестируйте в долгосрочные отношения и хобби',
        'Изучите техники управления рабочим стрессом',
        'Создайте финансовую подушку безопасности',
      ],
      '36-45': [
        'Уделите внимание профилактике профессионального выгорания',
        'Регулярно проводите время с семьей без работы',
        'Рассмотрите возможность смены приоритетов',
        'Инвестируйте в свое здоровье и физическую форму',
      ],
      '46-55': [
        'Подготовьтесь к изменениям в карьере и здоровье',
        'Развивайте новые интересы и хобби',
        'Уделите внимание поддержанию физической формы',
        'Планируйте пенсионные накопления',
      ],
      '56+': [
        'Сосредоточьтесь на поддержании социальных связей',
        'Найдите новые источники смысла и удовлетворения',
        'Следите за здоровьем и активностью',
        'Передавайте опыт молодому поколению',
      ],
    }

    return recommendations[ageGroup] || []
  }

  // Получение гендерных рекомендаций
  const getGenderSpecificRecommendations = (gender) => {
    const recommendations = {
      female: [
        'Не игнорируйте гормональные факторы стресса',
        'Практикуйте здоровые границы в отношениях',
        'Уделите время заботе о себе',
        'Не стесняйтесь просить о помощи в домашних делах',
      ],
      male: [
        'Не стесняйтесь выражать эмоции и просить о помощи',
        'Найдите здоровые способы снятия рабочего напряжения',
        'Развивайте эмоциональный интеллект',
        'Поддерживайте дружеские отношения',
      ],
      other: [
        'Найдите поддерживающее сообщество',
        'Работайте с психологом над вопросами идентичности',
        'Защищайте свои границы от дискриминации',
        'Используйте онлайн-ресурсы для поддержки',
      ],
    }

    return recommendations[gender] || []
  }

  return {
    getUserDemographics,
    generatePersonalizedNotes,
    getDemographicModifiers,
    getAgeSpecificRecommendations,
    getGenderSpecificRecommendations,
  }
}
