<template>
  <div class="test-page" v-if="!isLoading">
    <!-- Хедер с прогрессом -->
    <TestHeader
      :current-test="currentTest"
      :test-progress="testProgress"
      :current-question-number="currentQuestionNumber"
      :total-questions="totalQuestions"
      :testStarted="testStarted"
      @go-back="goBack"
    />

    <main class="test-page__main">
      <div class="test-page__container">
        <!-- Стартовый экран -->
        <TestIntroduction
          v-if="!testStarted"
          :test-data="testData"
          :current-test="currentTest"
          @start-test="startTest"
        />

        <!-- Интерфейс прохождения теста -->
        <TestInterface
          v-else
          :current-question="currentQuestion"
          :current-question-component="currentQuestionComponent"
          :current-answer="currentAnswer"
          :can-go-to-previous="canGoToPrevious"
          :can-go-to-next="canGoToNext"
          :is-current-question-answered="isCurrentQuestionAnswered"
          :is-last-question="isLastQuestion"
          @update-answer="handleAnswerChange"
          @go-to-previous="goToPreviousQuestion"
          @go-to-next="goToNextQuestion"
        />
      </div>
    </main>
  </div>

  <!-- Лоадер -->
  <TestLoader v-else />
</template>

<script setup>
import { onMounted } from 'vue'
import { useTestLogic } from '../composables/useTestLogic.js'

// Компоненты
import TestHeader from '../components/test/TestHeader.vue'
import TestIntroduction from '../components/test/TestIntroduction.vue'
import TestInterface from '../components/test/TestInterface.vue'
import TestLoader from '../components/test/TestLoader.vue'

// Основная логика теста
const {
  // Состояние
  testStarted,
  currentAnswer,
  testData,
  isLoading,

  // Вычисляемые свойства
  currentTest,
  currentQuestion,
  currentQuestionComponent,
  testProgress,
  currentQuestionNumber,
  totalQuestions,
  canGoToPrevious,
  canGoToNext,
  isLastQuestion,
  isCurrentQuestionAnswered,

  // Методы
  handleAnswerChange,
  goToPreviousQuestion,
  goToNextQuestion,
  startTest,
  goBack,
  initialize,
} = useTestLogic()

// Инициализация при монтировании
onMounted(initialize)
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.test-page__main {
  flex: 1;
  padding: 40px 0;
}

.test-page__container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .test-page__container {
    padding: 0 16px;
  }

  .test-page__main {
    padding: 20px 0;
  }
}
</style>
