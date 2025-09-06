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

  // Виправлені змінні для граматично правильних звернень
  const genderedDid = selectedGender === "male" ? "здобув" : "здобула"; // Здобув/здобула
  const genderedConqueror = selectedGender === "male" ? "підкорив" : "підкорила"; // Підкорив/підкорила
  const genderedWorthy = selectedGender === "male" ? "гідний" : "гідна"; // Гідний/гідна
  const genderedPassed = selectedGender === "male" ? "пройшов" : "пройшла"; // Пройшов/пройшла
  const genderedProved = selectedGender === "male" ? "довів" : "довела"; // Довів/довела
  const genderedReached = selectedGender === "male" ? "досяг" : "досягла"; // Досяг/досягла
  const genderedShowed = selectedGender === "male" ? "показав" : "показала"; // Показав/показала
  const genderedNeeded = selectedGender === "male" ? "потрібен" : "потрібна"; // Потрібен/потрібна

  // Словник для перетворення українських назв на англійські/латинські для назв файлів
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

  // Визначення повідомлення та відео за відсотком правильних відповідей
  const getMessageText = isFirstRun => {
    const messages1 = {
      success: {
        Єгиптянин: `**${playerName}**, мудрість фараонів відкрилась тобі. Ти ${genderedDid} перемогу, відповівши правильно на **${correctAnswers} з ${totalQuestions}** питань про спадщину Єгипту.`,
        Грек: `**${playerName}**, ти ${genderedProved} свою мудрість, ${genderedWorthy} Афін! Ти ${genderedDid} перемогу, відповівши правильно на **${correctAnswers} з ${totalQuestions}** питань про спадщину Еллади.`,
        Римлянин: `**${playerName}**, ти ${genderedConqueror} Вічне Місто! Твоя мудрість ${genderedWorthy} слави, адже ти відповів правильно на **${correctAnswers} з ${totalQuestions}** питань.`,
        Єврей: `**${playerName}**, ти ${genderedShowed} свою відданість та знання, здобувши перемогу! Ти відповів правильно на **${correctAnswers} з ${totalQuestions}** питань.`,
      },
      failure: {
        Єгиптянин: `На жаль, **${playerName}**, цей шлях не привів до слави фараонів. Твоя подорож завершується тут, з результатом **${correctAnswers} з ${totalQuestions}** правильних відповідей.`,
        Грек: `На жаль, **${playerName}**, ти не ${genderedReached} величі Агори. Твоя подорож завершується тут, з результатом **${correctAnswers} з ${totalQuestions}** правильних відповідей.`,
        Римлянин: `На жаль, **${playerName}**, цього разу твоя воля не була достатньо сильною. Твоя подорож завершується тут, з результатом **${correctAnswers} з ${totalQuestions}** правильних відповідей.`,
        Єврей: `На жаль, **${playerName}**, для цієї подорожі ${genderedNeeded} більша мудрість. Твоя подорож завершується тут, з результатом **${correctAnswers} з ${totalQuestions}** правильних відповідей.`,
      },
    };

    const messages2 = {
      success: {
        Єгиптянин: `Вітаємо, **${playerName}**! Ти знову ${genderedProved} свою мудрість і ${genderedPassed} випробування Єгипту.`,
        Грек: `Вітаємо, **${playerName}**! Твоя мудрість, як і раніше, ${genderedWorthy} героїв Еллади.`,
        Римлянин: `Ave, **${playerName}**! Ти знову ${genderedConqueror} випробування Риму і ${genderedDid} нову славу.`,
        Єврей: `Шалом, **${playerName}**! Ти вкотре ${genderedProved} свою мудрість та знання.`,
      },
      failure: {
        Єгиптянин: `На жаль, **${playerName}**, навіть після повторної спроби, загадки Нілу залишилися нерозгаданими.`,
        Грек: `На жаль, **${playerName}**, і вдруге тобі не ${genderedReached} пройти випробування стародавньої Греції.`,
        Римлянин: `На жаль, **${playerName}**, завоювання Риму не вдалося і вдруге.`,
        Єврей: `На жаль, **${playerName}**, ця спроба не принесла бажаного результату.`,
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

  if (percentage >= 80) {
    videoSrc = `videos/${characterBaseName}Happy.mp4`;
  } else {
    videoSrc = `videos/${characterBaseName}Angry.mp4`;
  }

  resultVideo.src = videoSrc;
  resultVideo.load();
  resultVideo.play();

  resultMessageElement.innerHTML = messageText;
};
