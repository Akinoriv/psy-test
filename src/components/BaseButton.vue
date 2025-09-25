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
    validator: (value) => ['primary', 'secondary', 'ghost', 'outline'].includes(value),
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
  const classes = ['btn']
  
  // Варианты
  classes.push(`btn--${props.variant}`)
  
  // Размеры (если не дефолтный)
  if (props.size !== 'medium') {
    const sizeMap = {
      small: 'sm',
      large: 'lg'
    }
    classes.push(`btn--${sizeMap[props.size]}`)
  }
  
  // Модификаторы
  if (props.fullWidth) classes.push('btn--full-width')
  if (props.disabled) classes.push('btn--disabled')

  return classes
})
</script>

<!-- Стили удалены - используем только универсальные классы из _components.scss -->