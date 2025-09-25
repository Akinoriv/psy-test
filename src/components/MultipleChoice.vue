<template>
  <div class="question-component">
    <h3 class="question-component__title">{{ question }}</h3>

    <div class="question-options">
      <label
        v-for="option in options"
        :key="option.value"
        class="option"
        :class="{ 'option--selected': isSelected(option.value) }"
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="isSelected(option.value)"
          @change="toggleOption(option.value)"
          class="option__input"
        />
        <span class="option__label">{{ option.label }}</span>
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

<!-- Стили удалены - используем только универсальные классы из _layouts.scss -->