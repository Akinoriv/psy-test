# 🤖 AI Assistant Information - Психологические тесты

## Обзор проекта

Современная веб-платформа для прохождения психологических тестов, построенная на Vue 3 с использованием Composition API, SCSS, и БЭМ методологии. Проект полностью переработан с упором на чистую архитектуру и переиспользуемые компоненты.

## 🏗️ Актуальная архитектура

### Основные технологии

- **Vue 3** с Composition API
- **Vue Router** для маршрутизации
- **Pinia** для управления состоянием
- **SCSS** с БЭМ методологией
- **Vite** для сборки

### Структура файлов (АКТУАЛЬНАЯ)

```
src/
├── components/
│   ├── MultipleChoice.vue      # ✅ РАБОТАЕТ - простой компонент
│   ├── SingleChoice.vue        # Компонент одиночного выбора
│   └── test/                   # Компоненты интерфейса тестов
├── composables/
│   └── useTestLogic.js        # ✅ ИСПРАВЛЕН - основная логика
├── pages/
│   ├── ResultPage.vue         # ✅ ИСПРАВЛЕН - без заглушек
│   ├── TestPage.vue           # Страница прохождения теста
│   └── DashboardPage.vue      # Главная страница
├── stores/
│   └── userStore.js           # Pinia store для пользователя
├── styles/                    # 🆕 НОВАЯ СИСТЕМА СТИЛЕЙ
│   ├── base.scss              # Переменные, базовые стили
│   ├── components.scss        # Компонентные стили (БЭМ)
│   ├── pages.scss             # Стили страниц
│   ├── utilities.scss         # Утилитарные классы
│   └── main.scss              # Главный файл импорта
├── tests/
│   ├── husband-readiness/     # ✅ УПРОЩЕН - убраны баллы
│   │   ├── config.js          # Простая конфигурация
│   │   ├── calculator.js      # Простой калькулятор
│   │   ├── interpreter.js     # Интерпретация результатов
│   │   └── index.js           # Объединяющий модуль
│   └── stress-burnout/        # Тест на стресс (старая система)
└── utils/
```

## 📋 Состояние компонентов

### ✅ РАБОТАЮЩИЕ компоненты

- **MultipleChoice.vue** - простая работающая версия без баллов
- **App.vue** - обновлен, использует новую систему стилей
- **ResultPage.vue** - исправлен, убраны заглушки, адаптивный

### 🔧 ИСПРАВЛЕННЫЕ модули

- **useTestLogic.js** - упрощенная логика без сложных computed
- **husband-readiness тест** - убраны weight, required, приколюхи
- **Стили** - полностью переработаны в БЭМ методологии

## 🎨 Новая система стилей (БЭМ)

### Структура стилей

```scss
// Блок
.component-name {
  // Элемент
  &__element {
    // Модификатор
    &--modifier {
    }
  }
}
```

### Основные компонентные классы

```scss
// Кнопки
.btn
.btn--primary
.btn--secondary
.btn--ghost
.btn--large

// Карточки
.card
.card--elevated
.card--hover

// Контейнеры
.container
.container--narrow
.container--wide

// Бейджи
.badge
.badge--primary
.badge--success

// Алерты
.alert
.alert--info
.alert--success
.alert--warning
.alert--danger
```

### CSS переменные

```scss
// Цвета
--color-primary: #6366f1;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;

// Отступы
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

// Радиусы
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

## 🧪 Система тестов

### Упрощенная структура теста

```javascript
// config.js
export default {
  id: 'test-name',
  title: 'Название',
  initialQuestions: [
    {
      id: 'question-id',
      type: 'multiple|single|scale',
      question: 'Текст вопроса',
      options: [
        { value: 'option1', label: 'Опция 1' }
      ]
    }
  ]
}

// calculator.js
export default class Calculator {
  calculate(answers, demographics, config) {
    // Простая логика подсчета
    return {
      testId: config.id,
      score: calculatedScore,
      level: 'excellent|good|average|low'
    }
  }
}

// interpreter.js
export default class Interpreter {
  interpret(result) {
    return {
      emoji: '😊',
      label: 'Результат',
      description: 'Описание',
      color: '#10b981'
    }
  }

  generatePersonalizedNotes(result) {
    return ['Персональная заметка']
  }
}
```

## 📊 Текущие тесты

### 1. husband-readiness (ИСПРАВЛЕН)

- ✅ Упрощен - убраны баллы, weight, required
- ✅ 2 простых вопроса
- ✅ Простой алгоритм совместимости
- ✅ Персональные заметки

### 2. stress-burnout

- ✅ Работает по старой системе
- 21 вопрос со шкалой
- Интерпретация по уровням стресса

## 🔧 Частые проблемы и их решения

### Проблема: "Опции не загружены"

**Причина**: currentQuestion возвращает строку вместо объекта
**Решение**: Проверить структуру questionsFlow в useTestLogic.js

### Проблема: Стили не применяются

**Причина**: Не подключен main.scss
**Решение**:

```vue
<style lang="scss">
@import './styles/main.scss';
</style>
```

### Проблема: Результаты не сохраняются

**Причина**: Ошибка в calculator или interpreter
**Решение**: Проверить console.log в finishTest()

## 🎯 Правила для ассистентов

### ✅ ЧТО ДЕЛАТЬ

1. Использовать БЭМ методологию для всех новых стилей
2. Применять существующие компонентные классы (.btn, .card, etc.)
3. Использовать CSS переменные из base.scss
4. Следовать простой структуре тестов без сложных балльных систем
5. Проверять работоспособность в DevTools

### ❌ ЧЕГО НЕ ДЕЛАТЬ

1. Не создавать сложные системы подсчета баллов
2. Не дублировать стили - использовать существующие классы
3. Не нарушать БЭМ методологию
4. Не создавать inline стили без крайней необходимости
5. Не игнорировать адаптивность

## 🐛 Известные баги (ИСПРАВЛЕНЫ)

- ✅ MultipleChoice не показывает опции - ИСПРАВЛЕНО
- ✅ ResultPage показывает заглушки - ИСПРАВЛЕНО
- ✅ Стили дублируются - ИСПРАВЛЕНО (вынесены в отдельные файлы)
- ✅ husband-readiness сложная система баллов - УПРОЩЕНО

## 📱 Адаптивность

Все компоненты адаптивны с breakpoints:

- Mobile: < 640px
- Tablet: 640px - 768px
- Desktop: > 768px

Используются утилитарные классы:

```scss
.sm\:hidden      // скрыть на мобильном
.md\:flex-col    // колонка на планшете
.container       // автоматические отступы
```

## 🚀 Деплой и сборка

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Превью
npm run preview
```

## 📞 Поддержка

При возникновении проблем:

1. Проверить console.log в DevTools
2. Убедиться что все файлы подключены
3. Проверить структуру данных в Vue DevTools
4. Сравнить с рабочими примерами в коде

---

**Примечание для ИИ**: Этот проект был полностью переработан. Используйте только актуальную информацию из этого документа. Старые подходы с complex computed, TestRegistry, и сложными системами баллов больше не используются.
