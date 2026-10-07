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

if (lineup) {
  let startX;
  let startScrollLeft;
  let dragged = false;

  function snapToNearestSuspect() {
    const lineupRect = lineup.getBoundingClientRect();
    const snapLeft =
      lineupRect.left +
      (parseFloat(getComputedStyle(lineup).scrollPaddingLeft) || 0);
    let nearestLeft = lineup.scrollLeft;
    let nearestDistance = Infinity;

    suspects.forEach((suspect) => {
      const left =
        lineup.scrollLeft + suspect.getBoundingClientRect().left - snapLeft;
      const distance = Math.abs(left - lineup.scrollLeft);
      if (distance < nearestDistance) {
        nearestLeft = left;
        nearestDistance = distance;
      }
    });

    lineup.classList.remove("is-dragging");
    lineup.scrollTo({ left: nearestLeft, behavior: "smooth" });
  }

  lineup.addEventListener("pointerdown", (event) => {
    if (
      event.button ||
      event.pointerType === "touch" ||
      event.target.closest("a")
    )
      return;
    startX = event.clientX;
    startScrollLeft = lineup.scrollLeft;
    dragged = false;
    lineup.setPointerCapture(event.pointerId);
    lineup.classList.add("is-dragging");
  });

  lineup.addEventListener("pointermove", (event) => {
    if (!lineup.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - startX;
    dragged ||= Math.abs(distance) > 4;
    lineup.scrollLeft = startScrollLeft - distance;
  });

  lineup.addEventListener("pointerup", (event) => {
    if (!lineup.hasPointerCapture(event.pointerId)) return;
    lineup.releasePointerCapture(event.pointerId);
    if (dragged) snapToNearestSuspect();
    else lineup.classList.remove("is-dragging");
    setTimeout(() => (dragged = false));
  });

  lineup.addEventListener("pointercancel", () => {
    lineup.classList.remove("is-dragging");
    dragged = false;
  });

  lineup.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
  });
}

document.querySelectorAll(".item-stack-toggle").forEach((button) => {
  const stack = document.getElementById(button.getAttribute("aria-controls"));
  const label = button.querySelector("span");
  if (!stack || !label) return;

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    stack.setAttribute("aria-hidden", String(expanded));
    label.textContent = expanded ? "Show stack" : "Hide stack";
  });
});
