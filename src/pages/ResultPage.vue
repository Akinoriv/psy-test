<template>
  <div class="result-page" v-if="testResult">
    <!-- Хедер -->
    <header class="result-page__header">
      <div class="result-page__header-content">
        <button @click="goToDashboard" class="result-page__back-button">← К тестам</button>
        <h1 class="result-page__title">Результаты теста</h1>
      </div>
    </header>

    <main class="result-page__main">
      <div class="result-page__container">
        <!-- Основной результат -->
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
                <p class="result-page__risk-description">{{ interpretationResult.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Рекомендации -->
        <div class="result-page__recommendations">
          <h3 class="result-page__section-title">💡 Рекомендации</h3>

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

        <!-- Демографический анализ -->
        <div class="result-page__demographic-analysis" v-if="testResult.demographics">
          <h3 class="result-page__section-title">👤 Персональный анализ</h3>

          <div class="result-page__demographic-info">
            <div class="result-page__demographic-item">
              <strong>Возрастная группа:</strong> {{ testResult.demographics.age }}
            </div>
            <div class="result-page__demographic-item">
              <strong>Группа:</strong> {{ testResult.demographics.gender }}
            </div>
          </div>

          <div v-if="testResult.personalizedNotes?.length > 0" class="result-page__personal-notes">
            <h4>Персональные заметки:</h4>
            <ul>
              <li v-for="note in testResult.personalizedNotes" :key="note">{{ note }}</li>
            </ul>
          </div>
        </div>

        <!-- Действия -->
        <div class="result-page__actions">
          <button
            @click="goToDashboard"
            class="result-page__action-button result-page__action-button--primary"
          >
            Вернуться к тестам
          </button>
          <button
            @click="retakeTest"
            class="result-page__action-button result-page__action-button--secondary"
          >
            Пройти тест заново
          </button>
        </div>
      </div>
    </main>
  </div>

  <!-- Состояние загрузки -->
  <div v-else-if="isLoading" class="result-page__loading">
    <div class="result-page__spinner"></div>
    <p>Загрузка результатов...</p>
  </div>

  <!-- Ошибка -->
  <div v-else class="result-page__error">
    <div class="result-page__error-content">
      <h2>Результаты не найдены</h2>
      <p>Не удалось загрузить результаты теста. Возможно, результат не был сохранен.</p>
      <button
        @click="goToDashboard"
        class="result-page__action-button result-page__action-button--primary"
      >
        Вернуться к тестам
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import { getResultInterpretation } from '../utils/testUtils.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const testStore = useTestStore()

const testResult = ref(null)
const isLoading = ref(true)

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

// ИСПРАВЛЕНО: Интерпретация результатов
const interpretationResult = computed(() => {
  if (!testResult.value) {
    return {
      label: 'Результат',
      range: { min: 0, max: 100 },
      recommendations: [],
      color: '#6b7280',
      description: 'Данные не найдены',
    }
  }

  // Используем данные теста для интерпретации
  const testData = getTestDataForResults()
  if (!testData) {
    return {
      label: 'Результат',
      range: { min: 0, max: 100 },
      recommendations: [],
      color: '#6b7280',
      description: 'Не удалось загрузить данные теста',
    }
  }

  return getResultInterpretation(testResult.value.score, testData)
})

// Получение данных теста для интерпретации
const getTestDataForResults = () => {
  // Простая заглушка с результатами - можно заменить на импорт из stressTest.js
  return {
    resultCalculation: {
      ranges: {
        minimal: {
          min: 0,
          max: 12,
          label: 'Минимальный уровень стресса',
          color: '#10b981',
          description:
            'Ваш уровень стресса находится в норме. Вы хорошо справляетесь с жизненными вызовами.',
        },
        mild: {
          min: 13,
          max: 25,
          label: 'Легкий уровень стресса',
          color: '#f59e0b',
          description:
            'У вас есть некоторые признаки стресса, но они пока не критичны. Стоит обратить внимание на профилактику.',
        },
        moderate: {
          min: 26,
          max: 40,
          label: 'Умеренный уровень стресса',
          color: '#ea580c',
          description:
            'Стресс начинает серьезно влиять на вашу жизнь. Рекомендуется принять активные меры.',
        },
        high: {
          min: 41,
          max: 55,
          label: 'Высокий уровень стресса',
          color: '#dc2626',
          description:
            'Вы находитесь в состоянии значительного стресса, который требует немедленного внимания.',
        },
        critical: {
          min: 56,
          max: 100,
          label: 'Критический уровень стресса',
          color: '#991b1b',
          description:
            'Критически высокий уровень стресса. Настоятельно рекомендуется обратиться к специалисту.',
        },
      },
      recommendations: {
        minimal: [
          'Продолжайте поддерживать здоровый образ жизни',
          'Развивайте навыки стрессоустойчивости для профилактики',
          'Поддерживайте социальные связи',
        ],
        mild: [
          'Изучите техники релаксации (дыхательные упражнения, медитация)',
          'Улучшите качество сна - ложитесь спать в одно время',
          'Добавьте в распорядок регулярные физические упражнения',
        ],
        moderate: [
          'Рассмотрите возможность снижения нагрузки или перераспределения обязанностей',
          'Обратитесь за поддержкой к близким людям',
          'Рассмотрите консультацию с психологом',
        ],
        high: [
          'Обязательно обратитесь к специалисту (психологу или психотерапевту)',
          'Рассмотрите временное снижение рабочей нагрузки',
          'Создайте поддерживающую среду дома и на работе',
        ],
        critical: [
          'НЕМЕДЛЕННО обратитесь к специалисту - это приоритет номер один',
          'Рассмотрите временный отпуск или больничный',
          'Активируйте всю доступную социальную поддержку',
        ],
      },
    },
  }
}

// CSS класс для карточки результата
const scoreCardClass = computed(() => {
  const level = interpretationResult.value.level || 'moderate'
  return `result-page__score-card--${level}`
})

// ИСПРАВЛЕНО: Загрузка результата теста
const loadTestResult = async () => {
  try {
    console.log('Loading test result for testId:', route.params.testId)
    console.log('User store results:', userStore.testResults)

    // Загружаем результаты из localStorage
    await userStore.loadTestResults()

    // Ищем последний результат для этого теста
    const results = userStore.testResults.filter((r) => r.testId === route.params.testId)
    console.log('Filtered results for this test:', results)

    if (results.length > 0) {
      // Берем самый последний результат
      testResult.value = results.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
      )[0]
      console.log('Loaded test result:', testResult.value)
    } else {
      console.error('No test results found for testId:', route.params.testId)

      // Попробуем получить из localStorage напрямую
      const allResults = JSON.parse(localStorage.getItem('psy-test-results') || '[]')
      console.log('All results from localStorage:', allResults)

      const directResults = allResults.filter(
        (r) => r.testId === route.params.testId && r.userId === userStore.user?.id,
      )

      if (directResults.length > 0) {
        testResult.value = directResults.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
        )[0]
        console.log('Found result directly from localStorage:', testResult.value)
      }
    }
  } catch (error) {
    console.error('Error loading test result:', error)
  } finally {
    isLoading.value = false
  }
}

// Переход к дашборду
const goToDashboard = () => {
  router.push('/dashboard')
}

// Повторное прохождение теста
const retakeTest = () => {
  // Очищаем прогресс
  localStorage.removeItem('test-progress')
  router.push(`/test/${route.params.testId}`)
}

// Инициализация при монтировании
onMounted(async () => {
  console.log('ResultPage mounted')
  console.log('Route params:', route.params)
  console.log('User authenticated:', userStore.isAuthenticated)

  if (!userStore.isAuthenticated) {
    router.push('/')
    return
  }

  await loadTestResult()
})
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.result-page__header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.result-page__header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.result-page__back-button {
  background: none;
  border: 2px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
  font-family: inherit;
}

.result-page__back-button:hover {
  border-color: #6366f1;
  color: #6366f1;
  background-color: #f8faff;
}

.result-page__title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.result-page__main {
  flex: 1;
  padding: 40px 0;
}

.result-page__container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.result-page__main-result {
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.result-page__test-info {
  margin-bottom: 24px;
}

.result-page__test-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.result-page__completion-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.result-page__completion-item {
  font-size: 14px;
  color: #6b7280;
}

.result-page__score-section {
  border-top: 2px solid #f1f5f9;
  padding-top: 24px;
}

.result-page__score-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.result-page__score-badge {
  text-align: center;
  min-width: 120px;
}

.result-page__score-value {
  font-size: 48px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.result-page__score-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.result-page__score-interpretation {
  flex: 1;
}

.result-page__interpretation-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.result-page__score-range {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.result-page__risk-description {
  font-size: 16px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

.result-page__recommendations,
.result-page__demographic-analysis {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.result-page__section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.result-page__recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-page__recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.result-page__recommendation-icon {
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
}

.result-page__recommendation-text {
  flex: 1;
  color: #374151;
  line-height: 1.5;
}

.result-page__demographic-info {
  margin-bottom: 16px;
}

.result-page__demographic-item {
  margin-bottom: 8px;
  color: #374151;
}

.result-page__personal-notes {
  background: #fef7cd;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
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

.result-page__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.result-page__action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 14px;
}

.result-page__action-button--primary {
  background: #6366f1;
  color: white;
  border: 2px solid #6366f1;
}

.result-page__action-button--primary:hover {
  background: #5856eb;
  border-color: #5856eb;
}

.result-page__action-button--secondary {
  background: white;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.result-page__action-button--secondary:hover {
  background: #f8faff;
}

.result-page__loading,
.result-page__error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.result-page__error-content {
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
}

.result-page__error-content h2 {
  font-size: 24px;
  color: #dc2626;
  margin: 0 0 16px 0;
}

.result-page__error-content p {
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.result-page__spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Цветовые схемы для разных уровней стресса */
.result-page__score-card--minimal {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.result-page__score-card--mild {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.result-page__score-card--moderate {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border-color: #ea580c;
}

.result-page__score-card--high {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border-color: #dc2626;
}

.result-page__score-card--critical {
  background: linear-gradient(135deg, #fecdd3 0%, #fda4af 100%);
  border-color: #991b1b;
}

@media (max-width: 768px) {
  .result-page__container {
    padding: 0 16px;
  }

  .result-page__main-result {
    padding: 24px;
  }

  .result-page__score-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .result-page__actions {
    flex-direction: column;
  }
}
</style>
