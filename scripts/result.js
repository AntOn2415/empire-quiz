// scripts/result.js
import { showLoader, hideLoader, updatePlayerStatsDisplay } from "./ui-handler.js";
import { cacheDynamicFiles } from "./utils.js";

const updatePlayerStats = (playerName, character, isWin) => {
  try {
    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

    const cleanedPlayerName = playerName.replace(/\s+/g, " ").trim();

    if (!playerStats[cleanedPlayerName]) {
      playerStats[cleanedPlayerName] = {};
    }

    if (!playerStats[cleanedPlayerName][character]) {
      playerStats[cleanedPlayerName][character] = { gamesWon: 0, gamesLost: 0 };
    }

    if (isWin) {
      playerStats[cleanedPlayerName][character].gamesWon += 1;
    } else {
      playerStats[cleanedPlayerName][character].gamesLost += 1;
    }

    localStorage.setItem("player-stats", JSON.stringify(playerStats));
  } catch (e) {
    console.error("Помилка при оновленні статистики у localStorage:", e);
  }
};

export const showResult = async (
  selectedCharacter,
  playerName,
  correctAnswers,
  totalQuestions,
  selectedGender
) => {
  const resultSection = document.getElementById("result");
  const resultVideo = document.getElementById("result-video");
  const resultMessageElement = document.getElementById("result-message");

  const percentage = (correctAnswers / totalQuestions) * 100;
  const isWin = percentage >= 80;

  const statsJSON = localStorage.getItem("player-stats");
  const playerStats = statsJSON ? JSON.parse(statsJSON) : {};
  const cleanedPlayerName = playerName.replace(/\s+/g, " ").trim();
  const previousWins = playerStats[cleanedPlayerName]?.[selectedCharacter]?.gamesWon || 0;
  const previousLosses = playerStats[cleanedPlayerName]?.[selectedCharacter]?.gamesLost || 0;

  updatePlayerStats(playerName, selectedCharacter, isWin);
  updatePlayerStatsDisplay();

  let isFirstResult;
  if (isWin) {
    isFirstResult = previousWins === 0;
  } else {
    isFirstResult = previousLosses === 0;
  }

  const genderedDid = selectedGender === "male" ? "здобув" : "здобула";
  const genderedConqueror = selectedGender === "male" ? "підкорив" : "підкорила";
  const genderedProved = selectedGender === "male" ? "довів" : "довела";
  const genderedPassed = selectedGender === "male" ? "пройшов" : "пройшла";
  const genderedAnswered = selectedGender === "male" ? "відповів" : "відповіла";
  const genderedReached = selectedGender === "male" ? "досяг" : "досягла";

  const characterNames = {
    Єгиптянин: "egypt",
    Грек: "greek",
    Римлянин: "roman",
    Єврей: "hebrew",
  };
  let characterBaseName = characterNames[selectedCharacter] || "default";

  const getMessageText = (isFirst, isWin) => {
    const messages = {
      first: {
        success: {
          Єгиптянин: `Вітаємо, <span class="player-name">${playerName}</span>! Твої знання історії стародавнього Єгипту вражають. Ти ${genderedProved} свою мудрість і ${genderedPassed} випробування.`,
          Грек: `Чудово, <span class="player-name">${playerName}</span>! Ти ${genderedReached} Олімпу, ${genderedDid} славу та мудрість, гідну філософів.`,
          Римлянин: `Вітаємо, <span class="player-name">${playerName}</span>, вірний громадянин! Ти ${genderedConqueror} Рим і ${genderedProved} свою силу.`,
          Єврей: `Шалом, <span class="player-name">${playerName}</span>! Ти ${genderedAnswered} на всі питання та ${genderedReached} глибокого розуміння історії.`,
        },
        failure: {
          Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedPassed} випробування. Спробуй ще раз, щоб розгадати таємниці Нілу.`,
          Грек: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedDid} слави на Олімпі. Спробуй ще раз, щоб довести свою доблесть.`,
          Римлянин: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedConqueror} Рим. Але дух імперії сильний, спробуй ще раз!`,
          Єврей: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedReached} потрібного розуміння. Спробуй ще раз, щоб знайти істину.`,
        },
      },
      repeated: {
        success: {
          Єгиптянин: `Вітаємо, <span class="player-name">${playerName}</span>! Твої знання історії стародавнього Єгипту вражають. Ти пройшов це випробування вдруге.`,
          Грек: `Чудово, <span class="player-name">${playerName}</span>! Ти і вдруге успішно пройшов це випробування.`,
          Римлянин: `Вітаємо, <span class="player-name">${playerName}</span>! Ти знову підкорив Рим.`,
          Єврей: `Шалом, <span class="player-name">${playerName}</span>! Ти знову довів свою мудрість та знання.`,
        },
        failure: {
          Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, навіть після повторної спроби, загадки Нілу залишилися нерозгаданими.`,
          Грек: `На жаль, <span class="player-name">${playerName}</span>, і вдруге тобі не вдалось пройти випробування стародавньої Греції.`,
          Римлянин: `На жаль, <span class="player-name">${playerName}</span>, завоювання Риму не вдалося і вдруге.`,
          Єврей: `На жаль, <span class="player-name">${playerName}</span>, ця спроба не принесла бажаного результату.`,
        },
      },
    };
    if (isWin) {
      return isFirst
        ? messages.first.success[selectedCharacter]
        : messages.repeated.success[selectedCharacter];
    } else {
      return isFirst
        ? messages.first.failure[selectedCharacter]
        : messages.repeated.failure[selectedCharacter];
    }
  };

  const messageText = getMessageText(isFirstResult, isWin);

  const incorrectAnswers = totalQuestions - correctAnswers;
  let statsSummary = "";

  const getRandomMessage = messagesArray => {
    return messagesArray[Math.floor(Math.random() * messagesArray.length)];
  };

  const characterStats = {
    Єгиптянин: {
      allCorrect: [
        `<i class="fas fa-gem"></i> Всі скарби знань — твої!`,
        `<i class="fas fa-star-of-david"></i> Мудрість фараона!`,
      ],
      allIncorrect: [
        `<i class="fas fa-times"></i> Загубився в пісках часу`,
        `<i class="fas fa-sad-cry"></i> Таємниці Нілу не розкрито`,
      ],
      regular: [
        `Правильних: ${correctAnswers}, неправильних: ${incorrectAnswers}.`,
        `${correctAnswers} вірних відповідей, але ${incorrectAnswers} таємниць ще чекають свого часу.`,
        `Ти розгадав ${correctAnswers} таємниць з ${totalQuestions}.`,
      ],
    },
    Грек: {
      allCorrect: [
        `<i class="fas fa-bullseye"></i> Всі в яблучко!`,
        `<i class="fas fa-feather-alt"></i> Олімп схвалює!`,
      ],
      allIncorrect: [
        `<i class="fas fa-skull-crossbones"></i> Стріла пройшла мимо...`,
        `<i class="fas fa-frown"></i> Олімп не підкорився`,
      ],
      regular: [
        `Попав: ${correctAnswers}, мімо: ${incorrectAnswers}.`,
        `З ${totalQuestions} стріл, ${correctAnswers} влучили в ціль!`,
        `Ти йдеш до перемоги: ${correctAnswers} подвигів на рахунку. Залишилось: ${
          totalQuestions - correctAnswers
        }.`,
      ],
    },
    Римлянин: {
      allCorrect: [
        `<i class="fas fa-crown"></i> Veni, Vidi, Vici!`,
        `<i class="fas fa-shield-alt"></i> Бездоганна перемога!`,
      ],
      allIncorrect: [
        `<i class="fas fa-times"></i> Цезар незадоволений`,
        `<i class="fas fa-flag-checkered"></i> Поразка, але не кінець!`,
      ],
      regular: [
        `Прийнято: ${correctAnswers}, відхилено: ${incorrectAnswers}.`,
        `Твоя дисципліна: ${correctAnswers} влучних ударів з ${totalQuestions}!`,
        `Ти на вірному шляху до завоювання: ${correctAnswers} перемог, ${incorrectAnswers} поразок.`,
      ],
    },
    Єврей: {
      allCorrect: [
        `<i class="fas fa-praying-hands"></i> Істина знайдена!`,
        `<i class="fas fa-star-of-david"></i> Всі відповіді мудрі!`,
      ],
      allIncorrect: [
        `<i class="fas fa-question-circle"></i> Потрібна ще мудрість`,
        `<i class="fas fa-times"></i> Невдача, але не поразка`,
      ],
      regular: [
        `Твоя мудрість зростає: ${correctAnswers} правильних, ${incorrectAnswers} помилкових!`,
        `Ти крок за кроком наближаєшся до істини: ${correctAnswers} вірних відповідей, ${incorrectAnswers} сумнівних.`,
        `Ось твої знання: ${correctAnswers} з ${totalQuestions} істин.`,
      ],
    },
  };

  if (correctAnswers === totalQuestions) {
    statsSummary = `<p class="stats-summary all-correct">${getRandomMessage(
      characterStats[selectedCharacter].allCorrect
    )}</p>`;
  } else if (correctAnswers === 0) {
    statsSummary = `<p class="stats-summary all-incorrect">${getRandomMessage(
      characterStats[selectedCharacter].allIncorrect
    )}</p>`;
  } else {
    statsSummary = `<p class="stats-summary mixed">${getRandomMessage(
      characterStats[selectedCharacter].regular
    )}</p>`;
  }

  showLoader();

  try {
    const videoSuffix = percentage >= 80 ? "Happy" : "Angry";
    const videoSrc = `videos/${characterBaseName}${videoSuffix}.mp4`;
    cacheDynamicFiles([videoSrc]);
    resultVideo.src = videoSrc;
    resultVideo.load();
    resultVideo.addEventListener(
      "loadeddata",
      () => {
        hideLoader();
        resultVideo.play();
      },
      { once: true }
    );
    resultVideo.addEventListener(
      "error",
      e => {
        console.error("Помилка завантаження відео:", e);
        hideLoader();
      },
      { once: true }
    );
  } catch (err) {
    console.error("Помилка при кешуванні відео:", err);
    hideLoader();
  }

  resultMessageElement.innerHTML = `${messageText}${statsSummary}`;
};
