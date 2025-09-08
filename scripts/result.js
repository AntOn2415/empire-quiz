import { showLoader, hideLoader } from "../script.js";

// Створюємо об'єкт для зберігання стану, чи була вже зіграна вікторина для кожної нації
const playedCharacters = {};

export const showResult = (
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
  let messageText = "";
  let videoSrc = "";

  const isFirstRun = !playedCharacters[selectedCharacter];

  const genderedDid = selectedGender === "male" ? "здобув" : "здобула";
  const genderedConqueror = selectedGender === "male" ? "підкорив" : "підкорила";
  const genderedWorthy = selectedGender === "male" ? "гідний" : "гідна";
  const genderedPassed = selectedGender === "male" ? "пройшов" : "пройшла";
  const genderedProved = selectedGender === "male" ? "довів" : "довела";
  const genderedReached = selectedGender === "male" ? "досяг" : "досягла";
  const genderedShowed = selectedGender === "male" ? "показав" : "показала";
  const genderedNeeded = selectedGender === "male" ? "потрібен" : "потрібна";
  const genderedAnswered = selectedGender === "male" ? "відповів" : "відповіла";

  const characterNames = {
    Єгиптянин: "egypt",
    Грек: "greek",
    Римлянин: "roman",
    Єврей: "hebrew",
  };

  const characterBaseName = characterNames[selectedCharacter];

  if (!characterBaseName) {
    console.error("Невідомий персонаж:", selectedCharacter);
    characterBaseName = "default";
  }

  const getMessageText = isFirstRun => {
    const messages1 = {
      success: {
        Єгиптянин: `<span class="player-name">${playerName}</span>, мудрість пірамід відкрилась тобі! Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
        Грек: `<span class="player-name">${playerName}</span>, твій розум гідний справжнього героя! Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
        Римлянин: `<span class="player-name">${playerName}</span>, твоя наполегливість підкорила випробування! Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
        Єврей: `<span class="player-name">${playerName}</span>, твоє прагнення до знань довело свою силу! Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
      },
      failure: {
        Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, цей шлях ще попереду. Але твоє прагнення до знань гідне похвали!`,
        Грек: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedReached} величі. Проте твоє прагнення до знань гідне похвали!`,
        Римлянин: `На жаль, <span class="player-name">${playerName}</span>, не всі дороги ведуть до перемоги. Проте твоє прагнення до знань гідне похвали!`,
        Єврей: `На жаль, <span class="player-name">${playerName}</span>, твої знання ще не повністю довели свою силу. Але попереду ще багато сторінок історії, які чекають на тебе!`,
      },
    };

    const messages2 = {
      success: {
        Єгиптянин: `Вітаємо, <span class="player-name">${playerName}</span>! Ти знову ${genderedProved} свою мудрість і ${genderedPassed} випробування Єгипту.`,
        Грек: `Вітаємо, <span class="player-name">${playerName}</span>! Твоя мудрість, як і раніше, гідна героїв Еллади.`,
        Римлянин: `Ave, <span class="player-name">${playerName}</span>! Ти знову ${genderedConqueror} випробування Риму і ${genderedDid} нову перемогу.`,
        Єврей: `Шалом, <span class="player-name">${playerName}</span>! Ти вкотре ${genderedProved} свою мудрість та знання.`,
      },
      failure: {
        Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, навіть після повторної спроби, загадки Нілу залишилися нерозгаданими.`,
        Грек: `На жаль, <span class="player-name">${playerName}</span>, і вдруге тобі не вдалось пройти випробування стародавньої Греції.`,
        Римлянин: `На жаль, <span class="player-name">${playerName}</span>, завоювання Риму не вдалося і вдруге.`,
        Єврей: `На жаль, <span class="player-name">${playerName}</span>, ця спроба не принесла бажаного результату.`,
      },
    };

    if (percentage >= 80) {
      if (!isFirstRun) {
        return messages2.success[selectedCharacter];
      }
      return messages1.success[selectedCharacter];
    } else {
      if (!isFirstRun) {
        return messages2.failure[selectedCharacter];
      }
      return messages1.failure[selectedCharacter];
    }
  };

  messageText = getMessageText(isFirstRun);

  if (isFirstRun) {
    playedCharacters[selectedCharacter] = true;
  }

  showLoader();

  if (percentage >= 80) {
    videoSrc = `videos/${characterBaseName}Happy.mp4`;
  } else {
    videoSrc = `videos/${characterBaseName}Angry.mp4`;
  }

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
    () => {
      console.error("Помилка завантаження відео.");
      hideLoader();
    },
    { once: true }
  );

  resultMessageElement.innerHTML = messageText;
};
