<template>
  <div class="question-component">
    <h3 class="question-component__title">{{ question }}</h3>

    <div class="question-options">
      <label
        v-for="option in options"
        :key="option.value"
        class="option option--radio"
        :class="{ 'option--selected': isSelected(option.value) }"
      >
        <input
          type="radio"
          :name="`question-${Math.random()}`"
          :value="option.value"
          :checked="isSelected(option.value)"
          @change="selectOption(option.value)"
          class="option__input"
        />
        <div class="option__indicator"></div>
        <span class="option__label">{{ option.label }}</span>
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

<!-- Без style scoped - используем универсальные классы -->