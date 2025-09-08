import { setupCharacterSelection } from "./scripts/character-selection.js";
import { quizData } from "./scripts/quiz.js";
import { showResult } from "./scripts/result.js";

let selectedCharacter = null;
let correctAnswersCount = 0;
let currentQuestionIndex = 0;
let totalQuestions = 0;
let quizQuestions = [];
let selectedGender = null;
let isMusicOn = true;
let isEffectsOn = true;

const backgroundMusic = document.getElementById("background-music");
const shortEffect = document.getElementById("short-effect");

// 👇 Новий код для лоудера
const loaderContainer = document.getElementById("loader");

export const showLoader = () => {
  loaderContainer.classList.add("visible");
};

export const hideLoader = () => {
  loaderContainer.classList.remove("visible");
};
// 👆 Кінець нового коду

const characterNamesMap = {
  Єгиптянин: "egypt",
  Грек: "greek",
  Римлянин: "roman",
  Єврей: "hebrew",
};

const characterEffectsMap = {
  Єгиптянин: "egypt-short.mp3",
  Грек: "greeks-short.mp3",
  Римлянин: "romans-short.mp3",
  Єврей: "hebrews-short.mp3",
};

const crossfadeMusic = newSrc => {
  backgroundMusic.src = newSrc;
  backgroundMusic.load();
  if (isMusicOn) {
    backgroundMusic.play().catch(e => console.error("Failed to play music:", e));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.getElementById("hero");
  const characterSelectionSection = document.getElementById("character-selection");
  const nameInputSection = document.getElementById("name-input");
  const quizSection = document.getElementById("quiz");
  const resultSection = document.getElementById("result");
  const playerNameInput = document.getElementById("player-name");
  const main = document.querySelector("main");
  const quizContainer = document.getElementById("quiz-container");
  let missionIntro = document.getElementById("mission-intro");
  let questionsOverlay = document.getElementById("questions-overlay");

  const genderMaleButton = document.getElementById("gender-male");
  const genderFemaleButton = document.getElementById("gender-female");

  const chooseCharacterButton = document.getElementById("choose-character");
  const confirmCharacterButton = document.getElementById("confirm-character");
  const startGameButton = document.getElementById("start-game");
  const retryButton = document.getElementById("retry");
  const backButton = document.getElementById("back-to-characters");
  const backToHeroButton = document.getElementById("back-to-hero");

  // Кнопки для різних футерів
  const toggleMusicButton = document.getElementById("toggle-music");
  const toggleEffectsButton = document.getElementById("toggle-effects");
  const toggleMusicFooterButton = document.getElementById("toggle-music-footer");
  const toggleEffectsFooterButton = document.getElementById("toggle-effects-footer");

  const bottomButtonsContainer = document.getElementById("bottom-buttons-container");
  const mainFooter = document.getElementById("main-footer");

  // Іконки для обох груп кнопок
  // ⚠️ ВИПРАВЛЕННЯ: Доступ до іконок переміщено всередину 'DOMContentLoaded', як було раніше,
  // але додано перевірку, щоб уникнути помилок, якщо елементи не існують.
  const musicIcon = toggleMusicButton ? toggleMusicButton.querySelector("i") : null;
  const effectsIcon = toggleEffectsButton ? toggleEffectsButton.querySelector("i") : null;
  const musicFooterIcon = toggleMusicFooterButton
    ? toggleMusicFooterButton.querySelector("i")
    : null;
  const effectsFooterIcon = toggleEffectsFooterButton
    ? toggleEffectsFooterButton.querySelector("i")
    : null;

  const updateMusicButtonState = () => {
    if (isMusicOn) {
      if (musicIcon) musicIcon.classList.replace("fa-volume-mute", "fa-volume-up");
      if (musicFooterIcon) musicFooterIcon.classList.replace("fa-volume-mute", "fa-volume-up");
    } else {
      if (musicIcon) musicIcon.classList.replace("fa-volume-up", "fa-volume-mute");
      if (musicFooterIcon) musicFooterIcon.classList.replace("fa-volume-up", "fa-volume-mute");
    }
  };

  const updateEffectsButtonState = () => {
    if (isEffectsOn) {
      if (effectsIcon) effectsIcon.classList.replace("fa-bell-slash", "fa-bell");
      if (effectsFooterIcon) effectsFooterIcon.classList.replace("fa-bell-slash", "fa-bell");
    } else {
      if (effectsIcon) effectsIcon.classList.replace("fa-bell", "fa-bell-slash");
      if (effectsFooterIcon) effectsFooterIcon.classList.replace("fa-bell", "fa-bell-slash");
    }
  };

  const playShortEffect = effectSrc => {
    if (isEffectsOn) {
      shortEffect.pause();
      shortEffect.currentTime = 0;
      shortEffect.src = `audio/${effectSrc}`;
      shortEffect.load();
      shortEffect.play().catch(e => {
        if (e.name !== "AbortError") {
          console.error("Failed to play short effect:", e);
        }
      });
    }
  };

  const missionIntros = {
    Єгиптянин: (playerName, gender) => {
      return `
        <h2>Ласкаво просимо, ${playerName}, у Вічну Долину Нілу!</h2>
        <p>Фараон закликає тебе пройти випробування Єгиптом. Чи готов${
          gender === "male" ? "ий" : "а"
        } ти розгадати таємниці пірамід і довести свою мудрість?</p>
        <button id="start-mission">Почати Місію</button>
      `;
    },
    Грек: (playerName, gender) => {
      const genderText = gender === "male" ? "герою" : "героїне";
      return `
        <h2>Слава тобі, ${playerName}, нащадку ${genderText} Еллади!</h2>
        <p>Олімп спостерігає за тобою! Доведи свою доблесть та інтелект у випробуваннях, гідних Афінського Агори. Чи готов${
          gender === "male" ? "ий" : "а"
        } ти до великих звершень?</p>
        <button id="start-mission">Почати Місію</button>
      `;
    },
    Римлянин: (playerName, gender) => {
      const genderText = gender === "male" ? "громадянине" : "громадянко";
      return `
        <h2>Ave, ${playerName}, ${genderText} Риму!</h2>
        <p>Імперія кличе! Приготуйся до важких випробувань, що загартують твій дух і розум. Чи гідн${
          gender === "male" ? "ий" : "а"
        } ти носити лаври Цезаря?</p>
        <button id="start-mission">Почати Місію</button>
      `;
    },
    Єврей: (playerName, gender) => {
      const genderText = gender === "male" ? "дитя Царя" : "дочко Царя";
      return `
        <h2>Шалом, ${playerName}, обран${gender === "male" ? "е" : "а"} ${genderText}!</h2>
        <p>Шлях до знання довгий, але істина веде праведних. Доведи свою вірність та мудрість, відповідаючи на питання, що сягають корінням віків. Чи готов${
          gender === "male" ? "ий" : "а"
        } ти до випробування віри?</p>
        <button id="start-mission">Почати Місію</button>
      `;
    },
  };

  const displayQuestion = index => {
    questionsOverlay.innerHTML = "";
    if (index < quizQuestions.length) {
      const questionData = quizQuestions[index];
      const questionBlock = document.createElement("div");
      questionBlock.classList.add("question-block", "fade-in");

      const questionText = document.createElement("h3");
      questionText.textContent = `${index + 1}. ${questionData.question}`;
      questionBlock.appendChild(questionText);

      questionData.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.classList.add("quiz-option");
        button.textContent = option;
        button.dataset.correct = optionIndex === questionData.correct;
        button.addEventListener("click", handleAnswerClick);
        questionBlock.appendChild(button);
      });
      questionsOverlay.appendChild(questionBlock);
    } else {
      showSection(resultSection);
      showResult(
        selectedCharacter,
        playerNameInput.value,
        correctAnswersCount,
        totalQuestions,
        selectedGender
      );
    }
  };

  const handleAnswerClick = event => {
    const isCorrect = event.target.dataset.correct === "true";
    if (isCorrect) {
      correctAnswersCount++;
    }

    const feedback = document.createElement("p");
    feedback.textContent = isCorrect ? "Правильно!" : "Неправильно.";
    feedback.classList.add(isCorrect ? "correct" : "incorrect");
    event.target.parentElement.appendChild(feedback);

    const buttons = event.target.parentElement.querySelectorAll("button");
    buttons.forEach(btn => (btn.disabled = true));

    const currentQuestionBlock = questionsOverlay.querySelector(".question-block");
    if (currentQuestionBlock) {
      currentQuestionBlock.classList.remove("fade-in");
      currentQuestionBlock.classList.add("fade-out");
      currentQuestionBlock.addEventListener(
        "animationend",
        () => {
          currentQuestionIndex++;
          displayQuestion(currentQuestionIndex);
        },
        { once: true }
      );
    }
  };

  const handleCharacterConfirmation = () => {
    const activeSlide = document.querySelector(".swiper-slide-active");
    if (!activeSlide) {
      Swal.fire({
        title: "Помилка!",
        text: "Будь ласка, оберіть персонажа!",
        icon: "error",
        confirmButtonText: "Зрозуміло",
      });
      return;
    }

    selectedCharacter = activeSlide.querySelector("p").textContent;

    if (characterEffectsMap[selectedCharacter]) {
      playShortEffect(characterEffectsMap[selectedCharacter]);
    }

    selectedGender = null;
    genderMaleButton.classList.remove("active");
    genderFemaleButton.classList.remove("active");

    showSection(nameInputSection);

    const themeClass = characterNamesMap[selectedCharacter];
    main.className = "";
    main.classList.add(`theme-${themeClass}`);
  };

  const handleStartGame = () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      Swal.fire({
        title: "Забули ім'я",
        text: "Будь ласка, введіть своє ім'я.",
        icon: "warning",
      });
      return;
    }
    if (selectedGender === null) {
      Swal.fire({
        title: "Забули стать",
        text: "Будь ласка, оберіть свою стать.",
        icon: "warning",
      });
      return;
    }

    showSection(quizSection);

    const characterData = quizData[selectedCharacter];
    const quizImage = document.createElement("img");
    quizImage.src = characterData.image;
    quizImage.alt = `Імперія: ${selectedCharacter}`;
    quizImage.classList.add("quiz-image");

    const existingImage = quizContainer.querySelector(".quiz-image");
    if (existingImage) {
      existingImage.remove();
    }
    quizContainer.prepend(quizImage);

    quizQuestions = characterData.questions;
    totalQuestions = quizQuestions.length;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;

    missionIntro.innerHTML = missionIntros[selectedCharacter](playerName, selectedGender);
    missionIntro.classList.remove("hidden");
    questionsOverlay.classList.add("hidden");

    const audioFiles = {
      Єгиптянин: "egypts.mp3",
      Грек: "greeks.mp3",
      Римлянин: "romans.mp3",
      Єврей: "hebrews.mp3",
    };

    crossfadeMusic(`audio/${audioFiles[selectedCharacter]}`);

    const startMissionButton = document.getElementById("start-mission");
    if (startMissionButton) {
      startMissionButton.addEventListener("click", () => {
        missionIntro.classList.add("hidden");
        questionsOverlay.classList.remove("hidden");
        displayQuestion(currentQuestionIndex);
      });
    }
  };

  const handleRetry = () => {
    showSection(characterSelectionSection);
    crossfadeMusic("audio/empireQuiz.mp3");

    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    selectedCharacter = null;
    selectedGender = null;

    genderMaleButton.classList.remove("active");
    genderFemaleButton.classList.remove("active");

    const quizImage = quizContainer.querySelector(".quiz-image");
    if (quizImage) {
      quizImage.remove();
    }
    main.className = "";
  };

  const handleBackToHero = () => {
    showSection(heroSection);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    updateMusicButtonState();
    updateEffectsButtonState();
  };

  const handleToggleMusic = () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
    updateMusicButtonState();
  };

  const handleToggleEffects = () => {
    isEffectsOn = !isEffectsOn;
    updateEffectsButtonState();
  };

  const handleBackToCharacters = () => {
    showSection(characterSelectionSection);
  };

  const showSection = sectionToShow => {
    const allSections = [
      heroSection,
      characterSelectionSection,
      nameInputSection,
      quizSection,
      resultSection,
    ];

    allSections.forEach(section => {
      section.classList.add("hidden");
    });
    sectionToShow.classList.remove("hidden");

    // 👇 Зміни: коректно перемикаємо видимість обох контейнерів
    if (sectionToShow === heroSection) {
      mainFooter.classList.remove("visually-hidden");
      bottomButtonsContainer.classList.add("hidden");
    } else {
      mainFooter.classList.add("visually-hidden");
      bottomButtonsContainer.classList.remove("hidden");
    }
  };

  if (genderMaleButton) {
    genderMaleButton.addEventListener("click", () => {
      selectedGender = "male";
      genderMaleButton.classList.add("active");
      if (genderFemaleButton) {
        genderFemaleButton.classList.remove("active");
      }
    });
  }

  if (genderFemaleButton) {
    genderFemaleButton.addEventListener("click", () => {
      selectedGender = "female";
      genderFemaleButton.classList.add("active");
      if (genderMaleButton) {
        genderMaleButton.classList.remove("active");
      }
    });
  }

  if (chooseCharacterButton) {
    chooseCharacterButton.addEventListener("click", () => {
      crossfadeMusic("audio/empireQuiz.mp3");
      showSection(characterSelectionSection);
      setupCharacterSelection();
    });
  }

  if (confirmCharacterButton) {
    confirmCharacterButton.addEventListener("click", handleCharacterConfirmation);
  }
  if (startGameButton) {
    startGameButton.addEventListener("click", handleStartGame);
  }
  if (retryButton) {
    retryButton.addEventListener("click", handleRetry);
  }

  if (toggleMusicButton) {
    toggleMusicButton.addEventListener("click", handleToggleMusic);
  }
  if (toggleEffectsButton) {
    toggleEffectsButton.addEventListener("click", handleToggleEffects);
  }

  if (toggleMusicFooterButton) {
    toggleMusicFooterButton.addEventListener("click", handleToggleMusic);
  }
  if (toggleEffectsFooterButton) {
    toggleEffectsFooterButton.addEventListener("click", handleToggleEffects);
  }

  if (backButton) {
    backButton.addEventListener("click", handleBackToCharacters);
  }
  if (backToHeroButton) {
    backToHeroButton.addEventListener("click", handleBackToHero);
  }

  showSection(heroSection);
});
