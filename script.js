document.addEventListener('DOMContentLoaded', () => {

  function getDoneDays() {
    const data = localStorage.getItem('doneDays');
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }

function saveDoneDays(days) {
  localStorage.setItem('doneDays', JSON.stringify(days));
}

  const days = document.querySelectorAll('.day');
  const doneDays = getDoneDays();

  days.forEach(day => {
    if (doneDays.includes(day.textContent)) {
      day.classList.add('done');
    }
  });

  days.forEach(day => {
    day.addEventListener('click', () => {
      day.classList.toggle('done');

      const dayNumber = day.textContent;
      let doneDays = getDoneDays();

      if (doneDays.includes(dayNumber)) {
        doneDays = doneDays.filter(d => d !== dayNumber);
      } else {
        doneDays.push(dayNumber);
      }

      saveDoneDays(doneDays);
    });

  });
});
