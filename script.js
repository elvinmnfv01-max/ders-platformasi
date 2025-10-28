// =============================
// 🔐 Təhlükəsizlik util-ləri
// =============================
function sanitize(input) {
  const div = document.createElement("div");
  div.textContent = input ?? "";
  return div.innerHTML;
}
function isSafeHttpUrl(url){
  try{
    const u = new URL(url);
    return (u.protocol === "http:" || u.protocol === "https:");
  }catch{ return false; }
}

// =============================
// 🔗 Google Sheet (Tək fayl, çox verəq/tab)
// =============================
// 1) BURADA ÖZ SHEET ID-Nİ YAZ:
const mainSheetId = "14l25Jz3r_o_y77Aa9nm4aRmVmMF-2oe8-QorvaDGQG8"; // məsələn: 1ABCxyz123...
// 2) Verəq adları qrup adları ilə eynidirsə, xəritəyə ehtiyac yoxdur.
//    Əgər tab adı fərqlidirsə, BURADA xəritə ilə uyğunlaşdır:
const tabNameMap = {
  // "S1": "S1", // eyni olduqda yazmağa ehtiyac yoxdur
  // "S2": "Qrup_S2",
  // "O1": "O1_tab",
  // "15S1": "15S1"
};

// =============================
// 🧩 HTML elementləri
// =============================
const groupSelect = document.getElementById("group");
const subjectSection = document.getElementById("subjectSection");
const videosDiv = document.getElementById("videos");
const videoTitle = document.getElementById("videoTitle");
const videoList = document.getElementById("videoList");
const backBtn = document.getElementById("backBtn");
const loadingEl = document.getElementById("loading");

// Seçilmiş qrupun verəqindən oxunan struktur: { subject: [ {title, link}, ... ] }
let subjectBuckets = {};

// =============================
// 🚀 Qrup seçimi
// =============================
groupSelect.addEventListener("change", async () => {
  const selectedGroup = sanitize(groupSelect.value);
  if (!selectedGroup) {
    subjectSection.classList.add("hidden");
    videosDiv.classList.add("hidden");
    return;
  }
  const tabName = tabNameMap[selectedGroup] || selectedGroup;

  loadingEl.classList.remove("hidden");
  videoList.innerHTML = "";
  videosDiv.classList.add("hidden");

  try{
    subjectBuckets = await loadFromSheetTab(tabName);
    subjectSection.classList.remove("hidden");
  }catch(e){
    console.error(e);
    alert("Məlumat yüklənmədi. Sheet paylaşım icazəsini və tab adını yoxlayın.");
    subjectSection.classList.add("hidden");
  }finally{
    loadingEl.classList.add("hidden");
  }
});

// =============================
// 📥 Verəqdən (tab) məlumatı oxu və fənnə görə qrupla
// =============================
async function loadFromSheetTab(sheetTabName){
  const apiUrl = `https://opensheet.elk.sh/${mainSheetId}/${encodeURIComponent(sheetTabName)}`;
  const resp = await fetch(apiUrl, { cache: "no-store" });
  if(!resp.ok) throw new Error("OpenSheet cavabı uğursuzdur: " + resp.status);
  const rows = await resp.json();

  const buckets = {};
  rows.forEach(row => {
    const s = (row.subject || "").trim().toLowerCase();
    const t = (row.title || "").trim();
    const l = (row.link || "").trim();

    if(!s || !t || !l) return;
    if(!buckets[s]) buckets[s] = [];
    buckets[s].push({ title: t, link: l });
  });

  // İstəyə görə sıralama (məs: title-ə görə)
  // Object.keys(buckets).forEach(k => buckets[k].sort((a,b)=>a.title.localeCompare(b.title, 'az')));

  return buckets;
}

// =============================
// 🧭 Fənn seçimi
// =============================
document.querySelectorAll(".subject-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const subject = (btn.dataset.subject || "").trim().toLowerCase();
    const group = (groupSelect.value || "").trim();
    showVideos(group, subject);
  });
});

// =============================
// 🔙 Geri
// =============================
backBtn.addEventListener("click", () => {
  videosDiv.classList.add("hidden");
  subjectSection.classList.remove("hidden");
});

// =============================
// ▶️ Videoları göstər
// =============================
function showVideos(group, subject){
  const list = subjectBuckets[subject] || [];
  videoList.innerHTML = "";

  videoTitle.textContent = `${group} → ${subject.toUpperCase()}`;

  if(list.length === 0){
    const msg = document.createElement("p");
    msg.textContent = "Bu fənn üçün video yoxdur.";
    videoList.appendChild(msg);
  }else{
    list.forEach(item => {
      const safeTitle = sanitize(item.title);
      const url = (item.link || "").trim();
      const safeUrl = isSafeHttpUrl(url) ? url : "#";

      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <strong>${safeTitle}</strong><br>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">▶️ Videoya bax</a>
      `;
      videoList.appendChild(card);
    });
  }

  subjectSection.classList.add("hidden");
  videosDiv.classList.remove("hidden");
}
