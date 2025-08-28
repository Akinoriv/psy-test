# 🗄️ ПЛАН ХРАНЕНИЯ ДАННЫХ НА СЕРВЕРЕ

> **Архитектура базы данных и аналитической системы для PSY-TESTS**

## 🎯 Цели системы хранения

### Основные задачи:
1. **Централизованное хранение** всех результатов тестов
2. **Аналитика и статистика** по результатам тестирования
3. **Синхронизация данных** между устройствами пользователя
4. **Исследовательские данные** для улучшения тестов
5. **Резервное копирование** и надежность хранения

### Дополнительные возможности:
- Сравнение результатов во времени
- Групповая аналитика (по возрасту, профессии, региону)
- A/B тестирование различных версий тестов
- Персональные рекомендации на основе Big Data

## 🗃️ Структура базы данных

### PostgreSQL Schema

```sql
-- ================================
-- ОСНОВНЫЕ ТАБЛИЦЫ
-- ================================

-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    occupation VARCHAR(255),
    location VARCHAR(255),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Каталог тестов
CREATE TABLE tests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version VARCHAR(10) DEFAULT '1.0.0',
    estimated_time_minutes INTEGER,
    max_questions INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Конфигурации тестов (версионирование)
CREATE TABLE test_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id VARCHAR(50) REFERENCES tests(id),
    version VARCHAR(10) NOT NULL,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(test_id, version)
);

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
    question_type VARCHAR(20) NOT NULL, -- 'single', 'multiple', 'scale'
    
    -- Ответы (гибкая структура)
    answer_value JSONB NOT NULL, -- сам ответ
    answer_score INTEGER, -- баллы за ответ
    answer_weight DECIMAL(4,2), -- вес ответа
    
    -- Время ответа
    question_order INTEGER, -- порядок вопроса в тесте
    time_to_answer_seconds INTEGER, -- время на размышление
    
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
    date DATE PRIMARY KEY,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Основные метрики
    total_completions INTEGER DEFAULT 0,
    total_starts INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2), -- %
    
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
    UNIQUE(date, test_id)
);

-- Демографическая аналитика
CREATE TABLE demographic_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Демографические срезы
    age_group VARCHAR(10), -- '18-25', '26-35', etc
    gender VARCHAR(20),
    occupation VARCHAR(255),
    
    -- Статистика для этой группы
    sample_size INTEGER,
    avg_score DECIMAL(8,2),
    std_deviation DECIMAL(8,2),
    completion_rate DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Корреляционный анализ
CREATE TABLE correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id VARCHAR(50) REFERENCES tests(id),
    analysis_date DATE NOT NULL,
    
    -- Корреляции между факторами
    age_score_correlation DECIMAL(4,3),
    gender_score_correlation DECIMAL(4,3),
    duration_score_correlation DECIMAL(4,3),
    
    -- Статистическая значимость
    sample_size INTEGER,
    confidence_level DECIMAL(4,3),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Индексы для производительности

```sql
-- Основные индексы для быстрых запросов
CREATE INDEX idx_test_results_user_test ON test_results(user_id, test_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX idx_test_results_level ON test_results(level);
CREATE INDEX idx_test_results_test_completed ON test_results(test_id, completed_at);

-- Индексы для аналитики
CREATE INDEX idx_question_answers_result_order ON question_answers(result_id, question_order);
CREATE INDEX idx_daily_stats_date_test ON daily_stats(date, test_id);

-- Составные индексы для сложных запросов  
CREATE INDEX idx_results_demographics ON test_results(test_id, completed_at) 
    INCLUDE (final_score, level);
CREATE INDEX idx_users_demographics ON users(age, gender, occupation) 
    WHERE is_active = true;

-- GIN индекс для JSONB поиска
CREATE INDEX idx_question_answers_value_gin ON question_answers USING GIN (answer_value);
CREATE INDEX idx_test_sessions_flow_gin ON test_sessions USING GIN (questions_flow);
```

## 🔌 API Endpoints

### REST API для фронтенда

```typescript
// ================================
// ПОЛЬЗОВАТЕЛИ
// ================================

// Регистрация/вход
POST /api/users/register
{
  "name": "string",
  "email": "string", 
  "age": number,
  "gender": "male|female|other",
  "occupation": "string",
  "location": "string"
}

GET /api/users/me
// Возвращает данные текущего пользователя

PUT /api/users/me
// Обновление профиля пользователя

// ================================
// ТЕСТЫ
// ================================

GET /api/tests
// Список доступных тестов

GET /api/tests/:testId/config
// Конфигурация теста (вопросы, логика)

// ================================  
// ПРОХОЖДЕНИЕ ТЕСТОВ
// ================================

POST /api/tests/:testId/sessions
// Начать новую сессию теста

GET /api/tests/:testId/sessions/:sessionId
// Получить состояние сессии

PUT /api/tests/:testId/sessions/:sessionId
// Сохранить прогресс
{
  "currentQuestionIndex": number,
  "questionsFlow": Question[],
  "answeredQuestions": Record<string, Answer>
}

POST /api/tests/:testId/sessions/:sessionId/complete
// Завершить тест и получить результат
{
  "answeredQuestions": Record<string, Answer>,
  "completedAt": "ISO_DATE",
  "deviceInfo": {...}
}

// ================================
// РЕЗУЛЬТАТЫ  
// ================================

GET /api/users/me/results
// История результатов пользователя

GET /api/users/me/results/:resultId
// Конкретный результат с деталями

POST /api/results/:resultId/feedback
// Обратная связь о качестве результата
{
  "rating": number, // 1-5
  "comment": "string",
  "helpful": boolean
}
```

### GraphQL API для аналитики

```graphql
# Аналитические запросы для админки
type Query {
  # Общая статистика
  testStats(testId: String!, dateRange: DateRange!): TestStatistics
  
  # Демографический анализ
  demographicBreakdown(
    testId: String!
    groupBy: [DemographicField!]!
    dateRange: DateRange!
  ): [DemographicGroup!]!
  
  # Корреляционный анализ
  correlationAnalysis(
    testId: String!
    factors: [AnalysisFactor!]!
    dateRange: DateRange!
  ): CorrelationResult
  
  # Трендовый анализ
  trendAnalysis(
    testId: String!
    metric: TrendMetric!
    interval: TimeInterval!
    dateRange: DateRange!
  ): [TrendPoint!]!
}

type TestStatistics {
  totalCompletions: Int!
  completionRate: Float!
  avgScore: Float!
  avgDuration: Int! # seconds
  levelDistribution: LevelDistribution!
}

type DemographicGroup {
  groupKey: String!
  sampleSize: Int!
  avgScore: Float!
  stdDeviation: Float!
  completionRate: Float!
}
```

## 📊 Аналитическая система  

### 1. Real-time дашборд метрики

```sql
-- Создание материализованных представлений для быстрой аналитики
CREATE MATERIALIZED VIEW mv_test_stats_realtime AS
SELECT 
    test_id,
    DATE(completed_at) as completion_date,
    COUNT(*) as total_completions,
    AVG(final_score) as avg_score,
    AVG(duration_seconds) as avg_duration,
    
    -- Распределение по уровням
    COUNT(*) FILTER (WHERE level = 'minimal') as minimal_count,
    COUNT(*) FILTER (WHERE level = 'mild') as mild_count,
    COUNT(*) FILTER (WHERE level = 'moderate') as moderate_count,
    COUNT(*) FILTER (WHERE level = 'high') as high_count,
    COUNT(*) FILTER (WHERE level = 'critical') as critical_count,
    
    -- Демографическая разбивка
    AVG(final_score) FILTER (WHERE u.gender = 'male') as male_avg_score,
    AVG(final_score) FILTER (WHERE u.gender = 'female') as female_avg_score,
    
    MAX(completed_at) as last_updated
FROM test_results tr
JOIN users u ON tr.user_id = u.id
WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY test_id, DATE(completed_at);

-- Автообновление каждые 15 минут
SELECT cron.schedule('refresh-stats', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_test_stats_realtime;');
```

### 2. Система алертов

```sql
-- Алерты на аномалии в данных
CREATE OR REPLACE FUNCTION check_completion_rate_drop() RETURNS void AS $$
BEGIN
    -- Проверяем резкое падение процента завершения
    IF (
        SELECT completion_rate 
        FROM daily_stats 
        WHERE date = CURRENT_DATE - 1
    ) < (
        SELECT AVG(completion_rate) * 0.8  -- меньше 80% от среднего
        FROM daily_stats 
        WHERE date >= CURRENT_DATE - 30
    ) THEN
        -- Отправить уведомление разработчикам
        INSERT INTO system_alerts (type, message, severity, created_at) 
        VALUES (
            'completion_rate_drop', 
            'Completion rate dropped significantly yesterday',
            'high',
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 3. ETL процессы для аналитики

```python
# Python скрипт для ежедневной обработки данных
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

def daily_analytics_etl():
    """Ежедневная обработка и агрегация данных"""
    
    engine = create_engine(DATABASE_URL)
    
    # 1. Агрегируем ежедневную статистику
    daily_agg_query = """
    INSERT INTO daily_stats (date, test_id, total_completions, completion_rate, ...)
    SELECT 
        DATE(completed_at) as date,
        test_id,
        COUNT(*) as total_completions,
        -- расчет остальных метрик...
    FROM test_results 
    WHERE DATE(completed_at) = CURRENT_DATE - 1
    GROUP BY DATE(completed_at), test_id
    ON CONFLICT (date, test_id) DO UPDATE SET
        total_completions = EXCLUDED.total_completions,
        -- обновляем все поля...
    """
    
    # 2. Обновляем демографическую статистику
    demographic_agg_query = """
    INSERT INTO demographic_stats (period_start, period_end, test_id, age_group, gender, ...)
    SELECT 
        CURRENT_DATE - 7 as period_start,
        CURRENT_DATE - 1 as period_end,
        test_id,
        CASE 
            WHEN age <= 25 THEN '18-25'
            WHEN age <= 35 THEN '26-35'
            -- и так далее...
        END as age_group,
        gender,
        COUNT(*) as sample_size,
        AVG(final_score) as avg_score,
        STDDEV(final_score) as std_deviation
    FROM test_results tr
    JOIN users u ON tr.user_id = u.id
    WHERE completed_at >= CURRENT_DATE - 7 
      AND completed_at < CURRENT_DATE
    GROUP BY test_id, age_group, gender
    """
    
    # 3. Корреляционный анализ
    df = pd.read_sql("""
        SELECT tr.final_score, u.age, u.gender, tr.duration_seconds
        FROM test_results tr
        JOIN users u ON tr.user_id = u.id  
        WHERE completed_at >= CURRENT_DATE - 30
    """, engine)
    
    # Вычисляем корреляции
    correlations = df.corr()
    
    # Сохраняем в БД
    save_correlations_to_db(correlations, engine)

def save_correlations_to_db(corr_matrix, engine):
    """Сохранение корреляций в базу"""
    # Реализация сохранения...
    pass

# Запуск через cron каждый день в 2:00
# 0 2 * * * /usr/local/bin/python /path/to/daily_analytics_etl.py
```

## 📈 Аналитические возможности

### 1. Психометрический анализ

```sql
-- Надежность теста (Альфа Кронбаха)
WITH question_correlations AS (
    SELECT 
        qa1.question_id as q1,
        qa2.question_id as q2,
        CORR(qa1.answer_score, qa2.answer_score) as correlation
    FROM question_answers qa1
    JOIN question_answers qa2 ON qa1.result_id = qa2.result_id
    WHERE qa1.question_id != qa2.question_id
    GROUP BY qa1.question_id, qa2.question_id
)
SELECT 
    AVG(correlation) as avg_inter_item_correlation,
    -- Расчет альфа Кронбаха
    (COUNT(DISTINCT q1) * AVG(correlation)) / 
    (1 + (COUNT(DISTINCT q1) - 1) * AVG(correlation)) as cronbach_alpha
FROM question_correlations;
```

### 2. Предиктивная аналитика

```python
# ML модель для предсказания результатов
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def build_predictive_model():
    """Построение модели для предсказания финального балла"""
    
    # Загрузка данных
    query = """
    SELECT 
        u.age,
        u.gender,
        u.occupation,
        tr.duration_seconds,
        COUNT(qa.id) as questions_answered,
        AVG(qa.time_to_answer_seconds) as avg_response_time,
        tr.final_score
    FROM test_results tr
    JOIN users u ON tr.user_id = u.id
    JOIN question_answers qa ON tr.id = qa.result_id
    GROUP BY u.id, tr.id
    """
    
    df = pd.read_sql(query, engine)
    
    # Подготовка признаков
    df_encoded = pd.get_dummies(df, columns=['gender', 'occupation'])
    
    X = df_encoded.drop(['final_score'], axis=1)
    y = df_encoded['final_score']
    
    # Обучение модели
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Оценка качества
    score = model.score(X_test, y_test)
    print(f"Model R² score: {score:.3f}")
    
    return model

# Сохранение модели для использования в API
def save_model_for_api(model):
    import joblib
    joblib.dump(model, '/models/stress_predictor.pkl')
```

### 3. A/B тестирование

```sql
-- Таблица для A/B тестов
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id),
    
    -- Конфигурации вариантов
    variant_a_config JSONB NOT NULL,
    variant_b_config JSONB NOT NULL,
    
    -- Параметры теста
    traffic_split DECIMAL(3,2) DEFAULT 0.5, -- 50/50 по умолчанию
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Метрики для отслеживания
    primary_metric VARCHAR(100), -- 'completion_rate', 'avg_score', etc
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Назначение пользователей к вариантам
CREATE TABLE ab_test_assignments (
    user_id UUID REFERENCES users(id),
    test_id UUID REFERENCES ab_tests(id),
    variant CHAR(1) CHECK (variant IN ('A', 'B')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, test_id)
);

-- Результаты A/B теста
CREATE VIEW ab_test_results AS
SELECT 
    at.id as test_id,
    at.name as test_name,
    ata.variant,
    COUNT(DISTINCT tr.user_id) as participants,
    COUNT(tr.id) as completions,
    AVG(tr.final_score) as avg_score,
    AVG(tr.duration_seconds) as avg_duration,
    COUNT(tr.id)::DECIMAL / COUNT(DISTINCT tr.user_id) as completion_rate
FROM ab_tests at
JOIN ab_test_assignments ata ON at.id = ata.test_id  
LEFT JOIN test_results tr ON ata.user_id = tr.user_id
WHERE at.is_active = true
GROUP BY at.id, at.name, ata.variant;
```

## 🔐 Безопасность и приватность

### 1. Шифрование чувствительных данных

```sql
-- Расширение для шифрования
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Шифрование PII данных
ALTER TABLE users ADD COLUMN email_encrypted BYTEA;
ALTER TABLE users ADD COLUMN name_encrypted BYTEA;

-- Функции для шифрования/дешифрования
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT) RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data BYTEA) RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Анонимизация для исследований

```sql
-- Создание анонимизированных данных для исследований
CREATE VIEW anonymous_results AS
SELECT 
    md5(user_id::TEXT) as anonymous_user_id,
    test_id,
    final_score,
    level,
    CASE 
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35' 
        -- и так далее...
    END as age_group,
    gender,
    CASE 
        WHEN occupation ILIKE '%врач%' THEN 'healthcare'
        WHEN occupation ILIKE '%учитель%' THEN 'education'
        -- категоризация профессий...
        ELSE 'other'
    END as occupation_category,
    completed_at
FROM test_results tr
JOIN users u ON tr.user_id = u.id
WHERE completed_at >= CURRENT_DATE - INTERVAL '1 year';
```

### 3. Соответствие GDPR

```sql  
-- Логирование доступа к данным
CREATE TABLE data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    accessed_by VARCHAR(255), -- email администратора
    access_type VARCHAR(50), -- 'view', 'export', 'analyze'
    data_scope TEXT, -- какие данные были затронуты
    purpose TEXT, -- цель доступа
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Функция для полного удаления данных пользователя
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(target_user_id UUID) RETURNS void AS $$
BEGIN
    -- Удаляем все связанные данные
    DELETE FROM question_answers WHERE result_id IN 
        (SELECT id FROM test_results WHERE user_id = target_user_id);
    DELETE FROM test_results WHERE user_id = target_user_id;
    DELETE FROM test_sessions WHERE user_id = target_user_id;
    DELETE FROM data_access_log WHERE user_id = target_user_id;
    DELETE FROM users WHERE id = target_user_id;
    
    -- Логируем удаление
    INSERT INTO deletion_log (user_id, deleted_at, deleted_by) 
    VALUES (target_user_id, NOW(), current_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚀 Развертывание и масштабирование

### 1. Docker-compose для разработки

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: psy_tests
      POSTGRES_USER: psy_tests_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://psy_tests_user:your_secure_password@postgres:5432/psy_tests
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 2. Стратегия масштабирования

```sql
-- Партиционирование больших таблиц по дате
CREATE TABLE test_results_2025 PARTITION OF test_results
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE test_results_2026 PARTITION OF test_results  
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Индексы для партиционированных таблиц
CREATE INDEX idx_test_results_2025_completed_at ON test_results_2025 (completed_at);
CREATE INDEX idx_test_results_2026_completed_at ON test_results_2026 (completed_at);
```

### 3. Мониторинг производительности

```sql
-- Создание представления для мониторинга медленных запросов
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) as hit_percent
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- запросы дольше 100мс
ORDER BY total_exec_time DESC;
```

## 📋 План внедрения

### Фаза 1: Базовая инфраструктура (1-2 недели)
1. ✅ Настройка PostgreSQL с базовой схемой
2. ✅ Создание API endpoints для пользователей и тестов
3. ✅ Миграция данных из localStorage
4. ✅ Базовая аналитика (ежедневная статистика)

### Фаза 2: Расширенная аналитика (2-3 недели)
1. ✅ Материализованные представления для быстрой аналитики
2. ✅ GraphQL API для сложных аналитических запросов  
3. ✅ Дашборд для просмотра статистики
4. ✅ Система алертов на аномалии

### Фаза 3: ML и предиктивная аналитика (3-4 недели)
1. ✅ Python ETL процессы
2. ✅ ML модели для предсказания результатов
3. ✅ A/B тестирование платформа
4. ✅ Персонализированные рекомендации

### Фаза 4: Продвинутые возможности (по необходимости)
1. ✅ Real-time аналитика с помощью Apache Kafka
2. ✅ Data Lake для хранения сырых данных
3. ✅ Интеграция с внешними системами (CRM, медицинские карты)
4. ✅ Исследовательские инструменты для психологов

---

**💡 Этот план обеспечивает:**
- Масштабируемое хранение миллионов результатов тестов
- Быструю аналитику с помощью индексов и материализованных представлений  
- Соответствие требованиям приватности (GDPR)
- Готовность к машинному обучению и предиктивной аналитике
- Инструменты для исследований и улучшения тестов