<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <div class="auth-page__header">
        <h1 class="heading heading--h1">Добро пожаловать!</h1>
        <p class="text text--secondary text--center">
          Пройдите регистрацию, чтобы получить персонализированные психологические тесты
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
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

        <div class="form__field">
          <label class="form__label">Пол</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" value="male" v-model="form.gender" class="radio-option__input" />
              <span class="radio-option__label">Мужской</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                value="female"
                v-model="form.gender"
                class="radio-option__input"
              />
              <span class="radio-option__label">Женский</span>
            </label>
            <label class="radio-option">
              <input type="radio" value="other" v-model="form.gender" class="radio-option__input" />
              <span class="radio-option__label">Другой</span>
            </label>
          </div>
          <div v-if="errors.gender" class="form__error">
            {{ errors.gender }}
          </div>
        </div>

        <BaseInput
          v-model="form.occupation"
          label="Род деятельности"
          placeholder="Например: Программист, Студент, Учитель"
          :error="errors.occupation"
        />

        <div class="consent">
          <label class="consent__label">
            <input type="checkbox" v-model="form.dataConsent" class="consent__checkbox" required />
            <span class="consent__text">
              Я согласен(а) на сбор и обработку персональных данных в соответствии с
              <a href="#" class="link">Политикой конфиденциальности</a>. Данные будут использованы
              исключительно для анализа результатов тестирования и улучшения качества сервиса.
            </span>
          </label>
          <div v-if="errors.dataConsent" class="form__error">
            {{ errors.dataConsent }}
          </div>
        </div>

        <div class="consent">
          <label class="consent__label">
            <input type="checkbox" v-model="form.researchConsent" class="consent__checkbox" />
            <span class="consent__text">
              Я согласен(а) на использование анонимных данных для научных исследований в области
              психологии (не обязательно)
            </span>
          </label>
        </div>

        <BaseButton type="submit" :disabled="isLoading" full-width class="form__submit">
          {{ isLoading ? 'Регистрируем...' : 'Зарегистрироваться' }}
        </BaseButton>

        <div v-if="errors.submit" class="form__error form__error--submit">
          {{ errors.submit }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
  console.log('form :>> ', form)
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
  console.log('📝 Registration form submitted')

  if (!validateForm()) {
    console.log('❌ Form validation failed:', errors.value)
    return
  }

  isLoading.value = true
  errors.value = {}

  try {
    console.log('🔄 Registering user...')

    const userData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      age: parseInt(form.age),
      gender: form.gender,
      occupation: form.occupation.trim(),
      dataConsent: form.dataConsent,
      researchConsent: form.researchConsent,
    }

    console.log('👤 User data:', userData)

    await userStore.registerUser(userData)

    console.log('✅ User registered successfully')
    router.push('/dashboard')
  } catch (error) {
    console.error('❌ Registration failed:', error)
    errors.value.submit = 'Ошибка регистрации. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}

// Проверяем, если пользователь уже залогинен
onMounted(async () => {
  console.log('🔧 Registration page mounted')

  // Загружаем пользователя если есть сохраненные данные
  await userStore.loadUser()

  // Если уже аутентифицирован - перенаправляем на дашборд
  if (userStore.isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to dashboard')
    router.push('/dashboard')
  }
})
</script>
