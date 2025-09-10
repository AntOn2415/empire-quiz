import { setupCharacterSelection } from "./scripts/character-selection.js";
import { quizData } from "./scripts/quiz.js";
import { showResult } from "./scripts/result.js";

// Нагадування: якщо вносиш зміни в код, закоментуй цей блок, щоб уникнути кешування.
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(registration => {
//         console.log("Service Worker зареєстровано успішно:", registration.scope);
//       })
//       .catch(error => {
//         console.log("Помилка реєстрації Service Worker:", error);
//       });
//   });
// }

// Функція для перемішування масиву (алгоритм Фішера-Єйтса)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
const characterAvatarsMap = {
  Єгиптянин: "egypt.png",
  Грек: "greek.png",
  Римлянин: "roman.png",
  Єврей: "hebrew.png",
};

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

  const characters = [
    { name: "Єгиптянин", label: "Єгипет" },
    { name: "Грек", label: "Греція" },
    { name: "Римлянин", label: "Рим" },
    { name: "Єврей", label: "Юдея" },
  ];

  playerAvatarsContainer.innerHTML = "";

  characters.forEach(char => {
    const gamesWon = currentPlayerStats?.[char.name]?.gamesWon || 0;
    const gamesLost = currentPlayerStats?.[char.name]?.gamesLost || 0;
    const isActive = gamesWon > 0 || gamesLost > 0;

    const avatarItem = document.createElement("div");
    avatarItem.classList.add("player-avatar-item");

    const avatarCircle = document.createElement("div");
    avatarCircle.classList.add("avatar-circle");

    const avatarImagePath = `images/avatars/${characterAvatarsMap[char.name]}`;
    avatarCircle.style.backgroundImage = `url('${avatarImagePath}')`;

    if (isActive) {
      avatarCircle.classList.add("colored");
    }

    const characterName = document.createElement("p");
    characterName.textContent = char.label;

    if (!isActive) {
      characterName.style.color = "gray";
    } else {
      characterName.style.color = "#fff";
    }

    avatarItem.appendChild(avatarCircle);
    avatarItem.appendChild(characterName);

    if (gamesWon > 0) {
      const victoryCard = document.createElement("div");
      victoryCard.classList.add("stats-card", "victory-card");
      victoryCard.innerHTML = `<i class="fas fa-medal"></i>`;
      avatarItem.appendChild(victoryCard);
    } else if (isActive) {
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
const playerStatsSection = document.getElementById("player-stats-section");
const playerStatsContainer = document.getElementById("player-stats-container");
// Генерує випадковий колір для аватара
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Оновлює відображення статистики гравців
export const updatePlayerStatsDisplay = () => {
  try {
    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

    const players = Object.keys(playerStats).map(name => {
      const games = playerStats[name];
      let totalWins = 0;
      let totalLosses = 0;

      // Підраховуємо загальну кількість перемог та поразок по всіх персонажах
      for (const character in games) {
        totalWins += games[character].gamesWon;
        totalLosses += games[character].gamesLost;
      }

      const totalGames = totalWins + totalLosses;
      const winRatio = totalGames > 0 ? totalWins / totalGames : 0;

      return {
        name,
        totalWins,
        totalLosses,
        totalGames,
        winRatio,
      };
    });

    // Сортуємо гравців: спочатку за winRatio (спадання), потім за кількістю ігор (зростання), потім за кількістю перемог (спадання)
    players.sort((a, b) => {
      if (b.winRatio !== a.winRatio) {
        return b.winRatio - a.winRatio; // Сортуємо за коефіцієнтом перемог
      }
      if (b.totalGames !== a.totalGames) {
        return b.totalGames - a.totalGames; // За кількістю ігор
      }
      return b.totalWins - a.totalWins; // За кількістю перемог
    });

    playerStatsContainer.innerHTML = "";
    if (players.length > 1) {
      playerStatsSection.classList.remove("hidden");
      players.forEach((player, index) => {
        const card = document.createElement("div");
        card.classList.add("player-card");

        const rankElement = document.createElement("div");
        rankElement.classList.add("rank");
        rankElement.textContent = `#${index + 1}`;

        const avatar = document.createElement("div");
        avatar.classList.add("player-avatar");
        avatar.style.setProperty("--avatar-bg-color", getRandomColor());
        const firstLetter = player.name.charAt(0).toUpperCase();
        avatar.innerHTML = `<span>${firstLetter}</span>`;

        // Додаємо медальки для перших трьох лідерів
        let medalHtml = "";
        if (index === 0 && player.totalGames > 0) {
          medalHtml = `<i class="fas fa-medal leader-medal"></i>`;
        } else if (index === 1 && player.totalGames > 0) {
          medalHtml = `<i class="fas fa-award leader-medal silver"></i>`;
        } else if (index === 2 && player.totalGames > 0) {
          medalHtml = `<i class="fas fa-trophy leader-medal bronze"></i>`;
        }
        if (medalHtml) {
          const medalContainer = document.createElement("div");
          medalContainer.innerHTML = medalHtml;
          avatar.appendChild(medalContainer.firstChild);
        }

        const info = document.createElement("div");
        info.classList.add("player-info");
        if (index < 3) {
          info.classList.add("leader");
        }

        info.innerHTML = `
          <h3>${player.name}</h3>
          <p>Перемог: <span class="wins">${player.totalWins}</span> | Поразок: <span class="losses">${player.totalLosses}</span></p>
        `;

        card.appendChild(rankElement);
        card.appendChild(avatar);
        card.appendChild(info);

        playerStatsContainer.appendChild(card);
      });
    } else {
      playerStatsSection.classList.add("hidden");
    }
  } catch (e) {
    console.error("Помилка при зчитуванні статистики з localStorage:", e);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.getElementById("hero");
  const characterSelectionSection = document.getElementById("character-selection");
  const nameInputSection = document.getElementById("name-input");
  const clearStatsButton = document.getElementById("clear-stats-btn");

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

  const settingsButton = document.getElementById("settings-button");
  const utilityButtonsWrapper = document.getElementById("utility-buttons-wrapper");

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

  // Додати обробник для кнопки "Очистити зал"
  clearStatsButton?.addEventListener("click", () => {
    Swal.fire({
      title: "Ви впевнені?",
      text: "Ці дії безповоротньо видалять усю статистику гравців!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Так, очистити!",
      cancelButtonText: "Відміна",
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem("player-stats");
        updatePlayerStatsDisplay(); // Оновлюємо відображення
        Swal.fire("Очищено!", "Усі дані про гравців були видалені.", "success");
      }
    });
  });

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

      // Зберігаємо початковий індекс правильної відповіді
      const originalCorrectIndex = questionData.correct;

      // Створюємо новий масив з варіантами та їхніми початковими індексами
      const optionsWithOriginalIndex = questionData.options.map((option, i) => ({
        option,
        originalIndex: i,
      }));

      // Перемішуємо масив варіантів
      const shuffledOptions = shuffleArray(optionsWithOriginalIndex);

      shuffledOptions.forEach(item => {
        const btn = document.createElement("button");
        btn.classList.add("quiz-option");
        btn.textContent = item.option;
        // Встановлюємо dataset.correct на основі оригінального індексу
        btn.dataset.correct = item.originalIndex === originalCorrectIndex;
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
    // Приховуємо всі основні секції
    [heroSection, characterSelectionSection, nameInputSection, quizSection, resultSection].forEach(
      s => s.classList.add("hidden")
    );

    // Приховуємо "Зал Слави" за замовчуванням
    playerStatsSection.classList.add("hidden");

    // Показуємо вибрану секцію
    section.classList.remove("hidden");

    // Показуємо "Зал Слави" тільки на сторінці введення імені
    if (section === nameInputSection) {
      updatePlayerStatsDisplay();
    }

    // Логіка для кнопок
    if (section === heroSection) {
      mainFooter?.classList.remove("visually-hidden");
      utilityButtonsWrapper?.classList.add("hidden");
    } else {
      mainFooter?.classList.add("visually-hidden");
      utilityButtonsWrapper?.classList.remove("hidden");
    }
  };

  // Функція для запуску музики залежно від поточної локації
  const playMusicForCurrentSection = () => {
    if (isMusicOn) {
      if (!characterSelectionSection.classList.contains("hidden")) {
        crossfadeMusic("audio/empireQuiz.mp3");
      } else if (!quizSection.classList.contains("hidden")) {
        const audioSrc = `audio/${
          selectedCharacter === "Єгиптянин"
            ? "egypts.mp3"
            : selectedCharacter === "Грек"
            ? "greeks.mp3"
            : selectedCharacter === "Римлянин"
            ? "romans.mp3"
            : "hebrews.mp3"
        }`;
        crossfadeMusic(audioSrc);
      }
    }
  };

  const savedGender = localStorage.getItem("playerGender");
  if (savedGender) {
    selectedGender = savedGender;
  }

  // Визначаємо початковий активний стан кнопок
  if (selectedGender === "male") {
    genderMaleButton?.classList.add("active");
  } else if (savedGender === "female") {
    genderFemaleButton?.classList.add("active");
  }

  genderMaleButton?.addEventListener("click", () => {
    selectedGender = "male";
    genderMaleButton.classList.add("active");
    genderFemaleButton?.classList.remove("active");
  });
  genderFemaleButton?.addEventListener("click", () => {
    selectedGender = "female";
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
    selectedCharacter = activeSlide.querySelector("p").textContent;
    if (characterEffectsMap[selectedCharacter])
      playShortEffect(characterEffectsMap[selectedCharacter]);

    showSection(nameInputSection);

    const savedGender = localStorage.getItem("playerGender");
    if (savedGender) {
      selectedGender = savedGender;
    }

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

  startGameButton?.addEventListener("click", async () => {
    const playerName = playerNameInput.value.trim();
    const lastPlayerName = localStorage.getItem("current-player-name");

    if (!playerName)
      return Swal.fire({ title: "Забули ім'я", text: "Введіть ім'я.", icon: "warning" });
    if (!selectedGender)
      return Swal.fire({ title: "Забули стать", text: "Оберіть стать.", icon: "warning" });

    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

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
        startGame(playerName);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        playerNameInput.value = "";
        return;
      }
    } else {
      startGame(playerName);
    }
  });

  const startGame = async playerName => {
    localStorage.setItem("current-player-name", playerName);
    localStorage.setItem("playerGender", selectedGender);

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
    playMusicForCurrentSection();
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    selectedCharacter = null;
    selectedGender = null;
    genderMaleButton.classList.remove("active");
    genderFemaleButton.classList.remove("active");
    quizContainer.querySelector(".quiz-image")?.remove();
    main.className = "";
    renderPlayerStatus();
  });

  backToHeroButton?.addEventListener("click", () => {
    showSection(heroSection);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    updateMusicButtonState();
    updateEffectsButtonState();
  });

  // Обробники для кнопок в bottom-buttons-container
  toggleMusicButton?.addEventListener("click", () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
      playMusicForCurrentSection();
    } else {
      backgroundMusic.pause();
    }
    updateMusicButtonState();
  });
  toggleEffectsButton?.addEventListener("click", () => {
    isEffectsOn = !isEffectsOn;
    updateEffectsButtonState();
  });
  backButton?.addEventListener("click", () => {
    showSection(characterSelectionSection);
    playMusicForCurrentSection();
  });

  // Обробник для кнопки налаштувань
  if (settingsButton && utilityButtonsWrapper) {
    settingsButton.addEventListener("click", () => {
      utilityButtonsWrapper.classList.toggle("visible-wrapper");
      settingsButton.classList.toggle("is-active");
    });
  }

  // Обробники для кнопок у футері
  toggleMusicFooterButton?.addEventListener("click", () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
      playMusicForCurrentSection();
    } else {
      backgroundMusic.pause();
    }
    updateMusicButtonState();
  });
  toggleEffectsFooterButton?.addEventListener("click", () => {
    isEffectsOn = !isEffectsOn;
    updateEffectsButtonState();
  });

  showSection(heroSection);
  // Приховуємо Зал Слави, щоб він не відображався на головній сторінці
  playerStatsSection.classList.add("hidden");
});
