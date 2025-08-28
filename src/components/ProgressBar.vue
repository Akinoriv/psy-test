<template>
  <div class="progress-bar">
    <div v-if="label" class="progress-bar__label">
      {{ label }}
      <span class="progress-bar__percentage">{{ progress }}%</span>
    </div>
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: progress + '%' }"></div>
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
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.progress-bar__percentage {
  color: #6366f1;
  font-weight: 600;
}

.progress-bar__track {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
