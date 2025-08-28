# src/components/MultipleChoice.vue vue
<template>
  <div class="multiple-choice">
    <h3 class="multiple-choice__question">{{ question }}</h3>

    <div class="multiple-choice__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="multiple-choice__option"
        :class="{ 'multiple-choice__option--selected': isSelected(option.value) }"
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="isSelected(option.value)"
          @change="toggleOption(option.value)"
          class="multiple-choice__checkbox"
        />
        <span class="multiple-choice__label">{{ option.label }}</span>
      </label>
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
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const isSelected = (value) => {
  return props.modelValue.includes(value)
}

const toggleOption = (value) => {
  const currentValues = [...props.modelValue]
  const index = currentValues.indexOf(value)

  if (index > -1) {
    currentValues.splice(index, 1)
  } else {
    currentValues.push(value)
  }

  emit('update:modelValue', currentValues)
}
</script>

<style scoped>
.multiple-choice {
  margin-bottom: 32px;
}

.multiple-choice__question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.4;
}

.multiple-choice__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.multiple-choice__option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.multiple-choice__option:hover {
  border-color: #6366f1;
  background-color: #f8faff;
}

.multiple-choice__option--selected {
  border-color: #6366f1;
  background-color: #eef2ff;
}

.multiple-choice__checkbox {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #6366f1;
}

.multiple-choice__label {
  font-size: 16px;
  color: #374151;
  line-height: 1.4;
  flex: 1;
}
</style>
