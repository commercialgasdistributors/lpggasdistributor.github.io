const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const slides = document.querySelector(".slides");
const slideItems = document.querySelectorAll(".slide");
const prev = document.querySelector("[data-prev]");
const next = document.querySelector("[data-next]");
let index = 0;
let auto;

function renderSlide() {
  if (!slides || !slideItems.length) return;
  slides.style.transform = `translateX(-${index * 100}%)`;
}

// === Google Reviews Integration ===
// Set your Google Place ID here. If empty, the code will keep the static/fallback slides.
const GOOGLE_PLACE_ID = ""; // e.g. "ChIJ..." — replace with your Place ID

// Render reviews into the carousel slides container
function renderReviewsToCarousel(reviews) {
  if (!slides || !reviews || !reviews.length) return;
  slides.innerHTML = "";
  reviews.forEach((r) => {
    const stars = "★".repeat(Math.round(r.rating || 5));
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.innerHTML = `
      <p class="quote">${r.text || ""}</p>
      <div class="reviewer">${r.author_name || "Anonymous"}${r.relative_time_description ? ' · ' + r.relative_time_description : ''}</div>
      <div class="stars" aria-label="${r.rating || 5} star rating">${stars}</div>
    `;
    slides.appendChild(slide);
  });

  // refresh slideItems NodeList and reset index
  index = 0;
  // reassign slideItems for carousel control functions
  // note: slideItems variable is a NodeList; we will query when needed
  renderSlide();
}

// Initialize reviews using Google Maps JavaScript PlacesService
window.initReviews = function initReviews() {
  if (!GOOGLE_PLACE_ID) return; // no place id configured
  if (!window.google || !google.maps) return;
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  service.getDetails({ placeId: GOOGLE_PLACE_ID, fields: ['review'] }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place && place.reviews && place.reviews.length) {
      renderReviewsToCarousel(place.reviews);
      // re-wire controls now that slides changed
      const newSlideItems = slides.querySelectorAll('.slide');
      if (newSlideItems.length) {
        prev?.removeEventListener('click', () => moveBy(-1));
        next?.removeEventListener('click', () => moveBy(1));
        prev?.addEventListener('click', () => moveBy(-1));
        next?.addEventListener('click', () => moveBy(1));
        clearInterval(auto);
        auto = setInterval(() => moveBy(1), 5000);
      }
    } else {
      // no reviews or error — keep static content
      console.warn('Could not load Google reviews:', status);
    }
  });
};

function moveBy(step) {
  index = (index + step + slideItems.length) % slideItems.length;
  renderSlide();
}

if (slideItems.length) {
  prev?.addEventListener("click", () => moveBy(-1));
  next?.addEventListener("click", () => moveBy(1));
  auto = setInterval(() => moveBy(1), 5000);
  slides?.addEventListener("mouseenter", () => clearInterval(auto));
  slides?.addEventListener("mouseleave", () => {
    auto = setInterval(() => moveBy(1), 5000);
  });
}

const inquiryForm = document.querySelector("#inquiry-form");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you. Your inquiry has been received. We will contact you shortly.");
    inquiryForm.reset();
  });
}
