<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exotic Bulldog Legacy - Carousel Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0b1120; /* Темно-синий фон как на скриншоте */
        }

        /* Классы для анимации карусели */
        .carousel-image {
            transition: opacity 1.5s ease-in-out;
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .carousel-image.active {
            opacity: 1;
            z-index: 10;
        }

        /* Градиент для текста 'Falkville, Alabama' */
        .text-gradient {
            background: linear-gradient(to right, #f97316, #fb923c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body class="text-white min-h-screen flex flex-col">

    <!-- Navbar (Simplified) -->
    <nav class="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <i data-lucide="paw-print" class="text-white w-5 h-5"></i>
            </div>
            <span class="font-bold text-lg tracking-wide">Exotic <span class="font-light text-gray-400">Bulldog Legacy</span></span>
        </div>
        
        <div class="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#" class="hover:text-white transition">Available Puppies</a>
            <a href="#" class="hover:text-white transition">Reviews</a>
            <a href="#" class="hover:text-white transition">FAQ</a>
            <a href="#" class="hover:text-white transition">About</a>
        </div>

        <a href="#" class="hidden md:flex items-center gap-1 border border-gray-600 px-4 py-2 rounded-full text-sm hover:border-orange-500 transition">
            Find a Puppy <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </a>
    </nav>

    <!-- Hero Section -->
    <main class="flex-grow flex items-center justify-center px-6 py-12">
        <div class="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <!-- Left Column: Content -->
            <div class="space-y-8">
                <div class="inline-flex items-center gap-2 bg-orange-900/30 border border-orange-500/30 px-3 py-1 rounded text-xs font-semibold text-orange-500 uppercase tracking-wide">
                    <i data-lucide="star" class="w-3 h-3 fill-current"></i> Bulldog puppies available in Alabama
                </div>

                <h1 class="text-5xl md:text-6xl font-bold leading-tight">
                    French & English <br>
                    bulldog puppies <br>
                    available in <br>
                    <span class="text-orange-500">Falkville, <br> Alabama</span>
                </h1>

                <p class="text-gray-400 text-lg max-w-md leading-relaxed">
                    Reserve your puppy with a secure $300 deposit, then choose appointment pickup in Falkville or vetted courier delivery. Health-first pedigrees and transparent updates at every step.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 pt-2">
                    <button class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition flex items-center justify-center gap-2">
                        View available puppies <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                    </button>
                    <button class="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-semibold transition flex items-center justify-center gap-2 border border-gray-700">
                        Schedule a video call <i data-lucide="play-circle" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Right Column: Image Carousel -->
            <div class="relative w-full max-w-xl mx-auto lg:ml-auto h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-800 group">
                
                <!-- CAROUSEL IMAGES -->
                <!-- Image 1 -->
                <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop" 
                     alt="Bulldog 1" 
                     class="carousel-image active">
                
                <!-- Image 2 -->
                <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1935&auto=format&fit=crop" 
                     alt="Bulldog 2" 
                     class="carousel-image">
                
                <!-- Image 3 -->
                <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2688&auto=format&fit=crop" 
                     alt="Bulldog 3" 
                     class="carousel-image">

                <!-- Floating Badge (Overlay) -->
                <!-- Note: z-index must be higher than active image (z-20) -->
                <div class="absolute bottom-6 left-6 z-20 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl flex items-center gap-4 max-w-xs shadow-lg">
                    <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                        <i data-lucide="shield-check" class="text-green-500 w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-white">Health Guarantee</h4>
                        <p class="text-xs text-gray-400">Vet-checked & vaccinated</p>
                    </div>
                </div>

                <!-- Optional: Gradient Overlay at bottom for better badge contrast -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            </div>

        </div>
    </main>

    <script>
        // Инициализация иконок
        lucide.createIcons();

        // Логика Карусели
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('.carousel-image');
            let currentIndex = 0;
            const intervalTime = 3500; // 3.5 секунды между сменой кадров

            function nextImage() {
                // Убираем класс active у текущей картинки
                images[currentIndex].classList.remove('active');

                // Вычисляем индекс следующей картинки (зацикливаем)
                currentIndex = (currentIndex + 1) % images.length;

                // Добавляем класс active новой картинке
                images[currentIndex].classList.add('active');
            }

            // Запускаем автоматическое переключение
            setInterval(nextImage, intervalTime);
        });
    </script>
</body>
</html>