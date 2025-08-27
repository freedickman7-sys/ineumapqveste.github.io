let currentMap = 0;
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;

const mapWrapper = document.getElementById("map-wrapper");
const mapImage = document.getElementById("map-image");
const iconsLayer = document.getElementById("icons-layer");

// --- карты и иконки ---
const maps = [
  {
    image: "maps/map1.png",
    icons: [
      { src: "icons/icon1.png", x: 200, y: 150 },
      { src: "icons/icon2.png", x: 400, y: 300 },
      { src: "icons/icon3.png", x: 600, y: 450 }
    ]
  },
  {
    image: "maps/map2.png",
    icons: [
      { src: "icons/icon1.png", x: 100, y: 100 },
      { src: "icons/icon3.png", x: 500, y: 200 }
    ]
  },
  {
    image: "maps/map3.png",
    icons: []
  },
  {
    image: "maps/map4.png",
    icons: [
      { src: "icons/icon2.png", x: 250, y: 300 }
    ]
  }
];

function setMap(index) {
  currentMap = index;
  scale = 1;
  rotation = 0;
  posX = 0;
  posY = 0;

  mapImage.src = maps[index].image;
  renderIcons();
  updateTransform();
}

function renderIcons() {
  iconsLayer.innerHTML = "";
  maps[currentMap].icons.forEach(icon => {
    if (icon.x === 0 && icon.y === 0) return; // скрыть иконку
    const el = document.createElement("img");
    el.src = icon.src;
    el.className = "icon";
    el.style.left = icon.x + "px";
    el.style.top = icon.y + "px";
    iconsLayer.appendChild(el);
  });
}

// применяем трансформации
function updateTransform() {
  mapWrapper.style.transform = 
    `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;

  // иконки должны оставаться "внизом"
  document.querySelectorAll(".icon").forEach(el => {
    el.style.transform = `scale(${scale}) rotate(${-rotation}deg)`;
  });
}

// --- управление жестами ---
// зум (щипок)
let startDist = 0, startAngle = 0, startScale = 1, startRot = 0;

mapWrapper.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    startDist = Math.hypot(dx, dy);
    startAngle = Math.atan2(dy, dx);
    startScale = scale;
    startRot = rotation;
  }
}, { passive: false });

mapWrapper.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    scale = Math.min(4, Math.max(0.5, startScale * (dist / startDist)));
    rotation = startRot + (angle - startAngle) * (180 / Math.PI);

    updateTransform();
  }
}, { passive: false });

// перемещение одним пальцем
let lastX = 0, lastY = 0;
mapWrapper.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
});
mapWrapper.addEventListener("touchmove", e => {
  if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    posX += dx;
    posY += dy;
    updateTransform();
  }
});

// --- мышь для ПК ---
let dragging = false;
mapWrapper.addEventListener("mousedown", e => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener("mouseup", () => dragging = false);
window.addEventListener("mousemove", e => {
  if (dragging) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    posX += dx;
    posY += dy;
    updateTransform();
  }
});
window.addEventListener("wheel", e => {
  scale = Math.min(4, Math.max(0.5, scale + e.deltaY * -0.001));
  updateTransform();
});

// загрузка первой карты
setMap(0);
