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
