<template>
  <div class="card card--elevated base-result-card">
    <!-- Информация о тесте -->
    <div class="base-result-card__test-info">
      <h2 class="heading heading--h2">{{ testInfo.title }}</h2>
      <div class="base-result-card__meta">
        <div class="base-result-card__meta-item">
          ⏱️ Завершен: {{ formattedDate }}
        </div>
        <div class="base-result-card__meta-item">
          📝 Отвечено на {{ questionsCount }} вопросов
        </div>
      </div>
    </div>

    <!-- Основной результат -->
    <div class="base-result-card__score-section" v-if="interpretation">
      <div 
        class="base-result-card__score-card" 
        :style="{ borderColor: interpretation.color || '#6b7280' }"
      >
        <div class="base-result-card__score-badge">
          <div class="base-result-card__score-emoji">{{ interpretation.emoji || '📊' }}</div>
          <div class="base-result-card__score-value">
            {{ formatScore(testResult.score) }}
          </div>
        </div>
        <div class="base-result-card__score-details">
          <h3 class="heading heading--h3">{{ interpretation.label || 'Результат' }}</h3>
          <p class="base-result-card__description">
            {{ interpretation.description || 'Результат обработан' }}
          </p>
          <div 
            class="base-result-card__probability" 
            v-if="interpretation.probability"
          >
            {{ getProbabilityText(interpretation.probability) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Простой результат без интерпретации -->
    <div class="base-result-card__simple-result" v-else-if="testResult.score !== undefined">
      <div class="base-result-card__simple-score">
        <div class="base-result-card__score-value">{{ formatScore(testResult.score) }}</div>
        <div class="base-result-card__score-label">{{ getScoreLabel() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  testResult: {
    type: Object,
    required: true
  },
  testInfo: {
    type: Object,
    required: true
  },
  formattedDate: {
    type: String,
    required: true
  },
  questionsCount: {
    type: [String, Number],
    required: true
  }
})

// Интерпретация результата
const interpretation = computed(() => {
  return props.testResult.interpretation || null
})

// Форматирование результата
const formatScore = (score) => {
  if (score === undefined || score === null) return 'N/A'
  
  // Если это процент (0-100)
  if (score <= 100 && score >= 0) {
    return Number.isInteger(score) ? `${score}%` : `${score.toFixed(1)}%`
  }
  
  // Если это балл
  return Number.isInteger(score) ? score.toString() : score.toFixed(1)
}

// Текст для вероятности/совместимости
const getProbabilityText = (probability) => {
  if (props.testResult.testId?.includes('compatibility') || 
      props.testResult.testId?.includes('readiness')) {
    return `Совместимость: ${probability}%`
  }
  return `Вероятность: ${probability}%`
}

// Лейбл для балла
const getScoreLabel = () => {
  const score = props.testResult.score
  
  if (score <= 100 && score >= 0) {
    return 'результат'
  }
  return 'баллов'
}
</script>

<style scoped>
.base-result-card {
  margin-bottom: var(--spacing-xl);
}

.base-result-card__test-info {
  margin-bottom: var(--spacing-lg);
}

.base-result-card__meta {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
}

.base-result-card__meta-item {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.base-result-card__score-section {
  border-top: 2px solid var(--color-bg-secondary);
  padding-top: var(--spacing-lg);
}

.base-result-card__score-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border-primary);
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  transition: var(--transition-normal);
}

.base-result-card__score-badge {
  text-align: center;
  min-width: 120px;
}

.base-result-card__score-emoji {
  font-size: 2rem;
  margin-bottom: var(--spacing-xs);
}

.base-result-card__score-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.base-result-card__score-details {
  flex: 1;
}

.base-result-card__description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
  line-height: var(--line-height-relaxed);
}

.base-result-card__probability {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  display: inline-block;
}

.base-result-card__simple-result {
  text-align: center;
  padding: var(--spacing-lg);
  border-top: 2px solid var(--color-bg-secondary);
}

.base-result-card__simple-score {
  display: inline-block;
}

.base-result-card__score-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

@media (max-width: 768px) {
  .base-result-card__score-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .base-result-card__meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>