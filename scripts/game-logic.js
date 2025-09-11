import { quizData } from "./quiz.js";
import { showResult } from "./result.js";
import { showSection, hideLoader, showLoader } from "./ui-handler.js";
import { cacheDynamicFiles, shuffleArray } from "./utils.js";
import { missionIntros } from "./constants.js";

// Змінні стану гри
export let selectedCharacter = null;
export let correctAnswersCount = 0;
export let currentQuestionIndex = 0;
export let totalQuestions = 0;
export let quizQuestions = [];
export let selectedGender = null;
export let isMusicOn = true;
export let isEffectsOn = true;

// Функція для оновлення стану
export const updateState = newState => {
  if (newState.selectedCharacter !== undefined) selectedCharacter = newState.selectedCharacter;
  if (newState.correctAnswersCount !== undefined)
    correctAnswersCount = newState.correctAnswersCount;
  if (newState.currentQuestionIndex !== undefined)
    currentQuestionIndex = newState.currentQuestionIndex;
  if (newState.totalQuestions !== undefined) totalQuestions = newState.totalQuestions;
  if (newState.quizQuestions !== undefined) quizQuestions = newState.quizQuestions;
  if (newState.selectedGender !== undefined) selectedGender = newState.selectedGender;
  if (newState.isMusicOn !== undefined) isMusicOn = newState.isMusicOn;
  if (newState.isEffectsOn !== undefined) isEffectsOn = newState.isEffectsOn;
};

// Функція для скидання стану
export const resetState = () => {
  selectedCharacter = null;
  correctAnswersCount = 0;
  currentQuestionIndex = 0;
  totalQuestions = 0;
  quizQuestions = [];
};

// Функція для завантаження стану з localStorage
export const loadState = () => {
  const savedGender = localStorage.getItem("playerGender");
  if (savedGender) {
    updateState({ selectedGender: savedGender });
  }
};

// Функція для підготовки та запуску вікторини
export const setupQuiz = async (character, quizContainer) => {
  const playerNameInput = document.getElementById("player-name");
  const missionIntro = document.getElementById("mission-intro");
  const questionsOverlay = document.getElementById("questions-overlay");
  const backgroundMusic = document.getElementById("background-music");
  const characterData = quizData[character];
  questionsOverlay.innerHTML = "";
  if (!characterData || !characterData.image || !characterData.questions) {
    hideLoader();
    Swal.fire({
      title: "Помилка!",
      text: "Дані вікторини не знайдені.",
      icon: "error",
    });
    return;
  }

  const audioSrc = `audio/${
    character === "Єгиптянин"
      ? "egypts.mp3"
      : character === "Грек"
      ? "greeks.mp3"
      : character === "Римлянин"
      ? "romans.mp3"
      : "hebrews.mp3"
  }`;

  // Кешування файлів
  cacheDynamicFiles([characterData.image, audioSrc]);

  try {
    // Завантаження зображення
    const quizImage = new Image();
    quizImage.src = characterData.image;
    await new Promise((resolve, reject) => {
      quizImage.onload = () => resolve();
      quizImage.onerror = () => reject(new Error("Помилка завантаження картинки"));
    });

    // Завантаження аудіо
    backgroundMusic.src = audioSrc;
    backgroundMusic.load();
    if (isMusicOn) {
      backgroundMusic.play().catch(e => {
        if (e.name !== "AbortError") {
          console.error("Помилка відтворення музики:", e);
        }
      });
    }

    // Видалення попереднього зображення, якщо воно є
    const existingQuizImage = quizContainer.querySelector(".quiz-image");
    if (existingQuizImage) existingQuizImage.remove();

    quizImage.classList.add("quiz-image");
    quizContainer.prepend(quizImage);

    // Оновлення стану гри
    updateState({
      quizQuestions: characterData.questions,
      totalQuestions: characterData.questions.length,
      currentQuestionIndex: 0,
      correctAnswersCount: 0,
    });

    // Приховання лоудера після успішного завантаження
    hideLoader();
    missionIntro.innerHTML = missionIntros[selectedCharacter](
      playerNameInput.value.trim(),
      selectedGender
    );
    missionIntro.classList.remove("hidden");
    questionsOverlay.classList.add("hidden");

    document.getElementById("start-mission")?.addEventListener("click", () => {
      missionIntro.classList.add("hidden");
      questionsOverlay.classList.remove("hidden");
      displayQuestion(currentQuestionIndex);
    });
  } catch (err) {
    // Приховання лоудера у разі помилки завантаження
    hideLoader();
    console.error(err);
    Swal.fire({
      title: "Помилка завантаження!",
      text: "Схоже, деякі файли не завантажились. Перевірте шляхи до файлів у коді та спробуйте ще раз.",
      icon: "error",
    });
  }
};

export const displayQuestion = index => {
  const questionsOverlay = document.getElementById("questions-overlay");

  if (questionsOverlay.children.length > 0) {
    questionsOverlay.classList.add("magical-fade-out");

    questionsOverlay.addEventListener(
      "animationend",
      () => {
        questionsOverlay.classList.remove("magical-fade-out");
        renderNewQuestion(index);
      },
      { once: true }
    );
  } else {
    renderNewQuestion(index);
  }
};

export const renderNewQuestion = index => {
  const questionsOverlay = document.getElementById("questions-overlay");

  if (index >= totalQuestions) {
    showSection(document.getElementById("result"));
    const playerNameInput = document.getElementById("player-name");
    showResult(
      selectedCharacter,
      playerNameInput.value,
      correctAnswersCount,
      totalQuestions,
      selectedGender
    );
    return;
  }

  const questionData = quizQuestions[index];
  const questionBlock = document.createElement("div");
  // Тут більше немає анімації для окремого питання
  questionBlock.classList.add("question-block");

  const questionText = document.createElement("h3");
  questionText.textContent = `${index + 1}. ${questionData.question}`;
  questionBlock.appendChild(questionText);

  const originalCorrectIndex = questionData.correct;
  const optionsWithOriginalIndex = questionData.options.map((option, i) => ({
    option,
    originalIndex: i,
  }));
  const shuffledOptions = shuffleArray(optionsWithOriginalIndex);

  shuffledOptions.forEach(item => {
    const btn = document.createElement("button");
    btn.classList.add("quiz-option");
    btn.textContent = item.option;
    btn.dataset.correct = item.originalIndex === originalCorrectIndex;
    btn.addEventListener("click", handleAnswerClick);
    questionBlock.appendChild(btn);
  });

  // Елемент для зворотного зв'язку
  const feedback = document.createElement("p");
  feedback.classList.add("feedback-message");
  questionBlock.appendChild(feedback);

  questionsOverlay.innerHTML = "";
  questionsOverlay.appendChild(questionBlock);

  // Запускаємо анімацію появи для контейнера
  questionsOverlay.classList.add("magical-fade-in");

  questionsOverlay.addEventListener(
    "animationend",
    () => {
      questionsOverlay.classList.remove("magical-fade-in");
    },
    { once: true }
  );
};

const handleAnswerClick = e => {
  const isCorrect = e.target.dataset.correct === "true";

  if (isCorrect) updateState({ correctAnswersCount: correctAnswersCount + 1 });

  // Знаходимо існуючий елемент для зворотного зв'язку
  const feedback = e.target.parentElement.querySelector(".feedback-message");

  // Очищаємо попередній вміст
  feedback.innerHTML = "";

  // Створюємо іконку в залежності від відповіді
  const icon = document.createElement("i");
  if (isCorrect) {
    icon.classList.add("fas", "fa-check", "correct-icon");
  } else {
    icon.classList.add("fas", "fa-times", "incorrect-icon");
  }

  // Вставляємо іконку в елемент зворотного зв'язку
  feedback.appendChild(icon);

  // Показуємо елемент зворотного зв'язку
  feedback.classList.add("show");

  // Відключаємо всі кнопки
  e.target.parentElement.querySelectorAll("button").forEach(b => (b.disabled = true));

  // Просто переходимо до наступного питання з затримкою
  setTimeout(() => {
    updateState({ currentQuestionIndex: currentQuestionIndex + 1 });
    displayQuestion(currentQuestionIndex);
  }, 1000); // 1-секундна затримка для перегляду результату
};
