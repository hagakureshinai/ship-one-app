const days = document.querySelectorAll('.day');

days.forEach(day => {
  day.addEventListener('click', () => {
    console.log('クリックされた日:', day.textContent);
  });
});
