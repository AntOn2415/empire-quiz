export const showResult = (selectedCharacter, playerName, correctAnswers, totalQuestions) => {
  const resultSection = document.getElementById("result");
  const resultMessage = document.getElementById("result-message");
  const resultVideo = document.getElementById("result-video");

  const percentage = (correctAnswers / totalQuestions) * 100;
  let message = "";
  let videoSrc = "";

  // Словник для перетворення українських назв на англійські/латинські для назв файлів
  const characterNames = {
    Єгиптянин: "egypt",
    Грек: "greek",
    Римлянин: "roman",
    Єврей: "hebrew",
  };

  const characterBaseName = characterNames[selectedCharacter];

  // Якщо ім'я персонажа не знайдено, використовуємо значення за замовчуванням
  if (!characterBaseName) {
    console.error("Невідомий персонаж:", selectedCharacter);
    characterBaseName = "default";
  }

  // Визначення відео та повідомлення за відсотком правильних відповідей
  if (percentage >= 70) {
    message = `Вітаємо, ${playerName}! Ти успішно пройшов випробування імперії ${selectedCharacter}! 
               Ти відповів правильно на ${correctAnswers} з ${totalQuestions} питань.`;
    videoSrc = `videos/${characterBaseName}Happy.mp4`;
  } else {
    message = `На жаль, ${playerName}, цього разу тобі не вдалося підкорити імперію ${selectedCharacter}.
               Ти відповів правильно на ${correctAnswers} з ${totalQuestions} питань. Спробуй ще раз!`;
    videoSrc = `videos/${characterBaseName}Angry.mp4`;
  }

  resultMessage.textContent = message;

  // Очищаємо попередні джерела відео
  resultVideo.innerHTML = "";

  // Додаємо нове джерело відео
  const videoSource = document.createElement("source");
  videoSource.src = videoSrc;
  videoSource.type = "video/mp4";
  resultVideo.appendChild(videoSource);

  resultVideo.load();
  resultVideo.play();

  resultSection.classList.remove("hidden");
};
