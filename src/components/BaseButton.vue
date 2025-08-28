# src/components/BaseButton.vue vue
<template>
  <button :class="buttonClasses" :disabled="disabled" @click="$emit('click', $event)" :type="type">
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'outline'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses = 'btn'
  const variantClass = `btn--${props.variant}`
  const sizeClass = `btn--${props.size}`
  const disabledClass = props.disabled ? 'btn--disabled' : ''
  const fullWidthClass = props.fullWidth ? 'btn--full-width' : ''

  return [baseClasses, variantClass, sizeClass, disabledClass, fullWidthClass]
    .filter(Boolean)
    .join(' ')
})
</script>

<style scoped>
.btn {
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-family: inherit;
}

.btn--primary {
  background-color: #6366f1;
  color: white;
}

.btn--primary:hover:not(.btn--disabled) {
  background-color: #5855eb;
}

.btn--secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn--secondary:hover:not(.btn--disabled) {
  background-color: #e5e7eb;
}

.btn--danger {
  background-color: #ef4444;
  color: white;
}

.btn--danger:hover:not(.btn--disabled) {
  background-color: #dc2626;
}

.btn--outline {
  background-color: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
}

.btn--outline:hover:not(.btn--disabled) {
  background-color: #6366f1;
  color: white;
}

.btn--small {
  padding: 8px 16px;
  font-size: 14px;
}

.btn--medium {
  padding: 12px 24px;
  font-size: 16px;
}

.btn--large {
  padding: 16px 32px;
  font-size: 18px;
}

.btn--full-width {
  width: 100%;
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
