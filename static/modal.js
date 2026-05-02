const scroller = document.querySelector(".scroller");
const bookmarks = document.querySelectorAll(".bookmark");
const sections = document.querySelectorAll(".snap-section");
const totalSections = sections.length;

function setActive(index) {
  bookmarks.forEach((b, i) => b.classList.toggle("active", i === index));
}

scroller.addEventListener("scroll", () => {
  const index = Math.round(scroller.scrollTop / window.innerHeight);
  setActive(index);
});

bookmarks.forEach((bookmark, i) => {
  bookmark.addEventListener("click", (e) => {
    e.preventDefault();
    scroller.scrollTo({ top: i * window.innerHeight, behavior: "smooth" });
  });
});

const isMobile = () => window.innerWidth < 768;

let touchStartY = 0;
let touchStartX = 0;
let snapDisabled = false;
let snapTimer = null;

scroller.addEventListener(
  "touchstart",
  (e) => {
    if (!isMobile()) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);

scroller.addEventListener(
  "touchmove",
  (e) => {
    if (!isMobile()) return;
    const content = e.target.closest(".section-content");
    if (!content) return;

    const isScrollable = content.scrollHeight > content.clientHeight;
    if (!isScrollable) return;

    const diffY = Math.abs(touchStartY - e.touches[0].clientY);
    const diffX = Math.abs(touchStartX - e.touches[0].clientX);
    if (diffY < diffX) return;

    const atTop = content.scrollTop === 0;
    const atBottom =
      content.scrollTop + content.clientHeight >= content.scrollHeight - 1;
    const scrollingUp = e.touches[0].clientY > touchStartY;
    const scrollingDown = e.touches[0].clientY < touchStartY;

    if ((atTop && scrollingUp) || (atBottom && scrollingDown)) return;

    if (!snapDisabled) {
      snapDisabled = true;
      scroller.style.scrollSnapType = "none";
    }

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      scroller.style.scrollSnapType = "";
      snapDisabled = false;
      const idx = Math.round(scroller.scrollTop / window.innerHeight);
      scroller.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" });
      setActive(idx);
    }, 300);
  },
  { passive: true },
);
