const emailLink = document.querySelector(".obf-email");

function openEmail() {
  const user = "jaraslau";
  const domain = "tutanota.com";
  location.href = "mailto:" + user + "@" + domain;
}

emailLink.addEventListener("click", openEmail);

emailLink.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openEmail();
  }
});
