import { showLoader, hideLoader, cacheDynamicFiles } from "../script.js";

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

  // Кешуємо всі 3D-моделі на початку
  const modelUrls = characters.map(char => char.model);
  cacheDynamicFiles(modelUrls);

  const modelLoadPromises = characters.map(character => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    const modelViewer = document.createElement("model-viewer");
    modelViewer.setAttribute("src", character.model);
    modelViewer.setAttribute("alt", character.name);
    modelViewer.setAttribute("auto-rotate", "");
    modelViewer.setAttribute("camera-controls", "");
    modelViewer.setAttribute("reveal", "auto");
    modelViewer.setAttribute("loading", "eager");
    modelViewer.setAttribute("camera-orbit", "0deg 90deg 100%");
    modelViewer.setAttribute("min-camera-orbit", "auto 30deg auto");
    modelViewer.setAttribute("max-camera-orbit", "auto 130deg auto");

    slide.appendChild(modelViewer);

    const characterName = document.createElement("p");
    characterName.textContent = character.name;
    slide.appendChild(characterName);

    swiperWrapper.appendChild(slide);

    return new Promise((resolve, reject) => {
      const onLoad = () => {
        modelViewer.removeEventListener("load", onLoad);
        modelViewer.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        modelViewer.removeEventListener("load", onLoad);
        modelViewer.removeEventListener("error", onError);
        console.error("Помилка завантаження моделі:", character.model);
        reject();
      };

      modelViewer.addEventListener("load", onLoad);
      modelViewer.addEventListener("error", onError);
    });
  });

  try {
    await Promise.all(modelLoadPromises);
    hideLoader();

    if (mySwiper) {
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
        init() {
          this.update();
        },
        slideChangeTransitionEnd() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide && !activeSlide.classList.contains("swiper-slide-duplicate")) {
            const modelViewer = activeSlide.querySelector("model-viewer");
            if (modelViewer) {
              modelViewer.setAttribute("camera-controls", "");
              modelViewer.removeAttribute("camera-controls");
              modelViewer.setAttribute("camera-controls", "");
            }
          }
        },
      },
    });
  } catch (error) {
    console.error("⚠️ Failed to load models or initialize Swiper:", error);
  }
}
