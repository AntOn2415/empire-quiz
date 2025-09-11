// scripts/constants.js
// Змінні для керування станом гри
export let selectedCharacter = null;
export let correctAnswersCount = 0;
export let currentQuestionIndex = 0;
export let totalQuestions = 0;
export let quizQuestions = [];
export let selectedGender = null;
export let isMusicOn = true;
export let isEffectsOn = true;

// Мапи персонажів
export const characterNamesMap = {
  Єгиптянин: "egypt",
  Грек: "greek",
  Римлянин: "roman",
  Єврей: "hebrew",
};

export const characterEffectsMap = {
  Єгиптянин: "egypt-short.mp3",
  Грек: "greeks-short.mp3",
  Римлянин: "romans-short.mp3",
  Єврей: "hebrews-short.mp3",
};

export const characterColorsMap = {
  Єгиптянин: "#d4ac0d",
  Грек: "#5d6d7e",
  Римлянин: "#c0392b",
  Єврей: "#2e86c1",
};

export const characterAvatarsMap = {
  Єгиптянин: "egypt.png",
  Грек: "greek.png",
  Римлянин: "roman.png",
  Єврей: "hebrew.png",
};

// Текст вступу до місій
export const missionIntros = {
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
