<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <div class="dashboard__header-content">
        <div class="dashboard__user-info">
          <h1 class="dashboard__title">Добро пожаловать, {{ userName }}!</h1>
          <p class="dashboard__subtitle">Выберите психологический тест для прохождения</p>
        </div>

        <div class="dashboard__user-menu">
          <div class="dashboard__user-avatar">
            {{ userInitials }}
          </div>
          <button @click="showUserMenu = !showUserMenu" class="dashboard__menu-toggle">▼</button>

          <div v-if="showUserMenu" class="dashboard__dropdown">
            <div class="dashboard__dropdown-item">
              <strong>{{ user.name }}</strong>
            </div>
            <div class="dashboard__dropdown-item">
              {{ user.email }}
            </div>
            <hr class="dashboard__dropdown-divider" />
            <button @click="viewResults" class="dashboard__dropdown-button">Мои результаты</button>
            <button @click="logout" class="dashboard__dropdown-button">Выйти</button>
          </div>
        </div>
      </div>
    </header>

    <main class="dashboard__main">
      <div class="dashboard__container">
        <div class="dashboard__stats" v-if="testResults.length > 0">
          <div class="dashboard__stat-card">
            <h3 class="dashboard__stat-title">Пройдено тестов</h3>
            <div class="dashboard__stat-value">{{ testResults.length }}</div>
          </div>
          <div class="dashboard__stat-card">
            <h3 class="dashboard__stat-title">Последний тест</h3>
            <div class="dashboard__stat-value">{{ lastTestDate }}</div>
          </div>
        </div>

        <section class="dashboard__tests-section">
          <h2 class="dashboard__section-title">Доступные тесты</h2>

          <div class="dashboard__tests-grid">
            <div
              v-for="test in availableTests"
              :key="test.id"
              class="dashboard__test-card"
              @click="startTest(test.id)"
            >
              <div class="dashboard__test-header">
                <h3 class="dashboard__test-title">{{ test.title }}</h3>
                <div class="dashboard__test-category">{{ test.category }}</div>
              </div>

              <p class="dashboard__test-description">
                {{ test.description }}
              </p>

              <div class="dashboard__test-meta">
                <div class="dashboard__test-info">⏱️ {{ test.duration }}</div>
                <div class="dashboard__test-info">📝 {{ test.questionsCount }}</div>
              </div>

              <div class="dashboard__test-action">
                <BaseButton variant="primary" full-width> Начать тест </BaseButton>
              </div>

              <div v-if="hasTestResult(test.id)" class="dashboard__test-completed">✓ Пройден</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { useTestStore } from '../stores/testStore.js'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const testStore = useTestStore()

const showUserMenu = ref(false)

const user = computed(() => userStore.user)
const userName = computed(() => userStore.getUserName)
const testResults = computed(() => userStore.getTestResults)
const availableTests = computed(() => testStore.getAvailableTests)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const lastTestDate = computed(() => {
  if (testResults.value.length === 0) return 'Нет'
  const lastTest = testResults.value[testResults.value.length - 1]
  return new Date(lastTest.timestamp).toLocaleDateString('ru-RU')
})

const hasTestResult = (testId) => {
  return testResults.value.some((result) => result.testId === testId)
}

const startTest = (testId) => {
  testStore.startTest(testId)
  router.push(`/test/${testId}`)
}

const viewResults = () => {
  router.push('/results')
}

const logout = () => {
  userStore.$reset()
  testStore.$reset()
  localStorage.removeItem('psy-user')
  localStorage.removeItem('psy-test-results')
  router.push('/')
}

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/')
    return
  }

  userStore.loadTestResults()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}

.dashboard__header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dashboard__header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard__title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.dashboard__subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.dashboard__user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard__user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.dashboard__menu-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.dashboard__menu-toggle:hover {
  background-color: #f3f4f6;
}

.dashboard__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dashboard__dropdown-item {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
}

.dashboard__dropdown-divider {
  border: none;
  height: 1px;
  background-color: #e5e7eb;
  margin: 8px 0;
}

.dashboard__dropdown-button {
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.dashboard__dropdown-button:hover {
  background-color: #f3f4f6;
}

.dashboard__main {
  padding: 32px 0;
}

.dashboard__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.dashboard__stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.dashboard__stat-title {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.dashboard__stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.dashboard__section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.dashboard__tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.dashboard__test-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.dashboard__test-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.dashboard__test-header {
  margin-bottom: 12px;
}

.dashboard__test-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.dashboard__test-category {
  display: inline-block;
  background: #eef2ff;
  color: #6366f1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.dashboard__test-description {
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.dashboard__test-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard__test-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.dashboard__test-completed {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #10b981;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dashboard__header-content {
    padding: 0 16px;
  }

  .dashboard__container {
    padding: 0 16px;
  }

  .dashboard__title {
    font-size: 20px;
  }

  .dashboard__tests-grid {
    grid-template-columns: 1fr;
  }

  .dashboard__user-info {
    flex: 1;
    min-width: 0;
  }

  .dashboard__title,
  .dashboard__subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
