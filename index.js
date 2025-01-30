let balance = 1000; // solde initial
let timeLeft = 60; // 60 secondes pour jouer
let level = 1; // niveau de difficulté
let gameOver = false;
let bonus = "Aucun"; // bonus actuel
let advice = false; // Indicateur si le joueur a acheté un conseil
let stocks = {}; // Portfolio : clés = nom de l'action, valeur = quantité détenue
let market = [
  { name: 'Tesla', price: 200, volatility: 0.1 },
  { name: 'Apple', price: 150, volatility: 0.05 },
  { name: 'Amazon', price: 180, volatility: 0.07 },
]; // Actions disponibles dans le marché

let missions = [
  { task: 'Acheter 10 actions de Tesla', completed: false, reward: 100 },
  { task: 'Vendre toutes tes actions avant qu’elles ne chutent', completed: false, reward: 150 },
  { task: 'Avoir un solde supérieur à 2000€', completed: false, reward: 200 }
]; // Missions à accomplir

const balanceDisplay = document.getElementById('balance');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');
const messageDisplay = document.getElementById('message');
const priceHistory = document.getElementById('priceHistory');
const portfolioDisplay = document.getElementById('portfolio');
const bonusDisplay = document.getElementById('bonus');
const buyAdviceBtn = document.getElementById('buyAdviceBtn');
const saveGameBtn = document.getElementById('saveGameBtn');
const loadGameBtn = document.getElementById('loadGameBtn');
const missionsDisplay = document.getElementById('missions');

// Fonction de mise à jour de l'interface
function updateDisplay() {
  balanceDisplay.innerText = balance + '€';
  timerDisplay.innerText = timeLeft + 's';
  levelDisplay.innerText = level;
  bonusDisplay.innerText = bonus;

  // Affichage du portfolio
  portfolioDisplay.innerHTML = '';
  for (let stock in stocks) {
    let li = document.createElement('li');
    li.innerText = `${stock} : ${stocks[stock]} actions`;
    portfolioDisplay.appendChild(li);
  }

  // Affichage des missions
  missionsDisplay.innerHTML = '';
  missions.forEach((mission, index) => {
    let missionDiv = document.createElement('div');
    missionDiv.innerText = mission.completed ? `✔️ ${mission.task} (Complété)` : mission.task;
    if (!mission.completed) {
      let button = document.createElement('button');
      button.innerText = 'Compléter';
      button.onclick = () => completeMission(index);
      missionDiv.appendChild(button);
    }
    missionsDisplay.appendChild(missionDiv);
  });

  // Vérifier si le jeu est terminé
  if (balance <= 0 || timeLeft <= 0) {
    gameOver = true;
    messageDisplay.innerText = balance <= 0 ? "Jeu terminé ! Tu as perdu, ton solde est épuisé." : "Jeu terminé ! Le temps est écoulé.";

    // Enregistrer le score
    const scoreRow = document.createElement('tr');
    const nameCell = document.createElement('td');
    const scoreCell = document.createElement('td');
    
    nameCell.innerText = "Joueur";
    scoreCell.innerText = balance + "€";
    
    scoreRow.appendChild(nameCell);
    scoreRow.appendChild(scoreCell);
    scoreTable.appendChild(scoreRow);
  }
}

// Compléter une mission
function completeMission(index) {
  let mission = missions[index];
  
  if (mission.task === 'Acheter 10 actions de Tesla' && stocks['Tesla'] >= 10) {
    mission.completed = true;
    balance += mission.reward;
    messageDisplay.innerText = `Mission complétée : ${mission.task}. Récompense reçue : ${mission.reward}€`;
    updateDisplay();
  } else if (mission.task === 'Vendre toutes tes actions avant qu’elles ne chutent' && !gameOver) {
    mission.completed = true;
    balance += mission.reward;
    messageDisplay.innerText = `Mission complétée : ${mission.task}. Récompense reçue : ${mission.reward}€`;
    updateDisplay();
  } else if (mission.task === 'Avoir un solde supérieur à 2000€' && balance >= 2000) {
    mission.completed = true;
    balance += mission.reward;
    messageDisplay.innerText = `Mission complétée : ${mission.task}. Récompense reçue : ${mission.reward}€`;
    updateDisplay();
  }
}

// Sauvegarder la partie
saveGameBtn.addEventListener('click', () => {
  const gameData = {
    balance,
    timeLeft,
    level,
    stocks,
    missions,
  };
  localStorage.setItem('gameData', JSON.stringify(gameData));
  messageDisplay.innerText = "Jeu sauvegardé !";
});

// Charger la partie
loadGameBtn.addEventListener('click', () => {
  const savedGame = localStorage.getItem('gameData');
  if (savedGame) {
    const gameData = JSON.parse(savedGame);
    balance = gameData.balance;
    timeLeft = gameData.timeLeft;
    level = gameData.level;
    stocks = gameData.stocks;
    missions = gameData.missions;
    updateDisplay();
    messageDisplay.innerText = "Jeu chargé !";
  } else {
    messageDisplay.innerText = "Aucune sauvegarde trouvée.";
  }
});

// Mettre à jour les prix des actions sur le marché
function fluctuateMarket() {
  if (gameOver) return;

  market.forEach(stock => {
    let fluctuation = (Math.random() * 2 - 1) * stock.volatility; // Fluctuation aléatoire
    stock.price = Math.max(10, stock.price + Math.floor(stock.price * fluctuation)); // Assurer que le prix ne devient pas négatif
  });

  // Mettre à jour l'affichage du marché
  let marketDiv = document.getElementById('market');
  marketDiv.innerHTML = ''; // Vider avant de remplir
  market.forEach(stock => {
    let stockDiv = document.createElement('div');
    stockDiv.innerHTML = `${stock.name}: ${stock.price}€`;
    let buyBtn = document.createElement('button');
    buyBtn.innerText = 'Acheter';
    buyBtn.onclick = () => buyStock(stock);
    stockDiv.appendChild(buyBtn);
    marketDiv.appendChild(stockDiv);
  });

  // Mettre à jour l'historique des prix
  updatePriceHistory();
}

// Acheter des actions
function buyStock(stock) {
  if (gameOver) return;

  let quantity = Math.floor(balance / stock.price); // Combien d'actions tu peux acheter
  if (quantity > 0) {
    balance -= quantity * stock.price;
    if (!stocks[stock.name]) stocks[stock.name] = 0;
    stocks[stock.name] += quantity;

    messageDisplay.innerText = `Tu as acheté ${quantity} actions de ${stock.name}.`;
    updateDisplay();
  } else {
    messageDisplay.innerText = "Fonds insuffisants pour acheter.";
  }
}

// Fonction d'historique des prix
let priceHistoryData = {
  labels: [],
  datasets: market.map(stock => ({
    label: stock.name,
    data: [],
    borderColor: getRandomColor(),
    borderWidth: 2,
    fill: false,
  }))
};

const priceHistoryChart = new Chart(document.getElementById('priceHistoryChart'), {
  type: 'line',
  data: priceHistoryData,
  options: {
    responsive: true,
    scales: {
      x: { type: 'linear', position: 'bottom' },
      y: { beginAtZero: true },
    }
  }
});

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function updatePriceHistory() {
  market.forEach((stock, index) => {
    priceHistoryData.labels.push(timeLeft);
    priceHistoryData.datasets[index].data.push(stock.price);
    let li = document.createElement('li');
    li.innerText = `${stock.name}: ${stock.price}€ à ${timeLeft}s`;
    priceHistory.appendChild(li);

    if (priceHistoryData.labels.length > 50) {
      priceHistoryData.labels.shift();
      priceHistoryData.datasets[index].data.shift();
    }
  });

  priceHistoryChart.update();
}

// Fonction de lancement du jeu
function startGame() {
  setInterval(() => {
    if (!gameOver) {
      timeLeft--;
      fluctuateMarket();
      updateDisplay();
    }
  }, 1000);
}

startGame();
