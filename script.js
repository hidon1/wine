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
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");
  const navCartCountEl = document.getElementById("nav-cart-count");
  const cartToggle = document.getElementById("cart-toggle");
  const checkoutBtn = document.getElementById("checkout-btn");

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
      row.innerHTML = `
        <strong>${item.name}</strong>
        <div class="qty-controls">
          <button class="qty-btn" aria-label="הפחת כמות" data-index="${index}" data-action="decrease">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" aria-label="הוסף כמות" data-index="${index}" data-action="increase">+</button>
        </div>
        <span>₪${(item.price * item.qty).toLocaleString('he-IL')}</span>
      `;
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = `₪${total.toLocaleString('he-IL')}`;
    updateCartBadge(qty);

    cartItemsEl.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const action = btn.dataset.action;
        if (action === "increase") cartState[index].qty += 1;
        if (action === "decrease") cartState[index].qty = Math.max(0, cartState[index].qty - 1);
        if (cartState[index].qty === 0) cartState.splice(index, 1);
        renderCart();
      });
    });
  };

  const addToCart = (name, price) => {
    const existing = cartState.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cartState.push({ name, price, qty: 1 });
    }
    renderCart();
    document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" });
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
        alert("הסל ריק. הוסיפו יינות כדי לסיים הזמנה.");
        return;
      }
      const total = cartState.reduce((sum, item) => sum + item.price * item.qty, 0);
      alert(`הזמנתכם התקבלה! סה\"כ לתשלום: ₪${total.toLocaleString('he-IL')}. ניצור קשר לאישור המשלוח.`);
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
