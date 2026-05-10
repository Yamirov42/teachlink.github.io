// ========== РАБОТА С ХРАНИЛИЩЕМ ==========
const STORAGE_USERS = "retro_tutors_users";
const STORAGE_CURRENT = "retro_tutors_current_user";
const STORAGE_BOOKINGS = "retro_tutors_bookings";

// База репетиторов
const TUTORS = [
    { id: 1, name: "Искоростинский Андрей Викторович", subject: "Физика | Электроника", price: "1200 ₽ / час", vintageIcon: " " },
    { id: 2, name: "Осмонова Айнура Женешбековна", subject: "Английский язык", price: "1100 ₽ / час", vintageIcon: " " },
    { id: 3, name: "Табаченко Людмила Генадьевна", subject: "Математика (алгебра/геометрия)", price: "1300 ₽ / час", vintageIcon: " " },
    { id: 4, name: "Сандарс Николай Игоревич", subject: "Программирование (html/css/js)", price: "3000 ₽ / час", vintageIcon: " " },
    { id: 5, name: "Ковтуненько Татьяна Анатольевна", subject: "Русский язык и литература", price: "1000 ₽ / час", vintageIcon: " " },
    { id: 6, name: "Корицкий Кирилл Анатольевич", subject: "История/Обществознание", price: "1150 ₽ / час", vintageIcon: " " }
];

function showToast(message) {
    const existingToast = document.querySelector(".toast-msg");
    if(existingToast) existingToast.remove();
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
}

function getUsers() {
    const users = localStorage.getItem(STORAGE_USERS);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getCurrentUser() {
    const curr = localStorage.getItem(STORAGE_CURRENT);
    return curr ? JSON.parse(curr) : null;
}

function setCurrentUser(user) {
    if(user) {
        localStorage.setItem(STORAGE_CURRENT, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_CURRENT);
    }
}

function getBookings() {
    const bookings = localStorage.getItem(STORAGE_BOOKINGS);
    return bookings ? JSON.parse(bookings) : {};
}

function saveBooking(userId, tutorId, tutorName) {
    const bookings = getBookings();
    if(!bookings[userId]) bookings[userId] = [];
    const already = bookings[userId].some(b => b.tutorId === tutorId);
    if(already) {
        showToast("Вы уже записались к этому репетитору!");
        return false;
    }
    bookings[userId].push({ tutorId, tutorName, date: new Date().toLocaleString() });
    localStorage.setItem(STORAGE_BOOKINGS, JSON.stringify(bookings));
    showToast(`Запись к "${tutorName}" оформлена!`);
    return true;
}

function getUserBookings(userId) {
    const bookings = getBookings();
    return bookings[userId] || [];
}

// ========== ОТРИСОВКА КАРТОЧЕК НА MAIN.HTML ==========
function renderTutors() {
    const grid = document.getElementById("tutorsGrid");
    if(!grid) return;
    const currentUser = getCurrentUser();
    grid.innerHTML = "";
    TUTORS.forEach(tutor => {
        const card = document.createElement("div");
        card.className = "tutor-card";
        card.innerHTML = `
            <h3>${tutor.vintageIcon} ${tutor.name}</h3>
            <div class="subject-badge">${tutor.subject}</div>
            <div class="price">${tutor.price}</div>
            <button class="hire-btn" data-id="${tutor.id}" data-name="${tutor.name}">ЗАПИСАТЬСЯ</button>
        `;
        grid.appendChild(card);
    });
    document.querySelectorAll(".hire-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if(!getCurrentUser()) {
                showToast("Пожалуйста, войдите в аккаунт!");
                window.location.href = "index.html";
                return;
            }
            const tutorId = parseInt(btn.dataset.id);
            const tutorName = btn.dataset.name;
            const userId = getCurrentUser().id;
            saveBooking(userId, tutorId, tutorName);
        });
    });
}

// ========== ЛИЧНЫЙ КАБИНЕТ (profile.html) ==========
function loadProfile() {
    const container = document.getElementById("profileInfo");
    if(!container) return;
    const user = getCurrentUser();
    if(!user) {
        container.innerHTML = `<div class="profile-card">Сеанс не обнаружен. Перенаправляем...</div>`;
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
    }
    const bookings = getUserBookings(user.id);
    let bookingsHtml = "";
    if(bookings.length === 0) {
        bookingsHtml = "<li class='empty-bookings'>Пока нет записей. Найдите репетитора на главной!</li>";
    } else {
        bookings.forEach(b => {
            bookingsHtml += `<li><span>${b.tutorName}</span><span>${b.date}</span></li>`;
        });
    }
    container.innerHTML = `
        <div class="profile-card">
            <div class="info-line">Имя: ${user.username}</div>
            <div class="info-line">Аккаунт авторизован в системе</div>
            <div class="info-line">Мои занятия:</div>
            <ul class="booking-list">${bookingsHtml}</ul>
            <button id="clearAllBookingsBtn" class="retro-btn" style="margin-top:20px; background:#9b5a2e;">Очистить все записи</button>
        </div>
    `;
    const clearBtn = document.getElementById("clearAllBookingsBtn");
    if(clearBtn) {
        clearBtn.addEventListener("click", () => {
            const bookingsAll = getBookings();
            delete bookingsAll[user.id];
            localStorage.setItem(STORAGE_BOOKINGS, JSON.stringify(bookingsAll));
            showToast("Все записи удалены!");
            loadProfile();
        });
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ СТРАНИЦ (роутинг) ==========
function initAuthPage() {
    const loginFormDiv = document.getElementById("loginForm");
    const registerFormDiv = document.getElementById("registerForm");
    const showLoginBtn = document.getElementById("showLoginBtn");
    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const switchToRegister = document.getElementById("switchToRegister");
    const switchToLogin = document.getElementById("switchToLogin");
    
    if(showLoginBtn) {
        showLoginBtn.addEventListener("click", () => {
            loginFormDiv.style.display = "block";
            registerFormDiv.style.display = "none";
            showLoginBtn.classList.add("active");
            showRegisterBtn.classList.remove("active");
        });
    }
    if(showRegisterBtn) {
        showRegisterBtn.addEventListener("click", () => {
            loginFormDiv.style.display = "none";
            registerFormDiv.style.display = "block";
            showRegisterBtn.classList.add("active");
            showLoginBtn.classList.remove("active");
        });
    }
    if(switchToRegister) {
        switchToRegister.addEventListener("click", () => {
            loginFormDiv.style.display = "none";
            registerFormDiv.style.display = "block";
            showRegisterBtn.classList.add("active");
            showLoginBtn.classList.remove("active");
        });
    }
    if(switchToLogin) {
        switchToLogin.addEventListener("click", () => {
            loginFormDiv.style.display = "block";
            registerFormDiv.style.display = "none";
            showLoginBtn.classList.add("active");
            showRegisterBtn.classList.remove("active");
        });
    }
    
    // регистрация
    const doRegister = document.getElementById("doRegisterBtn");
    if(doRegister) {
        doRegister.addEventListener("click", () => {
            const username = document.getElementById("regUsername").value.trim();
            const pwd = document.getElementById("regPassword").value;
            const confirm = document.getElementById("regConfirm").value;
            if(!username || !pwd) { showToast("Заполните имя и пароль!"); return; }
            if(pwd !== confirm) { showToast("Пароли не совпадают!"); return; }
            const users = getUsers();
            if(users.find(u => u.username === username)) { showToast("Имя уже существует!"); return; }
            const newUser = { id: Date.now(), username: username, password: pwd };
            users.push(newUser);
            saveUsers(users);
            showToast("Регистрация успешна! Теперь войдите.");
            loginFormDiv.style.display = "block";
            registerFormDiv.style.display = "none";
            showLoginBtn.classList.add("active");
            showRegisterBtn.classList.remove("active");
            document.getElementById("regUsername").value = "";
            document.getElementById("regPassword").value = "";
            document.getElementById("regConfirm").value = "";
        });
    }
    
    // логин
    const doLogin = document.getElementById("doLoginBtn");
    if(doLogin) {
        doLogin.addEventListener("click", () => {
            const username = document.getElementById("loginUsername").value.trim();
            const pwd = document.getElementById("loginPassword").value;
            const users = getUsers();
            const found = users.find(u => u.username === username && u.password === pwd);
            if(found) {
                setCurrentUser(found);
                showToast(`Добро пожаловать, ${found.username}! Перенаправление...`);
                setTimeout(() => window.location.href = "main.html", 1000);
            } else {
                showToast("Неверное имя или пароль!");
            }
        });
    }
    
    // если уже залогинены, кидаем на main
    if(getCurrentUser() && window.location.pathname.includes("index.html")) {
        window.location.href = "main.html";
    }
}

function initMainPage() {
    if(!getCurrentUser() && window.location.pathname.includes("main.html")) {
        showToast("Необходима авторизация!");
        window.location.href = "index.html";
        return;
    }
    renderTutors();
    const profileBtn = document.getElementById("navProfileBtn");
    const logoutBtn = document.getElementById("logoutBtnMain");
    if(profileBtn) profileBtn.addEventListener("click", () => window.location.href = "profile.html");
    if(logoutBtn) logoutBtn.addEventListener("click", () => { setCurrentUser(null); showToast("Выход выполнен"); window.location.href = "index.html"; });
}

function initProfilePage() {
    if(!getCurrentUser()) {
        window.location.href = "index.html";
        return;
    }
    loadProfile();
    const toMain = document.getElementById("navMainFromProfile");
    const logout = document.getElementById("logoutBtnProfile");
    if(toMain) toMain.addEventListener("click", () => window.location.href = "main.html");
    if(logout) logout.addEventListener("click", () => { setCurrentUser(null); showToast("Выход из кабинета"); window.location.href = "index.html"; });
}

// определение активной страницы
window.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if(path.includes("main.html")) initMainPage();
    else if(path.includes("profile.html")) initProfilePage();
    else initAuthPage();
});