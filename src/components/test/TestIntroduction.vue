<template>
  <div class="test-introduction">
    <div class="test-introduction-card">
      <!-- Иконка теста -->
      <div class="test-introduction-card__icon">
        {{ currentTest?.icon || '🧪' }}
      </div>

      <!-- Название теста -->
      <h1 class="test-introduction-card__title">
        {{ currentTest?.title || 'Психологический тест' }}
      </h1>

      <!-- Описание -->
      <p class="test-introduction-card__description">
        {{ currentTest?.description || 'Пройдите тест и узнайте больше о себе' }}
      </p>

      <!-- Метаинформация в одну строку -->
      <div class="test-introduction-card__meta">
        <div class="test-introduction-card__meta-item">
          <span class="icon">⏱️</span>
          <span>{{ currentTest?.duration || 5 }} мин</span>
        </div>
        <div class="test-introduction-card__meta-item">
          <span class="icon">📊</span>
          <span>{{ getTotalQuestions() }} вопросов</span>
        </div>
        <div class="test-introduction-card__meta-item">
          <span class="icon">🎯</span>
          <span>{{ getDifficultyName(currentTest?.difficulty) }}</span>
        </div>
      </div>

      <!-- Кнопка запуска -->
      <div class="test-introduction-card__action">
        <button 
          @click="$emit('start-test')" 
          class="btn btn--primary btn--lg"
          style="min-width: 200px;"
        >
          Начать тестирование
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  testData: {
    type: Object,
    default: () => ({})
  },
  currentTest: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['start-test'])

const getTotalQuestions = () => {
  return props.testData?.questions?.length || props.currentTest?.questionCount || 10
}

const getDifficultyName = (difficulty) => {
  const difficultyNames = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  }
  return difficultyNames[difficulty] || 'Средний'
}
</script>

<!-- Стили уже включены в _layouts.scss -->