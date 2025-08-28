<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-group__label">
      {{ label }}
      <span v-if="required" class="input-group__required">*</span>
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

    <div v-if="error" class="input-group__error">
      {{ error }}
    </div>

    <div v-if="hint && !error" class="input-group__hint">
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
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue', 'focus', 'blur'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const baseClasses = 'input-group__input'
  const errorClass = props.error ? 'input-group__input--error' : ''
  const disabledClass = props.disabled ? 'input-group__input--disabled' : ''

  return [baseClasses, errorClass, disabledClass].filter(Boolean).join(' ')
})
</script>

<style scoped>
.input-group {
  margin-bottom: 16px;
}

.input-group__label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input-group__required {
  color: #ef4444;
  margin-left: 2px;
}

.input-group__input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  background-color: white;
}

.input-group__input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-group__input--error {
  border-color: #ef4444;
}

.input-group__input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-group__input--disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-group__error {
  margin-top: 4px;
  color: #ef4444;
  font-size: 12px;
}

.input-group__hint {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}
</style>
