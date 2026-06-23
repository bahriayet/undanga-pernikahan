/* ==========================================================================
   APP.JS - PREMIUM WEDDING INVITATION INTERACTIVE LOGIC
   ========================================================================== */

// --- ⚙️ KONFIGURASI UNDANGAN (BISA DISESUAIKAN) ---
const WEDDING_CONFIG = {
    // Tanggal Pernikahan untuk Countdown (Format: YYYY-MM-DDTHH:mm:ss)
    targetDate: "2026-12-12T08:00:00", 
    
    // Nomor WhatsApp Tujuan RSVP (Format: Kode Negara tanpa '+', contoh 62812xxx)
    whatsappNumber: "628123456789", 
    
    // Nama Pengantin untuk format pesan WhatsApp
    groomName: "Arief",
    brideName: "Indah",
    
    // Detail Rekening Bank / Amplop Digital
    gifts: {
        bank1: {
            bankName: "BCA",
            accountNumber: "1234567890",
            accountOwner: "Arief Pratama"
        },
        bank2: {
            bankName: "Mandiri",
            accountNumber: "9876543210",
            accountOwner: "Indah Permatasari"
        }
    },
    
    // Tema Animasi Kelopak Bunga Jatuh ('gold', 'pink' untuk Sakura, atau 'mix')
    petalTheme: "gold",
    
    // URL Musik Latar Belakang (Royalty-Free Piano / Romantic Wedding Track)
    bgMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    
    firebase: {
        enabled: true,
        config: {
            apiKey: "AIzaSyDMX0__A6ctdPen0S-9Kz3s2waQlNsJvio",
            authDomain: "undangan-penikahan-4e528.firebaseapp.com",
            projectId: "undangan-penikahan-4e528",
            storageBucket: "undangan-penikahan-4e528.firebasestorage.app",
            messagingSenderId: "1079880061409",
            appId: "1:1079880061409:web:9bedd8c0b74ea2ce1502a0",
            measurementId: "G-HK7TGJG2Z4"
        }
    }
};

// --- 🎵 MANAJEMEN AUDIO & INTERAKSI HERO ---
let backgroundMusic = null;
let isMusicPlaying = false;

function initAudio() {
    backgroundMusic = new Audio(WEDDING_CONFIG.bgMusicUrl);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Set volume ke 50% agar tidak terlalu keras
}

// Buka Undangan Action
function openInvitation() {
    // Hapus kelas lock scroll pada body
    document.body.classList.remove("cover-locked");
    
    // Scroll ke bagian countdown (di bawah hero) secara halus
    const targetSection = document.getElementById("countdown-section");
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
    }
    
    // Putar musik jika belum berputar
    playMusic();
}

function playMusic() {
    if (!backgroundMusic) initAudio();
    
    // Mulai volume dari 0 untuk efek fade-in
    backgroundMusic.volume = 0;
    
    backgroundMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicToggleButton(true);
        
        // Naikkan volume secara berkala ke 0.5 selama 2 detik (2000ms)
        const fadeInterval = 50; // Kenaikan setiap 50ms
        const targetVolume = 0.5;
        const step = targetVolume / (2000 / fadeInterval);
        
        let currentVolume = 0;
        const intervalId = setInterval(() => {
            currentVolume = Math.min(targetVolume, currentVolume + step);
            backgroundMusic.volume = currentVolume;
            
            if (currentVolume >= targetVolume) {
                clearInterval(intervalId);
            }
        }, fadeInterval);
    }).catch(err => {
        console.warn("Autoplay dicegah oleh browser. Pengguna harus berinteraksi terlebih dahulu.", err);
    });
}

function toggleMusic() {
    if (!backgroundMusic) initAudio();
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        updateMusicToggleButton(false);
    } else {
        backgroundMusic.play();
        isMusicPlaying = true;
        updateMusicToggleButton(true);
    }
}

function updateMusicToggleButton(isPlaying) {
    const musicToggle = document.getElementById("music-toggle");
    const musicIcon = document.getElementById("music-icon");
    
    if (isPlaying) {
        musicIcon.textContent = "music_off";
        musicToggle.classList.add("music-pulse", "animate-pulse");
    } else {
        musicIcon.textContent = "music_note";
        musicToggle.classList.remove("music-pulse", "animate-pulse");
    }
}

// --- ⏳ COUNTDOWN TIMER ---
function startCountdown() {
    const countdownDate = new Date(WEDDING_CONFIG.targetDate).getTime();
    
    // Update countdown setiap detik
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        // Kalkulasi waktu
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Target DOM element
        const dVal = document.getElementById("countdown-days");
        const hVal = document.getElementById("countdown-hours");
        const mVal = document.getElementById("countdown-mins");
        const sVal = document.getElementById("countdown-secs");
        
        if (dVal && hVal && mVal && sVal) {
            if (distance < 0) {
                clearInterval(timerInterval);
                dVal.textContent = "00";
                hVal.textContent = "00";
                mVal.textContent = "00";
                sVal.textContent = "00";
            } else {
                dVal.textContent = String(days).padStart(2, '0');
                hVal.textContent = String(hours).padStart(2, '0');
                mVal.textContent = String(minutes).padStart(2, '0');
                sVal.textContent = String(seconds).padStart(2, '0');
            }
        }
    }, 1000);
}

// --- 📨 RSVP FORM HANDLER (WHATSAPP INTEGRATION) ---
function handleRSVPSubmission(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById("rsvp-name");
    const attendanceSelect = document.getElementById("rsvp-attendance");
    const guestsInput = document.getElementById("rsvp-guests");
    
    if (!nameInput.value || !attendanceSelect.value) {
        alert("Mohon lengkapi Nama dan Status Kehadiran Anda.");
        return;
    }
    
    const name = nameInput.value.trim();
    const attendance = attendanceSelect.value === "hadir" ? "Hadir (Will Attend)" : "Tidak Hadir (Cannot Attend)";
    const guests = guestsInput.value || "1";
    
    // Susun pesan WhatsApp
    const message = `Halo ${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}, saya ingin mengonfirmasi kehadiran untuk undangan pernikahan Anda.\n\n` +
                    `*Nama:* ${name}\n` +
                    `*Konfirmasi Kehadiran:* ${attendance}\n` +
                    `*Jumlah Tamu:* ${guests} Orang\n\n` +
                    `Terima kasih!`;
                    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WEDDING_CONFIG.whatsappNumber}&text=${encodedMessage}`;
    
    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, "_blank");
}

// --- ✍️ GUEST BOOK SYSTEM (LOCALSTORAGE + FIREBASE READY) ---
const LOCAL_WISHES_KEY = "wedding_wishes_list";

// Contoh ucapan awal jika LocalStorage masih kosong
const defaultWishes = [
    { name: "Budi & Keluarga", message: "Selamat menempuh hidup baru Arief & Indah. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Amin.", time: "Baru saja" },
    { name: "Sarah Wijaya", message: "Happy wedding guys! So happy for both of you. Lancar sampai hari H!", time: "1 jam yang lalu" },
    { name: "Andi Pratama", message: "Selamat Bro Arief! Akhirnya sah juga. Semoga bahagia selalu bersama istri tercinta.", time: "3 jam yang lalu" }
];

let firestoreDb = null;

function initFirebase() {
    if (!WEDDING_CONFIG.firebase.enabled) return;
    
    try {
        if (typeof firebase !== "undefined") {
            firebase.initializeApp(WEDDING_CONFIG.firebase.config);
            firestoreDb = firebase.firestore();
            console.log("Firebase initialized successfully.");
            
            // Dapatkan data secara real-time dari Firestore
            firestoreDb.collection("wishes")
                .orderBy("createdAt", "asc")
                .onSnapshot((snapshot) => {
                    let wishes = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        let wishTime = data.time || "Baru saja";
                        if (data.createdAt) {
                            const date = data.createdAt.toDate();
                            wishTime = formatRelativeTime(date);
                        }
                        wishes.push({
                            name: data.name,
                            message: data.message,
                            time: wishTime
                        });
                    });
                    
                    // Selalu render dan simpan perubahan (termasuk ketika semua data dihapus)
                    renderWishes(wishes);
                    localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(wishes));
                }, (error) => {
                    console.error("Firebase Firestore sync failed: ", error);
                });
        } else {
            console.warn("Firebase SDK tidak terdeteksi. Menggunakan penyimpanan lokal.");
        }
    } catch (e) {
        console.error("Error setting up Firebase: ", e);
    }
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return `${diffDays} hari yang lalu`;
}

function initGuestBook() {
    if (WEDDING_CONFIG.firebase.enabled) {
        initFirebase();
    }
    
    let wishes = JSON.parse(localStorage.getItem(LOCAL_WISHES_KEY));
    // Hanya gunakan defaultWishes jika data lokal belum pernah dibuat sama sekali (null)
    if (wishes === null) {
        wishes = defaultWishes;
        localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(wishes));
    }
    renderWishes(wishes);
}

function renderWishes(wishes) {
    const listContainer = document.getElementById("wishes-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = ""; // Bersihkan kontainer
    
    // Tampilkan ucapan dari yang terbaru di atas
    const sortedWishes = [...wishes].reverse();
    
    sortedWishes.forEach(wish => {
        const wishDiv = document.createElement("div");
        wishDiv.className = "border-b border-outline-variant/20 pb-4 last:border-b-0";
        wishDiv.innerHTML = `
            <div class="flex justify-between items-baseline mb-1">
                <h4 class="font-label-md text-label-md text-primary font-semibold">${escapeHTML(wish.name)}</h4>
                <span class="text-[10px] text-outline">${wish.time || "Baru saja"}</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant text-sm italic">
                "${escapeHTML(wish.message)}"
            </p>
        `;
        listContainer.appendChild(wishDiv);
    });
}

function submitWish(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById("wish-name");
    const messageInput = document.getElementById("wish-message");
    
    if (!nameInput.value.trim() || !messageInput.value.trim()) {
        alert("Mohon isi nama dan ucapan Anda.");
        return;
    }
    
    const newWish = {
        name: nameInput.value.trim(),
        message: messageInput.value.trim(),
        time: "Baru saja"
    };
    
    // Simpan ke LocalStorage
    let wishes = JSON.parse(localStorage.getItem(LOCAL_WISHES_KEY)) || [];
    wishes.push(newWish);
    localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(wishes));
    
    // Tampilkan ulang daftar ucapan
    renderWishes(wishes);
    
    // Pemicu efek confetti hati mewah
    if (typeof triggerHeartsConfetti === "function") {
        triggerHeartsConfetti();
    }
    
    // Reset form
    nameInput.value = "";
    messageInput.value = "";
    
    // Efek scroll otomatis ke bagian ucapan teratas
    const listContainer = document.getElementById("wishes-list");
    if (listContainer) {
        listContainer.scrollTop = 0;
    }
    
    // Firebase integrasi jika diaktifkan
    if (WEDDING_CONFIG.firebase.enabled) {
        saveWishToFirebase(newWish);
    }
}

function saveWishToFirebase(wish) {
    if (!firestoreDb) {
        console.warn("Firebase belum diinisialisasi atau dinonaktifkan.");
        return;
    }
    
    const newDoc = {
        name: wish.name,
        message: wish.message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    firestoreDb.collection("wishes").add(newDoc)
        .then(() => {
            console.log("Ucapan berhasil disimpan di Firestore!");
        })
        .catch((error) => {
            console.error("Gagal menyimpan ucapan di Firestore: ", error);
        });
}

// Utility untuk mencegah XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// --- 👁️ SCROLL ANIMATION OBSERVER ---
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    }, {
        threshold: 0.1, // Memicu saat 10% elemen terlihat di layar
        rootMargin: "0px 0px -50px 0px" // Offset agar animasi terasa natural saat scroll
    });
    
    const animatedSections = document.querySelectorAll(".fade-in-section");
    animatedSections.forEach(section => {
        observer.observe(section);
    });
}

// --- 🧭 NAVIGATION ACTIVE STATE & RESPONSIVE ROUTING ---
function initNavigation() {
    const navLinks = document.querySelectorAll("nav.md\\:hidden a");
    const sections = document.querySelectorAll("main > section");
    
    // Aktifkan tab bar bawah yang sesuai saat scroll
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute("id");
            }
        });
        
        if (currentSectionId) {
            navLinks.forEach(link => {
                const href = link.getAttribute("href").substring(1);
                if (href === currentSectionId) {
                    link.className = "flex flex-col items-center justify-center text-primary dark:text-primary-fixed-dim font-bold bg-primary-container/20 rounded-full px-4 py-1 scale-98 transition-all";
                } else {
                    link.className = "flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:text-secondary transition-all scale-98 px-4 py-1";
                }
            });
        }
    });

    // Event listener untuk klik navigasi seluler
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

// --- 🎨 FITUR MEWAH TAMBAHAN (PETALS, LIGHTBOX, GIFT CARDS, CALENDAR) ---

function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const guestNameEl = document.getElementById("guest-name");
    if (guestNameEl && guestName) {
        guestNameEl.textContent = decodeURIComponent(guestName.replace(/\+/g, ' '));
    }
}

function initCalendarLinks() {
    const akadLink = document.getElementById("add-to-calendar-akad");
    const resepsiLink = document.getElementById("add-to-calendar-resepsi");
    
    const title = encodeURIComponent(`Pernikahan ${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}`);
    const details = encodeURIComponent(`Mohon doa restu untuk pernikahan kami.\nLokasi: The Ritz-Carlton Jakarta.`);
    const location = encodeURIComponent("The Ritz-Carlton Jakarta, Pacific Place SCBD, Jakarta Selatan");
    
    // Tanggal 12 Des 2026:
    // Akad: 08:00 WIB - 10:00 WIB (WIB adalah UTC+7, jadi UTC: 01:00 - 03:00)
    // Resepsi: 19:00 WIB - Selesai (UTC: 12:00 - 15:00)
    const dateAkad = "20261212T010000Z/20261212T030000Z";
    const dateResepsi = "20261212T120000Z/20261212T150000Z";
    
    if (akadLink) {
        akadLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateAkad}&details=${details}&location=${location}`;
    }
    if (resepsiLink) {
        resepsiLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateResepsi}&details=${details}&location=${location}`;
    }
}



function initLightbox() {
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    const galleryImages = document.querySelectorAll("#gallery img");
    
    if (!lightbox || !lightboxImg || !closeBtn) return;
    
    galleryImages.forEach(img => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.remove("hidden");
            void lightbox.offsetWidth; // trigger reflow
            lightbox.classList.add("active");
        });
    });
    
    const closeLightbox = () => {
        lightbox.classList.remove("active");
        setTimeout(() => {
            lightbox.classList.add("hidden");
            lightboxImg.src = "";
        }, 300);
    };
    
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
            closeLightbox();
        }
    });
}

function startPetalsAnimation() {
    const container = document.getElementById("petals-container");
    if (!container) return;
    
    const petalThemes = {
        gold: ["#ffd700", "#d4af37", "#b8860b", "#fff8dc"],
        pink: ["#ffc0cb", "#ffb6c1", "#ff69b4", "#ffe4e1"],
        mix: ["#ffd700", "#d4af37", "#ffc0cb", "#ffb6c1"]
    };
    
    const colors = petalThemes[WEDDING_CONFIG.petalTheme] || petalThemes.gold;
    
    // Deteksi perangkat mobile untuk optimasi performa
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const maxPetals = isMobile ? 10 : 20;
    const intervalTime = isMobile ? 1200 : 800;
    
    setInterval(() => {
        if (container.children.length > maxPetals) return;
        createPetal(container, colors);
    }, intervalTime);
}

function createPetal(container, colors) {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    
    const isPink = WEDDING_CONFIG.petalTheme === "pink" || (WEDDING_CONFIG.petalTheme === "mix" && Math.random() > 0.5);
    if (isPink) {
        petal.classList.add("pink-petal");
    } else {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        petal.style.background = `linear-gradient(135deg, ${randomColor}, ${adjustColorBrightness(randomColor, -20)})`;
    }
    
    const size = Math.random() * 10 + 8; // 8px - 18px
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    
    petal.style.left = `${Math.random() * 100}%`;
    
    const fallDuration = Math.random() * 6 + 6;
    const swayDuration = Math.random() * 3 + 2;
    const delay = Math.random() * -10;
    
    petal.style.animation = `fall ${fallDuration}s linear infinite, sway ${swayDuration}s ease-in-out infinite alternate`;
    petal.style.animationDelay = `${delay}s`;
    
    container.appendChild(petal);
    
    setTimeout(() => {
        petal.remove();
    }, (fallDuration * 1000) + 1000);
}

function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

function initQuoteSlider() {
    const slides = document.querySelectorAll(".quote-slide");
    if (slides.length <= 1) return;
    
    let activeIndex = 0;
    
    setInterval(() => {
        const currentSlide = slides[activeIndex];
        currentSlide.classList.remove("opacity-100", "translate-y-0");
        currentSlide.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
        currentSlide.setAttribute("data-active", "false");
        
        activeIndex = (activeIndex + 1) % slides.length;
        
        const nextSlide = slides[activeIndex];
        nextSlide.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
        nextSlide.classList.add("opacity-100", "translate-y-0");
        nextSlide.setAttribute("data-active", "true");
    }, 5000);
}

function init3DTilt() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    const cards = document.querySelectorAll(".tilt-card");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        });
    });
}

function triggerHeartsConfetti() {
    const button = document.querySelector("#wish-form button[type='submit']");
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    const heartIcons = ["❤️", "💖", "💕", "💛", "✨", "🌸"];
    
    for (let i = 0; i < 25; i++) {
        const p = document.createElement("div");
        p.className = "heart-particle";
        p.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;
        
        const xOffset = (Math.random() - 0.5) * 300;
        const yOffset = -Math.random() * 250 - 100;
        const scale = Math.random() * 0.8 + 0.6;
        const rotation = Math.random() * 360;
        
        p.style.setProperty("--x-offset", `${xOffset}px`);
        p.style.setProperty("--y-offset", `${yOffset}px`);
        p.style.setProperty("--scale-multiplier", scale);
        p.style.setProperty("--rotation", `${rotation}deg`);
        
        p.style.animationDelay = `${Math.random() * 0.2}s`;
        
        document.body.appendChild(p);
        
        setTimeout(() => {
            p.remove();
        }, 1700);
    }
}

// --- 🚀 INISIALISASI UTAMA SAAT DOM SIAP ---
document.addEventListener("DOMContentLoaded", () => {
    // Kunci scroll body saat cover masih aktif
    document.body.classList.add("cover-locked");
    
    // Inisialisasi fitur
    startCountdown();
    initGuestBook();
    initScrollObserver();
    initNavigation();
    
    // Inisialisasi Fitur Mewah
    initGuestName();
    initCalendarLinks();
    initLightbox();
    startPetalsAnimation();
    initQuoteSlider();
    init3DTilt();
    
    // Pasang Event Listeners
    const openInvitationBtn = document.getElementById("open-invitation-btn");
    if (openInvitationBtn) {
        openInvitationBtn.addEventListener("click", openInvitation);
    }
    
    const musicToggle = document.getElementById("music-toggle");
    if (musicToggle) {
        musicToggle.addEventListener("click", toggleMusic);
    }
    
    const rsvpForm = document.getElementById("rsvp-form");
    if (rsvpForm) {
        rsvpForm.addEventListener("submit", handleRSVPSubmission);
    }
    
    const wishForm = document.getElementById("wish-form");
    if (wishForm) {
        wishForm.addEventListener("submit", submitWish);
    }
});
