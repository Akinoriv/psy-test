<template>
  <div class="progress-bar">
    <div v-if="label" class="progress-bar__label">
      <span class="text text--sm font-medium">{{ label }}</span>
      <span class="text text--sm font-semibold text--primary">{{ progress }}%</span>
    </div>
    <div class="progress-bar__track">
      <div 
        class="progress-bar__fill" 
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100,
  },
  label: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.progress-bar {
  width: 100%;
}

.progress-bar__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-bar__track {
  width: 100%;
  height: 8px;
  background-color: var(--color-border-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
}

.text--primary {
  color: var(--color-primary);
}
</style>