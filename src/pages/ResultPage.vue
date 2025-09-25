<template>
  <div class="page" v-if="testResult">
    <!-- Хедер -->
    <header class="page__header">
      <div class="container container--result">
        <div class="header">
          <div class="header__info">
            <h1 class="heading heading--h2">Результаты теста</h1>
          </div>
          <div class="header__actions">
            <button @click="goToDashboard" class="btn btn--ghost">
              <span class="icon">←</span>
              К тестам
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="page__main">
      <div class="container container--result">
        <!-- Основной результат -->
        <BaseResultCard
          :test-result="enhancedTestResult"
          :test-info="testInfo"
          :formatted-date="formattedCompletionDate"
          :questions-count="answeredQuestionsCount"
        />

        <!-- Динамические секции результатов -->
        <ResultSection 
          v-for="section in resultSections" 
          :key="section.id" 
          :section="section" 
        />

        <!-- Действия -->
        <div class="flex justify-center gap-3 m-4">
          <button @click="goToDashboard" class="btn btn--primary">
            Вернуться к тестам
          </button>
          <button @click="retakeTest" class="btn btn--secondary">
            Пройти заново
          </button>
        </div>
      </div>
    </main>
  </div>

  <!-- Состояние загрузки -->
  <div v-else-if="isLoading" class="loading-state">
    <div class="loading-state__icon">
      <div class="spinner"></div>
    </div>
    <h2 class="heading heading--h3">Загрузка результатов...</h2>
  </div>

  <!-- Ошибка -->
  <div v-else class="empty-state">
    <div class="empty-state__icon">❌</div>
    <h2 class="heading heading--h2">Результаты не найдены</h2>
    <p class="text text--secondary text--center">
      Не удалось загрузить результаты теста. Возможно, результат не был сохранен.
    </p>
    <button @click="goToDashboard" class="btn btn--primary">
      Вернуться к тестам
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import { UniversalResultInterpreter } from '../utils/universalResultInterpreter.js'

// Компоненты
import BaseResultCard from '../components/result/BaseResultCard.vue'
import ResultSection from '../components/result/ResultSection.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const testStore = useTestStore()

const testResult = ref(null)
const isLoading = ref(true)

// Информация о тесте
const testInfo = computed(() => {
  return (
    testStore.getTestById(route.params.testId) || {
      title: 'Тест завершен',
      description: 'Результаты теста',
    }
  )
})

// Улучшенный результат с универсальной интерпретацией
const enhancedTestResult = computed(() => {
  if (!testResult.value) return null

  const enhanced = { ...testResult.value }

  // Если нет интерпретации - создаем универсальную
  if (!enhanced.interpretation) {
    enhanced.interpretation = UniversalResultInterpreter.interpret(enhanced)
  }

  return enhanced
})

// Форматированная дата завершения
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

// Количество отвеченных вопросов
const answeredQuestionsCount = computed(() => {
  return (
    testResult.value?.totalQuestions ||
    testResult.value?.questionCount ||
    (testResult.value?.answers ? Object.keys(testResult.value.answers).length : 'неизвестно')
  )
})

// Универсальные секции результатов
const resultSections = computed(() => {
  if (!testResult.value) return []

  const sections = []

  // Персональные заметки
  if (testResult.value.personalizedNotes?.length > 0) {
    sections.push({
      id: 'personal-notes',
      title: '💭 Персональный анализ',
      type: 'notes',
      items: testResult.value.personalizedNotes.map((note) => ({
        icon: '✨',
        text: note,
      })),
    })
  }

  // Рекомендации из результата или универсальные
  const recommendations =
    testResult.value.recommendations ||
    UniversalResultInterpreter.generateRecommendations(
      testResult.value,
      UniversalResultInterpreter.detectTestType(testResult.value.testId, null, testResult.value),
    )

  if (recommendations?.length > 0) {
    sections.push({
      id: 'recommendations',
      title: '💡 Рекомендации',
      type: 'notes',
      items: recommendations.map((rec) => ({
        icon: '✓',
        text: rec,
      })),
    })
  }

  // Выбранные качества/ответы
  if (testResult.value.selectedTraits?.length > 0) {
    sections.push({
      id: 'selected-traits',
      title: '📋 Выбранные качества',
      type: 'badges',
      items: testResult.value.selectedTraits.map((trait) => ({
        label: getTraitLabel(trait),
        variant: 'primary',
      })),
    })
  }

  // Цель в отношениях
  if (testResult.value.relationshipGoal) {
    sections.push({
      id: 'relationship-goal',
      title: '💕 Цель в отношениях',
      type: 'badges',
      items: [
        {
          label: getGoalLabel(testResult.value.relationshipGoal),
          variant: 'secondary',
        },
      ],
    })
  }

  // Черты личности
  if (testResult.value.personalityTraits?.length > 0) {
    sections.push({
      id: 'personality-traits',
      title: '🎭 Черты личности',
      type: 'badges',
      items: testResult.value.personalityTraits.map((trait) => ({
        label: trait.name || trait,
        variant: 'info',
      })),
    })
  }

  // Дополнительные детали
  if (testResult.value.details?.length > 0) {
    sections.push({
      id: 'additional-details',
      title: '📊 Дополнительно',
      type: 'details',
      items: testResult.value.details,
    })
  }

  // Ответы на вопросы (если есть)
  if (testResult.value.answers && Object.keys(testResult.value.answers).length > 0) {
    sections.push({
      id: 'answers-summary',
      title: '📝 Краткое содержание ответов',
      type: 'key-value',
      items: Object.entries(testResult.value.answers)
        .slice(0, 5)
        .map(([key, value]) => ({
          key: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: Array.isArray(value.answer) ? value.answer.join(', ') : value.answer,
        })),
    })
  }

  // Демографический анализ
  if (testResult.value.demographics) {
    const demoItems = [
      { key: 'Возраст', value: testResult.value.demographics.age },
      { key: 'Пол', value: testResult.value.demographics.gender },
      { key: 'Образование', value: testResult.value.demographics.education },
      { key: 'Профессия', value: testResult.value.demographics.occupation },
    ].filter((item) => item.value)

    if (demoItems.length > 0) {
      sections.push({
        id: 'demographics',
        title: '👤 Демографические данные',
        type: 'key-value',
        items: demoItems,
      })
    }
  }

  return sections
})

// Вспомогательные функции для лейблов
const getTraitLabel = (trait) => {
  const traitMap = {
    smart: 'Умный',
    kind: 'Добрый',
    funny: 'Веселый',
    caring: 'Заботливый',
    loyal: 'Верный',
    ambitious: 'Амбициозный',
    creative: 'Творческий',
    responsible: 'Ответственный',
    romantic: 'Романтичный',
    supportive: 'Поддерживающий',
    confident: 'Уверенный',
    honest: 'Честный',
    patient: 'Терпеливый',
    optimistic: 'Оптимистичный',
  }
  return traitMap[trait] || trait
}

const getGoalLabel = (goal) => {
  const goalMap = {
    love: 'Любовь и романтика',
    family: 'Семья и дети',
    partnership: 'Партнерство и поддержка',
    growth: 'Совместное развитие',
    stability: 'Стабильность и надежность',
    adventure: 'Приключения и новизна',
    career: 'Карьера и успех',
  }
  return goalMap[goal] || goal
}

// Загрузка результата теста
const loadTestResult = async () => {
  try {
    console.log('Loading test result for testId:', route.params.testId)

    await userStore.loadTestResults()

    const results = userStore.testResults.filter((r) => r.testId === route.params.testId)

    if (results.length > 0) {
      testResult.value = results.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
      )[0]
      console.log('Loaded test result:', testResult.value)
    } else {
      console.error('No test results found for testId:', route.params.testId)
    }
  } catch (error) {
    console.error('Error loading test result:', error)
  } finally {
    isLoading.value = false
  }
}

// Навигация
const goToDashboard = () => {
  router.push('/dashboard')
}

const retakeTest = () => {
  localStorage.removeItem('test-progress')
  router.push(`/test/${route.params.testId}`)
}

// Инициализация
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/')
    return
  }

  await loadTestResult()
})
</script>

<!-- Стили удалены - используем только универсальные классы -->