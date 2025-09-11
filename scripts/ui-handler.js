import { isMusicOn, isEffectsOn, selectedCharacter } from "./game-logic.js";
import { cacheDynamicFiles } from "./utils.js";
import { characterAvatarsMap } from "./constants.js";

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

// Показ/приховування секцій
export const showSection = section => {
  const heroSection = document.getElementById("hero");
  const characterSelectionSection = document.getElementById("character-selection");
  const nameInputSection = document.getElementById("name-input");
  const quizSection = document.getElementById("quiz");
  const resultSection = document.getElementById("result");
  const playerStatsSection = document.getElementById("player-stats-section");
  const mainFooter = document.getElementById("main-footer");
  const utilityButtonsWrapper = document.getElementById("utility-buttons-wrapper");
  [heroSection, characterSelectionSection, nameInputSection, quizSection, resultSection].forEach(
    s => s.classList.add("hidden")
  );
  playerStatsSection.classList.add("hidden");
  section.classList.remove("hidden");
  if (section === nameInputSection) {
    updatePlayerStatsDisplay();
  }
  if (section === heroSection) {
    mainFooter?.classList.remove("visually-hidden");
    utilityButtonsWrapper?.classList.add("hidden");
  } else {
    mainFooter?.classList.add("visually-hidden");
    utilityButtonsWrapper?.classList.remove("hidden");
  }
};

// Функція для оновлення стану кнопок музики
export const updateMusicButtonState = () => {
  const toggleMusicButton = document.getElementById("toggle-music");
  const toggleMusicFooterButton = document.getElementById("toggle-music-footer");
  const musicIcon = toggleMusicButton?.querySelector("i");
  const musicFooterIcon = toggleMusicFooterButton?.querySelector("i");
  if (isMusicOn) {
    musicIcon?.classList.replace("fa-volume-mute", "fa-volume-up");
    musicFooterIcon?.classList.replace("fa-volume-mute", "fa-volume-up");
  } else {
    musicIcon?.classList.replace("fa-volume-up", "fa-volume-mute");
    musicFooterIcon?.classList.replace("fa-volume-up", "fa-volume-mute");
  }
};

// Функція для оновлення стану кнопок ефектів
export const updateEffectsButtonState = () => {
  const toggleEffectsButton = document.getElementById("toggle-effects");
  const toggleEffectsFooterButton = document.getElementById("toggle-effects-footer");
  const effectsIcon = toggleEffectsButton?.querySelector("i");
  const effectsFooterIcon = toggleEffectsFooterButton?.querySelector("i");
  if (isEffectsOn) {
    effectsIcon?.classList.replace("fa-bell-slash", "fa-bell");
    effectsFooterIcon?.classList.replace("fa-bell-slash", "fa-bell");
  } else {
    effectsIcon?.classList.replace("fa-bell", "fa-bell-slash");
    effectsFooterIcon?.classList.replace("fa-bell", "fa-bell-slash");
  }
};

// Функція для відтворення короткого ефекту
export const playShortEffect = effectSrc => {
  const shortEffect = document.getElementById("short-effect");
  if (isEffectsOn) {
    cacheDynamicFiles([`audio/${effectSrc}`]);
    shortEffect.pause();
    shortEffect.currentTime = 0;
    shortEffect.src = `audio/${effectSrc}`;
    shortEffect.load();
    shortEffect.play().catch(e => e.name !== "AbortError" && console.error(e));
  }
};

// Функція для запуску музики залежно від поточної локації
export const playMusicForCurrentSection = () => {
  const characterSelectionSection = document.getElementById("character-selection");
  const quizSection = document.getElementById("quiz");
  const backgroundMusic = document.getElementById("background-music");
  const crossfadeMusic = newSrc => {
    backgroundMusic.src = newSrc;
    backgroundMusic.load();
    if (isMusicOn) backgroundMusic.play().catch(e => console.error(e));
  };
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

// Оновлює відображення статистики гравців
export const updatePlayerStatsDisplay = () => {
  const playerStatsSection = document.getElementById("player-stats-section");
  const playerStatsContainer = document.getElementById("player-stats-container");
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  try {
    const statsJSON = localStorage.getItem("player-stats");
    const playerStats = statsJSON ? JSON.parse(statsJSON) : {};
    const players = Object.keys(playerStats).map(name => {
      const games = playerStats[name];
      let totalWins = 0;
      let totalLosses = 0;
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
    players.sort((a, b) => {
      if (b.winRatio !== a.winRatio) {
        return b.winRatio - a.winRatio;
      }
      if (b.totalGames !== a.totalGames) {
        return b.totalGames - a.totalGames;
      }
      return b.totalWins - a.totalWins;
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

// Функція для оновлення статусу гравця на екрані вибору персонажа
export const renderPlayerStatus = () => {
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

    const avatarItem = document.createElement("div");
    avatarItem.classList.add("player-avatar-item");

    const avatarCircle = document.createElement("div");
    avatarCircle.classList.add("avatar-circle");

    const avatarImagePath = `images/avatars/${characterAvatarsMap[char.name]}`;
    avatarCircle.style.backgroundImage = `url('${avatarImagePath}')`;

    if (gamesWon > 0 || gamesLost > 0) {
      avatarCircle.classList.add("colored");
    }

    const characterName = document.createElement("p");
    characterName.textContent = char.label;
    characterName.style.color = gamesWon > 0 || gamesLost > 0 ? "#fff" : "gray";

    avatarItem.appendChild(avatarCircle);
    avatarItem.appendChild(characterName);

    // Нова логіка відображення:
    // Якщо є хоч одна перемога, показуємо тільки медаль.
    // Статистика (програші) більше не показується.
    if (gamesWon > 0) {
      const victoryCard = document.createElement("div");
      victoryCard.classList.add("stats-card", "victory-card");
      victoryCard.innerHTML = `<i class="fas fa-medal"></i>`;
      avatarItem.appendChild(victoryCard);
    } else if (gamesLost > 0) {
      // Якщо немає перемог, але є поразки, показуємо картку зі статистикою
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
