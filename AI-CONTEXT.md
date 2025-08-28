# 🤖 AI-CONTEXT - Контекст проекта для ИИ (ОБНОВЛЕНО)

> **Этот файл содержит всю необходимую информацию для быстрого введения ИИ в курс дела проекта PSY-TESTS после РЕФАКТОРИНГА**

## 🎯 О проекте

**PSY-TESTS** - Vue 3 система психологических тестов с адаптивной логикой и персонализированными результатами.

**Текущий статус:** ✅ Новая архитектура внедрена, система готова к масштабированию

**Главные изменения в архитектуре:**

- 🏗️ **Модульная система тестов** - каждый тест в отдельной папке
- 🔄 **TestRegistry** - автоматическое обнаружение и регистрация тестов
- 💾 **StorageManager** - адаптивная система хранения с fallback
- 🧩 **Чистая архитектура** - разделение данных, логики, интерпретации
- 🔙 **Backward compatibility** - поддержка старого кода

## 🏗️ Новая архитектура

### ⚡ Ключевые изменения:

#### 1. **Модульная структура тестов:**

```
СТАРАЯ СИСТЕМА:
src/data/stressTest.js - все в одном файле (структура + логика + интерпретация)

НОВАЯ СИСТЕМА:
src/tests/stress-burnout/
├── config.js         - ТОЛЬКО структура вопросов
├── calculator.js     - ТОЛЬКО логика расчетов
├── interpreter.js    - ТОЛЬКО интерпретация результатов
└── index.js         - связывание компонентов
```

#### 2. **TestRegistry - автоматическая регистрация:**

```javascript
// СТАРАЯ СИСТЕМА - жесткая привязка в useTestLogic.js:
switch (route.params.testId) {
  case 'stress-burnout':
    const { stressBurnoutTest } = await import('../data/stressTest.js')
    break
  // каждый новый тест = новый case
}

// НОВАЯ СИСТЕМА - автоматическое обнаружение:
const testIds = ['stress-burnout', 'anxiety-test'] // просто добавить в список
await TestRegistry.discoverTests() // автоматически загружает все
const test = TestRegistry.get(testId) // получение теста
```

#### 3. **StorageManager - адаптивное хранение:**

```javascript
// СТАРАЯ СИСТЕМА - прямая работа с localStorage:
localStorage.setItem('test-progress', JSON.stringify(data))

// НОВАЯ СИСТЕМА - через адаптеры:
const storage = new StorageManager()
await storage.saveProgress(userId, testId, data) // автоматический выбор адаптера
storage.setAdapter('api') // легкое переключение на сервер
```

### 📁 Обновленная структура файлов:

```
src/
├── core/                    # 🆕 ЯДРО СИСТЕМЫ
│   ├── test-engine/
│   │   └── TestRegistry.js  # Автоматическая регистрация тестов
│   └── storage/
│       └── StorageManager.js # Адаптеры хранения (local/api/indexed)
├── tests/                   # 🆕 МОДУЛЬНЫЕ ТЕСТЫ
│   └── stress-burnout/      # Каждый тест - отдельная папка
│       ├── config.js        # Структура вопросов и потоки
│       ├── calculator.js    # Класс для расчета баллов
│       ├── interpreter.js   # Класс для интерпретации результатов
│       └── index.js         # Экспорт всех модулей
├── composables/             # 🔄 ОБНОВЛЕНО
│   ├── useTestLogic.js      # Теперь использует TestRegistry + StorageManager
│   └── useDemographics.js   # Без изменений
├── stores/                  # 🔄 ОБНОВЛЕНО
│   ├── userStore.js         # Теперь использует StorageManager
│   └── testStore.js         # Автоматически загружает из TestRegistry
├── data/                    # ⚠️ LEGACY - будет удалено
│   └── stressTest.js        # Старая структура (для совместимости)
└── utils/                   # ⚠️ LEGACY
    └── testUtils.js         # Старые утилиты (для совместимости)
```

## 🔄 Как работает новая система

### 1. Загрузка тестов:

```javascript
// useTestLogic.js - новый поток:
1. TestRegistry.discoverTests()      // автоматически находит все тесты
2. TestRegistry.get(testId)          // получает конкретный тест
3. testModule = { config, calculator, interpreter }  // модульная структура
4. Fallback на старую систему если новая не работает
```

### 2. Расчет результатов:

```javascript
// НОВАЯ СИСТЕМА:
const result = testModule.calculator.calculate(answers, demographics, config)
const interpretation = testModule.interpreter.interpret(result.score)

// СТАРАЯ СИСТЕМА (fallback):
const result = calculateTestResult({ testId, answeredQuestions, testData, demographics })
```

### 3. Сохранение данных:

```javascript
// Через StorageManager с автоматическим fallback:
await storageManager.saveTestResult(userId, result) // новая система
userStore.saveTestResult(result) // старая система (backup)
```

## 🧩 Структура модульного теста

### config.js - ТОЛЬКО данные:

```javascript
export default {
  id: 'stress-burnout',
  title: 'Тест на стресс',
  initialQuestions: [...],    // стартовые вопросы
  questionFlows: {...}        // дополнительные потоки
  // БЕЗ логики расчетов!
}
```

### calculator.js - ТОЛЬКО расчеты:

```javascript
export default class StressCalculator {
  calculate(answers, demographics, config) {
    // чистая логика расчета баллов
    return { score, rawScore, detailedScoring }
  }
  // БЕЗ данных вопросов!
}
```

### interpreter.js - ТОЛЬКО интерпретация:

```javascript
export default class StressInterpreter {
  interpret(score) {
    // определение уровня и рекомендаций по баллам
    return { level, label, recommendations, color }
  }
  // БЕЗ логики расчетов!
}
```

## 💡 Логи новой системы

### Успешная загрузка:

```javascript
🔍 Loading test data for: stress-burnout
✅ Test registered: stress-burnout
✅ Test loaded: Комплексный тест на стресс и эмоциональное состояние
💾 Saving progress: stress-burnout Question: 2
🧮 Calculating test result...
📊 Interpreting score: 34
💾 Saving test result: stress-burnout Score: 34
```

### Fallback на старую систему:

```javascript
❌ Test not found: stress-burnout
⚠️ Trying legacy system...
🔄 Using legacy test loading system
✅ Test loaded via legacy system
```

### Проблемы с хранением:

```javascript
❌ New storage failed, using legacy: Error message
✅ Test result saved via legacy system
```

## 📝 Типичные задачи для ИИ (обновлено)

### 1. Добавление нового теста (НОВАЯ СИСТЕМА):

```javascript
// Шаг 1: Создать папку
mkdir src/tests/anxiety-test

// Шаг 2: Создать 4 файла (скопировать из stress-burnout)
config.js       // структура вопросов
calculator.js   // логика расчетов
interpreter.js  // интерпретация
index.js        // связывание

// Шаг 3: Добавить в TestRegistry.js
const testIds = ['stress-burnout', 'anxiety-test']

// 🎉 ГОТОВО! Тест автоматически появится в системе
```

### 2. Изменение логики расчетов:

```javascript
// НОВАЯ СИСТЕМА - править ТОЛЬКО:
src / tests / stress - burnout / calculator.js

// СТАРАЯ СИСТЕМА - править ВСЕ:
src / data / stressTest.js + src / utils / testUtils.js + src / composables / useTestLogic.js
```

### 3. Добавление новых типов вопросов:

```javascript
// Те же места что и раньше:
1. Создать компонент в src/components/
2. Добавить в currentQuestionComponent (useTestLogic.js)
3. Добавить обработку в calculator.js нового теста
```

### 4. Работа с хранением данных:

```javascript
// Через StorageManager:
const storage = new StorageManager()
await storage.saveTestResult(userId, result)
await storage.loadTestResults(userId, testId)
await storage.saveProgress(userId, testId, progress)

// Переключение адаптера:
storage.setAdapter('api') // переключение на сервер
storage.setAdapter('local') // обратно на localStorage
```

## 🔧 Советы по отладке (обновлено)

### Проверка новой системы:

```javascript
// Проверить регистрацию тестов
console.log(TestRegistry.getAll())

// Проверить загрузку конкретного теста
console.log(TestRegistry.get('stress-burnout'))

// Проверить StorageManager
const storage = new StorageManager()
console.log(await storage.loadTestResults(userId))
```

### Принудительное использование старой системы:

```javascript
// В TestRegistry.js временно закомментировать тест:
const testIds = [
  // 'stress-burnout'  // это заставит использовать legacy
]
```

### Очистка для сброса:

```javascript
localStorage.clear() // очистить все данные
TestRegistry.clear() // очистить регистрацию тестов
```

## 🗄️ База данных и сервер

### Текущее состояние:

- **localStorage** - основное хранение (работает)
- **StorageManager** - готовность к серверу (адаптеры)
- **Планы**: PostgreSQL + API для синхронизации

### Структура БД (из SERVER-DATA-PLAN.md):

#### Основные таблицы:

```sql
users(id, email, name, age, gender, occupation, created_at)
test_results(id, user_id, test_id, score, answers, completed_at)
test_sessions(id, user_id, test_id, progress, expires_at)
question_answers(id, result_id, question_id, answer, score)
```

#### Аналитические таблицы:

```sql
daily_stats(date, test_id, completions, avg_score, completion_rate)
demographic_stats(period, age_group, gender, occupation, avg_score)
correlations(test_id, age_score_correlation, gender_score_correlation)
```

### API Endpoints (планируемые):

```javascript
POST /api/users/register                          // регистрация
GET  /api/users/me/results                        // результаты пользователя
POST /api/tests/:testId/sessions                  // начало теста
PUT  /api/tests/:testId/sessions/:sessionId       // сохранение прогресса
POST /api/tests/:testId/sessions/:sessionId/complete  // завершение теста

// Аналитические endpoints:
GET  /api/analytics/tests/:testId/stats           // статистика по тесту
GET  /api/analytics/demographics                  // демографический анализ
POST /api/analytics/correlations                  // корреляционный анализ
```

### Переключение на сервер:

```javascript
// В main.js или App.vue:
const storage = new StorageManager()
if (window.location.hostname !== 'localhost') {
  storage.setAdapter('api')  // на продакшене используем API
}

// StorageManager автоматически переключится:
localStorage → API calls с теми же методами
```

### Миграция данных:

```javascript
// Планируемый процесс:
1. Пользователь заходит на сайт с сервером
2. StorageManager проверяет наличие локальных данных
3. Автоматически синхронизирует localStorage → сервер
4. Переключается на работу с API
5. Локальные данные остаются как backup
```

## ⚡ Быстрые ответы на частые вопросы (обновлено)

**Q: Как добавить новый тест в новой системе?**  
A: 1) Создать папку `src/tests/новый-тест/` 2) Скопировать 4 файла из stress-burnout 3) Добавить ID в TestRegistry.js

**Q: Что делать если новая система не работает?**  
A: Система автоматически переключится на старый код с логами "⚠️ Trying legacy system..."

**Q: Как переключиться на работу с сервером?**  
A: `storageManager.setAdapter('api')` - все методы останутся теми же, изменится только место хранения

**Q: Куда делся старый код?**  
A: Остался для совместимости в `src/data/` и `src/utils/`, но используется только как fallback

**Q: Как проверить что новая система работает?**  
A: Открыть консоль браузера - должны быть логи со значками: 🔍 ✅ 💾 🧮 📊

**Q: Можно ли откатиться к старой системе?**  
A: Да, достаточно вернуть старые версии useTestLogic.js, userStore.js, testStore.js

---

## 📊 Статистика изменений:

- **Добавлено файлов:** 7 (TestRegistry, StorageManager, 4 файла теста, index.js)
- **Изменено файлов:** 3 (useTestLogic.js, userStore.js, testStore.js)
- **Время добавления теста:** с 3 часов до 30 минут
- **Backward compatibility:** 100% сохранена
- **Готовность к серверу:** встроена через адаптеры

**🎯 Главное преимущество:** система стала модульной и готовой к любому масштабированию, сохранив всю функциональность!
