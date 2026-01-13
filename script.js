document.addEventListener('DOMContentLoaded', () => {
  const days = document.querySelectorAll('.day');

  days.forEach(day => {
    day.addEventListener('click', () => {
      day.classList.toggle('done');
      console.log('ぽん:', day.textContent);
    });
  });
});
