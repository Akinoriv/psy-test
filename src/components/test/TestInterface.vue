<template>
  <div class="test-interface">
    <!-- Основная карточка с вопросом -->
    <div class="question-card">
      <!-- Индикатор типа вопроса -->
      <div class="question-type">
        <span class="question-type__badge" :class="questionTypeBadgeClass">
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
        class="question-card__component"
      />

      <!-- Навигация -->
      <div class="navigation">
        <BaseButton
          v-if="canGoToPrevious"
          @click="$emit('goToPrevious')"
          variant="secondary"
          class="navigation__btn"
        >
          <span class="icon">←</span>
          Предыдущий
        </BaseButton>

        <div class="navigation__spacer"></div>

        <!-- Подсказка о необходимости ответа -->
        <div v-if="!isCurrentQuestionAnswered" class="answer-hint">
          {{ answerHintText }}
        </div>

        <BaseButton
          v-if="canGoToNext"
          @click="$emit('goToNext')"
          variant="primary"
          :disabled="!isCurrentQuestionAnswered"
          class="navigation__btn"
        >
          {{ isLastQuestion ? 'Завершить тест' : 'Далее' }}
          <span v-if="!isLastQuestion" class="icon">→</span>
          <span v-else class="icon">✓</span>
        </BaseButton>
      </div>
    </div>

    <!-- Боковая панель -->
    <div class="sidebar">
      <!-- Карточка помощи -->
      <div class="help-card">
        <h4 class="help-card__title">💡 Совет</h4>
        <p class="help-card__text">{{ helpText }}</p>
      </div>

      <!-- Индикатор сохранения -->
      <div class="save-indicator" v-if="isCurrentQuestionAnswered">
        <div class="save-indicator__icon">✓</div>
        <span class="save-indicator__text">Ответ сохранен</span>
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
  return `question-type__badge--${type}`
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

<!-- Без style scoped - используем универсальные классы -->