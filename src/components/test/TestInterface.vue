<template>
  <div class="test-interface-full">
    <!-- Основная карточка с вопросом (на всю ширину) -->
    <div class="question-card">
      <!-- Тип вопроса -->
      <div class="question-type">
        <span
          class="question-type__badge"
          :class="{
            'question-type__badge--single': currentQuestionComponent === 'SingleChoice',
            'question-type__badge--multiple': currentQuestionComponent === 'MultipleChoice',
            'question-type__badge--scale': currentQuestionComponent === 'ScaleQuestion',
          }"
        >
          {{ getQuestionTypeName(currentQuestionComponent) }}
        </span>
      </div>

      <!-- Компонент с вопросом -->
      <component
        :is="currentQuestionComponent"
        :key="currentQuestion.id"
        v-bind="currentQuestion"
        :modelValue="currentAnswer"
        @update:modelValue="handleAnswerUpdate"
      />

      <!-- Навигация с фиксированным положением кнопок -->
      <div class="navigation">
        <!-- Кнопка "Назад" всегда на том же месте -->
        <button
          v-if="canGoToPrevious"
          @click="$emit('go-to-previous')"
          class="navigation__btn btn btn--secondary"
        >
          <span class="icon">←</span>
          Назад
        </button>
        <div v-else class="navigation__btn"></div>
        <!-- Заглушка для фиксации позиции -->

        <!-- Подсказка по центру (при необходимости) -->
        <div v-if="!isCurrentQuestionAnswered" class="answer-hint">
          {{ getAnswerHint(currentQuestionComponent) }}
        </div>

        <!-- Кнопка "Далее" всегда на том же месте -->
        <button
          v-if="canGoToNext"
          @click="$emit('go-to-next')"
          class="navigation__btn btn"
          :class="isLastQuestion ? 'btn--primary' : 'btn--primary'"
          :disabled="!isCurrentQuestionAnswered"
        >
          {{ isLastQuestion ? 'Завершить тест' : 'Далее' }}
          <span class="icon" v-if="!isLastQuestion">→</span>
        </button>
        <div v-else class="navigation__btn"></div>
        <!-- Заглушка для фиксации позиции -->
      </div>
    </div>

    <!-- Скрытые подсказки (показываются по наведению на иконку) -->
    <div class="floating-help" v-if="getHelpForQuestion(currentQuestionComponent)">
      <div class="floating-help__trigger">
        <span class="floating-help__icon">💡</span>
      </div>
      <div class="floating-help__content">
        <h4 class="floating-help__title">Совет</h4>
        <p class="floating-help__text">{{ getHelpForQuestion(currentQuestionComponent) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SingleChoice from '../SingleChoice.vue'
import MultipleChoice from '../MultipleChoice.vue'
import ScaleQuestion from '../ScaleQuestion.vue'

const props = defineProps({
  currentQuestion: {
    type: Object,
    required: true,
  },
  currentQuestionComponent: {
    type: String,
    required: true,
  },
  currentAnswer: {
    default: null,
  },
  canGoToPrevious: {
    type: Boolean,
    default: false,
  },
  canGoToNext: {
    type: Boolean,
    default: false,
  },
  isCurrentQuestionAnswered: {
    type: Boolean,
    default: false,
  },
  isLastQuestion: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-answer', 'go-to-previous', 'go-to-next'])

const handleAnswerUpdate = (value) => {
  emit('update-answer', value)
}

const getQuestionTypeName = (component) => {
  const names = {
    SingleChoice: 'Одиночный выбор',
    MultipleChoice: 'Множественный выбор',
    ScaleQuestion: 'Шкала оценки',
  }
  return names[component] || 'Вопрос'
}

const getAnswerHint = (component) => {
  const hints = {
    SingleChoice: 'Выберите один вариант ответа',
    MultipleChoice: 'Можете выбрать несколько вариантов',
    ScaleQuestion: 'Выберите значение на шкале',
  }
  return hints[component] || 'Выберите ответ'
}

const getHelpForQuestion = (component) => {
  const help = {
    SingleChoice:
      'Выберите тот вариант, который наиболее точно отражает ваше состояние или мнение.',
    MultipleChoice: 'Можете выбрать несколько вариантов, если они подходят к вашей ситуации.',
    ScaleQuestion: 'Выберите число от 1 до 10, где 1 - минимальное значение, а 10 - максимальное.',
  }
  return help[component]
}
</script>

<style lang="scss" scoped>
.test-interface-full {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.floating-help {
  position: fixed;
  bottom: 120px;
  right: 30px;
  z-index: 100;

  &__trigger {
    width: 50px;
    height: 50px;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: var(--transition-normal);

    &:hover {
      transform: scale(1.1);
      background: var(--color-primary-dark);
    }
  }

  &__icon {
    font-size: var(--font-size-xl);
  }

  &__content {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 280px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-xl);
    opacity: 0;
    transform: translateY(10px);
    transition: var(--transition-normal);
    pointer-events: none;
  }

  &:hover &__content {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }

  &__title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }

  &__text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin: 0;
  }

  @media (max-width: 768px) {
    bottom: 80px;
    right: 20px;

    &__content {
      width: 260px;
    }
  }
}
</style>
