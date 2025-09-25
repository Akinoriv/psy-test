<template>
  <div class="page">
    <main class="page__main">
      <div class="container container--narrow">
        <div class="card">
          <!-- Заголовок -->
          <div class="text--center p-4">
            <h1 class="heading heading--h1">Добро пожаловать!</h1>
            <p class="text text--secondary">
              Пройдите регистрацию, чтобы получить персонализированные психологические тесты
            </p>
          </div>

          <!-- Форма -->
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
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

            <!-- Пол -->
            <div class="form-field">
              <label class="form-field__label">Пол</label>
              <div class="flex gap-2">
                <label class="option option--radio">
                  <input 
                    type="radio" 
                    value="male" 
                    v-model="form.gender" 
                    class="option__input" 
                  />
                  <span class="option__label">Мужской</span>
                </label>
                <label class="option option--radio">
                  <input
                    type="radio"
                    value="female"
                    v-model="form.gender"
                    class="option__input"
                  />
                  <span class="option__label">Женский</span>
                </label>
                <label class="option option--radio">
                  <input 
                    type="radio" 
                    value="other" 
                    v-model="form.gender" 
                    class="option__input" 
                  />
                  <span class="option__label">Другой</span>
                </label>
              </div>
              <div v-if="errors.gender" class="text text--error">
                {{ errors.gender }}
              </div>
            </div>

            <BaseInput
              v-model="form.occupation"
              label="Род деятельности"
              placeholder="Например: Программист, Студент, Учитель"
              :error="errors.occupation"
            />

            <!-- Согласие на обработку данных -->
            <div class="form-field">
              <label class="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="form.dataConsent" 
                  class="option__input" 
                  required 
                />
                <span class="text text--sm">
                  Я согласен(а) на сбор и обработку персональных данных в соответствии с
                  <a href="#" class="text-primary">Политикой конфиденциальности</a>. 
                  Данные будут использованы исключительно для анализа результатов тестирования 
                  и улучшения качества сервиса.
                </span>
              </label>
              <div v-if="errors.dataConsent" class="text text--error">
                {{ errors.dataConsent }}
              </div>
            </div>

            <!-- Согласие на исследования -->
            <div class="form-field">
              <label class="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="form.researchConsent" 
                  class="option__input" 
                />
                <span class="text text--sm text--secondary">
                  Я согласен(а) на использование анонимных данных для научных исследований 
                  в области психологии (не обязательно)
                </span>
              </label>
            </div>

            <BaseButton 
              type="submit" 
              :disabled="isLoading" 
              full-width 
              class="m-2"
            >
              {{ isLoading ? 'Регистрируем...' : 'Зарегистрироваться' }}
            </BaseButton>

            <div v-if="errors.submit" class="text text--error text--center">
              {{ errors.submit }}
            </div>
          </form>
        </div>
      </div>
    </main>
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

<style scoped>
.form-field {
  margin-bottom: 1rem;
}

.form-field__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.text--error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: 0.25rem;
}

.text-primary {
  color: var(--color-primary);
}

.cursor-pointer {
  cursor: pointer;
}
</style>