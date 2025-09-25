<template>
  <div class="single-choice">
    <h3 class="single-choice__question">{{ question }}</h3>

    <div class="single-choice__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="single-choice__option"
        :class="{ 'single-choice__option--selected': isSelected(option.value) }"
      >
        <input
          type="radio"
          :name="`question-${Math.random()}`"
          :value="option.value"
          :checked="isSelected(option.value)"
          @change="selectOption(option.value)"
          class="single-choice__radio"
        />
        <span class="single-choice__label">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const isSelected = (value) => {
  return props.modelValue === value
}

const selectOption = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.single-choice {
  margin-bottom: var(--spacing-xl);
}

.single-choice__question {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-normal);
}

.single-choice__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.single-choice__option {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  background-color: var(--color-bg-primary);
}

.single-choice__option:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.single-choice__option--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.single-choice__radio {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-sm);
  accent-color: var(--color-primary);
  cursor: pointer;
}

.single-choice__label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
  flex: 1;
  cursor: pointer;
}
</style>
