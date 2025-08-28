<template>
  <div class="result-page" v-if="testResult">
    <!-- Существующий header остается без изменений -->
    <header class="result-page__header">
      <div class="result-page__header-content">
        <button @click="goToDashboard" class="result-page__back-button">← К тестам</button>
        <h1 class="result-page__title">Результаты теста</h1>
      </div>
    </header>

    <main class="result-page__main">
      <div class="result-page__container">
        <!-- Основной результат с улучшенной визуализацией -->
        <div class="result-page__main-result">
          <div class="result-page__test-info">
            <h2 class="result-page__test-title">{{ testInfo?.title }}</h2>
            <div class="result-page__completion-info">
              <div class="result-page__completion-item">
                ⏱️ Завершен: {{ formattedCompletionDate }}
              </div>
              <div class="result-page__completion-item">
                📝 Отвечено на {{ testResult.questionCount }} вопросов
              </div>
            </div>
          </div>

          <div class="result-page__score-section">
            <div class="result-page__score-card" :class="scoreCardClass">
              <div class="result-page__score-badge">
                <div class="result-page__score-value">{{ testResult.score }}</div>
                <div class="result-page__score-label">баллов</div>
              </div>
              <div class="result-page__score-interpretation">
                <h3 class="result-page__interpretation-title">{{ interpretationResult.label }}</h3>
                <div class="result-page__score-range">
                  Диапазон: {{ interpretationResult.range.min }} -
                  {{ interpretationResult.range.max }} баллов
                </div>
                <p class="result-page__risk-description">{{ getRiskDescription }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Новая секция: Демографический анализ -->
        <div class="result-page__demographic-analysis" v-if="demographicAnalysis">
          <h3 class="result-page__section-title">👤 Персональный анализ</h3>

          <div class="result-page__demographic-grid">
            <div class="result-page__demographic-card">
              <h4>Возрастные особенности</h4>
              <p>{{ demographicAnalysis.age.info.note }}</p>
            </div>
            <div class="result-page__demographic-card">
              <h4>Индивидуальные факторы</h4>
              <p>{{ demographicAnalysis.gender.info.note }}</p>
            </div>
          </div>

          <div v-if="personalizedNotes.length > 0" class="result-page__personal-notes">
            <h4>Персональные заметки:</h4>
            <ul>
              <li v-for="note in personalizedNotes" :key="note">{{ note }}</li>
            </ul>
          </div>
        </div>

        <!-- Основные рекомендации -->
        <div class="result-page__recommendations">
          <h3 class="result-page__section-title">💡 Основные рекомендации</h3>

          <div class="result-page__recommendations-list">
            <div
              v-for="(recommendation, index) in interpretationResult.recommendations"
              :key="index"
              class="result-page__recommendation-item"
            >
              <div class="result-page__recommendation-icon">✓</div>
              <div class="result-page__recommendation-text">{{ recommendation }}</div>
            </div>
          </div>
        </div>

        <!-- Персонализированные рекомендации -->
        <div
          class="result-page__personal-recommendations"
          v-if="getDemographicRecommendations.length > 0"
        >
          <div v-for="recGroup in getDemographicRecommendations" :key="recGroup.title">
            <h3 class="result-page__section-title">🎯 {{ recGroup.title }}</h3>
            <div class="result-page__recommendations-list">
              <div
                v-for="(item, index) in recGroup.items"
                :key="index"
                class="result-page__recommendation-item"
              >
                <div class="result-page__recommendation-icon">→</div>
                <div class="result-page__recommendation-text">{{ item }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Остальные секции остаются без изменений -->
        <!-- Детальный анализ, действия, другие тесты -->
      </div>
    </main>
  </div>

  <div v-else class="result-page__loading">
    <div class="result-page__spinner"></div>
    <p>Загрузка результатов...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import { stressBurnoutTest } from '../data/stressTest.js'
import BaseButton from '../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const testStore = useTestStore()

const testResult = ref(null)
const testData = ref(null)
const showDetailedAnalysis = ref(false)

const testInfo = computed(() => {
  return testStore.getTestById(route.params.testId)
})

const formattedCompletionDate = computed(() => {
  if (!testResult.value?.completedAt) return 'Неизвестно'
  return new Date(testResult.value.completedAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Интерпретация результатов с учетом демографии
const interpretationResult = computed(() => {
  if (!testData.value?.resultCalculation || !testResult.value) {
    return {
      label: 'Результат',
      range: { min: 0, max: 100 },
      recommendations: [],
      color: '#6b7280',
      description: 'Данные не найдены',
    }
  }

  const score = testResult.value.score
  const ranges = testData.value.resultCalculation.ranges
  const recommendations = testData.value.resultCalculation.recommendations

  // Находим подходящий диапазон
  for (const [key, range] of Object.entries(ranges)) {
    if (score >= range.min && score <= range.max) {
      return {
        label: range.label,
        range: range,
        color: range.color,
        description: range.description,
        recommendations: recommendations[key] || [],
        level: key,
      }
    }
  }

  // Fallback
  return {
    label: ranges.moderate?.label || 'Результат',
    range: ranges.moderate || { min: 0, max: 100 },
    color: ranges.moderate?.color || '#6b7280',
    description: ranges.moderate?.description || '',
    recommendations: recommendations.moderate || [],
    level: 'moderate',
  }
})

// Демографический анализ
const demographicAnalysis = computed(() => {
  if (!testResult.value?.demographics || !testData.value?.resultCalculation?.demographicModifiers) {
    return null
  }

  const demographics = testResult.value.demographics
  const modifiers = testData.value.resultCalculation.demographicModifiers

  return {
    age: {
      group: demographics.age,
      info: modifiers.age[demographics.age] || {
        multiplier: 1,
        note: 'Стандартная возрастная группа',
      },
    },
    gender: {
      type: demographics.gender,
      info: modifiers.gender[demographics.gender] || { multiplier: 1, note: 'Стандартная группа' },
    },
  }
})

// Персонализированные заметки
const personalizedNotes = computed(() => {
  return testResult.value?.personalizedNotes || []
})

// CSS класс для карточки результата
const scoreCardClass = computed(() => {
  const level = interpretationResult.value.level
  return `result-page__score-card--${level}`
})

// Форматирование ответа для отображения
const formatAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.length > 0 ? answer.join(', ') : 'Не выбрано'
  }
  if (typeof answer === 'number') {
    return `${answer} из 10`
  }
  return answer?.toString() || 'Нет ответа'
}

// Получение описания уровня риска
const getRiskDescription = computed(() => {
  const level = interpretationResult.value.level
  const score = testResult.value?.score || 0

  const riskDescriptions = {
    minimal: 'Отличный результат! Вы демонстрируете здоровые механизмы совладания со стрессом.',
    mild: 'Легкий стресс - это нормально. Главное не позволить ему накапливаться.',
    moderate: 'Стресс начинает влиять на качество жизни. Пора принять активные меры.',
    high: 'Высокий уровень стресса требует серьезного внимания к своему состоянию.',
    critical: 'Критическая ситуация. Необходима профессиональная помощь.',
  }

  return riskDescriptions[level] || 'Результат в пределах нормы.'
})

// Рекомендации по возрасту и полу
const getDemographicRecommendations = computed(() => {
  if (!demographicAnalysis.value) return []

  const recommendations = []
  const age = demographicAnalysis.value.age.group
  const gender = demographicAnalysis.value.gender.type

  // Возрастные рекомендации
  const ageRecommendations = {
    '18-25': [
      'Изучите техники управления учебным и социальным стрессом',
      'Развивайте навыки планирования и тайм-менеджмента',
      'Не стесняйтесь обращаться за помощью к старшим',
    ],
    '26-35': [
      'Найдите баланс между карьерой и личной жизнью',
      'Инвестируйте в долгосрочные отношения и хобби',
      'Изучите техники управления рабочим стрессом',
    ],
    '36-45': [
      'Уделите внимание профилактике профессионального выгорания',
      'Регулярно проводите время с семьей без работы',
      'Рассмотрите возможность смены приоритетов',
    ],
    '46-55': [
      'Подготовьтесь к изменениям в карьере и здоровье',
      'Развивайте новые интересы и хобби',
      'Уделите внимание поддержанию физической формы',
    ],
    '56+': [
      'Сосредоточьтесь на поддержании социальных связей',
      'Найдите новые источники смысла и удовлетворения',
      'Следите за здоровьем и активностью',
    ],
  }

  // Гендерные рекомендации
  const genderRecommendations = {
    female: [
      'Не игнорируйте гормональные факторы стресса',
      'Практикуйте здоровые границы в отношениях',
      'Уделите время заботе о себе',
    ],
    male: [
      'Не стесняйтесь выражать эмоции и просить о помощи',
      'Найдите здоровые способы снятия рабочего напряжения',
      'Развивайте эмоциональный интеллект',
    ],
    other: [
      'Найдите поддерживающее сообщество',
      'Работайте с психологом над вопросами идентичности',
      'Защищайте свои границы от дискриминации',
    ],
  }

  if (ageRecommendations[age]) {
    recommendations.push({
      title: 'Возрастные рекомендации',
      items: ageRecommendations[age],
    })
  }

  if (genderRecommendations[gender]) {
    recommendations.push({
      title: 'Персональные рекомендации',
      items: genderRecommendations[gender],
    })
  }

  return recommendations
})

// ... остальные функции остаются без изменений

// В template добавляем секцию демографического анализа
</script>

<style scoped>
/* Дополнительные стили для новых секций */
.result-page__demographic-analysis,
.result-page__personal-recommendations {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.result-page__demographic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.result-page__demographic-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.result-page__demographic-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.result-page__demographic-card p {
  font-size: 13px;
  color: #475569;
  margin: 0;
  line-height: 1.4;
}

.result-page__personal-notes {
  background: #fef7cd;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.result-page__personal-notes h4 {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 8px 0;
}

.result-page__personal-notes ul {
  margin: 0;
  padding-left: 20px;
  color: #78350f;
}

.result-page__personal-notes li {
  font-size: 13px;
  margin-bottom: 4px;
}

.result-page__risk-description {
  font-size: 14px;
  color: #4b5563;
  margin: 8px 0 0 0;
  line-height: 1.4;
}

/* Цветовые схемы для разных уровней стресса */
.result-page__score-card--minimal {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.result-page__score-card--mild {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
}

.result-page__score-card--moderate {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border: 2px solid #ea580c;
}

.result-page__score-card--high {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border: 2px solid #dc2626;
}

.result-page__score-card--critical {
  background: linear-gradient(135deg, #fecdd3 0%, #fda4af 100%);
  border: 2px solid #991b1b;
}
</style>
