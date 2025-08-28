<template>
  <div class="scale-question">
    <h3 class="scale-question__question">{{ question }}</h3>

    <div class="scale-question__container">
      <div class="scale-question__labels" v-if="scale.labels">
        <span class="scale-question__label-start">{{ scale.labels[scale.min] }}</span>
        <span class="scale-question__label-end">{{ scale.labels[scale.max] }}</span>
      </div>

      <div class="scale-question__scale">
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
            class="scale-question__radio"
          />
          <span class="scale-question__value">{{ value }}</span>
        </label>
      </div>

      <div class="scale-question__current" v-if="modelValue">Выбрано: {{ modelValue }}</div>
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
  margin-bottom: 32px;
}

.scale-question__question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.4;
}

.scale-question__container {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.scale-question__labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.scale-question__scale {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

.scale-question__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scale-question__option:hover .scale-question__value {
  background-color: #6366f1;
  color: white;
}

.scale-question__option--selected .scale-question__value {
  background-color: #6366f1;
  color: white;
  transform: scale(1.1);
}

.scale-question__radio {
  display: none;
}

.scale-question__value {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  font-weight: 600;
  background-color: white;
  color: #374151;
  transition: all 0.2s ease;
}

.scale-question__current {
  text-align: center;
  font-weight: 500;
  color: #6366f1;
}
</style>
