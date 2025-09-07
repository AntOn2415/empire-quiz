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
        Єгиптянин: `<span class="player-name">${playerName}</span>, мудрість фараонів відкрилась тобі. Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань про спадщину Єгипту.`,
        Грек: `<span class="player-name">${playerName}</span>, ти ${genderedProved} свою мудрість, ${genderedWorthy} Афін! Ти ${genderedDid} перемогу, ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань про спадщину Еллади.`,
        Римлянин: `<span class="player-name">${playerName}</span>, ти ${genderedConqueror} Вічне Місто! Твоя мудрість ${genderedWorthy} слави, адже ти ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
        Єврей: `<span class="player-name">${playerName}</span>, ти ${genderedShowed} свою відданість та знання, здобувши перемогу! Ти ${genderedAnswered} правильно на ${correctAnswers} з ${totalQuestions} питань.`,
      },
      failure: {
        Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, цей шлях не привів до слави фараонів. Твоя подорож завершується тут, з результатом ${correctAnswers} з ${totalQuestions} правильних відповідей.`,
        Грек: `На жаль, <span class="player-name">${playerName}</span>, ти не ${genderedReached} величі Агори. Твоя подорож завершується тут, з результатом ${correctAnswers} з ${totalQuestions} правильних відповідей.`,
        Римлянин: `На жаль, <span class="player-name">${playerName}</span>, не всі дороги ведуть до перемоги. Проте твоє прагнення до знань достойне похвали! Твоя подорож завершується тут, з результатом ${correctAnswers} з ${totalQuestions} правильних відповідей.`,
        Єврей: `На жаль, <span class="player-name">${playerName}</span>, твої знання ще не повністю ${genderedProved} свою силу. Але попереду ще багато сторінок історії, які чекають на тебе! Твоя подорож завершується тут, з результатом ${correctAnswers} з ${totalQuestions} правильних відповідей.`,
      },
    };

    const messages2 = {
      success: {
        Єгиптянин: `Вітаємо, <span class="player-name">${playerName}</span>! Ти знову ${genderedProved} свою мудрість і ${genderedPassed} випробування Єгипту.`,
        Грек: `Вітаємо, <span class="player-name">${playerName}</span>! Твоя мудрість, як і раніше, ${genderedWorthy} героїв Еллади.`,
        Римлянин: `Ave, <span class="player-name">${playerName}</span>! Ти знову ${genderedConqueror} випробування Риму і ${genderedDid} нову славу.`,
        Єврей: `Шалом, <span class="player-name">${playerName}</span>! Ти вкотре ${genderedProved} свою мудрість та знання.`,
      },
      failure: {
        Єгиптянин: `На жаль, <span class="player-name">${playerName}</span>, навіть після повторної спроби, загадки Нілу залишилися нерозгаданими.`,
        Грек: `На жаль, <span class="player-name">${playerName}</span>, і вдруге тобі не ${genderedReached} пройти випробування стародавньої Греції.`,
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

  // 💡 Тут починається логіка для лоудера
  showLoader(); // Показуємо лоудер

  if (percentage >= 80) {
    videoSrc = `videos/${characterBaseName}Happy.mp4`;
  } else {
    videoSrc = `videos/${characterBaseName}Angry.mp4`;
  }

  resultVideo.src = videoSrc;
  resultVideo.load();

  // Додаємо обробник події, щоб приховати лоудер, коли відео готове до відтворення
  resultVideo.addEventListener(
    "loadeddata",
    () => {
      hideLoader(); // Приховуємо лоудер
      resultVideo.play();
    },
    { once: true }
  ); // Важливо: { once: true } щоб уникнути багаторазового спрацювання

  // Додаємо обробку помилки, якщо відео не завантажилося
  resultVideo.addEventListener(
    "error",
    () => {
      console.error("Помилка завантаження відео.");
      hideLoader(); // Все одно приховуємо лоудер, щоб не "зависав"
    },
    { once: true }
  );

  resultMessageElement.innerHTML = messageText;
};
