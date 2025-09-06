import { setupCharacterSelection } from "./scripts/character-selection.js";
import { quizData } from "./scripts/quiz.js";
import { showResult } from "./scripts/result.js";

let selectedCharacter = null;
let correctAnswersCount = 0;
let currentQuestionIndex = 0;
let totalQuestions = 0;
let quizQuestions = [];

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

  const chooseCharacterButton = document.getElementById("choose-character");
  const confirmCharacterButton = document.getElementById("confirm-character");
  const startGameButton = document.getElementById("start-game");
  const retryButton = document.getElementById("retry");
  const musicButton = document.getElementById("toggle-music");
  const backgroundMusic = document.getElementById("background-music");
  const musicIcon = musicButton.querySelector("i");

  // Мапа для перетворення українських назв на латинські для CSS-класів
  const characterNamesMap = {
    Єгиптянин: "egypt",
    Грек: "greek",
    Римлянин: "roman",
    Єврей: "hebrew",
  };

  // Епічні тексти для кожної нації
  const missionIntros = {
    Єгиптянин: playerName => `
      <h2>Ласкаво просимо, ${playerName}, у Вічну Долину Нілу!</h2>
      <p>Фараон закликає тебе пройти випробування Єгиптом. Чи готовий ти розгадати таємниці пірамід і довести свою мудрість?</p>
      <button id="start-mission">Почати Місію</button>
    `,
    Грек: playerName => `
      <h2>Слава тобі, ${playerName}, нащадку героїв Еллади!</h2>
      <p>Олімп спостерігає за тобою! Доведи свою доблесть та інтелект у випробуваннях, гідних Афінського Агори. Чи готовий ти до великих звершень?</p>
      <button id="start-mission">Почати Місію</button>
    `,
    Римлянин: playerName => `
      <h2>Ave, ${playerName}, громадянине Риму!</h2>
      <p>Імперія кличе! Приготуйся до важких випробувань, що загартують твій дух і розум. Чи гідний ти носити лаври Цезаря?</p>
      <button id="start-mission">Почати Місію</button>
    `,
    Єврей: playerName => `
      <h2>Шалом, ${playerName}, обранє дитя Царя!</h2>
      <p>Шлях до знання довгий, але істина веде праведних. Доведи свою вірність та мудрість, відповідаючи на питання, що сягають корінням віків. Чи готовий ти до випробування віри?</p>
      <button id="start-mission">Почати Місію</button>
    `,
  };

  const updateMusicButtonState = () => {
    if (!backgroundMusic.paused) {
      musicButton.classList.add("playing");
      musicButton.classList.remove("paused");
      musicIcon.classList.remove("fa-volume-mute");
      musicIcon.classList.add("fa-volume-up");
    } else {
      musicButton.classList.add("paused");
      musicButton.classList.remove("playing");
      musicIcon.classList.remove("fa-volume-up");
      musicIcon.classList.add("fa-volume-mute");
    }
  };

  const displayQuestion = index => {
    // Очищаємо попередні запитання
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
      // Показуємо результат, якщо всі питання пройдені
      quizSection.classList.add("hidden");
      showResult(selectedCharacter, playerNameInput.value, correctAnswersCount, totalQuestions);
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
      alert("Будь ласка, оберіть персонажа!");
      return;
    }
    selectedCharacter = activeSlide.querySelector("p").textContent;
    characterSelectionSection.classList.add("hidden");
    // Явно приховуємо quizSection, щоб уникнути багу
    quizSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    nameInputSection.classList.remove("hidden");

    const themeClass = characterNamesMap[selectedCharacter];
    main.className = "";
    main.classList.add(`theme-${themeClass}`);

    const audioFiles = {
      Єгиптянин: "egypts.mp3",
      Грек: "greeks.mp3",
      Римлянин: "romans.mp3",
      Єврей: "hebrews.mp3",
    };
    backgroundMusic.src = `audio/${audioFiles[selectedCharacter]}`;
    backgroundMusic
      .play()
      .then(() => {
        musicButton.classList.remove("hidden");
        updateMusicButtonState();
      })
      .catch(error => {
        console.error("Failed to play music:", error);
      });
  };

  const handleStartGame = () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert("Будь ласка, введіть своє ім'я!");
      return;
    }
    nameInputSection.classList.add("hidden");
    quizSection.classList.remove("hidden");

    const characterData = quizData[selectedCharacter];
    const quizImage = document.createElement("img");
    quizImage.src = characterData.image;
    quizImage.alt = `Імперія: ${selectedCharacter}`;
    quizImage.classList.add("quiz-image");

    // Перевіряємо, чи зображення вже існує, щоб уникнути дублювання
    const existingImage = quizContainer.querySelector(".quiz-image");
    if (existingImage) {
      existingImage.remove();
    }
    quizContainer.prepend(quizImage);

    quizQuestions = characterData.questions;
    totalQuestions = quizQuestions.length;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;

    missionIntro.innerHTML = missionIntros[selectedCharacter](playerName);
    missionIntro.classList.remove("hidden");
    questionsOverlay.classList.add("hidden");

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
    // Приховуємо всі секції та повертаємо до hero
    resultSection.classList.add("hidden");
    quizSection.classList.add("hidden");
    nameInputSection.classList.add("hidden");
    characterSelectionSection.classList.add("hidden");
    heroSection.style.display = "flex";

    // Скидаємо стан музики
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    musicButton.classList.add("hidden");
    musicButton.classList.remove("playing", "paused");
    musicIcon.classList.remove("fa-volume-mute");
    musicIcon.classList.add("fa-volume-up");

    // Очищаємо стилі теми та контейнер
    main.className = "";

    // Скидаємо глобальні змінні
    selectedCharacter = null;
    correctAnswersCount = 0;
    currentQuestionIndex = 0;
    totalQuestions = 0;
    quizQuestions = [];

    // Прибираємо динамічно додані елементи та відновлюємо початкову структуру
    const quizImage = quizContainer.querySelector(".quiz-image");
    if (quizImage) {
      quizImage.remove();
    }

    // Оновлюємо посилання на елементи, так як вони можуть бути перезаписані
    missionIntro = document.getElementById("mission-intro");
    questionsOverlay = document.getElementById("questions-overlay");
    if (missionIntro) missionIntro.innerHTML = "";
    if (questionsOverlay) questionsOverlay.innerHTML = "";
  };

  const handleToggleMusic = () => {
    if (backgroundMusic.paused) {
      backgroundMusic
        .play()
        .then(() => {
          updateMusicButtonState();
        })
        .catch(error => {
          console.error("Failed to play music:", error);
        });
    } else {
      backgroundMusic.pause();
      updateMusicButtonState();
    }
  };

  chooseCharacterButton.addEventListener("click", () => {
    heroSection.style.display = "none";
    characterSelectionSection.classList.remove("hidden");
    setupCharacterSelection();
  });
  confirmCharacterButton.addEventListener("click", handleCharacterConfirmation);
  startGameButton.addEventListener("click", handleStartGame);
  retryButton.addEventListener("click", handleRetry);
  musicButton.addEventListener("click", handleToggleMusic);
});
