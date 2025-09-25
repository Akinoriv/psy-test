<template>
  <div class="input-field">
    <label v-if="label" :for="inputId" class="input-field__label">
      {{ label }}
      <span v-if="required" class="input-field__required">*</span>
    </label>
    <input
      :id="inputId"
      :value="modelValue"
      @input="handleInput"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    <div v-if="error" class="input-field__error">
      {{ error }}
    </div>
    <div v-if="hint && !error" class="input-field__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  return [
    'input-field__input',
    { 'input-field__input--error': props.error },
    { 'input-field__input--disabled': props.disabled }
  ]
})

function handleInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<style scoped>
.input-field {
  margin-bottom: var(--spacing-md);
}

.input-field__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.input-field__required {
  color: var(--color-error);
  margin-left: 2px;
}

.input-field__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: var(--transition-fast);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.input-field__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field__input--error {
  border-color: var(--color-error);
}

.input-field__input--error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-field__input--disabled {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.input-field__error {
  margin-top: var(--spacing-xs);
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.input-field__hint {
  margin-top: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}
</style>