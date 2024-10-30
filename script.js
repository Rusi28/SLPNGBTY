// Alap admin jelszó (ezt helyettesítheted saját jelszóval)
const adminPassword = "titkosjelszo";

// Kezdési idő kijelzése
let startTime = "06:00";
document.getElementById("start-time-display").innerText = startTime;

// Időközök generálása a dropdown listához
const betTimeSelect = document.getElementById("bet-time");
for (let i = 0; i < 24; i++) {
    const option = document.createElement("option");
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    const minutes = i % 2 === 0 ? "00" : "30";
    option.value = `${hours}:${minutes}`;
    option.textContent = `${hours}:${minutes}`;
    betTimeSelect.appendChild(option);
}

// Admin bejelentkezés kezelése
document.getElementById("admin-login-btn").addEventListener("click", () => {
    const enteredPassword = document.getElementById("admin-password").value;
    if (enteredPassword === adminPassword) {
        document.querySelector(".admin-section").classList.remove("hidden");
        document.querySelector(".admin-login").classList.add("hidden");  // Elrejti a bejelentkezési mezőt
    } else {
        alert("Helytelen jelszó!");
    }
});

// Kijelentkezés kezelése
document.getElementById("logout-btn").addEventListener("click", () => {
    document.querySelector(".admin-section").classList.add("hidden");
    document.querySelector(".admin-login").classList.remove("hidden"); // Visszaállítja a bejelentkezési mezőt
    document.getElementById("admin-password").value = ""; // Törli a jelszót
});


// Fogadások kezelése
const betForm = document.getElementById("bet-form");
const betList = document.getElementById("bet-list");
const bets = [];
const betAmount = 500;  // Minden tét 500 Ft
let resultsSaved = false;

betForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const betTime = document.getElementById("bet-time").value;
    bets.push({ name, betTime });
    displayBets();
    betForm.reset();
});

// Fogadások megjelenítése
function displayBets() {
    betList.innerHTML = "";
    bets.forEach((bet) => {
        const li = document.createElement("li");
        li.textContent = `${bet.name}: ${bet.betTime} (500 Ft)`;
        betList.appendChild(li);
    });
}

// Admin beállítások mentése
document.getElementById("save-admin-settings").addEventListener("click", () => {
    const setStartTime = document.getElementById("set-start-time").value;
    const actualArrivalTime = document.getElementById("actual-arrival-time").value;

    if (setStartTime) {
        startTime = setStartTime;
        document.getElementById("start-time-display").innerText = startTime;
    }

    if (actualArrivalTime) {
        calculateWinner(parseTime(actualArrivalTime));
        document.getElementById("save-result-btn").disabled = false; // Engedélyezi a mentés gombot
    }
});

// Győztes kiszámítása érkezési idő alapján és nyeremény összegének megjelenítése
function calculateWinner(actualTime) {
    let closestBet = null;
    let closestDifference = Infinity;

    bets.forEach((bet) => {
        const betTime = parseTime(bet.betTime);
        const diff = Math.abs(actualTime - betTime);
        if (diff < closestDifference) {
            closestDifference = diff;
            closestBet = bet;
        }
    });

    const winnerDisplay = document.getElementById("winner-display");
    const totalPrize = bets.length * betAmount;
    if (closestBet) {
        winnerDisplay.textContent = `Győztes: ${closestBet.name} (${closestBet.betTime}) - Nyeremény: ${totalPrize} Ft`;
        closestBet.totalPrize = totalPrize;  // Nyeremény mentése
        closestBet.winner = true;  // Győztes jelölése
    } else {
        winnerDisplay.textContent = "Nincs fogadás.";
    }
}

// Eredmények mentése CSV fájlba
document.getElementById("save-result-btn").addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Név,Fogadási idő,Nyeremény,Győztes\n" +
        bets.map(bet => `${bet.name},${bet.betTime},${bet.winner ? bet.totalPrize : 0},${bet.winner ? "Igen" : "Nem"}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fogadasi_eredmenyek.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    resultsSaved = true;
    document.getElementById("save-result-btn").disabled = true; // Letiltja a mentés gombot
});

// Segédfüggvény az idő konvertálásához
function parseTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

// Figyelmeztetés az oldal frissítésekor, ha az eredmény nincs mentve
window.addEventListener("beforeunload", function (e) {
    if (!resultsSaved) {
        e.preventDefault();
        e.returnValue = "Az eredmények nincsenek mentve. Biztosan el akarod hagyni az oldalt?";
    }
});
