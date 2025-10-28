// =============================
// 🔗 1. Google Sheet bağlantısı
// =============================
const sheetId = "14l25Jz3r_o_y77Aa9nm4aRmVmMF-2oe8-QorvaDGQG8"; // məsələn: 1ABCxyz1234567890
const sheetName = "linkler"; // sən cədvələ hansı ad vermisənsə
const apiUrl = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

// =============================
// 🧩 2. HTML elementləri
// =============================
const groupSelect = document.getElementById("group");
const subjectSelect = document.getElementById("subjectSelect");
const videosDiv = document.getElementById("videos");
const videoTitle = document.getElementById("videoTitle");
const videoList = document.getElementById("videoList");
const backBtn = document.getElementById("backBtn");

let allVideos = {}; // Sheet-dən gələn məlumat burada saxlanacaq

// =============================
// 🚀 3. Sayt yüklənəndə Sheet-dən məlumatı al
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    allVideos = await loadVideosFromSheet();
    console.log("Videolar uğurla yükləndi:", allVideos);
  } catch (err) {
    console.error("Videoları yükləmək mümkün olmadı:", err);
    alert("Videolar yüklənə bilmədi. Zəhmət olmasa səhifəni yeniləyin.");
  }
});

// =============================
// 📄 4. Google Sheet-dən JSON məlumatı çək
// =============================
async function loadVideosFromSheet() {
  const response = await fetch(apiUrl);
  const data = await response.json();

  // Sheet-i strukturlaşdırırıq: group → subject → [videolar]
  const grouped = {};
  data.forEach(row => {
    const g = row.group?.trim();
    const s = row.subject?.trim();
    const t = row.title?.trim();
    const l = row.link?.trim();

    if (!g || !s || !t || !l) return; // boş sətirlər atılır

    if (!grouped[g]) grouped[g] = {};
    if (!grouped[g][s]) grouped[g][s] = [];
    grouped[g][s].push({ title: t, link: l });
  });
  return grouped;
}

// =============================
// 🧭 5. Qrup seçimi
// =============================
groupSelect.addEventListener("change", () => {
  if (groupSelect.value) {
    subjectSelect.classList.remove("hidden");
    videosDiv.classList.add("hidden");
  } else {
    subjectSelect.classList.add("hidden");
  }
});

// =============================
// 📚 6. Fənn seçimi
// =============================
document.querySelectorAll(".subject-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = groupSelect.value;
    const subject = btn.dataset.subject;
    showVideos(group, subject);
  });
});

// =============================
// 🔙 7. “Geri” düyməsi
// =============================
backBtn.addEventListener("click", () => {
  videosDiv.classList.add("hidden");
  subjectSelect.classList.remove("hidden");
});

// =============================
// ▶️ 8. Videoları göstərmək
// =============================
function showVideos(group, subject) {
  const data = allVideos[group]?.[subject];
  videoList.innerHTML = "";

  if (!data || data.length === 0) {
    videoTitle.textContent = `${group} → ${subject.toUpperCase()}`;
    const msg = document.createElement("p");
    msg.textContent = "Bu bölmədə hələ video yoxdur.";
    videoList.appendChild(msg);
  } else {
    videoTitle.textContent = `${group} → ${subject.toUpperCase()}`;
    data.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("video-card");
      card.innerHTML = `
        <strong>${item.title}</strong><br>
        <a href="${item.link}" target="_blank">▶️ Videoya bax</a>
      `;
      videoList.appendChild(card);
    });
  }

  subjectSelect.classList.add("hidden");
  videosDiv.classList.remove("hidden");
}
