document.querySelector(".obf-email").addEventListener("click", function () {
  const user = "jaraslau";
  const domain = "tutanota.com";
  location.href = "mailto:" + user + "@" + domain;
});
