document.addEventListener("DOMContentLoaded", () => {
  // גלילה חלקה בעת לחיצה על קישורים בתפריט
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // טיפול בשליחת טופס
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // שליחה ל-Formspree
      const data = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      }).then(response => {
        if (response.ok) {
          alert("ההודעה נשלחה בהצלחה!");
          form.reset();
        } else {
          alert("אירעה שגיאה בשליחת ההודעה. נסה שוב.");
        }
      }).catch(() => {
        alert("שגיאה ברשת. בדוק את החיבור שלך.");
      });
    });
  }
});
