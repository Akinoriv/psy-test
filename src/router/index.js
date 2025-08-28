import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'

// Lazy loading компонентов для лучшей производительности
const RegistrationPage = () => import('../pages/RegistrationPage.vue')
const DashboardPage = () => import('../pages/DashboardPage.vue')
const TestPage = () => import('../pages/TestPage.vue')
const ResultPage = () => import('../pages/ResultPage.vue')

const routes = [
  {
    path: '/',
    name: 'Registration',
    component: RegistrationPage,
    meta: {
      title: 'Регистрация - Психологические тесты',
      requiresAuth: false,
      hideForAuthenticated: true,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      title: 'Дашборд - Психологические тесты',
      requiresAuth: true,
    },
  },
  {
    path: '/test/:testId',
    name: 'Test',
    component: TestPage,
    meta: {
      title: 'Тест - Психологические тесты',
      requiresAuth: true,
    },
    props: true,
  },
  {
    path: '/result/:testId',
    name: 'Result',
    component: ResultPage,
    meta: {
      title: 'Результаты - Психологические тесты',
      requiresAuth: true,
    },
    props: true,
  },
  {
    path: '/results',
    name: 'AllResults',
    redirect: '/dashboard',
  },
  {
    // Перехват всех несуществующих маршрутов
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Глобальные guards для авторизации и редиректов
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Загружаем пользователя из localStorage если еще не загружен
  if (!userStore.isAuthenticated) {
    userStore.loadUser()
  }

  // Проверяем требования к авторизации
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/')
    return
  }

  // Скрываем страницы для авторизованных пользователей
  if (to.meta.hideForAuthenticated && userStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // Обновляем заголовок страницы
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

// Обработка ошибок навигации
router.onError((error) => {
  console.error('Router error:', error)
  // В продакшене здесь можно отправить ошибку в систему логирования
})

export default router
