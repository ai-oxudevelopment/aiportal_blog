<template>
  <div class="min-h-screen bg-black text-gray-100">
    <Header
      :is-menu-open="isMenuOpen"
      @toggle-menu="toggleMenu"
    />

    <div class="flex">
      <Sidebar :is-menu-open="isMenuOpen" />

      <main
        :class="`pt-14 w-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'md:ml-64' : 'ml-0'}`"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
          <!-- Hero Top Cards Section -->
          <section id="hero-section">
            <HeroTopCards />
          </section>

          <!-- Prompts Section -->
          <section id="prompts-section" class="mb-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              {{ sectionTitle }}
            </h1>
            <div class="mt-4 sm:mt-6">
              <Tabs 
                :section="section" 
                :loading="loading" 
                :selected-category="selectedCategory"
                @category-change="handleCategoryChange"
              />
            </div>
          </section>

          <Section
            :articles="filteredArticles"
            :loading="loading"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '~/components/main/Header.vue';
import Sidebar from '~/components/main/Sidebar.vue';
import HeroTopCards from '~/components/main/HeroTopCards.vue';
import Tabs from '~/components/main/Tabs.vue';
import Section from '~/components/main/Section.vue';

const isMenuOpen = ref(false);
const selectedCategory = ref('all');
const section = ref(null);
const articles = ref([]);
const loading = ref(true);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleCategoryChange = (category) => {
  selectedCategory.value = category;
};

const sectionTitle = computed(() => section.value?.attributes.name || 'Библиотека GPT-инструкций');

const filteredArticles = computed(() => {
  if (!articles.value || articles.value.length === 0) return [];
  if (selectedCategory.value === 'all') {
    return articles.value;
  }
  return articles.value.filter(article => {
    const articleCategories = article.attributes.categories?.data || [];
    return articleCategories.some(cat => cat.attributes.slug === selectedCategory.value);
  });
});

// Mock data fetching
onMounted(() => {
  setTimeout(() => {
    const mockPrompts = [
      {
        id: 1,
        attributes: {
          title: "Анализ резюме кандидата",
          slug: "resume-analysis",
          excerpt: "Проанализируй резюме кандидата на позицию [должность] и выдели ключевые...",
          content: `<h2>Описание промпта</h2>
<p>Создай подробный анализ резюме кандидата на позицию [должность] с учетом ключевых навыков и опыта.</p>
Проанализируй резюме кандидата на позицию [должность] и выдели ключевые...`,
          publishedAt: "2024-01-15T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{
              attributes: { name: "HR&Рекрутинг", slug: "hr-recruiting" }
            }]
          }
        }
      },
      {
        id: 2,
        attributes: {
          title: "Составление описания вакансии",
          slug: "job-description",
          excerpt: "Создай привлекательное описание вакансии для позиции [должность] в компании [тип]...",
          content: `<h2>Описание промпта</h2>
<p>Создай список вопросов для интервью с кандидатом на позицию [должность] с учетом уровня...</p>
Создай привлекательное описание вакансии для позиции [должность] в компании [тип]...`,
          publishedAt: "2024-01-14T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "HR&Рекрутинг", slug: "hr-recruiting" } }]
          }
        }
      },
      {
        id: 3,
        attributes: {
          title: "Подготовка вопросов для интервью",
          slug: "interview-questions",
          excerpt: "Создай список вопросов для интервью с кандидатом на позицию [должность] с учетом...",
          content: `<h2>Описание промпта</h2>
<p>Создай список вопросов для интервью с кандидатом на позицию [должность] с учетом уровня...</p>
Создай список вопросов для интервью с кандидатом на позицию [должность] с учетом...`,
          publishedAt: "2024-01-13T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "HR&Рекрутинг", slug: "hr-recruiting" } }]
          }
        }
      },
      {
        id: 4,
        attributes: {
          title: "Оценка кандидата после интервью",
          slug: "candidate-evaluation",
          excerpt: "Проанализируй результаты интервью с кандидатом на позицию [должность] и дай...",
          content: `<h2>Описание промпта</h2>
<p>Проанализируй результаты интервью с кандидатом на позицию [должность] и дай рекомендации...</p>
Проанализируй результаты интервью с кандидатом на позицию [должность] и дай...`,
          publishedAt: "2024-01-12T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "HR&Рекрутинг", slug: "hr-recruiting" } }]
          }
        }
      },
      {
        id: 5,
        attributes: {
          title: "Создание стратегии продаж",
          slug: "sales-strategy",
          excerpt: "Разработай стратегию продаж для [продукт/услуга] с учетом целевой аудитории...",
          content: `<h2>Описание промпта</h2>
<p>Разработай комплексную стратегию продаж для [продукт/услуга] с учетом целевой аудитории...</p>
Разработай стратегию продаж для [продукт/услуга] с учетом целевой аудитории...`,
          publishedAt: "2024-01-11T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "Продажи", slug: "sales" } }]
          }
        }
      },
      {
        id: 6,
        attributes: {
          title: "Анализ конкурентов",
          slug: "competitor-analysis",
          excerpt: "Проведи анализ конкурентов в сфере [отрасль] и выдели их сильные и слабые стороны...",
          content: `<h2>Описание промпта</h2>
<p>Проведи детальный анализ конкурентов в сфере [отрасль] и выдели их сильные и слабые стороны...</p>
Проведи анализ конкурентов в сфере [отрасль] и выдели их сильные и слабые стороны...`,
          publishedAt: "2024-01-10T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "Маркетинг", slug: "marketing" } }]
          }
        }
      },
      {
        id: 7,
        attributes: {
          title: "Создание контент-плана",
          slug: "content-plan",
          excerpt: "Создай контент-план для социальных сетей на месяц для [бренд/компания]...",
          content: `<h2>Описание промпта</h2>
<p>Создай детальный контент-план для социальных сетей на месяц для [бренд/компания]...</p>
Создай контент-план для социальных сетей на месяц для [бренд/компания]...`,
          publishedAt: "2024-01-09T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "Маркетинг", slug: "marketing" } }]
          }
        }
      },
      {
        id: 8,
        attributes: {
          title: "Финансовый анализ проекта",
          slug: "financial-analysis",
          excerpt: "Проведи финансовый анализ проекта [название] и оцени его рентабельность...",
          content: `<h2>Описание промпта</h2>
<p>Проведи детальный финансовый анализ проекта [название] и оцени его рентабельность...</p>
Проведи финансовый анализ проекта [название] и оцени его рентабельность...`,
          publishedAt: "2024-01-08T10:30:00Z",
          type: "prompt",
          categories: {
            data: [{ attributes: { name: "Финансы", slug: "finance" } }]
          }
        }
      }
    ];
    const mockSections = [
      {
        attributes: {
          name: "Библиотека GPT-инструкций",
          slug: "prompts",
          categories: {
            data: [
              { attributes: { name: "HR&Рекрутинг", slug: "hr-recruiting" } },
              { attributes: { name: "Продажи", slug: "sales" } },
              { attributes: { name: "Маркетинг", slug: "marketing" } },
              { attributes: { name: "Менеджмент", slug: "management" } },
              { attributes: { name: "Аналитика", slug: "analytics" } },
              { attributes: { name: "Финансы", slug: "finance" } },
              { attributes: { name: "Документы", slug: "documents" } },
              { attributes: { name: "Разработка", slug: "development" } },
              { attributes: { name: "Техподдержка", slug: "support" } },
              { attributes: { name: "Коммуникация", slug: "communication" } },
              { attributes: { name: "Универсальные", slug: "universal" } }
            ]
          },
          articles: {
            data: mockPrompts
          }
        }
      },
    ];
    
    section.value = mockSections[0];
    articles.value = mockPrompts;
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.container {
  max-width: 800px;
}
.search-bar input {
  transition: border-color 0.3s ease;
}
.search-bar input:focus {
  border-color: #4a5568;
}
.category-item {
  transition: background-color 0.3s ease;
}
.category-item:hover {
  background-color: #2d3748;
}
</style>
