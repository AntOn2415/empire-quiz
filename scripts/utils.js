// Функція для перемішування масиву (алгоритм Фішера-Єйтса)
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Функція для кешування файлів
export const cacheDynamicFiles = async urls => {
  const cacheName = "empire-quiz-dynamic-v1";
  try {
    const cache = await caches.open(cacheName);
    const requests = urls.map(url => {
      const request = new Request(url);
      return cache.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          cache.put(request, response.clone());
          return response;
        });
      });
    });
    await Promise.all(requests);
  } catch (err) {
    console.error("Помилка при кешуванні файлів:", err);
  }
};

// Виправлена функція для очищення імені гравця
export const sanitizePlayerName = name => {
  if (typeof name !== "string") {
    return "";
  }
  // 1. Видаляємо пробіли на початку і в кінці
  const trimmedName = name.trim();
  // 2. Замінюємо будь-яку кількість пробілів всередині на один
  return trimmedName.replace(/\s+/g, " ");
};
