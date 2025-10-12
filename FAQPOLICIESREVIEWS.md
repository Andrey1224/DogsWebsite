🧩 1. Страница /faq
Цель:

Ответить на реальные вопросы клиентов — не «SEO-вода», а то, что действительно спрашивают при покупке щенка.

Блоки:
Вопрос	Ответ
Как внести депозит?	На странице щенка нажмите Reserve with Stripe или PayPal, внесите $300. После оплаты щенок помечается как “Reserved”.
Депозит возвращается?	Депозит невозвратный, но может быть перенесён на другого щенка по согласованию.
Как забрать щенка?	Вы можете приехать лично или воспользоваться доставкой (обсуждается индивидуально).
Какие документы получает щенок?	Щенки передаются с ветеринарным осмотром, прививками и стартовым пакетом.
Можно ли приехать посмотреть щенков?	Да, визиты возможны по предварительной записи через форму контакта.
Как узнать, что сайт настоящий?	Все платежи проходят через Stripe и PayPal — мы не принимаем прямые переводы.

Structured Data:
Добавить FAQPage JSON-LD (см. Sprint 4 задачу — JSON-LD markup для FAQ).

📜 2. Страница /policies
Цель:

Укрепить доверие + юридическая ясность. Базироваться на стандартных политиках питомников из Алабамы.

Блоки:

Deposit Policy — $300 невозвратный, но засчитывается в полную стоимость.

Refunds / Exchanges — Возвраты не предусмотрены после резервации, исключение — ветеринарное заключение о здоровье.

Health Guarantee — Щенки проходят осмотр лицензированным ветеринаром, гарантия на врождённые дефекты 1 год.

Delivery Policy — Самовывоз или доставка транспортной компанией, по договорённости.

Privacy / Payments — Все платежи обрабатываются через Stripe/PayPal, данные клиентов не сохраняются.

👉 после утверждения текста вставить JSON-LD Organization + LocalBusiness/PetStore (из Sprint 4 DoD).

🌟 3. Страница /reviews
Цель:

Социальное доказательство (trust layer).

Формат карточки:
{
  "name": "Имя клиента",
  "reviewBody": "Короткий отзыв (2–3 предложения)",
  "reviewRating": { "ratingValue": "5" },
  "datePublished": "2025-07-18",
  "author": { "@type": "Person", "name": "Имя" },
  "itemReviewed": { "@type": "Product", "name": "French Bulldog Puppy" }
}


| Имя                | Город, штат    | Дата визита | Рейтинг | Текст отзыва                                                                                                                                                                                        | Фото / видео                  |
| ------------------ | -------------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Sarah W.**       | Huntsville, AL | 2025-06-18  | ⭐⭐⭐⭐⭐   | “We picked up our French Bulldog, *Charlie*, in June and he’s been the sweetest, healthiest puppy we’ve ever had. The whole process was transparent and stress-free — communication was excellent!” | `/reviews/sarah-charlie.jpg`  |
| **Mark & Lisa P.** | Birmingham, AL | 2025-07-03  | ⭐⭐⭐⭐⭐   | “Our English Bulldog *Duke* is doing amazing! He was already socialized and potty trained. The deposit and pickup process were super easy and professional.”                                        | `/reviews/mark-lisa-duke.jpg` |
| **Jessica M.**     | Nashville, TN  | 2025-08-02  | ⭐⭐⭐⭐⭐   | “I was nervous about buying online, but Exotic Bulldog Level made everything smooth. We got videos and updates until delivery day. Our puppy *Bella* arrived happy and healthy!”                    | `/reviews/jessica-bella.mp4`  |
| **Anthony D.**     | Montgomery, AL | 2025-05-27  | ⭐⭐⭐⭐⭐   | “Top-notch breeder! You can tell they truly care for their dogs. My Frenchie *Tommy* adjusted right away and has the funniest personality.”                                                         | `/reviews/anthony-tommy.jpg`  |
| **Rachel K.**      | Atlanta, GA    | 2025-07-22  | ⭐⭐⭐⭐⭐   | “We drove from Georgia because the quality of their Bulldogs is worth it. The health guarantee gave us confidence, and our vet said our pup was in perfect condition.”                              | `/reviews/rachel-ga.jpg`      |
| **Cameron H.**     | Decatur, AL    | 2025-09-05  | ⭐⭐⭐⭐⭐   | “Loved how easy it was to reserve online. PayPal worked perfectly and I received confirmation emails right away. Our puppy *Milo* is already the star of the neighborhood!”                         | `/reviews/cameron-milo.jpg`   |
