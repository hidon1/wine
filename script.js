document.addEventListener("DOMContentLoaded", () => {
  
  // 1. גלילה חלקה לקישורי התפריט
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        // הגלילה החלקה והאיטית נשלטת בעיקר על ידי ה-CSS
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 2. טיפול בשליחת טופס יצירת קשר
  const contactForm = document.querySelector("#contact form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      fetch(contactForm.action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      }).then(response => {
        if (response.ok) {
          alert("ההודעה נשלחה בהצלחה! ניצור קשר בקרוב.");
          contactForm.reset();
        } else {
          alert("אירעה שגיאה בשליחת ההודעה. אנא נסו שוב.");
        }
      }).catch(() => {
        alert("שגיאת רשת. אנא בדקו את חיבור האינטרנט שלכם.");
      });
    });
  }

  // 3. טעינת תוכן "אודות" מקובץ JSON
  function loadAboutSection() {
    fetch('about.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.innerHTML = `
            <h2>${data.title}</h2>
            <img src="${data.image}" alt="תמונה של היקב">
            <h3>${data.subtitle}</h3>
            ${data.paragraphs.map(p => `<p>${p}</p>`).join('')}
          `;
        }
      })
      .catch(error => {
        console.error('בעיה בטעינת קובץ ה-JSON:', error);
        const aboutSection = document.getElementById('about');
        if(aboutSection) aboutSection.innerHTML = "<p>אירעה שגיאה בטעינת התוכן. נסו לרענן את הדף.</p>";
      });
  }
  
  // 4. הפעלת הגלריה הקופצת (Lightbox)
  function setupLightbox() {
    const modal = document.getElementById("imageModal");
    if (!modal) return;

    const modalImg = document.getElementById("modalImage");
    const galleryImages = document.querySelectorAll(".gallery-grid img");
    const closeModal = document.querySelector(".close-modal");

    galleryImages.forEach(img => {
      img.addEventListener("click", () => {
        modal.style.display = "block";
        modalImg.src = img.src;
      });
    });

    closeModal.onclick = () => {
      modal.style.display = "none";
    }
    
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  // 5. הפעלת תמונות רקע מתחלפות
  function setupBackgroundSlideshow() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('#background-container .background-slide');
    if (slides.length === 0) return;

    slides[currentSlide].classList.add('active');

    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 10000);
  }

  // הפעלת כל הפונקציות לאחר טעינת הדף
  loadAboutSection();
  setupLightbox();
  setupBackgroundSlideshow();
});
