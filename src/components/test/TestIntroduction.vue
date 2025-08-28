# src/components/test/TestIntroduction.vue ```vue
<template>
  <div class="test-intro">
    <div class="test-intro__card">
      <div class="test-intro__icon">🧠</div>

      <h2 class="test-intro__title">{{ currentTest?.title }}</h2>
      <p class="test-intro__description">{{ testData?.description }}</p>

      <div class="test-intro__info">
        <div class="test-intro__info-item">
          <div class="test-intro__info-icon">⏱️</div>
          <div class="test-intro__info-content">
            <strong>Примерное время:</strong> {{ currentTest?.duration }}
          </div>
        </div>
        <div class="test-intro__info-item">
          <div class="test-intro__info-icon">📝</div>
          <div class="test-intro__info-content">
            <strong>Количество вопросов:</strong> {{ currentTest?.questionsCount }}
          </div>
        </div>
        <div class="test-intro__info-item">
          <div class="test-intro__info-icon">🎯</div>
          <div class="test-intro__info-content">
            <strong>Тип теста:</strong> Адаптивный (вопросы изменяются в зависимости от ответов)
          </div>
        </div>
      </div>

      <div class="test-intro__instructions">
        <h3 class="test-intro__instructions-title">📋 Инструкция по прохождению:</h3>
        <ul class="test-intro__instructions-list">
          <li>Отвечайте честно и обдуманно на каждый вопрос</li>
          <li>Нет правильных или неправильных ответов</li>
          <li>При необходимости можно вернуться к предыдущим вопросам</li>
          <li>Тест автоматически сохраняет ваш прогресс</li>
          <li>Результаты будут учитывать ваши демографические данные</li>
        </ul>
      </div>

      <BaseButton
        @click="$emit('startTest')"
        variant="primary"
        size="large"
        full-width
        class="test-intro__start-button"
      >
        🚀 Начать тестирование
      </BaseButton>

      <div class="test-intro__privacy">
        <div class="test-intro__privacy-icon">🔒</div>
        <div class="test-intro__privacy-text">
          Ваши данные защищены и используются только для анализа результатов
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '../BaseButton.vue'

defineProps({
  testData: Object,
  currentTest: Object,
})

defineEmits(['startTest'])
</script>

<style scoped>
.test-intro {
  display: flex;
  justify-content: center;
  animation: fadeIn 0.5s ease-out;
}

.test-intro__card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.test-intro__icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}

.test-intro__title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.test-intro__description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
  text-align: left;
}

.test-intro__info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  margin: 0 0 32px 0;
  text-align: left;
}

.test-intro__info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.test-intro__info-item:last-child {
  margin-bottom: 0;
}

.test-intro__info-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.test-intro__info-content {
  flex: 1;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.test-intro__instructions {
  margin: 0 0 32px 0;
  text-align: left;
}

.test-intro__instructions-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-intro__instructions-list {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
}

.test-intro__instructions-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.test-intro__privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin: 0 0 32px 0;
}

.test-intro__privacy-icon {
  font-size: 16px;
  color: #15803d;
}

.test-intro__privacy-text {
  font-size: 13px;
  color: #15803d;
  font-weight: 500;
}

.test-intro__start-button {
  font-size: 18px;
  padding: 16px 32px;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .test-intro__card {
    padding: 24px;
    border-radius: 16px;
  }

  .test-intro__title {
    font-size: 24px;
  }

  .test-intro__icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .test-intro__info {
    padding: 20px;
  }

  .test-intro__start-button {
    font-size: 16px;
    padding: 14px 28px;
  }
}
</style>
```
