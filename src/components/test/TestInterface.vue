<template>
  <div class="test-interface">
    <div class="test-interface__question-card">
      <!-- Индикатор типа вопроса -->
      <div class="test-interface__question-type">
        <span class="test-interface__type-badge" :class="questionTypeBadgeClass">
          {{ questionTypeLabel }}
        </span>
      </div>

      <!-- Сам вопрос -->
      <component
        :is="currentQuestionComponent"
        :question="currentQuestion?.question"
        :options="currentQuestion?.options"
        :scale="currentQuestion?.scale"
        :model-value="currentAnswer"
        @update:model-value="$emit('updateAnswer', $event)"
        class="test-interface__question-component"
      />

      <!-- Навигация -->
      <div class="test-interface__navigation">
        <BaseButton
          v-if="canGoToPrevious"
          @click="$emit('goToPrevious')"
          variant="secondary"
          class="test-interface__nav-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
          Предыдущий
        </BaseButton>

        <div class="test-interface__nav-spacer"></div>

        <!-- Подсказка о необходимости ответа -->
        <div v-if="!isCurrentQuestionAnswered" class="test-interface__answer-hint">
          {{ answerHintText }}
        </div>

        <BaseButton
          v-if="canGoToNext"
          @click="$emit('goToNext')"
          variant="primary"
          :disabled="!isCurrentQuestionAnswered"
          class="test-interface__nav-button"
        >
          {{ isLastQuestion ? 'Завершить тест' : 'Далее' }}
          <svg
            v-if="!isLastQuestion"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
        </BaseButton>
      </div>
    </div>

    <!-- Боковая панель с дополнительной информацией -->
    <div class="test-interface__sidebar">
      <div class="test-interface__help-card">
        <h4 class="test-interface__help-title">💡 Совет</h4>
        <p class="test-interface__help-text">{{ helpText }}</p>
      </div>

      <!-- Индикатор сохранения -->
      <div class="test-interface__save-indicator" v-if="isCurrentQuestionAnswered">
        <div class="test-interface__save-icon">✓</div>
        <span class="test-interface__save-text">Ответ сохранен</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '../BaseButton.vue'

const props = defineProps({
  currentQuestion: Object,
  currentQuestionComponent: String,
  currentAnswer: [String, Number, Array],
  canGoToPrevious: Boolean,
  canGoToNext: Boolean,
  isCurrentQuestionAnswered: Boolean,
  isLastQuestion: Boolean,
})

defineEmits(['updateAnswer', 'goToPrevious', 'goToNext'])

// Определение типа вопроса и соответствующих стилей
const questionTypeBadgeClass = computed(() => {
  const type = props.currentQuestion?.type
  return `test-interface__type-badge--${type}`
})

const questionTypeLabel = computed(() => {
  const labels = {
    single: 'Одиночный выбор',
    multiple: 'Множественный выбор',
    scale: 'Шкала оценки',
  }
  return labels[props.currentQuestion?.type] || 'Вопрос'
})

// Подсказка о необходимости ответа
const answerHintText = computed(() => {
  const type = props.currentQuestion?.type
  const hints = {
    single: 'Выберите один вариант ответа',
    multiple: 'Выберите один или несколько вариантов',
    scale: 'Выберите значение на шкале',
  }
  return hints[type] || 'Выберите ответ для продолжения'
})

// Текст помощи в зависимости от типа вопроса
const helpText = computed(() => {
  const type = props.currentQuestion?.type
  const helps = {
    single: 'Выберите тот вариант, который наиболее точно отражает ваше состояние или мнение.',
    multiple: 'Можете выбрать несколько вариантов, если они подходят к вашей ситуации.',
    scale: 'Выберите число от 1 до 10, где 1 - минимальное значение, а 10 - максимальное.',
  }
  return helps[type] || 'Отвечайте честно, основываясь на своих ощущениях и опыте.'
})
</script>

<style scoped>
.test-interface {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
  align-items: start;
}

.test-interface__question-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: slideInLeft 0.3s ease-out;
}

.test-interface__question-type {
  margin-bottom: 20px;
}

.test-interface__type-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.test-interface__type-badge--single {
  background: #dbeafe;
  color: #1e40af;
}

.test-interface__type-badge--multiple {
  background: #dcfce7;
  color: #166534;
}

.test-interface__type-badge--scale {
  background: #fef3c7;
  color: #92400e;
}

.test-interface__question-component {
  margin-bottom: 32px;
}

.test-interface__navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
  position: relative;
}

.test-interface__nav-spacer {
  flex: 1;
}

.test-interface__nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-interface__answer-hint {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #fef3c7;
  color: #92400e;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #fbbf24;
  animation: pulse 2s infinite;
}

.test-interface__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideInRight 0.3s ease-out;
}

.test-interface__help-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.test-interface__help-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.test-interface__help-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.test-interface__save-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 16px;
  animation: fadeInScale 0.3s ease-out;
}

.test-interface__save-icon {
  width: 16px;
  height: 16px;
  background: #22c55e;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.test-interface__save-text {
  font-size: 12px;
  color: #15803d;
  font-weight: 500;
}

/* Анимации */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .test-interface {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .test-interface__sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .test-interface__question-card {
    padding: 24px;
    border-radius: 16px;
  }

  .test-interface__navigation {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .test-interface__nav-spacer {
    display: none;
  }

  .test-interface__answer-hint {
    position: static;
    transform: none;
    margin-bottom: 16px;
    text-align: center;
  }

  .test-interface__help-card {
    padding: 16px;
  }
}
</style>
