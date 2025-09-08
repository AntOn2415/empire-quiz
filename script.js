import { setupCharacterSelection } from "./scripts/character-selection.js";
import { quizData } from "./scripts/quiz.js";
import { showResult } from "./scripts/result.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(registration => {
        console.log("Service Worker зареєстровано успішно:", registration.scope);
      })
      .catch(error => {
        console.log("Помилка реєстрації Service Worker:", error);
      });
  });
}

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

// Лоудер
export const showLoader = () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.remove("hidden");
    loader.classList.add("visible");
  }
};

export const hideLoader = () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.remove("visible");
    loader.classList.add("hidden");
  }
};

// Показати лоудер одразу при заході на сайт
showLoader();

// Ховаємо лоудер після повного завантаження головної секції героя
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
});

// Фallback спінер після Lottie завантаження
const lottie = document.getElementById("lottie");
const fallback = document.querySelector(".fallback-spinner");
if (lottie && fallback) {
  lottie.addEventListener("load", () => fallback.classList.add("fallback-hidden"));
}

// Мапи персонажів
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

const characterColorsMap = {
  Єгиптянин: "#d4ac0d",
  Грек: "#5d6d7e",
  Римлянин: "#c0392b",
  Єврей: "#2e86c1",
};

// Функція для кешування файлів
export const cacheDynamicFiles = async urls => {
  if ("caches" in window) {
    const cache = await caches.open("empire-quiz-dynamic-files");
    for (const url of urls) {
      try {
        await cache.add(url);
        console.log(`Файл закешовано: ${url}`);
      } catch (e) {
        console.error(`Не вдалося закешувати ${url}:`, e);
      }
    }
  }
};

// Функція для завантаження аудіо з лоудером
const loadAudioWithLoader = src =>
  new Promise((resolve, reject) => {
    backgroundMusic.src = src;
    backgroundMusic.load();

    const onCanPlay = () => {
      backgroundMusic.removeEventListener("canplaythrough", onCanPlay);
      resolve();
    };

    const onError = e => {
      backgroundMusic.removeEventListener("error", onError);
      console.error("Помилка завантаження аудіо:", e);
      reject(e);
    };

    backgroundMusic.addEventListener("canplaythrough", onCanPlay, { once: true });
    backgroundMusic.addEventListener("error", onError, { once: true });

    if (isMusicOn) backgroundMusic.play().catch(e => console.error(e));
  });

// Функція crossfade для музики без лоудера (для перемикання)
const crossfadeMusic = newSrc => {
  backgroundMusic.src = newSrc;
  backgroundMusic.load();
  if (isMusicOn) backgroundMusic.play().catch(e => console.error(e));
};

// Функція для оновлення статусу гравця на екрані вибору персонажа
// Функція для оновлення статусу гравця на екрані вибору персонажа
const renderPlayerStatus = () => {
  const playerStatusTitle = document.getElementById("player-status-title");
  const playerAvatarsContainer = document.getElementById("player-avatars-and-stats");
  const playerName = localStorage.getItem("current-player-name");

  if (playerName) {
    playerStatusTitle.textContent = `Статус гравця: ${playerName}`;
  } else {
    playerStatusTitle.textContent = "Статус поточного гравця";
  }

  const statsJSON = localStorage.getItem("player-stats");
  const playerStats = statsJSON ? JSON.parse(statsJSON) : {};
  const currentPlayerStats = playerName ? playerStats[playerName] : null;

  // Масив для коротких назв
  const characters = [
    { name: "Єгиптянин", label: "Єгипет" },
    { name: "Грек", label: "Греція" },
    { name: "Римлянин", label: "Рим" },
    { name: "Єврей", label: "Іудея" },
  ];

  playerAvatarsContainer.innerHTML = "";

  characters.forEach(char => {
    const gamesWon = currentPlayerStats?.[char.name]?.gamesWon || 0;
    const gamesLost = currentPlayerStats?.[char.name]?.gamesLost || 0;
    const isActive = gamesWon > 0 || gamesLost > 0;
    const avatarColor = characterColorsMap[char.name];

    const avatarItem = document.createElement("div");
    avatarItem.classList.add("player-avatar-item");

    const avatarCircle = document.createElement("div");
    avatarCircle.classList.add("avatar-circle");
    avatarCircle.style.backgroundColor = avatarColor;
    if (isActive) {
      avatarCircle.classList.add("colored");
    }

    const characterName = document.createElement("p");
    characterName.textContent = char.label;

    avatarItem.appendChild(avatarCircle);
    avatarItem.appendChild(characterName);

    // Додаємо умовний рендеринг: якщо є хоча б одна перемога, показуємо кубок
    if (gamesWon > 0) {
      const victoryCard = document.createElement("div");
      victoryCard.classList.add("stats-card", "victory-card");
      victoryCard.innerHTML = `<i class="fas fa-medal"></i>`; // Використовуємо іконку медалі для перемоги
      avatarItem.appendChild(victoryCard);
    } else if (isActive) {
      // Якщо перемог немає, але є зіграні ігри, показуємо статистику
      const statsCard = document.createElement("div");
      statsCard.classList.add("stats-card");

      const winsRow = document.createElement("div");
      winsRow.classList.add("stats-row");
      winsRow.innerHTML = `<span class="stats-label win"><i class="fas fa-trophy"></i></span> <span class="stats-value">${gamesWon}</span>`;

      const lossesRow = document.createElement("div");
      lossesRow.classList.add("stats-row");
      lossesRow.innerHTML = `<span class="stats-label loss"><i class="fas fa-shield-alt"></i></span> <span class="stats-value">${gamesLost}</span>`;

      statsCard.appendChild(winsRow);
      statsCard.appendChild(lossesRow);
      avatarItem.appendChild(statsCard);
    }
    playerAvatarsContainer.appendChild(avatarItem);
  });
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

  const toggleMusicButton = document.getElementById("toggle-music");
  const toggleEffectsButton = document.getElementById("toggle-effects");
  const toggleMusicFooterButton = document.getElementById("toggle-music-footer");
  const toggleEffectsFooterButton = document.getElementById("toggle-effects-footer");

  const bottomButtonsContainer = document.getElementById("bottom-buttons-container");
  const mainFooter = document.getElementById("main-footer");

  const musicIcon = toggleMusicButton?.querySelector("i");
  const effectsIcon = toggleEffectsButton?.querySelector("i");
  const musicFooterIcon = toggleMusicFooterButton?.querySelector("i");
  const effectsFooterIcon = toggleEffectsFooterButton?.querySelector("i");

  const updateMusicButtonState = () => {
    if (isMusicOn) {
      musicIcon?.classList.replace("fa-volume-mute", "fa-volume-up");
      musicFooterIcon?.classList.replace("fa-volume-mute", "fa-volume-up");
    } else {
      musicIcon?.classList.replace("fa-volume-up", "fa-volume-mute");
      musicFooterIcon?.classList.replace("fa-volume-up", "fa-volume-mute");
    }
  };

  const updateEffectsButtonState = () => {
    if (isEffectsOn) {
      effectsIcon?.classList.replace("fa-bell-slash", "fa-bell");
      effectsFooterIcon?.classList.replace("fa-bell-slash", "fa-bell");
    } else {
      effectsIcon?.classList.replace("fa-bell", "fa-bell-slash");
      effectsFooterIcon?.classList.replace("fa-bell", "fa-bell-slash");
    }
  };

  const playShortEffect = effectSrc => {
    if (isEffectsOn) {
      cacheDynamicFiles([`audio/${effectSrc}`]);

      shortEffect.pause();
      shortEffect.currentTime = 0;
      shortEffect.src = `audio/${effectSrc}`;
      shortEffect.load();
      shortEffect.play().catch(e => e.name !== "AbortError" && console.error(e));
    }
  };

  // Вступні тексти місії
  const missionIntros = {
    Єгиптянин: (playerName, gender) => `
      <h2>Ласкаво просимо, ${playerName}, у Вічну Долину Нілу!</h2>
      <p>Фараон закликає тебе пройти випробування Єгиптом. Чи готов${
        gender === "male" ? "ий" : "а"
      } ти розгадати таємниці пірамід і довести свою мудрість?</p>
      <button id="start-mission">Почати Місію</button>
    `,
    Грек: (playerName, gender) => {
      const genderText = gender === "male" ? "герою" : "героїне";
      return `
        <h2>О, ${playerName}, доблесний нащадку ${genderText} Еллади!</h2>
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

  // Відображення запитань
  const displayQuestion = index => {
    questionsOverlay.innerHTML = "";
    if (index < quizQuestions.length) {
      const questionData = quizQuestions[index];
      const questionBlock = document.createElement("div");
      questionBlock.classList.add("question-block", "fade-in");
      const questionText = document.createElement("h3");
      questionText.textContent = `${index + 1}. ${questionData.question}`;
      questionBlock.appendChild(questionText);
      questionData.options.forEach((option, i) => {
        const btn = document.createElement("button");
        btn.classList.add("quiz-option");
        btn.textContent = option;
        btn.dataset.correct = i === questionData.correct;
        btn.addEventListener("click", handleAnswerClick);
        questionBlock.appendChild(btn);
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

  // Відповідь на запитання
  const handleAnswerClick = e => {
    const isCorrect = e.target.dataset.correct === "true";
    if (isCorrect) correctAnswersCount++;
    const feedback = document.createElement("p");
    feedback.textContent = isCorrect ? "Правильно!" : "Неправильно.";
    feedback.classList.add(isCorrect ? "correct" : "incorrect");
    e.target.parentElement.appendChild(feedback);
    e.target.parentElement.querySelectorAll("button").forEach(b => (b.disabled = true));

    const currentBlock = questionsOverlay.querySelector(".question-block");
    if (currentBlock) {
      currentBlock.classList.remove("fade-in");
      currentBlock.classList.add("fade-out");
      currentBlock.addEventListener(
        "animationend",
        () => {
          currentQuestionIndex++;
          displayQuestion(currentQuestionIndex);
        },
        { once: true }
      );
    }
  };

  // Показ/приховування секцій
  const showSection = section => {
    [heroSection, characterSelectionSection, nameInputSection, quizSection, resultSection].forEach(
      s => s.classList.add("hidden")
    );
    section.classList.remove("hidden");
    if (section === heroSection) {
      mainFooter.classList.remove("visually-hidden");
      bottomButtonsContainer.classList.add("hidden");
    } else {
      mainFooter.classList.add("visually-hidden");
      bottomButtonsContainer.classList.remove("hidden");
    }
  };

  // Обробники кнопок, старт гри, вибір персонажа, гендеру, лоудер для картинки та аудіо
  genderMaleButton?.addEventListener("click", () => {
    selectedGender = "male";
    genderMaleButton.classList.add("active");
    genderFemaleButton?.classList.remove("active");
    localStorage.setItem("playerGender", "male");
  });
  genderFemaleButton?.addEventListener("click", () => {
    selectedGender = "female";
    genderFemaleButton.classList.add("active");
    genderMaleButton?.classList.remove("active");
    localStorage.setItem("playerGender", "female");
  });

  chooseCharacterButton?.addEventListener("click", () => {
    crossfadeMusic("audio/empireQuiz.mp3");
    showSection(characterSelectionSection);
    setupCharacterSelection();
    // Оновлюємо статус гравця при переході на екран вибору персонажа
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
    selectedCharacter = activeSlide.querySelector("p").textContent;
    if (characterEffectsMap[selectedCharacter])
      playShortEffect(characterEffectsMap[selectedCharacter]);

    showSection(nameInputSection);

    selectedGender = localStorage.getItem("playerGender");
    genderMaleButton.classList.remove("active");
    genderFemaleButton.classList.remove("active");
    if (selectedGender === "male") {
      genderMaleButton.classList.add("active");
    } else if (selectedGender === "female") {
      genderFemaleButton.classList.add("active");
    }

    main.className = "";
    main.classList.add(`theme-${characterNamesMap[selectedCharacter]}`);
  });

  let isInputFocused = false; // Змінна для відстеження, чи поле отримало фокус

  playerNameInput?.addEventListener("focus", () => {
    if (!isInputFocused && playerNameInput.value) {
      playerNameInput.value = ""; // Очищаємо поле
      isInputFocused = true;
    }
  });

  // Додаємо обробник, щоб скинути прапорець, коли поле втрачає фокус
  playerNameInput?.addEventListener("blur", () => {
    isInputFocused = false;
  });

  startGameButton?.addEventListener("click", async () => {
    const playerName = playerNameInput.value.trim();
    const lastPlayerName = localStorage.getItem("current-player-name");

    if (!playerName)
      return Swal.fire({ title: "Забули ім'я", text: "Введіть ім'я.", icon: "warning" });
    if (!selectedGender)
      return Swal.fire({ title: "Забули стать", text: "Оберіть стать.", icon: "warning" });

    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

    // Перевіряємо, чи ім'я було змінено вручну І чи воно існує в статистиці
    if (playerName !== lastPlayerName && playerStats[playerName]) {
      const result = await Swal.fire({
        title: "Це ім'я вже існує!",
        text: `Гравець "${playerName}" вже має статистику. Хочете зіграти за це ім'я або обрати нове?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Продовжити",
        cancelButtonText: "Обрати інше ім'я",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Якщо гравець вибрав "Продовжити", запускаємо гру
        startGame(playerName);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Якщо гравець вибрав "Обрати інше ім'я", очищаємо поле вводу і повертаємось
        playerNameInput.value = "";
        return;
      }
    } else {
      // Якщо ім'я нове, або не було змінене, запускаємо гру одразу
      startGame(playerName);
    }
  });

  // Нова функція для запуску гри, щоб уникнути дублювання коду
  const startGame = async playerName => {
    localStorage.setItem("current-player-name", playerName);

    showSection(quizSection);
    showLoader();

    const characterData = quizData[selectedCharacter];
    const quizImage = new Image();
    quizImage.src = characterData.image;
    quizImage.alt = selectedCharacter;
    quizImage.classList.add("quiz-image");

    const audioSrc = `audio/${
      selectedCharacter === "Єгиптянин"
        ? "egypts.mp3"
        : selectedCharacter === "Грек"
        ? "greeks.mp3"
        : selectedCharacter === "Римлянин"
        ? "romans.mp3"
        : "hebrews.mp3"
    }`;
    cacheDynamicFiles([quizImage.src, audioSrc]);
    loadAudioWithLoader(audioSrc);

    try {
      await new Promise((resolve, reject) => {
        quizImage.onload = () => resolve();
        quizImage.onerror = () => reject(new Error("Помилка завантаження картинки"));
      });

      hideLoader();
      quizContainer.querySelector(".quiz-image")?.remove();
      quizContainer.prepend(quizImage);

      quizQuestions = characterData.questions;
      totalQuestions = quizQuestions.length;
      currentQuestionIndex = 0;
      correctAnswersCount = 0;

      missionIntro.innerHTML = missionIntros[selectedCharacter](playerName, selectedGender);
      missionIntro.classList.remove("hidden");
      questionsOverlay.classList.add("hidden");

      document.getElementById("start-mission")?.addEventListener("click", () => {
        missionIntro.classList.add("hidden");
        questionsOverlay.classList.remove("hidden");
        displayQuestion(currentQuestionIndex);
      });
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
    crossfadeMusic("audio/empireQuiz.mp3");
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    selectedCharacter = null;
    selectedGender = null;
    genderMaleButton.classList.remove("active");
    genderFemaleButton.classList.remove("active");
    quizContainer.querySelector(".quiz-image")?.remove();
    main.className = "";
    // Оновлюємо статус гравця при переході на екран вибору персонажа
    renderPlayerStatus();
  });

  backToHeroButton?.addEventListener("click", () => {
    showSection(heroSection);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    updateMusicButtonState();
    updateEffectsButtonState();
  });

  toggleMusicButton?.addEventListener("click", () => {
    isMusicOn = !isMusicOn;
    isMusicOn ? backgroundMusic.play() : backgroundMusic.pause();
    updateMusicButtonState();
  });
  toggleEffectsButton?.addEventListener("click", () => {
    isEffectsOn = !isEffectsOn;
    updateEffectsButtonState();
  });
  toggleMusicFooterButton?.addEventListener("click", () => {
    isMusicOn = !isMusicOn;
    isMusicOn ? backgroundMusic.play() : backgroundMusic.pause();
    updateMusicButtonState();
  });
  toggleEffectsFooterButton?.addEventListener("click", () => {
    isEffectsOn = !isEffectsOn;
    updateEffectsButtonState();
  });
  backButton?.addEventListener("click", () => showSection(characterSelectionSection));

  showSection(heroSection);
});
