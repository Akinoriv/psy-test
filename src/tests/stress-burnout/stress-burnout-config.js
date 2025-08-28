// src/tests/stress-burnout/config.js
export default {
  id: 'stress-burnout',
  title: 'Комплексный тест на стресс и эмоциональное состояние',
  description: 'Профессиональный психологический тест, который адаптируется под ваши ответы, пол и возраст. Поможет точно оценить уровень стресса и получить персональные рекомендации.',
  version: '1.2.0',
  category: 'Стресс и эмоциональное состояние',
  estimatedTime: '10-15 минут',
  tags: ['стресс', 'выгорание', 'эмоции'],
  
  // Начальные вопросы - всегда показываются
  initialQuestions: [
    {
      id: 'general_stress',
      type: 'scale',
      question: 'Как бы вы оценили общий уровень стресса в вашей жизни за последний месяц?',
      scale: {
        min: 1,
        max: 10,
        labels: { 1: 'Очень низкий', 10: 'Критически высокий' }
      },
      conditions: {
        low_stress: { max: 3, nextFlow: 'low_stress_flow' },
        moderate_stress: { min: 4, max: 6, nextFlow: 'moderate_stress_flow' },
        high_stress: { min: 7, nextFlow: 'high_stress_flow' }
      }
    }
  ],

  questionFlows: {
    // Поток для низкого стресса (1-3 балла)
    low_stress_flow: [
      {
        id: 'energy_level',
        type: 'single',
        question: 'Как вы оцениваете свой уровень энергии в течение дня?',
        options: [
          { value: 'high', label: 'Высокий, чувствую себя бодро', stress: 0 },
          { value: 'stable', label: 'Стабильный, без резких спадов', stress: 1 },
          { value: 'variable', label: 'Переменный, бывают спады', stress: 2 },
          { value: 'low', label: 'Низкий, часто чувствую усталость', stress: 3 }
        ]
      },
      {
        id: 'sleep_quality_low',
        type: 'single',
        question: 'Как вы спите последнее время?',
        options: [
          { value: 'excellent', label: 'Отлично, высыпаюсь', stress: 0 },
          { value: 'good', label: 'Хорошо, иногда просыпаюсь', stress: 1 },
          { value: 'poor', label: 'Плохо, часто не могу заснуть', stress: 3 },
          { value: 'very_poor', label: 'Очень плохо, постоянная бессонница', stress: 4 }
        ]
      }
    ],

    // Поток для умеренного стресса (4-6 баллов)
    moderate_stress_flow: [
      {
        id: 'stress_sources',
        type: 'multiple',
        question: 'Что является основными источниками стресса в вашей жизни? (выберите все подходящие)',
        options: [
          { value: 'work', label: 'Работа или учеба', weight: 2 },
          { value: 'relationships', label: 'Отношения с людьми', weight: 2 },
          { value: 'finances', label: 'Финансовые проблемы', weight: 3 },
          { value: 'health', label: 'Проблемы со здоровьем', weight: 3 },
          { value: 'family', label: 'Семейные проблемы', weight: 2 },
          { value: 'future', label: 'Неопределенность будущего', weight: 2 }
        ]
      },
      {
        id: 'coping_strategies',
        type: 'single',
        question: 'Какой способ справления со стрессом вы чаще всего используете?',
        options: [
          { value: 'healthy_active', label: 'Спорт, прогулки, активный отдых', stress: -2 },
          { value: 'healthy_passive', label: 'Медитация, чтение, музыка', stress: -1 },
          { value: 'social', label: 'Общение с друзьями, семьей', stress: -1 },
          { value: 'avoidance', label: 'Избегание проблем, откладывание дел', stress: 2 },
          { value: 'unhealthy', label: 'Алкоголь, переедание, курение', stress: 4 }
        ]
      },
      {
        id: 'physical_symptoms',
        type: 'multiple',
        question: 'Какие физические симптомы стресса вы замечали у себя за последние недели?',
        options: [
          { value: 'headaches', label: 'Головные боли', weight: 2 },
          { value: 'tension', label: 'Мышечное напряжение', weight: 2 },
          { value: 'stomach', label: 'Проблемы с желудком', weight: 2 },
          { value: 'fatigue', label: 'Быстрая утомляемость', weight: 3 },
          { value: 'sleep', label: 'Нарушения сна', weight: 3 },
          { value: 'appetite', label: 'Изменения аппетита', weight: 2 },
          { value: 'none', label: 'Никаких симптомов не замечаю', weight: -2 }
        ]
      }
    ],

    // Поток для высокого стресса (7-10 баллов)
    high_stress_flow: [
      {
        id: 'stress_duration',
        type: 'single',
        question: 'Как долго вы находитесь в состоянии повышенного стресса?',
        options: [
          { value: 'recent', label: 'Последние несколько дней', stress: 2 },
          { value: 'weeks', label: 'Последние несколько недель', stress: 3 },
          { value: 'months', label: 'Несколько месяцев', stress: 4 },
          { value: 'long_term', label: 'Больше года', stress: 5 }
        ]
      },
      {
        id: 'emotional_symptoms',
        type: 'multiple',
        question: 'Какие эмоциональные симптомы вы испытываете? (выберите все подходящие)',
        options: [
          { value: 'anxiety', label: 'Тревожность, беспокойство', weight: 3 },
          { value: 'irritability', label: 'Раздражительность, вспыльчивость', weight: 3 },
          { value: 'sadness', label: 'Грусть, уныние', weight: 3 },
          { value: 'overwhelm', label: 'Ощущение подавленности', weight: 4 },
          { value: 'hopelessness', label: 'Чувство безнадежности', weight: 5 },
          { value: 'panic', label: 'Панические атаки', weight: 5 }
        ]
      },
      {
        id: 'concentration',
        type: 'scale',
        question: 'Как влияет стресс на вашу способность концентрироваться?',
        scale: {
          min: 1,
          max: 10,
          labels: { 1: 'Не влияет совсем', 10: 'Полностью лишает концентрации' }
        }
      }
    ]
  }
}