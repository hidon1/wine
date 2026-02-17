document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const cartState = [];
  const MESSAGE_DURATION = 3200;
  const currency = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });
  const MAX_URL_SAFE_LENGTH = 2000;
  const URL_HEADROOM = 200;
  const MAX_GMAIL_URL_LENGTH = MAX_URL_SAFE_LENGTH - URL_HEADROOM;
  const TRUNCATION_SUFFIX = "\n(המשך הפרטים קוצר לצורך שליחה)";
  const URL_PARAM_BUFFER = 300;
  const BODY_TRUNCATION_LENGTH = MAX_GMAIL_URL_LENGTH - URL_PARAM_BUFFER - TRUNCATION_SUFFIX.length;
  const formatPerUnit = (price, qty) => `${qty} × ${currency.format(price)} ליחידה`;

  const cartEl = document.getElementById("cart");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");
  const navCartCountEl = document.getElementById("nav-cart-count");
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  const truncateBody = (text) => (text.length <= BODY_TRUNCATION_LENGTH ? text : `${text.slice(0, BODY_TRUNCATION_LENGTH)}${TRUNCATION_SUFFIX}`);

  const announce = (message) => {
    if (!cartMessage) return;
    cartMessage.textContent = message;
    cartMessage.classList.add("show");
    setTimeout(() => cartMessage.classList.remove("show"), MESSAGE_DURATION);
  };

  const openCart = () => {
    cartEl?.classList.add("open");
  };

  const closeCart = () => {
    cartEl?.classList.remove("open");
  };

  const updateCartBadge = (qty) => {
    if (cartCountEl) cartCountEl.textContent = `${qty} פריטים`;
    if (navCartCountEl) navCartCountEl.textContent = String(qty);
    cartToggle?.classList.toggle("visible", qty > 0);
  };

  const renderCart = () => {
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    if (cartState.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">הסל ריק - הוסיפו יינות טעימים</p>';
      cartTotalEl.textContent = "₪0";
      updateCartBadge(0);
      closeCart();
      return;
    }

    let total = 0;
    let qty = 0;

    cartState.forEach((item, index) => {
      total += item.price * item.qty;
      qty += item.qty;

      const row = document.createElement("div");
      row.className = "cart-item";

      const info = document.createElement("div");
      info.className = "cart-info";

      const nameEl = document.createElement("strong");
      nameEl.textContent = item.name;

      const metaEl = document.createElement("span");
      metaEl.className = "cart-meta";
      metaEl.textContent = formatPerUnit(item.price, item.qty);

      info.append(nameEl, metaEl);

      const controls = document.createElement("div");
      controls.className = "qty-controls";

      const decBtn = document.createElement("button");
      decBtn.className = "qty-btn";
      decBtn.setAttribute("aria-label", "הפחת כמות");
      decBtn.dataset.index = String(index);
      decBtn.dataset.action = "decrease";
      decBtn.textContent = "-";

      const qtySpan = document.createElement("span");
      qtySpan.textContent = String(item.qty);

      const incBtn = document.createElement("button");
      incBtn.className = "qty-btn";
      incBtn.setAttribute("aria-label", "הוסף כמות");
      incBtn.dataset.index = String(index);
      incBtn.dataset.action = "increase";
      incBtn.textContent = "+";

      controls.append(decBtn, qtySpan, incBtn);

      const priceEl = document.createElement("span");
      priceEl.className = "line-total";
      priceEl.textContent = currency.format(item.price * item.qty);

      row.append(info, controls, priceEl);
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = currency.format(total);
    updateCartBadge(qty);
  };

  cartItemsEl?.addEventListener("click", (event) => {
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

  const addToCart = (name, price) => {
    const existing = cartState.find((item) => item.name === name);
    if (existing) existing.qty += 1;
    else cartState.push({ name, price, qty: 1 });
    renderCart();
    openCart();
    announce("הפריט נוסף לסל");
  };

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { name, price } = btn.dataset;
      if (!name || !price) return;
      addToCart(name, Number(price));
    });
  });

  cartToggle?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  checkoutBtn?.addEventListener("click", () => {
    if (cartState.length === 0) {
      announce("הסל ריק. הוסיפו יינות כדי לסיים הזמנה.");
      return;
    }
    const total = cartState.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemsSummary = cartState
      .map((item) => `${item.name} — כמות: ${item.qty} (סה״כ ${currency.format(item.price * item.qty)})`)
      .join("\n");
    const body = [
      "שלום יקב דורות,",
      "אני רוצה להזמין את הפריטים הבאים:",
      itemsSummary,
      "",
      `סה״כ לתשלום: ${currency.format(total)}`,
      "נשמח לאישור הזמנה וחיוב.",
    ].join("\n");

    const encodedSubject = encodeURIComponent("הזמנה חדשה מאתר יקב דורות");
    let encodedBody = encodeURIComponent(body);
    let gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;
    let mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

    if (gmailUrl.length > MAX_GMAIL_URL_LENGTH || mailtoUrl.length > MAX_GMAIL_URL_LENGTH) {
      encodedBody = encodeURIComponent(truncateBody(body));
      gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;
      mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    }

    const targetUrl = gmailUrl.length > MAX_GMAIL_URL_LENGTH ? mailtoUrl : gmailUrl;
    window.open(targetUrl, "_blank", "noopener");
    announce("פותחים מייל חדש עם פרטי ההזמנה.");
  });

  const contactForm = document.querySelector("#contact form");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    fetch(contactForm.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (response.ok) {
          alert("ההודעה נשלחה בהצלחה! ניצור קשר בקרוב.");
          contactForm.reset();
        } else {
          alert("אירעה שגיאה בשליחת ההודעה. אנא נסו שוב.");
        }
      })
      .catch(() => {
        alert("שגיאת רשת. אנא בדקו את חיבור האינטרנט שלכם.");
      });
  });

  const loadAboutSection = () => {
    fetch("about.json")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        const aboutSection = document.getElementById("about");
        if (!aboutSection) return;
        aboutSection.innerHTML = `
          <h2>${data.title}</h2>
          <img src="${data.image}" alt="תמונה של היקב">
          <h3>${data.subtitle}</h3>
          ${data.paragraphs.map((p) => `<p>${p}</p>`).join("")}
        `;
      })
      .catch((error) => {
        console.error("בעיה בטעינת קובץ ה-JSON:", error);
        const aboutSection = document.getElementById("about");
        if (aboutSection) aboutSection.innerHTML = "<p>אירעה שגיאה בטעינת התוכן. נסו לרענן את הדף.</p>";
      });
  };

  const setupLightbox = () => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.querySelector(".close-modal");
    if (!modal || !modalImg || !closeModal) return;

    document.querySelectorAll(".gallery-grid img").forEach((img) => {
      img.addEventListener("click", () => {
        modal.style.display = "block";
        modalImg.src = img.src;
      });
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });
  };


  const setupScrollReveal = () => {
    const revealItems = document.querySelectorAll("section, .card, .feature-card, .testimonial-card, .faq-item");
    revealItems.forEach((item) => item.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  const setupBackgroundSlideshow = () => {
    let currentSlide = 0;
    const slides = document.querySelectorAll("#background-container .background-slide");
    if (!slides.length) return;

    slides[currentSlide].classList.add("active");
    setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 10000);
  };

  renderCart();
  loadAboutSection();
  setupLightbox();
  setupBackgroundSlideshow();
  setupScrollReveal();
});
