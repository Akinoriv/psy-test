<template>
  <div class="single-choice">
    <h3 class="single-choice__question">{{ question }}</h3>

    <div class="single-choice__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="single-choice__option"
        :class="{ 'single-choice__option--selected': modelValue === option.value }"
      >
        <input
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="$emit('update:modelValue', option.value)"
          class="single-choice__radio"
        />
        <span class="single-choice__label">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.single-choice {
  margin-bottom: 32px;
}

.single-choice__question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.4;
}

.single-choice__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.single-choice__option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.single-choice__option:hover {
  border-color: #6366f1;
  background-color: #f8faff;
}

.single-choice__option--selected {
  border-color: #6366f1;
  background-color: #eef2ff;
}

.single-choice__radio {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #6366f1;
}

.single-choice__label {
  font-size: 16px;
  color: #374151;
  line-height: 1.4;
  flex: 1;
}
</style>
