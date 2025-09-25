# 🧠 Психологические Тесты - Платформа онлайн тестирования

Современная веб-платформа для прохождения психологических тестов с персонализированными результатами и рекомендациями.

## ✨ Особенности

- 🎯 **Разнообразие тестов**: Стресс-тест, тест совместимости и другие
- 📊 **Детальные результаты**: Персонализированный анализ и рекомендации
- 📱 **Адаптивный дизайн**: Отлично работает на всех устройствах
- 🎨 **Современный UI**: Чистый дизайн с плавными анимациями
- 💾 **Сохранение прогресса**: Возможность продолжить тест позже
- 🔐 **Приватность**: Данные хранятся локально в браузере

## 🏗️ Архитектура

### Технический стек

- **Frontend**: Vue 3 (Composition API), Vue Router, Pinia
- **Стили**: SCSS с БЭМ методологией
- **Сборка**: Vite
- **Тестирование**: Vitest (планируется)

### Структура проекта

```
src/
├── components/           # Переиспользуемые компоненты
│   ├── MultipleChoice.vue
│   ├── SingleChoice.vue
│   └── test/            # Компоненты для тестов
├── composables/         # Композиционные функции
│   ├── useTestLogic.js  # Основная логика тестирования
│   └── useDemographics.js
├── pages/               # Страницы приложения
├── stores/              # Pinia стейты
├── styles/              # SCSS стили с БЭМ
│   ├── base.scss        # Переменные и базовые стили
│   ├── components.scss  # Компонентные стили
│   ├── pages.scss       # Стили страниц
│   ├── utilities.scss   # Утилитарные классы
│   └── main.scss        # Главный файл стилей
├── tests/               # Конфигурации тестов
│   ├── husband-readiness/
│   │   ├── config.js
│   │   ├── calculator.js
│   │   ├── interpreter.js
│   │   └── index.js
│   └── stress-burnout/
├── utils/               # Утилитарные функции
└── router/              # Настройка маршрутизации
```

## 🎨 Дизайн-система

### БЭМ методология

Все компоненты используют БЭМ (Block Element Modifier) для структурированного CSS:

```scss
.component-name {
  // Block
  &__element {
    // Element
    &--modifier {
      // Modifier
    }
  }
}
```

### Цветовая палитра

```scss
// Основные цвета
--color-primary: #6366f1;
--color-secondary: #64748b;

// Семантические цвета
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;

// Текст
--color-text-primary: #1f2937;
--color-text-secondary: #6b7280;
```

### Компонентная библиотека

- **Кнопки**: `.btn` с модификаторами `--primary`, `--secondary`, `--ghost`
- **Карточки**: `.card` с модификаторами `--elevated`, `--hover`
- **Бейджи**: `.badge` с цветовыми вариантами
- **Контейнеры**: `.container` с размерными модификаторами

## 🧪 Доступные тесты

### 1. Тест на стресс и выгорание (`stress-burnout`)

- **Назначение**: Оценка уровня стресса и эмоционального выгорания
- **Количество вопросов**: 21 вопрос
- **Время прохождения**: 5-7 минут
- **Результат**: Уровень стресса от минимального до критического

### 2. Готовность стать мужем Вероники (`husband-readiness`)

- **Назначение**: Игровой тест на совместимость
- **Количество вопросов**: 2 блока вопросов
- **Время прохождения**: 3-5 минут
- **Результат**: Процент совместимости с персональными заметками

## 📋 API тестов

### Структура конфигурации теста

```javascript
{
  id: 'test-id',
  title: 'Название теста',
  description: 'Описание теста',
  category: 'Категория',
  estimatedTime: '5-7 минут',
  initialQuestions: [
    {
      id: 'question_id',
      type: 'multiple|single|scale',
      question: 'Текст вопроса',
      options: [
        { value: 'option_value', label: 'Текст опции' }
      ]
    }
  ]
}
```

### Calculator API

```javascript
class TestCalculator {
  calculate(answers, demographics, config) {
    // Логика подсчета результата
    return {
      testId: config.id,
      score: calculatedScore,
      level: 'excellent|good|average|low',
      // дополнительные поля...
    }
  }
}
```

### Interpreter API

```javascript
class TestInterpreter {
  interpret(result) {
    // Интерпретация результата
    return {
      emoji: '😊',
      label: 'Заголовок результата',
      description: 'Описание результата',
      color: '#10b981',
      probability: 85,
    }
  }

  generatePersonalizedNotes(result) {
    // Персональные рекомендации
    return ['Заметка 1', 'Заметка 2']
  }
}
```

## 🚀 Установка и запуск

### Предварительные требования

- Node.js 16+
- npm или yarn

### Клонирование и установка

```bash
git clone https://github.com/your-username/psy-tests.git
cd psy-tests
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
```

### Предварительный просмотр билда

```bash
npm run preview
```

## 🛠️ Разработка

### Добавление нового теста

1. **Создайте папку теста**:

```bash
mkdir src/tests/your-test-name
```

2. **Создайте конфигурацию** (`config.js`):

```javascript
export default {
  id: 'your-test-name',
  title: 'Название вашего теста',
  // ... остальная конфигурация
}
```

3. **Создайте калькулятор** (`calculator.js`):

```javascript
export default class YourTestCalculator {
  calculate(answers, demographics, config) {
    // Логика расчета
  }
}
```

4. **Создайте интерпретатор** (`interpreter.js`):

```javascript
export default class YourTestInterpreter {
  interpret(result) {
    // Логика интерпретации
  }
}
```

5. **Создайте индексный файл** (`index.js`):

```javascript
import config from './config.js'
import Calculator from './calculator.js'
import Interpreter from './interpreter.js'

export default {
  config,
  calculator: new Calculator(),
  interpreter: new Interpreter(),
}
```

### Добавление новых стилей

Все стили организованы по БЭМ методологии в папке `src/styles/`:

1. **Базовые стили** в `base.scss` - переменные, типографика
2. **Компоненты** в `components.scss` - переиспользуемые компоненты
3. **Страницы** в `pages.scss` - стили конкретных страниц
4. **Утилиты** в `utilities.scss` - вспомогательные классы

## 📱 Адаптивность

Платформа полностью адаптивна и использует mobile-first подход:

- **Мобильные устройства**: < 640px
- **Планшеты**: 640px - 768px
- **Десктоп**: > 768px

## 🔧 Конфигурация

### Переменные окружения

```env
VITE_APP_TITLE=Психологические тесты
VITE_APP_VERSION=1.0.0
```

### Настройка Vite

См. `vite.config.js` для настройки сборки и плагинов.

## 🧪 Тестирование

```bash
# Запуск тестов
npm run test

# Тесты с покрытием
npm run test:coverage

# Тесты в режиме наблюдения
npm run test:watch
```

## 📊 Система результатов

### Сохранение результатов

Результаты сохраняются в localStorage браузера в зашифрованном виде:

```javascript
{
  userId: 'user-id',
  testId: 'test-name',
  score: 85,
  interpretation: { /* данные интерпретации */ },
  personalizedNotes: ['заметка1', 'заметка2'],
  completedAt: '2024-01-01T12:00:00.000Z'
}
```

### Персонализация

Результаты персонализируются на основе:

- Демографических данных пользователя
- Паттернов ответов
- Исторических результатов

## 🎯 Планы развития

- [ ] Добавление новых типов вопросов (ранжирование, слайдеры)
- [ ] Система достижений и прогресса
- [ ] Экспорт результатов в PDF
- [ ] Сравнение результатов с предыдущими прохождениями
- [ ] Интеграция с API для синхронизации данных
- [ ] Темная тема
- [ ] Многоязычность (i18n)

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Стандарты кода

- Используйте ESLint и Prettier для форматирования
- Следуйте Vue 3 Composition API conventions
- Применяйте БЭМ методологию для стилей
- Пишите осмысленные commit сообщения

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 👥 Команда

- **Разработка**: [Ваше имя](https://github.com/username)
- **Дизайн**: [Дизайнер](https://github.com/designer)
- **Психологическое консультирование**: [Психолог](https://example.com)

## 📞 Контакты

- **Email**: contact@example.com
- **Telegram**: [@username](https://t.me/username)
- **Issues**: [GitHub Issues](https://github.com/username/psy-tests/issues)

---

**⚠️ Важно**: Результаты тестов носят информационный характер и не заменяют профессиональную психологическую консультацию.
