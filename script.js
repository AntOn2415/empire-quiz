import { setupCharacterSelection } from "./scripts/character-selection.js";
import {
  isMusicOn,
  isEffectsOn,
  selectedCharacter,
  selectedGender,
  updateState,
  resetState,
  loadState,
  setupQuiz,
} from "./scripts/game-logic.js";
import {
  showSection,
  updateMusicButtonState,
  updateEffectsButtonState,
  playMusicForCurrentSection,
  updatePlayerStatsDisplay,
  renderPlayerStatus,
  showLoader,
  hideLoader,
  playShortEffect,
} from "./scripts/ui-handler.js";
// Прибираємо імпорт sanitizePlayerName
// import { sanitizePlayerName } from "./scripts/utils.js";
import { characterEffectsMap, characterNamesMap } from "./scripts/constants.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(registration => {})
      .catch(error => {
        console.error("❌ Помилка реєстрації Service Worker:", error);
      });
  });
}

// Лоудер
showLoader();
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
});
const lottie = document.getElementById("lottie");
const fallback = document.querySelector(".fallback-spinner");
if (lottie && fallback) {
  lottie.addEventListener("load", () => fallback.classList.add("fallback-hidden"));
}

document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.getElementById("hero");
  const characterSelectionSection = document.getElementById("character-selection");
  const nameInputSection = document.getElementById("name-input");
  const quizSection = document.getElementById("quiz");
  const playerNameInput = document.getElementById("player-name");
  const main = document.querySelector("main");
  const quizContainer = document.getElementById("quiz-container");
  const genderMaleButton = document.getElementById("gender-male");
  const genderFemaleButton = document.getElementById("gender-female");
  const chooseCharacterButton = document.getElementById("choose-character");
  const confirmCharacterButton = document.getElementById("confirm-character");
  const startGameButton = document.getElementById("start-game");
  const retryButton = document.getElementById("retry");
  const backButton = document.getElementById("back-to-characters");
  const backToHeroButton = document.getElementById("back-to-hero");
  const clearStatsButton = document.getElementById("clear-stats-btn");
  const toggleMusicButton = document.getElementById("toggle-music");
  const toggleEffectsButton = document.getElementById("toggle-effects");
  const toggleMusicFooterButton = document.getElementById("toggle-music-footer");
  const toggleEffectsFooterButton = document.getElementById("toggle-effects-footer");
  const settingsButton = document.getElementById("settings-button");
  const utilityButtonsWrapper = document.getElementById("utility-buttons-wrapper");

  // ЗАВАНТАЖУЄМО ІМ'Я ГРАВЦЯ З LOCALSTORAGE
  const savedPlayerName = localStorage.getItem("current-player-name");
  if (playerNameInput && savedPlayerName) {
    playerNameInput.value = savedPlayerName.replace(/\s+/g, " ").trim();
  }

  loadState();
  updateMusicButtonState();
  updateEffectsButtonState();

  clearStatsButton?.addEventListener("click", () => {
    Swal.fire({
      title: "Ви впевнені?",
      text: "Ці дії безповоротно видалять усю статистику гравців!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Так, очистити!",
      cancelButtonText: "Відміна",
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem("player-stats");
        updatePlayerStatsDisplay();
        Swal.fire("Очищено!", "Усі дані про гравців були видалені.", "success");
      }
    });
  });

  let isInputFocused = false;
  playerNameInput?.addEventListener("focus", () => {
    if (!isInputFocused && playerNameInput.value) {
      playerNameInput.value = "";
      isInputFocused = true;
    }
  });
  playerNameInput?.addEventListener("blur", () => {
    isInputFocused = false;
  });

  genderMaleButton?.addEventListener("click", () => {
    updateState({ selectedGender: "male" });
    genderMaleButton.classList.add("active");
    genderFemaleButton?.classList.remove("active");
  });
  genderFemaleButton?.addEventListener("click", () => {
    updateState({ selectedGender: "female" });
    genderFemaleButton.classList.add("active");
    genderMaleButton?.classList.remove("active");
  });

  chooseCharacterButton?.addEventListener("click", () => {
    showSection(characterSelectionSection);
    playMusicForCurrentSection();
    setupCharacterSelection();
    renderPlayerStatus();
  });

  confirmCharacterButton?.addEventListener("click", () => {
    const activeSlide = document.querySelector(".swiper-slide-active");
    if (!activeSlide)
      return Swal.fire({
        title: "Помилка!",
        text: "Будь ласка, оберіть персонажа!",
        icon: "error",
      });
    const character = activeSlide.querySelector("p").textContent;
    updateState({ selectedCharacter: character });
    if (characterEffectsMap[selectedCharacter])
      playShortEffect(characterEffectsMap[selectedCharacter]);
    showSection(nameInputSection);
    if (selectedGender === "male") {
      genderMaleButton.classList.add("active");
    } else if (selectedGender === "female") {
      genderFemaleButton.classList.add("active");
    }
    main.className = "";
    main.classList.add(`theme-${characterNamesMap[selectedCharacter]}`);
  });

  startGameButton?.addEventListener("click", async () => {
    const playerName = playerNameInput.value.replace(/\s+/g, " ").trim();
    const lastPlayerName = localStorage.getItem("current-player-name");

    if (!playerName) {
      return Swal.fire({ title: "Забули ім'я", text: "Введіть ім'я.", icon: "warning" });
    }
    if (!selectedGender) {
      return Swal.fire({ title: "Забули стать", text: "Оберіть стать.", icon: "warning" });
    }

    if (playerName !== lastPlayerName) {
      const statsJSON = localStorage.getItem("player-stats");
      const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

      if (playerStats[playerName]) {
        const result = await Swal.fire({
          title: "Це ім'я вже існує!",
          text: `Гравець "${playerName}" вже має статистику. Хочете продовжити за це ім'я або обрати нове?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Продовжити",
          cancelButtonText: "Обрати інше ім'я",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          localStorage.setItem("current-player-name", playerName);
          localStorage.setItem("playerGender", selectedGender);
          startGame();
        } else {
          playerNameInput.value = "";
          return;
        }
      } else {
        localStorage.setItem("current-player-name", playerName);
        localStorage.setItem("playerGender", selectedGender);
        startGame();
      }
    } else {
      localStorage.setItem("current-player-name", playerName);
      localStorage.setItem("playerGender", selectedGender);
      startGame();
    }
  });

  const startGame = async () => {
    const playerName = localStorage.getItem("current-player-name");
    showSection(quizSection);
    showLoader();
    try {
      await setupQuiz(selectedCharacter, quizContainer);
    } catch (err) {
      console.error(err);
      hideLoader();
      Swal.fire({
        title: "Помилка завантаження!",
        text: "Схоже, деякі файли не завантажились. Спробуйте ще раз.",
        icon: "error",
      });
    }
  };

  retryButton?.addEventListener("click", () => {
    showSection(characterSelectionSection);
    playMusicForCurrentSection();
    resetState();
    const quizImage = quizContainer.querySelector(".quiz-image");
    if (quizImage) quizImage.remove();
    main.className = "";
    renderPlayerStatus();
  });

  backToHeroButton?.addEventListener("click", () => {
    showSection(heroSection);
    const backgroundMusic = document.getElementById("background-music");
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    updateMusicButtonState();
    updateEffectsButtonState();
  });

  toggleMusicButton?.addEventListener("click", () => {
    updateState({ isMusicOn: !isMusicOn });
    const backgroundMusic = document.getElementById("background-music");
    if (isMusicOn) {
      playMusicForCurrentSection();
    } else {
      backgroundMusic.pause();
    }
    updateMusicButtonState();
  });
  toggleEffectsButton?.addEventListener("click", () => {
    updateState({ isEffectsOn: !isEffectsOn });
    updateEffectsButtonState();
  });
  backButton?.addEventListener("click", () => {
    showSection(characterSelectionSection);
    playMusicForCurrentSection();
  });

  if (settingsButton && utilityButtonsWrapper) {
    settingsButton.addEventListener("click", () => {
      utilityButtonsWrapper.classList.toggle("visible-wrapper");
      settingsButton.classList.toggle("is-active");
    });
  }

  toggleMusicFooterButton?.addEventListener("click", () => {
    updateState({ isMusicOn: !isMusicOn });
    const backgroundMusic = document.getElementById("background-music");
    if (isMusicOn) {
      playMusicForCurrentSection();
    } else {
      backgroundMusic.pause();
    }
    updateMusicButtonState();
  });
  toggleEffectsFooterButton?.addEventListener("click", () => {
    updateState({ isEffectsOn: !isEffectsOn });
    updateEffectsButtonState();
  });

  showSection(heroSection);
  const playerStatsSection = document.getElementById("player-stats-section");
  playerStatsSection.classList.add("hidden");
});
