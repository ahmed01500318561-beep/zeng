// مفتاح TMDB API وروابط الصور الأساسية
const API_KEY = '286b3ca5e17ecbac2103804fc5ef97ee';
const BASE_URL = `https://api.themoviedb.org/3`;
const IMG_PATH = `https://image.tmdb.org/t/p/w500`;

// عناصر DOM الرئيسية
const mediaGrid = document.getElementById('mediaGrid');
const searchInput = document.getElementById('searchInput');
const moviesTab = document.getElementById('moviesTab');
const tvTab = document.getElementById('tvTab');
const sectionTitle = document.getElementById('sectionTitle');

const playerModal = document.getElementById('playerModal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const controlsContainer = document.getElementById('controlsContainer');

// المتغيرات الخاصة بالحالة الحالية
let currentType = 'movie'; // 'movie' أو 'tv'
let currentItemData = null;
let currentSeason = 1;
let currentEpisode = 1;
let activeServer = 1;

// جلب العروض من TMDB API
async function fetchMedia(url) {
    try {
        mediaGrid.innerHTML = `
            <div class="col-span-full text-center py-16 flex flex-col items-center justify-center gap-3">
                <div class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-slate-400 text-sm font-medium">جاري تحميل الكتالوج السينمائي...</p>
            </div>
        `;

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            displayMedia(data.results);
        } else {
            mediaGrid.innerHTML = `
                <div class="col-span-full text-center py-16 text-slate-400">
                    <p class="text-lg font-bold text-red-400 mb-2">عذراً، لم نتمكن من العثور على نتائج!</p>
                    <p class="text-xs text-slate-500">جرب البحث بالاسم الإسباني أو الإنجليزي للمسلسلات الشهيرة (مثل: La Casa de Papel أو Dexter أو Berlin).</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("خطأ أثناء الاتصال بالخادم:", error);
        mediaGrid.innerHTML = `
            <div class="col-span-full text-center py-16 text-red-500">
                <p class="font-bold">حدث خطأ أثناء تحميل البيانات. يرجى التأكد من اتصال الإنترنت.</p>
            </div>
        `;
    }
}

// عرض بطاقات الأفلام والمسلسلات في الشبكة
function displayMedia(items) {
    mediaGrid.innerHTML = '';

    items.forEach(item => {
        const title = item.title || item.name;
        const poster = item.poster_path ? IMG_PATH + item.poster_path : 'https://placehold.co/500x750/1e293b/94a3b8?text=No+Poster';
        const date = item.release_date || item.first_air_date || 'غير معروف';
        const year = date !== 'غير معروف' ? date.split('-')[0] : 'N/A';
        const vote = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

        const card = document.createElement('div');
        card.className = 'group bg-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-950/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-slate-800/80';
        
        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[2/3] bg-slate-800">
                <img src="${poster}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                <div class="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                    <span>⭐</span>
                    <span>${vote}</span>
                </div>
            </div>
            <div class="p-3 flex flex-col flex-grow justify-between">
                <h3 class="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-red-400 transition truncate" title="${title}">${title}</h3>
                <div class="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                    <span class="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">${year}</span>
                    <span class="text-red-500 font-semibold text-[10px] group-hover:translate-x-0.5 transition">شاهد الآن ◀</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => handleCardClick(item));
        mediaGrid.appendChild(card);
    });
}

// التبديل بين قسم الأفلام وقسم المسلسلات
function switchTab(type) {
    currentType = type;
    searchInput.value = ''; 

    if (type === 'movie') {
        moviesTab.className = "px-5 py-2 rounded-lg font-bold text-xs sm:text-sm bg-red-600 text-white transition shadow-md shadow-red-900/40";
        tvTab.className = "px-5 py-2 rounded-lg font-bold text-xs sm:text-sm text-slate-400 hover:text-white transition";
        sectionTitle.textContent = "أحدث الأفلام الرائجة";
        fetchMedia(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=ar-SA`);
    } else {
        tvTab.className = "px-5 py-2 rounded-lg font-bold text-xs sm:text-sm bg-red-600 text-white transition shadow-md shadow-red-900/40";
        moviesTab.className = "px-5 py-2 rounded-lg font-bold text-xs sm:text-sm text-slate-400 hover:text-white transition";
        sectionTitle.textContent = "أحدث المسلسلات الرائجة";
        fetchMedia(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}&language=ar-SA`);
    }
}

// توليد رابط المشغل بناءً على السيرفر المحدد
function getEmbedUrl(serverIndex = 1) {
    const id = currentItemData.id;
    if (currentType === 'movie') {
        if (serverIndex === 1) return `https://vidsrc.to/embed/movie/${id}`;
        if (serverIndex === 2) return `https://vidsrc.cc/v2/embed/movie/${id}`;
        return `https://embed.su/embed/movie/${id}`;
    } else {
        if (serverIndex === 1) return `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
        if (serverIndex === 2) return `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
        return `https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
    }
}

// توليد رابط التنزيل المباشر الخارجي
// تعديل رابط التحميل ليفتح في صفحة جديدة بشكل آمن
function getDownloadUrl() {
    const id = currentItemData.id;
    if (currentType === 'movie') {
        return `https://vidsrc.to/embed/movie/${id}`;
    } else {
        return `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
    }
}


// تحديث إطار المشغل وزر التحميل
function loadVideoPlayer(serverIndex = 1) {
    activeServer = serverIndex;
    videoFrame.src = getEmbedUrl(serverIndex);
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.href = getDownloadUrl();
    }
    updateServerButtonsUI();
}

// تحديث الألوان الحالة لأزرار السيرفرات
function updateServerButtonsUI() {
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`srvBtn${i}`);
        if (btn) {
            if (i === activeServer) {
                btn.className = "bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow transition";
            } else {
                btn.className = "bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold transition";
            }
        }
    }
}

// التعامل مع الضغط على بطاقة أي فيلم أو مسلسل
async function handleCardClick(item) {
    currentItemData = item;
    currentSeason = 1;
    currentEpisode = 1;
    activeServer = 1;

    const title = item.title || item.name;
    modalTitle.textContent = title;
    modalOverview.textContent = item.overview || "لا توجد تفاصيل متاحة لهذا العرض حالياً.";

    if (currentType === 'movie') {
        buildMovieControls();
        loadVideoPlayer(1);
    } else {
        try {
            const res = await fetch(`${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=ar-SA`);
            const tvData = await res.json();
            await buildTVControls(tvData);
            loadVideoPlayer(1);
        } catch (err) {
            console.error("خطأ جلب بيانات المسلسل المفصلة:", err);
            buildMovieControls(); // Fallback
            loadVideoPlayer(1);
        }
    }

    playerModal.classList.remove('hidden');
}

// بناء أزرار وسيرفرات التحكم الخاصة بالأفلام
function buildMovieControls() {
    controlsContainer.innerHTML = `
        <div class="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 font-bold">السيرفر:</span>
                <button onclick="loadVideoPlayer(1)" id="srvBtn1" class="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">سيرفر 1</button>
                <button onclick="loadVideoPlayer(2)" id="srvBtn2" class="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-bold">سيرفر 2</button>
                <button onclick="loadVideoPlayer(3)" id="srvBtn3" class="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-bold">سيرفر 3</button>
            </div>
            <div>
                <a id="downloadBtn" href="${getDownloadUrl()}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-950/50">
                    <span>📥</span>
                    <span>تنزيل الفيلم</span>
                </a>
            </div>
        </div>
    `;
}

// بناء قوائم وسيرفرات التحكم الخاصة بالمسلسلات (المواسم والحلقات)
async function buildTVControls(tvData) {
    const validSeasons = (tvData.seasons || []).filter(s => s.season_number > 0 && s.episode_count > 0);
    const seasonsOptions = validSeasons.map(s => `<option value="${s.season_number}">${s.name} (${s.episode_count} حلقة)</option>`).join('');

    controlsContainer.innerHTML = `
        <div class="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <!-- تحديد الموسم والحلقة -->
            <div class="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div class="flex items-center gap-1.5">
                    <label class="text-[11px] text-slate-400 font-bold">الموسم:</label>
                    <select id="seasonSelect" class="bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-red-500">
                        ${seasonsOptions || '<option value="1">الموسم 1</option>'}
                    </select>
                </div>
                <div class="flex items-center gap-1.5">
                    <label class="text-[11px] text-slate-400 font-bold">الحلقة:</label>
                    <select id="episodeSelect" class="bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-red-500">
                        <option value="1">الحلقة 1</option>
                    </select>
                </div>
            </div>

            <!-- أزرار اختيار السيرفرات -->
            <div class="flex items-center gap-1.5">
                <span class="text-xs text-slate-400 font-bold hidden sm:inline">السيرفر:</span>
                <button onclick="loadVideoPlayer(1)" id="srvBtn1" class="bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold">سيرفر 1</button>
                <button onclick="loadVideoPlayer(2)" id="srvBtn2" class="bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg font-bold">سيرفر 2</button>
                <button onclick="loadVideoPlayer(3)" id="srvBtn3" class="bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg font-bold">سيرفر 3</button>
            </div>

            <!-- زر التنزيل للمسلسل -->
            <div>
                <a id="downloadBtn" href="${getDownloadUrl()}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md">
                    <span>📥</span>
                    <span>تنزيل الحلقة</span>
                </a>
            </div>
        </div>
    `;

    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');

    // جلب قائمة حلقات الموسم المحدد
    async function updateEpisodesList(seasonNum) {
        try {
            const res = await fetch(`${BASE_URL}/tv/${currentItemData.id}/season/${seasonNum}?api_key=${API_KEY}&language=ar-SA`);
            const seasonData = await res.json();
            
            episodeSelect.innerHTML = '';
            if (seasonData.episodes && seasonData.episodes.length > 0) {
                seasonData.episodes.forEach(ep => {
                    const opt = document.createElement('option');
                    opt.value = ep.episode_number;
                    opt.textContent = `حلقة ${ep.episode_number}: ${ep.name || ''}`;
                    episodeSelect.appendChild(opt);
                });
            } else {
                episodeSelect.innerHTML = `<option value="1">الحلقة 1</option>`;
            }
        } catch (e) {
            console.error("خطأ أثناء جلب قائمة الحلقات:", e);
        }
    }

    // جلب الحلقات للموسم الأول ابتداءً
    const initialSeason = validSeasons.length > 0 ? validSeasons[0].season_number : 1;
    await updateEpisodesList(initialSeason);

    // الأحداث عند تغيير الموسم أو الحلقة
    seasonSelect.addEventListener('change', async (e) => {
        currentSeason = parseInt(e.target.value);
        await updateEpisodesList(currentSeason);
        currentEpisode = 1;
        loadVideoPlayer(activeServer);
    });

    episodeSelect.addEventListener('change', (e) => {
        currentEpisode = parseInt(e.target.value);
        loadVideoPlayer(activeServer);
    });
}

// إغلاق نافذة المشغل وتصفير البيانات
function closePlayer() {
    videoFrame.src = ''; 
    controlsContainer.innerHTML = '';
    playerModal.classList.add('hidden');
}

// شريط البحث المباشر (تأخير 400ms لتخفيف طلبات الشبكة)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    searchTimeout = setTimeout(() => {
        if (query !== '') {
            sectionTitle.textContent = `نتائج البحث عن: "${query}"`;
            fetchMedia(`${BASE_URL}/search/${currentType}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ar-SA`);
        } else {
            sectionTitle.textContent = currentType === 'movie' ? "أحدث الأفلام الرائجة" : "أحدث المسلسلات الرائجة";
            fetchMedia(`${BASE_URL}/trending/${currentType}/day?api_key=${API_KEY}&language=ar-SA`);
        }
    }, 400);
});

// تشغيل الصفحة افتراضياً بقائمة الأفلام الرائجة عند التحميل
window.onload = function() {
    fetchMedia(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=ar-SA`);
};