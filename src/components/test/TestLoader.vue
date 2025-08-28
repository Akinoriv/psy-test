<template>
  <div class="test-loader">
    <div class="test-loader__content">
      <div class="test-loader__spinner">
        <div class="test-loader__circle"></div>
        <div class="test-loader__circle"></div>
        <div class="test-loader__circle"></div>
      </div>

      <h2 class="test-loader__title">Подготавливаем тест...</h2>
      <p class="test-loader__description">
        Загружаем персонализированные вопросы специально для вас
      </p>

      <div class="test-loader__progress">
        <div class="test-loader__progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Компонент только для отображения, логика не нужна
</script>

<style scoped>
.test-loader {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.test-loader__content {
  text-align: center;
  color: white;
  max-width: 400px;
}

.test-loader__spinner {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.test-loader__circle {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.test-loader__circle:nth-child(1) {
  animation-delay: -0.32s;
}

.test-loader__circle:nth-child(2) {
  animation-delay: -0.16s;
}

.test-loader__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
}

.test-loader__description {
  font-size: 16px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.test-loader__progress {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.test-loader__progress-bar {
  height: 100%;
  background-color: white;
  border-radius: 2px;
  animation: progress 2s infinite ease-in-out;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes progress {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 75%;
    margin-left: 12.5%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

@media (max-width: 768px) {
  .test-loader__title {
    font-size: 20px;
  }

  .test-loader__description {
    font-size: 14px;
  }
}
</style>
```
