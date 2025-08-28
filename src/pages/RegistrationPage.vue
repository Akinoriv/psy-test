<template>
  <div class="registration-page">
    <div class="registration-page__container">
      <div class="registration-page__header">
        <h1 class="registration-page__title">Добро пожаловать!</h1>
        <p class="registration-page__subtitle">
          Пройдите регистрацию, чтобы получить персонализированные психологические тесты
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="registration-page__form">
        <BaseInput
          v-model="form.name"
          label="Имя"
          placeholder="Введите ваше имя"
          required
          :error="errors.name"
        />

        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="example@email.com"
          required
          :error="errors.email"
        />

        <BaseInput
          v-model="form.age"
          type="number"
          label="Возраст"
          placeholder="25"
          required
          :error="errors.age"
        />

        <div class="registration-page__field">
          <label class="registration-page__label">Пол</label>
          <div class="registration-page__radio-group">
            <label class="registration-page__radio-option">
              <input
                type="radio"
                value="male"
                v-model="form.gender"
                class="registration-page__radio"
              />
              <span>Мужской</span>
            </label>
            <label class="registration-page__radio-option">
              <input
                type="radio"
                value="female"
                v-model="form.gender"
                class="registration-page__radio"
              />
              <span>Женский</span>
            </label>
            <label class="registration-page__radio-option">
              <input
                type="radio"
                value="other"
                v-model="form.gender"
                class="registration-page__radio"
              />
              <span>Другой</span>
            </label>
          </div>
          <div v-if="errors.gender" class="registration-page__error">
            {{ errors.gender }}
          </div>
        </div>

        <BaseInput
          v-model="form.occupation"
          label="Род деятельности"
          placeholder="Например: Программист, Студент, Учитель"
          :error="errors.occupation"
        />

        <div class="registration-page__consent">
          <label class="registration-page__consent-label">
            <input
              type="checkbox"
              v-model="form.dataConsent"
              class="registration-page__checkbox"
              required
            />
            <span class="registration-page__consent-text">
              Я согласен(а) на сбор и обработку персональных данных в соответствии с
              <a href="#" class="registration-page__link">Политикой конфиденциальности</a>. Данные
              будут использованы исключительно для анализа результатов тестирования и улучшения
              качества сервиса.
            </span>
          </label>
          <div v-if="errors.dataConsent" class="registration-page__error">
            {{ errors.dataConsent }}
          </div>
        </div>

        <div class="registration-page__consent">
          <label class="registration-page__consent-label">
            <input
              type="checkbox"
              v-model="form.researchConsent"
              class="registration-page__checkbox"
            />
            <span class="registration-page__consent-text">
              Я согласен(а) на использование анонимных данных для научных исследований в области
              психологии (не обязательно)
            </span>
          </label>
        </div>

        <BaseButton
          type="submit"
          :disabled="isLoading"
          full-width
          class="registration-page__submit"
        >
          {{ isLoading ? 'Регистрируем...' : 'Зарегистрироваться' }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import BaseInput from '../components/BaseInput.vue'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)

const form = reactive({
  name: '',
  email: '',
  age: '',
  gender: '',
  occupation: '',
  dataConsent: false,
  researchConsent: false,
})

const errors = ref({})

const validateForm = () => {
  const newErrors = {}

  if (!form.name.trim()) {
    newErrors.name = 'Имя обязательно для заполнения'
  } else if (form.name.trim().length < 2) {
    newErrors.name = 'Имя должно содержать минимум 2 символа'
  }

  if (!form.email.trim()) {
    newErrors.email = 'Email обязателен для заполнения'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = 'Введите корректный email'
  }

  if (!form.age) {
    newErrors.age = 'Возраст обязателен для заполнения'
  } else if (form.age < 14 || form.age > 100) {
    newErrors.age = 'Возраст должен быть от 14 до 100 лет'
  }

  if (!form.gender) {
    newErrors.gender = 'Выберите пол'
  }

  if (!form.dataConsent) {
    newErrors.dataConsent = 'Согласие на обработку данных обязательно'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  // if (!validateForm()) {
  //   return
  // }

  isLoading.value = true

  try {
    await userStore.registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      age: parseInt(form.age),
      gender: form.gender,
      occupation: form.occupation.trim(),
      dataConsent: form.dataConsent,
      researchConsent: form.researchConsent,
    })

    router.push('/dashboard')
  } catch (error) {
    console.error('Registration failed:', error)
    errors.value.submit = 'Ошибка регистрации. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.registration-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.registration-page__container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.registration-page__header {
  text-align: center;
  margin-bottom: 32px;
}

.registration-page__title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.registration-page__subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.registration-page__form {
  display: flex;
  flex-direction: column;
}

.registration-page__field {
  margin-bottom: 16px;
}

.registration-page__label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.registration-page__radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.registration-page__radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.registration-page__radio {
  margin-right: 8px;
  accent-color: #6366f1;
}

.registration-page__consent {
  margin-bottom: 20px;
}

.registration-page__consent-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.registration-page__checkbox {
  margin-right: 12px;
  margin-top: 4px;
  accent-color: #6366f1;
  flex-shrink: 0;
}

.registration-page__consent-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.registration-page__link {
  color: #6366f1;
  text-decoration: underline;
}

.registration-page__error {
  margin-top: 4px;
  color: #ef4444;
  font-size: 12px;
}

.registration-page__submit {
  margin-top: 16px;
}

@media (max-width: 600px) {
  .registration-page__container {
    margin: 20px;
    padding: 24px;
  }

  .registration-page__radio-group {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
