import { showLoader, hideLoader } from "../script.js";

let mySwiper = null;

export async function setupCharacterSelection() {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  const characters = [
    { name: "Єгиптянин", model: "models/egypts.glb" },
    { name: "Грек", model: "models/greeks.glb" },
    { name: "Римлянин", model: "models/romans.glb" },
    { name: "Єврей", model: "models/hebrews.glb" },
  ];

  swiperWrapper.innerHTML = "";
  showLoader();

  const modelLoadPromises = [];

  characters.forEach(character => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    const modelViewer = document.createElement("model-viewer");
    modelViewer.setAttribute("src", character.model);
    modelViewer.setAttribute("auto-rotate", "");
    modelViewer.setAttribute("camera-controls", "");
    modelViewer.setAttribute("alt", character.name);
    slide.appendChild(modelViewer);
    const label = document.createElement("p");
    label.textContent = character.name;
    slide.appendChild(label);
    swiperWrapper.appendChild(slide);

    const promise = new Promise((resolve, reject) => {
      const complete = () => {
        modelViewer.removeEventListener("load", complete);
        modelViewer.removeEventListener("error", complete);
        resolve();
      };
      modelViewer.addEventListener("load", complete);
      modelViewer.addEventListener("error", complete);
      setTimeout(complete, 5000);
    });
    modelLoadPromises.push(promise);
  });

  try {
    await Promise.all(modelLoadPromises);
    hideLoader();

    if (mySwiper !== null) {
      mySwiper.destroy(true, true);
    }

    mySwiper = new Swiper(".swiper-container", {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 10,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      on: {
        init: function () {
          this.update();
        },
        slideChangeTransitionEnd: function () {
          const activeSlide = this.slides[this.activeIndex];

          if (activeSlide && !activeSlide.classList.contains("swiper-slide-duplicate")) {
            const modelViewer = activeSlide.querySelector("model-viewer");
            if (modelViewer) {
              // 👇 Вмикаємо і вимикаємо camera-controls для скидання стану
              modelViewer.setAttribute("camera-controls", "");
              modelViewer.removeAttribute("camera-controls");
              modelViewer.setAttribute("camera-controls", "");
            }
          }
        },
      },
    });
  } catch (error) {
    console.error("Failed to load models or initialize Swiper:", error);
    hideLoader();
  }
}
