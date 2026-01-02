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

  // 2. סל קניות מודרני
  const cartState = [];
  const MESSAGE_DURATION = 3200;
  const currency = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' });
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");
  const navCartCountEl = document.getElementById("nav-cart-count");
  const cartToggle = document.getElementById("cart-toggle");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const announce = (message) => {
    if (!cartMessage) return;
    cartMessage.textContent = message;
    cartMessage.classList.add("show");
    setTimeout(() => cartMessage.classList.remove("show"), MESSAGE_DURATION);
  };

  const updateCartBadge = (qty) => {
    if (cartCountEl) cartCountEl.textContent = `${qty} פריטים`;
    if (navCartCountEl) navCartCountEl.textContent = qty;
  };

  const renderCart = () => {
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    if (cartState.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">הסל ריק - הוסיפו יינות טעימים</p>';
      cartTotalEl.textContent = "₪0";
      updateCartBadge(0);
      return;
    }

    let total = 0;
    let qty = 0;

    cartState.forEach((item, index) => {
      total += item.price * item.qty;
      qty += item.qty;

      const row = document.createElement("div");
      row.className = "cart-item";

      const nameEl = document.createElement("strong");
      nameEl.textContent = item.name;

      const controls = document.createElement("div");
      controls.className = "qty-controls";

      const decBtn = document.createElement("button");
      decBtn.className = "qty-btn";
      decBtn.setAttribute("aria-label", "הפחת כמות");
      decBtn.dataset.index = index;
      decBtn.dataset.action = "decrease";
      decBtn.textContent = "-";

      const qtySpan = document.createElement("span");
      qtySpan.textContent = item.qty;

      const incBtn = document.createElement("button");
      incBtn.className = "qty-btn";
      incBtn.setAttribute("aria-label", "הוסף כמות");
      incBtn.dataset.index = index;
      incBtn.dataset.action = "increase";
      incBtn.textContent = "+";

      controls.append(decBtn, qtySpan, incBtn);

      const priceEl = document.createElement("span");
      priceEl.textContent = currency.format(item.price * item.qty);

      row.append(nameEl, controls, priceEl);
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = currency.format(total);
    updateCartBadge(qty);

  };

  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".qty-btn");
      if (!btn) return;
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      if (Number.isNaN(index)) return;
      if (action === "increase") cartState[index].qty += 1;
      if (action === "decrease") cartState[index].qty = Math.max(0, cartState[index].qty - 1);
      if (cartState[index].qty === 0) cartState.splice(index, 1);
      renderCart();
    });
  }

  const addToCart = (name, price) => {
    const existing = cartState.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cartState.push({ name, price, qty: 1 });
    }
    renderCart();
    announce("הפריט נוסף לסל");
    if (!prefersReducedMotion) {
      document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const { name, price } = btn.dataset;
      if (!name || !price) return;
      addToCart(name, Number(price));
    });
  });

  if (cartToggle) {
    cartToggle.addEventListener("click", () => {
      document.getElementById("cart")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cartState.length === 0) {
        announce("הסל ריק. הוסיפו יינות כדי לסיים הזמנה.");
        return;
      }
      const total = cartState.reduce((sum, item) => sum + item.price * item.qty, 0);
      announce(`הזמנתכם התקבלה! סה״כ לתשלום: ${currency.format(total)}. ניצור קשר לאישור המשלוח.`);
    });
  }

  // 3. טיפול בשליחת טופס יצירת קשר
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

  // 4. טעינת תוכן "אודות" מקובץ JSON
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
  
  // 5. הפעלת הגלריה הקופצת (Lightbox)
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

  // 6. הפעלת תמונות רקע מתחלפות
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
  renderCart();
  loadAboutSection();
  setupLightbox();
  setupBackgroundSlideshow();
});
