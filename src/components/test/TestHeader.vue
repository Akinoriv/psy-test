<template>
  <header class="test-header">
    <div class="test-header__content">
      <button @click="$emit('goBack')" class="test-header__back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
        Назад
      </button>

      <div class="test-header__title-section">
        <h1 class="test-header__title">{{ currentTest?.title }}</h1>
        <div v-if="testStarted" class="test-header__progress-info">
          Вопрос {{ currentQuestionNumber }} из {{ totalQuestions }}
        </div>
      </div>
    </div>

    <ProgressBar
      v-if="testStarted"
      :progress="testProgress"
      label="Прогресс теста"
      class="test-header__progress"
    />
  </header>
</template>

<script setup>
import ProgressBar from '../ProgressBar.vue'

defineProps({
  testStarted: Boolean,
  currentTest: Object,
  testProgress: Number,
  currentQuestionNumber: Number,
  totalQuestions: Number,
})

defineEmits(['goBack'])
</script>

<style scoped>
.test-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.test-header__content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.test-header__back-button {
  display: flex;
  align-items: center;
  gap: 8px;
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

.test-header__back-button:hover {
  border-color: #6366f1;
  color: #6366f1;
  background-color: #f8faff;
}

.test-header__title-section {
  flex: 1;
}

.test-header__title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.test-header__progress-info {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.test-header__progress {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .test-header__content {
    padding: 0 16px;
  }

  .test-header__progress {
    padding: 0 16px;
  }

  .test-header__title {
    font-size: 18px;
  }

  .test-header__back-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
```
