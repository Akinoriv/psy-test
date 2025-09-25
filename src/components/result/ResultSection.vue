<template>
  <div class="card result-section">
    <h3 class="heading heading--h3 result-section__title">
      {{ section.title }}
    </h3>
    
    <!-- Заметки и рекомендации -->
    <div 
      v-if="section.type === 'notes'" 
      class="result-section__notes"
    >
      <div 
        v-for="(item, index) in section.items"
        :key="index"
        class="result-section__note-item"
      >
        <div class="result-section__note-icon">{{ item.icon }}</div>
        <div class="result-section__note-text">{{ item.text }}</div>
      </div>
    </div>
    
    <!-- Бейджи -->
    <div 
      v-else-if="section.type === 'badges'" 
      class="result-section__badges"
    >
      <span 
        v-for="(item, index) in section.items"
        :key="index"
        :class="['badge', `badge--${item.variant || 'primary'}`]"
      >
        {{ item.label }}
      </span>
    </div>
    
    <!-- Детальная информация -->
    <div 
      v-else-if="section.type === 'details'" 
      class="result-section__details"
    >
      <div 
        v-for="(item, index) in section.items"
        :key="index"
        class="result-section__detail-item"
      >
        <h4 v-if="item.title" class="result-section__detail-title">{{ item.title }}</h4>
        <p v-if="item.description" class="result-section__detail-description">{{ item.description }}</p>
        <div v-if="item.value" class="result-section__detail-value">{{ item.value }}</div>
      </div>
    </div>
    
    <!-- Ключ-значение -->
    <div 
      v-else-if="section.type === 'key-value'" 
      class="result-section__key-value"
    >
      <div 
        v-for="(item, index) in section.items"
        :key="index"
        class="result-section__kv-item"
      >
        <dt class="result-section__kv-key">{{ item.key }}:</dt>
        <dd class="result-section__kv-value">{{ item.value }}</dd>
      </div>
    </div>
    
    <!-- Список -->
    <div 
      v-else-if="section.type === 'list'" 
      class="result-section__list"
    >
      <ul class="result-section__list-items">
        <li 
          v-for="(item, index) in section.items"
          :key="index"
          class="result-section__list-item"
        >
          {{ typeof item === 'string' ? item : item.text }}
        </li>
      </ul>
    </div>
    
    <!-- Пользовательский контент -->
    <div 
      v-else-if="section.type === 'custom'" 
      class="result-section__custom"
      v-html="section.content"
    ></div>
    
    <!-- Таблица -->
    <div 
      v-else-if="section.type === 'table'" 
      class="result-section__table"
    >
      <table class="result-section__data-table">
        <thead v-if="section.headers">
          <tr>
            <th 
              v-for="header in section.headers"
              :key="header"
              class="result-section__table-header"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in section.items"
            :key="index"
            class="result-section__table-row"
          >
            <td 
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="result-section__table-cell"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (section) => {
      return section.id && section.title && section.type && section.items
    }
  }
})
</script>

<style scoped>
.result-section {
  margin-bottom: var(--spacing-lg);
}

.result-section__title {
  margin-bottom: var(--spacing-md) !important;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Заметки и рекомендации */
.result-section__notes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-section__note-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.result-section__note-icon {
  width: 20px;
  height: 20px;
  background: var(--color-success);
  border-radius: var(--radius-full);
  color: white;
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
  margin-top: 2px;
}

.result-section__note-text {
  flex: 1;
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

/* Бейджи */
.result-section__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

/* Детали */
.result-section__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-section__detail-item {
  padding: var(--spacing-sm);
  border-left: 3px solid var(--color-primary);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.result-section__detail-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.result-section__detail-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: var(--line-height-relaxed);
}

.result-section__detail-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

/* Ключ-значение */
.result-section__key-value {
  display: grid;
  gap: var(--spacing-sm);
}

.result-section__kv-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-md);
  align-items: start;
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.result-section__kv-key {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.result-section__kv-value {
  color: var(--color-text-primary);
  margin: 0;
}

/* Список */
.result-section__list-items {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-primary);
}

.result-section__list-item {
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-relaxed);
}

/* Пользовательский контент */
.result-section__custom {
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

.result-section__custom :deep(p) {
  margin-bottom: var(--spacing-sm);
}

.result-section__custom :deep(ul) {
  padding-left: var(--spacing-lg);
}

/* Таблица */
.result-section__table {
  overflow-x: auto;
}

.result-section__data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.result-section__table-header {
  background: var(--color-bg-secondary);
  padding: var(--spacing-sm);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-primary);
}

.result-section__table-row:nth-child(even) {
  background: var(--color-bg-secondary);
}

.result-section__table-cell {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .result-section__badges {
    justify-content: center;
  }
  
  .result-section__kv-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
  
  .result-section__kv-key {
    font-size: var(--font-size-xs);
  }
}
</style>