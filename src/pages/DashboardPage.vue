<template>
  <div class="page">
    <!-- Заголовок -->
    <header class="page__header">
      <div class="container">
        <div class="header">
          <div class="header__info">
            <h1 class="heading heading--h1">Добро пожаловать, {{ userName }}!</h1>
            <p class="text text--secondary">Выберите психологический тест для прохождения</p>
          </div>

          <div class="header__actions">
            <div class="user-menu">
              <div class="user-avatar">{{ userInitials }}</div>
              <button @click="showUserMenu = !showUserMenu" class="btn btn--ghost btn--icon">
                <span class="icon">▼</span>
              </button>

              <div v-if="showUserMenu" class="dropdown">
                <div class="dropdown__item">
                  <strong>{{ user.name }}</strong>
                </div>
                <div class="dropdown__item text text--secondary">{{ user.email }}</div>
                <hr class="divider" />
                <button @click="viewResults" class="dropdown__button">
                  <span class="icon">📊</span>
                  Мои результаты
                </button>
                <button @click="logout" class="dropdown__button">
                  <span class="icon">🚪</span>
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="page__main">
      <div class="container">
        <!-- Статистика пользователя -->
        <section v-if="userStats.totalTests > 0" class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__icon">🎯</div>
              <div class="stat-card__content">
                <h3 class="stat-card__title">Пройдено тестов</h3>
                <div class="stat-card__value">{{ userStats.totalTests }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">📈</div>
              <div class="stat-card__content">
                <h3 class="stat-card__title">Средний балл</h3>
                <div class="stat-card__value">{{ userStats.averageScore }}%</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">📅</div>
              <div class="stat-card__content">
                <h3 class="stat-card__title">В этом месяце</h3>
                <div class="stat-card__value">{{ userStats.testsThisMonth }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">⏰</div>
              <div class="stat-card__content">
                <h3 class="stat-card__title">Последний тест</h3>
                <div class="stat-card__value stat-card__value--small">{{ lastTestDate }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Состояние загрузки -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-state__icon">
            <div class="spinner"></div>
          </div>
          <p class="text">Загрузка тестов...</p>
        </div>

        <!-- Список тестов -->
        <section v-else class="tests-section">
          <h2 class="heading heading--h2">Доступные тесты</h2>

          <div v-if="availableTests.length === 0" class="empty-state">
            <div class="empty-state__icon">🧪</div>
            <h3 class="heading heading--h3">Тесты загружаются</h3>
            <p class="text text--secondary">Пожалуйста, подождите...</p>
          </div>

          <div v-else class="tests-grid">
            <div
              v-for="test in availableTests"
              :key="test.id"
              class="test-card"
              :class="{ 
                'test-card--unavailable': !test.isAvailable,
                'test-card--completed': hasTestResult(test.id)
              }"
              @click="test.isAvailable && startTest(test.id)"
            >
              <!-- Заголовок теста -->
              <div class="test-card__header">
                <div class="test-card__icon">{{ test.icon }}</div>
                <div class="test-card__header-content">
                  <h3 class="test-card__title">{{ test.title }}</h3>
                  <div class="test-card__badges">
                    <span class="badge badge--category">{{ getCategoryName(test.category) }}</span>
                  </div>
                </div>
              </div>

              <!-- Описание -->
              <p class="test-card__description">{{ test.description }}</p>

              <!-- Метаинформация -->
              <div class="test-card__meta">
                <div class="meta-item">
                  <span class="icon">⏱️</span>
                  <span>{{ test.duration }} мин</span>
                </div>
                <div class="meta-item">
                  <span class="icon">📊</span>
                  <span>{{ getDifficultyName(test.difficulty) }}</span>
                </div>
              </div>

              <!-- Теги -->
              <div class="test-card__tags">
                <span v-for="tag in test.tags.slice(0, 3)" :key="tag" class="badge badge--tag">
                  {{ tag }}
                </span>
              </div>

              <!-- Действие -->
              <div class="test-card__action">
                <BaseButton
                  v-if="test.isAvailable"
                  variant="primary"
                  full-width
                  :disabled="!test.isAvailable"
                >
                  {{ hasTestResult(test.id) ? 'Пройти снова' : 'Начать тест' }}
                </BaseButton>
                <div v-else class="test-card__unavailable">
                  <span class="icon">🔒</span>
                  <span>Скоро доступен</span>
                </div>
              </div>

              <!-- Индикатор завершения -->
              <div v-if="hasTestResult(test.id)" class="test-card__completed-badge">
                <span class="icon">✓</span>
                <span>Пройден</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const testStore = useTestStore()

const showUserMenu = ref(false)
const isLoading = ref(true)

// Computed свойства
const user = computed(() => userStore.user)
const userName = computed(() => userStore.getUserName || 'Пользователь')
const testResults = computed(() => userStore.getTestResults)
const availableTests = computed(() => testStore.getAllTests)
const userStats = computed(() => userStore.getUserStats)

const userInitials = computed(() => {
  if (!user.value?.name) return 'У'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const lastTestDate = computed(() => {
  if (userStats.value.totalTests === 0) return 'Нет'
  return new Date(userStats.value.lastTestDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})

// Методы
const hasTestResult = (testId) => {
  return testResults.value.some(result => result.testId === testId)
}

const getCategoryName = (category) => {
  const categoryNames = {
    relationships: 'Отношения',
    wellbeing: 'Самочувствие',
    personality: 'Личность',
    career: 'Карьера',
  }
  return categoryNames[category] || category
}

const getDifficultyName = (difficulty) => {
  const difficultyNames = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',
  }
  return difficultyNames[difficulty] || difficulty
}

const startTest = (testId) => {
  console.log('🚀 Starting test:', testId)
  router.push(`/test/${testId}`)
}

const viewResults = () => {
  showUserMenu.value = false
  router.push('/results')
}

const logout = async () => {
  showUserMenu.value = false

  if (confirm('Вы уверены, что хотите выйти?')) {
    console.log('👋 Logging out user...')
    await userStore.logout()
    router.push('/')
  }
}

// Инициализация при монтировании
onMounted(async () => {
  console.log('🔧 Dashboard mounted, checking authentication...')

  // Проверяем аутентификацию
  if (!userStore.isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to registration')
    router.push('/')
    return
  }

  console.log('✅ User authenticated:', userStore.user.name)

  try {
    isLoading.value = true

    // Загружаем тесты и результаты параллельно
    await Promise.all([testStore.initializeTests(), userStore.loadTestResults()])

    console.log('✅ Dashboard initialized successfully')
    console.log('📊 Available tests:', availableTests.value.length)
    console.log('🎯 Test results:', testResults.value.length)
  } catch (error) {
    console.error('❌ Failed to initialize dashboard:', error)
  } finally {
    isLoading.value = false
  }
})

// Закрываем меню при клике вне его
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<!-- Стили удалены - используем только универсальные классы -->