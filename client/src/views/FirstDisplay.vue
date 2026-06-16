<template>
  <div class="landing-page">
    
    <!-- Hero секция -->
    <div class="hero-section">
      <div class="hero-content">
        
        <!-- Левая колонка - текст -->
        <div class="hero-text">

          
          <h1 class="hero-title">
            Надёжная страховая защита<br>
            для вас и вашего имущества
          </h1>
          
          <p class="hero-description">
            Мы предлагаем комплексные страховые решения для автомобилей, 
            недвижимости и здоровья. Более 10 лет на рынке, тысячи довольных клиентов 
            и гарантия выплат в кратчайшие сроки.
          </p>
          
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">10+</span>
              <span class="stat-label">лет на рынке</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">15 000+</span>
              <span class="stat-label">довольных клиентов</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">98%</span>
              <span class="stat-label">выплат по заявкам</span>
            </div>
          </div>
          
          <div class="hero-buttons">
            <router-link to="/register" class="btn-primary btn-large">
              Начать страхование
            </router-link>
            <router-link to="/login" class="btn-secondary btn-large">
              Войти в аккаунт
            </router-link>
          </div>
        </div>
        
        <!-- Правая колонка - изображение / иконки -->
        <div class="hero-image">
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🚗</div>
              <h4>Автострахование</h4>
              <p>КАСКО и ОСАГО</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏠</div>
              <h4>Недвижимость</h4>
              <p>Квартиры и дома</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">❤️</div>
              <h4>Здоровье</h4>
              <p>ДМС и страховка</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💼</div>
              <h4>Бизнес</h4>
              <p>Для компаний</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- Секция преимуществ -->
    <div class="benefits-section">
      <h2 class="benefits-title">Почему выбирают SafeInsure</h2>
      
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">⚡</div>
          <h4>Быстрое оформление</h4>
          <p>Заявка занимает всего 5 минут, а полис приходит на email в течение часа</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🤝</div>
          <h4>Честные выплаты</h4>
          <p>98% заявок одобряются и оплачиваются в полном объёме в срок до 14 дней</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📱</div>
          <h4>Личный кабинет</h4>
          <p>Отслеживайте статус заявок, управляйте договорами и получайте уведомления</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🛡️</div>
          <h4>Надёжная защита</h4>
          <p>Работаем с ведущими перестраховщиками, гарантируем финансовую стабильность</p>
        </div>
      </div>
    </div>
    
    <!-- Секция CTA -->
    <div class="cta-section">
      <div class="cta-content">
        <h2>Готовы защитить то, что вам дорого?</h2>
        <p>Присоединяйтесь к тысячам довольных клиентов SafeInsure уже сегодня</p>
        <router-link to="/register" class="btn-primary btn-large">
          Зарегистрироваться бесплатно
        </router-link>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
// Главная страница с информацией о компании
</script>

<style scoped>
/* Основные переменные */
.landing-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
  padding: 60px 40px 80px;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  width: 100%;
}

/* Левая колонка */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.logo-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  font-size: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-name {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin: 0;
}

.hero-title span {
  color: #2563eb;
}

.hero-description {
  font-size: 1.1rem;
  color: #475569;
  line-height: 1.8;
  max-width: 500px;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 40px;
  padding: 16px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-large {
  padding: 14px 32px;
  font-size: 1rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {

  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: white;
  color: #1e293b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  color: #2563eb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* Правая колонка - иконки */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 480px;
}

.feature-card {
  background: white;
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.feature-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);

}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.feature-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.feature-card p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

/* Секция преимуществ */
.benefits-section {
  padding: 80px 40px;
  background: white;
}

.benefits-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 48px;
}

.benefits-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.benefit-card {
  text-align: center;
  padding: 28px 20px;
  border-radius: 16px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  background: #eff6ff;

}

.benefit-icon {
  font-size: 2.8rem;
  margin-bottom: 16px;
}

.benefit-card h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.benefit-card p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* CTA секция */
.cta-section {
  padding: 80px 40px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
}

.cta-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 32px 0;
}

.cta-content .btn-primary {
  background: white;
  color: #2563eb;
}

.cta-content .btn-primary:hover {
  background: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-text {
    text-align: center;
    align-items: center;
  }
  
  .hero-description {
    max-width: 100%;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .hero-buttons {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px 60px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-stats {
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  
  .benefits-section {
    padding: 50px 20px;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .feature-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .cta-section {
    padding: 50px 20px;
  }
  
  .cta-content h2 {
    font-size: 1.8rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .btn-large {
    width: 100%;
    justify-content: center;
  }
  
  .logo-name {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
    max-width: 280px;
  }
  
  .hero-title {
    font-size: 1.6rem;
  }
}
</style>