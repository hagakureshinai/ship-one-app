document.addEventListener('DOMContentLoaded', () => {

  let currentDate = new Date();

  function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // ← +1しない！

  const title = document.getElementById('current-month');
  title.textContent = `${year}年 ${month + 1}月`;

  generateCalendar(year, month); // ← ★ここで呼ぶ
  }

  function generateCalendar(year, month) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const doneDays = getDoneDays(year, month);

  let row = document.createElement("tr");

  for (let i = 0; i < firstDay.getDay(); i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let date = 1; date <= lastDate; date++) {
    const cell = document.createElement("td");
    cell.textContent = date;
    cell.classList.add("day");

    if (doneDays.includes(date)) {
      cell.classList.add("done");
    }

    cell.addEventListener("click", () => {
      cell.classList.toggle("done");

      let updated = getDoneDays(year, month);
      if (updated.includes(date)) {
        updated = updated.filter(d => d !== date);
      } else {
        updated.push(date);
      }
      saveDoneDays(year, month, updated);
    });

    row.appendChild(cell);

    if ((firstDay.getDay() + date) % 7 === 0) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }
  }

  tbody.appendChild(row);
  }

  document.getElementById('prev').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMonth();
  });

  document.getElementById('next').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderMonth();
  });

  function getStorageKey(year, month) {
  return `doneDays-${year}-${month}`;
  }

  function getDoneDays(year, month) {
    const data = localStorage.getItem(getStorageKey(year, month));
    return data ? JSON.parse(data) : [];
  }

  function saveDoneDays(year, month, days) {
    localStorage.setItem(
      getStorageKey(year, month),
      JSON.stringify(days)
    );
  }

  renderMonth();

});
