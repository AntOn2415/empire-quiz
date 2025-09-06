let mySwiper = null; // Зберігаємо екземпляр Swiper в глобальній змінній

export function setupCharacterSelection() {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  const characters = [
    { name: "Єгиптянин", model: "models/egypts.glb" },
    { name: "Грек", model: "models/greeks.glb" },
    { name: "Римлянин", model: "models/romans.glb" },
    { name: "Єврей", model: "models/hebrews.glb" },
  ];

  console.log("Setting up character selection");

  // Очищаємо попередні слайди, щоб уникнути дублювання
  swiperWrapper.innerHTML = "";

  characters.forEach(character => {
    console.log(`Adding character: ${character.name}`);
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
  });

  // Якщо екземпляр Swiper вже існує, знищуємо його
  if (mySwiper !== null) {
    mySwiper.destroy(true, true);
  }

  // Ініціалізація Swiper, який тепер доступний глобально
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
    // Додаємо подію для оновлення Swiper після ініціалізації
    on: {
      init: function () {
        this.update();
      },
    },
  });

  console.log("Swiper initialized successfully.");
}
