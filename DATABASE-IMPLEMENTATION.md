# 🗄️ ХРАНЕНИЕ ДАННЫХ И ТЕСТОВ В БД - ГОТОВОЕ РЕШЕНИЕ

> **Полная архитектура для работы с PostgreSQL базой данных и аналитикой**

## 🎯 Текущее состояние и план перехода

### ✅ Что уже готово:
- **StorageManager** с адаптерами - переключение localStorage ↔ API одной строкой
- **Модульная структура тестов** - готова к загрузке из БД
- **Система логирования** - готова к отправке аналитики
- **GDPR compliance** - встроенные функции приватности

### 🚀 План перехода:

#### **Фаза 1: Backend API (1-2 недели)**  
```javascript
// Переключение одной строкой:
storageManager.setAdapter('api')
// Все методы остаются теми же, меняется только место хранения
```

#### **Фаза 2: База данных (2-3 недели)**
- PostgreSQL с оптимизированными индексами
- Автоматические аналитические процессы  
- Real-time дашборд

#### **Фаза 3: ML Аналитика (3-4 недели)**
- Предиктивные модели
- Персонализированные рекомендации
- A/B тестирование тестов

---

## 🗃️ База данных PostgreSQL

### Основные таблицы:

```sql
-- ================================
-- ПОЛЬЗОВАТЕЛИ И СЕССИИ
-- ================================

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    occupation VARCHAR(255),
    location VARCHAR(255),
    timezone VARCHAR(50),
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Настройки приватности
    analytics_consent BOOLEAN DEFAULT false,
    data_retention_days INTEGER DEFAULT 365
);

-- ================================
-- ТЕСТЫ И КОНФИГУРАЦИИ  
-- ================================

-- Каталог тестов
CREATE TABLE tests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version VARCHAR(10) DEFAULT '1.0.0',
    estimated_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Конфигурации тестов (версионирование)
CREATE TABLE test_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id VARCHAR(50) REFERENCES tests(id),
    version VARCHAR(10) NOT NULL,
    config_data JSONB NOT NULL,  -- Вся структура теста в JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id, version)
);

-- ================================
-- РЕЗУЛЬТАТЫ И ОТВЕТЫ
-- ================================

-- Результаты тестов
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(50) REFERENCES tests(id),
    test_version VARCHAR(10),
    
    -- Основные результаты
    raw_score INTEGER NOT NULL,
    final_score INTEGER NOT NULL,
    level VARCHAR(50) NOT NULL,
    
    -- Демографические модификаторы
    age_multiplier DECIMAL(3,2),
    gender_multiplier DECIMAL(3,2),
    
    -- Время прохождения
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER GENERATED ALWAYS AS 
        (EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER) STORED,
    
    -- Метаданные
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Детальные ответы на вопросы
CREATE TABLE question_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    
    -- Ответы (гибкая JSON структура)
    answer_value JSONB NOT NULL,
    answer_score INTEGER,
    answer_weight DECIMAL(4,2),
    
    -- Время ответа
    question_order INTEGER,
    time_to_answer_seconds INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Сессии прохождения (для незавершенных тестов)
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Состояние сессии
    current_question_index INTEGER DEFAULT 0,
    questions_flow JSONB NOT NULL,
    answered_questions JSONB NOT NULL,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    is_completed BOOLEAN DEFAULT false
);

-- ================================
-- АНАЛИТИЧЕСКИЕ ТАБЛИЦЫ
-- ================================

-- Ежедневная статистика
CREATE TABLE daily_stats (
    date DATE NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Основные метрики
    total_completions INTEGER DEFAULT 0,
    total_starts INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    
    -- Результаты по уровням
    level_minimal_count INTEGER DEFAULT 0,
    level_mild_count INTEGER DEFAULT 0,
    level_moderate_count INTEGER DEFAULT 0,
    level_high_count INTEGER DEFAULT 0,
    level_critical_count INTEGER DEFAULT 0,
    
    -- Средние значения
    avg_score DECIMAL(8,2),
    avg_duration_minutes DECIMAL(8,2),
    avg_questions_answered DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY(date, test_id)
);

-- Демографическая аналитика
CREATE TABLE demographic_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Демографические срезы
    age_group VARCHAR(10),
    gender VARCHAR(20),
    occupation VARCHAR(255),
    
    -- Статистика для этой группы
    sample_size INTEGER,
    avg_score DECIMAL(8,2),
    std_deviation DECIMAL(8,2),
    completion_rate DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Оптимизированные индексы:

```sql
-- Основные индексы для быстрых запросов
CREATE INDEX idx_test_results_user_test ON test_results(user_id, test_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX idx_test_results_level ON test_results(level);
CREATE INDEX idx_test_results_test_completed ON test_results(test_id, completed_at);

-- Составные индексы для аналитики
CREATE INDEX idx_results_demographics ON test_results(test_id, completed_at) 
    INCLUDE (final_score, level);
CREATE INDEX idx_users_demographics ON users(age, gender, occupation) 
    WHERE is_active = true;

-- GIN индексы для JSONB поиска
CREATE INDEX idx_question_answers_value_gin ON question_answers USING GIN (answer_value);
CREATE INDEX idx_test_configs_data_gin ON test_configs USING GIN (config_data);
CREATE INDEX idx_test_sessions_flow_gin ON test_sessions USING GIN (questions_flow);

-- Партиционирование для больших объемов данных
CREATE TABLE test_results_2025 PARTITION OF test_results
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE test_results_2026 PARTITION OF test_results
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

## 🔌 REST API для фронтенда

### Основные endpoints:

```typescript
// ================================
// ПОЛЬЗОВАТЕЛИ
// ================================

// Регистрация нового пользователя
POST /api/users/register
{
  "name": "Анна Иванова",
  "email": "anna@example.com",
  "age": 28,
  "gender": "female",
  "occupation": "психолог",
  "location": "Москва",
  "analyticsConsent": true
}
Response: { "user": {...}, "token": "jwt_token" }

// Получение профиля пользователя
GET /api/users/me
Headers: { "Authorization": "Bearer jwt_token" }
Response: { "user": {...}, "stats": {...} }

// Обновление профиля
PUT /api/users/me
{
  "name": "Анна Петрова",
  "occupation": "клинический психолог"
}

// ================================
// ТЕСТЫ И КОНФИГУРАЦИИ
// ================================

// Получение списка доступных тестов
GET /api/tests
Response: [
  {
    "id": "stress-burnout",
    "title": "Тест на стресс и выгорание",
    "description": "...",
    "category": "Стресс и эмоциональное состояние",
    "estimatedTime": "10-15 минут",
    "version": "1.2.0"
  }
]

// Получение конфигурации конкретного теста  
GET /api/tests/:testId/config
Response: {
  "id": "stress-burnout",
  "version": "1.2.0",
  "initialQuestions": [...],
  "questionFlows": {...}
}

// ================================
// ПРОХОЖДЕНИЕ ТЕСТОВ
// ================================

// Начало новой сессии теста
POST /api/tests/:testId/sessions
Response: {
  "sessionId": "uuid",
  "testConfig": {...},
  "expiresAt": "2025-09-04T19:00:00Z"
}

// Получение состояния текущей сессии
GET /api/tests/:testId/sessions/:sessionId
Response: {
  "sessionId": "uuid",
  "currentQuestionIndex": 3,
  "questionsFlow": [...],
  "answeredQuestions": {...},
  "lastActivityAt": "2025-08-28T19:30:00Z"
}

// Сохранение прогресса теста
PUT /api/tests/:testId/sessions/:sessionId
{
  "currentQuestionIndex": 4,
  "questionsFlow": [...],
  "answeredQuestions": {
    "general_stress": {
      "questionId": "general_stress",
      "answer": 7,
      "timestamp": "2025-08-28T19:35:00Z"
    }
  }
}

// Завершение теста и получение результата
POST /api/tests/:testId/sessions/:sessionId/complete
{
  "answeredQuestions": {...},
  "completedAt": "2025-08-28T19:40:00Z",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "deviceType": "desktop"
  }
}
Response: {
  "result": {
    "score": 34,
    "level": "moderate",
    "interpretation": {...},
    "recommendations": [...],
    "personalizedNotes": [...]
  }
}

// ================================
// РЕЗУЛЬТАТЫ
// ================================

// История результатов пользователя
GET /api/users/me/results?testId=stress-burnout&limit=10&offset=0
Response: {
  "results": [...],
  "total": 25,
  "stats": {
    "averageScore": 32,
    "lastTestDate": "2025-08-28T19:40:00Z",
    "totalTests": 25,
    "improvement": "+5 points"
  }
}

// Детальная информация о конкретном результате
GET /api/users/me/results/:resultId
Response: {
  "result": {...},
  "detailedAnswers": [...],
  "comparisonWithPrevious": {...}
}

// Экспорт результатов в PDF
GET /api/users/me/results/:resultId/export?format=pdf
Response: PDF file download

// ================================
// АНАЛИТИКА (для админов)
// ================================

// Общая статистика по тестам
GET /api/analytics/overview
Response: {
  "totalUsers": 1250,
  "totalCompletions": 3480,
  "popularTests": [...],
  "completionRate": 0.87
}

// Статистика по конкретному тесту
GET /api/analytics/tests/:testId
Response: {
  "completions": 1250,
  "averageScore": 34.2,
  "levelDistribution": {...},
  "demographicBreakdown": {...}
}
```

---

## 🔄 Интеграция с фронтендом

### Адаптер для работы с API:

```javascript
// src/core/storage/APIAdapter.js
class APIAdapter {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || '/api'
    this.token = localStorage.getItem('auth-token')
  }
  
  async saveUser(user) {
    const response = await fetch(`${this.baseURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    
    const data = await response.json()
    this.token = data.token
    localStorage.setItem('auth-token', this.token)
    
    return data.user
  }
  
  async loadUser() {
    if (!this.token) return null
    
    const response = await fetch(`${this.baseURL}/users/me`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    
    if (response.status === 401) {
      // Токен истек
      this.token = null
      localStorage.removeItem('auth-token')
      return null
    }
    
    const data = await response.json()
    return data.user
  }
  
  async saveTestResult(userId, result) {
    // Создаем сессию и сразу завершаем её
    const sessionResponse = await fetch(`${this.baseURL}/tests/${result.testId}/sessions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const session = await sessionResponse.json()
    
    // Завершаем сессию с результатом
    const completeResponse = await fetch(`${this.baseURL}/tests/${result.testId}/sessions/${session.sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answeredQuestions: result.answers,
        completedAt: result.completedAt,
        deviceInfo: {
          userAgent: navigator.userAgent,
          deviceType: this.detectDeviceType()
        }
      })
    })
    
    return completeResponse.ok
  }
  
  async loadTestResults(userId, testId = null) {
    const url = testId 
      ? `${this.baseURL}/users/me/results?testId=${testId}` 
      : `${this.baseURL}/users/me/results`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    
    const data = await response.json()
    return data.results
  }
  
  async saveProgress(userId, testId, progress) {
    // Создаем или обновляем сессию
    const response = await fetch(`${this.baseURL}/tests/${testId}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const session = await response.json()
    
    // Сохраняем прогресс
    const updateResponse = await fetch(`${this.baseURL}/tests/${testId}/sessions/${session.sessionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(progress)
    })
    
    return updateResponse.ok
  }
  
  async loadProgress(userId, testId) {
    // Получаем активную сессию
    const response = await fetch(`${this.baseURL}/tests/${testId}/sessions/active`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    
    if (response.status === 404) return null
    
    const session = await response.json()
    return {
      currentQuestionIndex: session.currentQuestionIndex,
      answeredQuestions: session.answeredQuestions,
      questionsFlow: session.questionsFlow
    }
  }
  
  detectDeviceType() {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
}

export default APIAdapter
```

### Автоматическое переключение адаптеров:

```javascript
// src/core/storage/StorageManager.js (обновленный)
import LocalStorageAdapter from './LocalStorageAdapter.js'
import APIAdapter from './APIAdapter.js'

class StorageManager {
  constructor() {
    this.adapters = {
      local: new LocalStorageAdapter(),
      api: new APIAdapter()
    }
    
    // Автоматический выбор адаптера
    this.currentAdapter = this.detectBestAdapter()
  }
  
  detectBestAdapter() {
    // На продакшене используем API, в разработке - localStorage
    if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_API_URL) {
      return this.adapters.api
    }
    
    return this.adapters.local
  }
  
  async setAdapter(type) {
    const newAdapter = this.adapters[type]
    if (!newAdapter) {
      console.warn(`Unknown adapter type: ${type}`)
      return false
    }
    
    // Проверяем работоспособность нового адаптера
    try {
      if (type === 'api') {
        // Проверяем доступность API
        const response = await fetch(`${newAdapter.baseURL}/health`)
        if (!response.ok) throw new Error('API not available')
      }
      
      console.log(`📦 Storage adapter changed to: ${type}`)
      this.currentAdapter = newAdapter
      return true
    } catch (error) {
      console.warn(`⚠️ Cannot switch to ${type} adapter:`, error.message)
      return false
    }
  }
  
  // Все остальные методы остаются без изменений
  async saveTestResult(userId, result) {
    try {
      return await this.currentAdapter.saveTestResult(userId, result)
    } catch (error) {
      // Fallback на localStorage
      console.warn('⚠️ API failed, using localStorage fallback')
      return await this.adapters.local.saveTestResult(userId, result)
    }
  }
}
```

---

## 📊 Аналитическая система

### Real-time дашборд:

```sql
-- Материализованное представление для быстрой аналитики
CREATE MATERIALIZED VIEW test_analytics_realtime AS
SELECT 
    test_id,
    DATE(completed_at) as date,
    COUNT(*) as completions,
    AVG(final_score) as avg_score,
    AVG(duration_seconds / 60.0) as avg_duration_minutes,
    
    -- Распределение по уровням
    COUNT(*) FILTER (WHERE level = 'minimal') as minimal_count,
    COUNT(*) FILTER (WHERE level = 'mild') as mild_count,
    COUNT(*) FILTER (WHERE level = 'moderate') as moderate_count,
    COUNT(*) FILTER (WHERE level = 'high') as high_count,
    COUNT(*) FILTER (WHERE level = 'critical') as critical_count,
    
    -- Демографическая разбивка
    AVG(final_score) FILTER (WHERE u.gender = 'male') as male_avg_score,
    AVG(final_score) FILTER (WHERE u.gender = 'female') as female_avg_score,
    
    -- Возрастная разбивка
    AVG(final_score) FILTER (WHERE u.age BETWEEN 18 AND 25) as age_18_25_avg,
    AVG(final_score) FILTER (WHERE u.age BETWEEN 26 AND 35) as age_26_35_avg,
    AVG(final_score) FILTER (WHERE u.age BETWEEN 36 AND 45) as age_36_45_avg
    
FROM test_results tr
JOIN users u ON tr.user_id = u.id
WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY test_id, DATE(completed_at);

-- Автообновление каждые 15 минут
SELECT cron.schedule(
    'refresh-analytics', 
    '*/15 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY test_analytics_realtime;'
);
```

### Python скрипты для ETL:

```python
# analytics/daily_etl.py
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from datetime import datetime, timedelta

def daily_analytics_etl():
    """Ежедневная обработка аналитических данных"""
    
    engine = create_engine(DATABASE_URL)
    yesterday = datetime.now().date() - timedelta(days=1)
    
    # 1. Агрегируем ежедневную статистику
    daily_query = f"""
    INSERT INTO daily_stats (
        date, test_id, total_completions, total_starts, 
        completion_rate, avg_score, avg_duration_minutes,
        level_minimal_count, level_mild_count, level_moderate_count,
        level_high_count, level_critical_count
    )
    SELECT 
        '{yesterday}' as date,
        test_id,
        COUNT(*) as total_completions,
        (SELECT COUNT(*) FROM test_sessions 
         WHERE test_id = tr.test_id 
         AND DATE(started_at) = '{yesterday}') as total_starts,
        COUNT(*)::DECIMAL / NULLIF(
            (SELECT COUNT(*) FROM test_sessions 
             WHERE test_id = tr.test_id 
             AND DATE(started_at) = '{yesterday}'), 0
        ) * 100 as completion_rate,
        AVG(final_score) as avg_score,
        AVG(duration_seconds / 60.0) as avg_duration_minutes,
        COUNT(*) FILTER (WHERE level = 'minimal') as level_minimal_count,
        COUNT(*) FILTER (WHERE level = 'mild') as level_mild_count,
        COUNT(*) FILTER (WHERE level = 'moderate') as level_moderate_count,
        COUNT(*) FILTER (WHERE level = 'high') as level_high_count,
        COUNT(*) FILTER (WHERE level = 'critical') as level_critical_count
    FROM test_results tr
    WHERE DATE(completed_at) = '{yesterday}'
    GROUP BY test_id
    ON CONFLICT (date, test_id) DO UPDATE SET
        total_completions = EXCLUDED.total_completions,
        completion_rate = EXCLUDED.completion_rate,
        avg_score = EXCLUDED.avg_score;
    """
    
    engine.execute(daily_query)
    
    # 2. Демографическая аналитика (еженедельно)
    if yesterday.weekday() == 6:  # воскресенье
        demographic_analysis(engine, yesterday)
    
    # 3. Корреляционный анализ (ежемесячно)
    if yesterday.day == 1:  # первое число месяца
        correlation_analysis(engine, yesterday)
    
    print(f"✅ Daily ETL completed for {yesterday}")

def demographic_analysis(engine, date):
    """Демографический анализ по неделям"""
    
    week_start = date - timedelta(days=6)
    
    query = f"""
    INSERT INTO demographic_stats (
        period_start, period_end, test_id, age_group, gender,
        sample_size, avg_score, std_deviation, completion_rate
    )
    SELECT 
        '{week_start}' as period_start,
        '{date}' as period_end,
        tr.test_id,
        CASE 
            WHEN u.age <= 25 THEN '18-25'
            WHEN u.age <= 35 THEN '26-35'
            WHEN u.age <= 45 THEN '36-45'
            WHEN u.age <= 55 THEN '46-55'
            ELSE '56+'
        END as age_group,
        u.gender,
        COUNT(*) as sample_size,
        AVG(tr.final_score) as avg_score,
        STDDEV(tr.final_score) as std_deviation,
        COUNT(tr.*)::DECIMAL / NULLIF(COUNT(ts.*), 0) * 100 as completion_rate
    FROM test_results tr
    JOIN users u ON tr.user_id = u.id
    LEFT JOIN test_sessions ts ON ts.user_id = u.id 
        AND ts.test_id = tr.test_id
        AND DATE(ts.started_at) BETWEEN '{week_start}' AND '{date}'
    WHERE DATE(tr.completed_at) BETWEEN '{week_start}' AND '{date}'
    GROUP BY tr.test_id, age_group, u.gender
    HAVING COUNT(*) >= 10;  -- минимум 10 записей для статистической значимости
    """
    
    engine.execute(query)
    print(f"✅ Demographic analysis completed for week {week_start} - {date}")

def correlation_analysis(engine, date):
    """Корреляционный анализ между факторами"""
    
    # Загружаем данные за последний месяц
    query = f"""
    SELECT 
        tr.test_id,
        tr.final_score,
        u.age,
        CASE 
            WHEN u.gender = 'male' THEN 1
            WHEN u.gender = 'female' THEN 2  
            ELSE 0
        END as gender_numeric,
        tr.duration_seconds,
        COUNT(qa.*) as questions_answered
    FROM test_results tr
    JOIN users u ON tr.user_id = u.id
    LEFT JOIN question_answers qa ON qa.result_id = tr.id
    WHERE tr.completed_at >= '{date - timedelta(days=30)}'
    GROUP BY tr.id, tr.test_id, tr.final_score, u.age, u.gender, tr.duration_seconds
    """
    
    df = pd.read_sql(query, engine)
    
    # Группируем по тестам
    for test_id in df['test_id'].unique():
        test_df = df[df['test_id'] == test_id]
        
        if len(test_df) < 50:  # минимум для корреляционного анализа
            continue
            
        # Вычисляем корреляции
        correlations = test_df[['final_score', 'age', 'gender_numeric', 'duration_seconds']].corr()
        
        # Сохраняем результаты
        insert_query = f"""
        INSERT INTO correlations (
            test_id, analysis_date, sample_size,
            age_score_correlation, gender_score_correlation, 
            duration_score_correlation, confidence_level
        ) VALUES (
            '{test_id}', '{date}', {len(test_df)},
            {correlations.loc['final_score', 'age']:.3f},
            {correlations.loc['final_score', 'gender_numeric']:.3f},
            {correlations.loc['final_score', 'duration_seconds']:.3f},
            0.95
        )
        ON CONFLICT (test_id, analysis_date) DO UPDATE SET
            sample_size = EXCLUDED.sample_size,
            age_score_correlation = EXCLUDED.age_score_correlation,
            gender_score_correlation = EXCLUDED.gender_score_correlation,
            duration_score_correlation = EXCLUDED.duration_score_correlation;
        """
        
        engine.execute(insert_query)
    
    print(f"✅ Correlation analysis completed for {date}")

if __name__ == "__main__":
    daily_analytics_etl()
```

---

## 🚀 План внедрения

### **Неделя 1-2: Backend API**
```bash
# Создание API сервера
npm init
npm install express postgres jsonwebtoken bcrypt cors helmet

# Основные endpoints:
/api/users/* - управление пользователями
/api/tests/* - работа с тестами  
/api/analytics/* - аналитика
```

### **Неделя 3-4: База данных**
```bash
# Создание БД и таблиц
psql -U postgres -d psy_tests -f schema.sql

# Настройка индексов и партицинирования
psql -U postgres -d psy_tests -f indexes.sql

# ETL процессы
python analytics/daily_etl.py
```

### **Неделя 5-6: Интеграция фронтенда**
```javascript
// Переключение на API
const storage = new StorageManager()
await storage.setAdapter('api')

// Тестирование fallback механизмов
// Миграция существующих данных
```

### **Неделя 7-8: Аналитика и дашборды**
```bash
# Настройка Grafana для визуализации
docker run -d -p 3000:3000 grafana/grafana

# Python скрипты для ML
pip install pandas scikit-learn matplotlib seaborn
python analytics/ml_models.py
```

---

## 🔐 Безопасность

### Шифрование PII:
```sql
-- Функции шифрования
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT) RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем таблицу пользователей
ALTER TABLE users ADD COLUMN email_encrypted BYTEA;
UPDATE users SET email_encrypted = encrypt_pii(email);
```

### JWT Authentication:
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.sendStatus(401)
  }
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
```

### GDPR Compliance:
```sql
-- Функция полного удаления данных пользователя
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(target_user_id UUID) 
RETURNS void AS $$
BEGIN
    DELETE FROM question_answers WHERE result_id IN 
        (SELECT id FROM test_results WHERE user_id = target_user_id);
    DELETE FROM test_results WHERE user_id = target_user_id;
    DELETE FROM test_sessions WHERE user_id = target_user_id;
    DELETE FROM users WHERE id = target_user_id;
    
    INSERT INTO deletion_log (user_id, deleted_at, deleted_by) 
    VALUES (target_user_id, NOW(), current_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 Ожидаемые результаты

### Производительность:
- **Время загрузки теста:** < 200ms
- **Время сохранения результата:** < 100ms  
- **Запросы к аналитике:** < 500ms
- **Пропускная способность:** 1000+ одновременных пользователей

### Аналитические возможности:
- **Real-time мониторинг** прохождений тестов
- **Демографическая аналитика** по всем параметрам
- **Предиктивные модели** для персонализации
- **A/B тестирование** новых версий тестов

### Масштабируемость:
- **Горизонтальное масштабирование** API серверов
- **Партиционирование БД** по датам
- **CDN** для статических ресурсов
- **Кэширование** частых запросов

**🎯 Итог: готовая enterprise-level система для психологического тестирования с полной аналитикой!**