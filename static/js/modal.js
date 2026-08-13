const scroller = document.querySelector(".scroller");
const bookmarks = document.querySelectorAll(".bookmark");
const sections = document.querySelectorAll(".snap-section");

function setActive(index) {
  bookmarks.forEach((b, i) => b.classList.toggle("active", i === index));
}

scroller.addEventListener("scroll", () => {
  let index = 0;
  let closestDistance = Infinity;

  sections.forEach((section, i) => {
    const distance = Math.abs(section.offsetTop - scroller.scrollTop);
    if (distance < closestDistance) {
      closestDistance = distance;
      index = i;
    }
  });

  setActive(index);
});

bookmarks.forEach((bookmark, i) => {
  bookmark.addEventListener("click", (e) => {
    e.preventDefault();
    const section = sections[i];
    if (!section) return;

    scroller.scrollTo({ top: section.offsetTop, behavior: "smooth" });
    history.replaceState(null, "", bookmark.getAttribute("href"));
  });
});

if (window.location.hash) {
  const section = document.querySelector(window.location.hash);
  if (section) {
    requestAnimationFrame(() => {
      scroller.scrollTo({ top: section.offsetTop });
    });
  }
}

document.querySelectorAll(".cards-track").forEach((track) => {
  const dotsContainer = track
    .closest(".section-content")
    .querySelector(".scroll-dots");
  if (!dotsContainer) return;

  const dots = dotsContainer.querySelectorAll(".scroll-dot");

  track.addEventListener("scroll", () => {
    const cardWidth = track.offsetWidth;
    if (cardWidth === 0) return;
    const index = Math.round(track.scrollLeft / cardWidth);
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  });
});

const projectsContent = document.querySelector(".projects-content");
const lineup = document.querySelector(".lineup");
const suspects = lineup?.querySelectorAll(".lineup-suspect") || [];
const charges = projectsContent?.querySelectorAll(".charge-sheet") || [];

function positionProjectCharges() {
  if (!projectsContent || !lineup) return;

  const contentLeft = projectsContent.getBoundingClientRect().left;
  suspects.forEach((suspect, index) => {
    const charge = charges[index];
    if (!charge) return;

    const rect = suspect.getBoundingClientRect();
    charge.style.left = `${rect.left + rect.width / 2 - contentLeft}px`;
  });
}

positionProjectCharges();
lineup?.addEventListener("scroll", positionProjectCharges, { passive: true });
window.addEventListener("resize", positionProjectCharges);
