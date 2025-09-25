<template>
  <div class="question-component">
    <h3 class="question-component__title">{{ question }}</h3>

    <div class="scale-question">
      <!-- Лейблы для крайних значений -->
      <div v-if="scale.labels" class="scale-question__labels">
        <span class="text text--secondary text--sm">{{ scale.labels[scale.min] }}</span>
        <span class="text text--secondary text--sm">{{ scale.labels[scale.max] }}</span>
      </div>

      <!-- Шкала значений -->
      <div class="scale-question__options">
        <label
          v-for="value in scaleValues"
          :key="value"
          class="scale-question__option"
          :class="{ 'scale-question__option--selected': modelValue === value }"
        >
          <input
            type="radio"
            :value="value"
            :checked="modelValue === value"
            @change="$emit('update:modelValue', value)"
            class="scale-question__input"
          />
          <span class="scale-question__value">{{ value }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  scale: {
    type: Object,
    required: true,
    validator: (value) => value.min && value.max && value.min < value.max,
  },
  modelValue: {
    type: Number,
    default: null,
  },
})

defineEmits(['update:modelValue'])

const scaleValues = computed(() => {
  const values = []
  for (let i = props.scale.min; i <= props.scale.max; i++) {
    values.push(i)
  }
  return values
})
</script>

<style scoped>
.scale-question {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.scale-question__labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.scale-question__options {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.scale-question__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.scale-question__option:hover .scale-question__value {
  background-color: var(--color-primary);
  color: white;
}

.scale-question__option--selected .scale-question__value {
  background-color: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.scale-question__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.scale-question__value {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
}

.text--primary {
  color: var(--color-primary);
}
</style>
