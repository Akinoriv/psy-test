<template>
  <div class="loading-state">
    <div class="loading-state__icon">
      <div class="test-loader__spinner">
        <div class="test-loader__circle"></div>
        <div class="test-loader__circle"></div>
        <div class="test-loader__circle"></div>
      </div>
    </div>

    <h2 class="heading heading--h3">Подготавливаем тест...</h2>
    <p class="text text--secondary text--center">
      Загружаем персонализированные вопросы специально для вас
    </p>
  </div>
</template>

<style scoped>
.test-loader__spinner {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.test-loader__circle {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  animation: bounce 1.4s ease-in-out infinite both;
}

.test-loader__circle:nth-child(1) {
  animation-delay: -0.32s;
}

.test-loader__circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>