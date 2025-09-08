import { showLoader, hideLoader, cacheDynamicFiles } from "../script.js";

// Функція для оновлення статистики у localStorage
const updatePlayerStats = (playerName, character, isWin) => {
  try {
    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};

    // Перевіряємо, чи існує гравець
    if (!playerStats[playerName]) {
      playerStats[playerName] = {};
    }

    // Перевіряємо, чи існує статистика для цього персонажа
    if (!playerStats[playerName][character]) {
      playerStats[playerName][character] = { gamesWon: 0, gamesLost: 0 };
    }

    // Оновлюємо лічильники
    if (isWin) {
      playerStats[playerName][character].gamesWon += 1;
    } else {
      playerStats[playerName][character].gamesLost += 1;
    }

    // Зберігаємо оновлені дані у localStorage
    localStorage.setItem("player-stats", JSON.stringify(playerStats));
    console.log("Статистика гравця оновлена:", playerStats[playerName]);
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

  // Отримуємо поточну статистику ПЕРЕД оновленням
  const statsJSON = localStorage.getItem("player-stats");
  const playerStats = statsJSON ? JSON.parse(statsJSON) : {};
  const previousWins = playerStats[playerName]?.[selectedCharacter]?.gamesWon || 0;
  const previousLosses = playerStats[playerName]?.[selectedCharacter]?.gamesLost || 0;

  // Оновлюємо статистику гравця
  updatePlayerStats(playerName, selectedCharacter, isWin);

  // Визначаємо, чи це перша перемога/поразка для цього гравця та персонажа
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
          Римлянин: `На жаль, <span class=\"player-name\">${playerName}</span>, завоювання Риму не вдалося і вдруге.`,
          Єврей: `На жаль, <span class=\"player-name\">${playerName}</span>, ця спроба не принесла бажаного результату.`,
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

  resultMessageElement.innerHTML = `<p>${messageText}</p>`;
};
