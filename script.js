let dealerCards = [];
let playerCards = [];
let phase = 1;

// Object to track the counts for each card type (4 per card)
const cardCounts = {
  "2": 4,
  "3": 4,
  "4": 4,
  "5": 4,
  "6": 4,
  "7": 4,
  "8": 4,
  "9": 4,
  "10": 4,
  "J": 4,
  "Q": 4,
  "K": 4,
  "A": 4
};

// Helper to convert card key to numeric value
const getCardNumericValue = (key) => {
  if (key === "A") return 1;
  if (["J", "Q", "K"].includes(key)) return 10;
  return parseInt(key, 10);
};

function getCardsLeft(n) {
  return Object.keys(cardCounts).reduce((total, key) => {
    return total + (getCardNumericValue(key) === n ? cardCounts[key] : 0);
  }, 0);
}

function getCardsLessOrEqual(n) {
  return Object.keys(cardCounts).reduce((total, key) => {
    return total + (getCardNumericValue(key) <= n ? cardCounts[key] : 0);
  }, 0);
}

function getTotalCards() {
  return Object.values(cardCounts).reduce((total, count) => total + count, 0);
}

function getTotalTens() {
  const keys = ["10", "J", "Q", "K"];
  return keys.reduce((total, key) => total + (cardCounts[key] || 0), 0);
}

// Calculate best hand total (Aces as 11 or 1)
function getHandValue(cards) {
  let sum = 0, aces = 0;
  cards.forEach((card) => {
    if (card === "A") {
      sum += 11;
      aces++;
    } else if (["J", "Q", "K"].includes(card)) {
      sum += 10;
    } else {
      sum += Number(card);
    }
  });
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

// Update a DOM element's text
function updateElement(id, value) {
  document.getElementById(id).innerText = value;
}

// Update button colors based on phase and input progress
function updateButtonColors() {
  const buttons = document.querySelectorAll('.card-button');
  if (phase === 2) {
    // Dealer's turn, all buttons red
    buttons.forEach(button => {
      button.style.backgroundColor = "#ff353d";
    });
  } else {
    // Phase 1
    if (dealerCards.length < 2) {
      // Still dealing dealer's cards
      buttons.forEach(button => {
        button.style.backgroundColor = "#ff353d";
      });
    } else {
      // Player's turn to input cards
      buttons.forEach(button => {
        button.style.backgroundColor = "#01b202";
      });
    }
  }
}

function addCard(value, label = value) {
  if (phase === 1) {
    // Phase 1 logic
    if (dealerCards.length < 2) {
      // Add dealer's fixed cards
      dealerCards.push(value);
      const slot = document.getElementById(`dealer-card-${dealerCards.length}`);
      slot.innerText = label;
      slot.classList.remove('empty');
      slot.classList.add('filled');
    } else {
      // Player's cards in Phase 1
      playerCards.push(value);
      if (playerCards.length <= 2) {
        // Fill the fixed slots for the first 2 player cards
        const slot = document.getElementById(`player-card-${playerCards.length}`);
        slot.innerText = label;
        slot.classList.remove('empty');
        slot.classList.add('filled');
      } else {
        // Additional hits: create a new card element
        const playerContainer = document.getElementById("player-cards");
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card", "filled");  // .filled for white bg, bigger font, thicker border
        cardDiv.innerText = label;
        playerContainer.appendChild(cardDiv);
      }
    }
  } else if (phase === 2) {
    // During dealer's turn, extra hits for the dealer
    dealerCards.push(value);
    const dealerContainer = document.getElementById("dealer-cards");
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "filled");
    cardDiv.innerText = label;
    dealerContainer.appendChild(cardDiv);
  }
  updateProbabilities();
  updateButtonColors();
}

function updateProbabilities() {
  const dealerTotal = getHandValue(dealerCards);
  const playerTotal = getHandValue(playerCards);
  const remaining = 21 - playerTotal;
  const cardsRemaining = getTotalCards();
  const tensRemaining = getTotalTens();
  const safeRemaining = getCardsLessOrEqual(remaining);
  const winRemaining = getCardsLeft(remaining);

  updateElement("dealer-total", dealerTotal);
  updateElement("player-total", playerTotal);

  if (cardsRemaining === 0) return;

  const safeDraw = (safeRemaining / cardsRemaining) * 100;
  const bust = 100 - safeDraw;
  const draw10 = (tensRemaining / cardsRemaining) * 100;
  const hit21 = (winRemaining / cardsRemaining) * 100;

  updateElement("safe-draw", safeDraw.toFixed(2) + "%");
  updateElement("bust", bust.toFixed(2) + "%");
  updateElement("draw-10", draw10.toFixed(2) + "%");
  updateElement("hit-21", hit21.toFixed(2) + "%");
  
  if (playerTotal === 21) {
    showPhaseMessage("Perfect 21!", "#1aff1a");
  } else if (playerTotal > 21) {
    showPhaseMessage("BUST! :(", "#ff0000");
  }
}

function showPhaseMessage(message, color) {
  const msgEl = document.getElementById("phase-message");
  msgEl.innerText = message;
  msgEl.style.color = color;
  msgEl.style.opacity = "1";
  setTimeout(() => {
    msgEl.style.opacity = "0";
  }, 2000);
}

function nextPhase() {
  // Ensure at least 2 dealer cards and 2 player cards first
  if (dealerCards.length < 2 || playerCards.length < 2) {
    showPhaseMessage("Click the cards", "#000000");
    return;
  }

  // Calculate totals to see if we should skip the dealer's turn
  const dealerTotal = getHandValue(dealerCards);
  const playerTotal = getHandValue(playerCards);

  // If either side has 21 or is busted (>=21), skip directly to new round
  if (dealerTotal >= 21 || playerTotal >= 21) {
    showPhaseMessage("Next Round", "#00b300");
    // Immediately reset to Phase 1
    phase = 1;
    dealerCards = [];
    playerCards = [];
    // Reset the first 2 card slots to "?"
    document.querySelectorAll(".card").forEach(el => el.innerText = "?");
    
    // Remove extra appended cards from containers
    const dealerContainer = document.getElementById("dealer-cards");
    while (dealerContainer.children.length > 2) {
      dealerContainer.removeChild(dealerContainer.lastElementChild);
    }
    const playerContainer = document.getElementById("player-cards");
    while (playerContainer.children.length > 2) {
      playerContainer.removeChild(playerContainer.lastElementChild);
    }

  for (let i = 0; i < dealerContainer.children.length; i++) {
    dealerContainer.children[i].innerText = "?";
    dealerContainer.children[i].classList.remove('filled');
    dealerContainer.children[i].classList.add('empty');
  }
  for (let i = 0; i < playerContainer.children.length; i++) {
    playerContainer.children[i].innerText = "?";
    playerContainer.children[i].classList.remove('filled');
    playerContainer.children[i].classList.add('empty');
  }

  } else {
    // Otherwise, proceed with normal phase toggle
    phase = (phase === 1) ? 2 : 1;
    if (phase === 2) {
      showPhaseMessage("Dealer's Turn", "#ff0000");
    } else {
      showPhaseMessage("Next Round", "#00b300");
      dealerCards = [];
      playerCards = [];
      // Reset the first 2 card slots to "?"
      document.querySelectorAll(".card").forEach(el => el.innerText = "?");
      
      // Remove extra appended cards from containers
      const dealerContainer = document.getElementById("dealer-cards");
      while (dealerContainer.children.length > 2) {
        dealerContainer.removeChild(dealerContainer.lastElementChild);
      }
      const playerContainer = document.getElementById("player-cards");
      while (playerContainer.children.length > 2) {
        playerContainer.removeChild(playerContainer.lastElementChild);
      }
        for (let i = 0; i < dealerContainer.children.length; i++) {
    dealerContainer.children[i].innerText = "?";
    dealerContainer.children[i].classList.remove('filled');
    dealerContainer.children[i].classList.add('empty');
  }
  for (let i = 0; i < playerContainer.children.length; i++) {
    playerContainer.children[i].innerText = "?";
    playerContainer.children[i].classList.remove('filled');
    playerContainer.children[i].classList.add('empty');
  }
    }
  }
  updateButtonColors();
  updateProbabilities();
}


function resetGame() {
  dealerCards = [];
  playerCards = [];
  phase = 1;

  // Reset the first 2 Dealer card slots
  const dealerCard1 = document.getElementById('dealer-card-1');
  dealerCard1.innerText = '?';
  dealerCard1.classList.remove('filled');
  dealerCard1.classList.add('empty');

  const dealerCard2 = document.getElementById('dealer-card-2');
  dealerCard2.innerText = '?';
  dealerCard2.classList.remove('filled');
  dealerCard2.classList.add('empty');

  // Reset the first 2 Player card slots
  const playerCard1 = document.getElementById('player-card-1');
  playerCard1.innerText = '?';
  playerCard1.classList.remove('filled');
  playerCard1.classList.add('empty');

  const playerCard2 = document.getElementById('player-card-2');
  playerCard2.innerText = '?';
  playerCard2.classList.remove('filled');
  playerCard2.classList.add('empty');

  // Remove extra appended cards
  const dealerContainer = document.getElementById("dealer-cards");
  while (dealerContainer.children.length > 2) {
    dealerContainer.removeChild(dealerContainer.lastElementChild);
  }
  const playerContainer = document.getElementById("player-cards");
  while (playerContainer.children.length > 2) {
    playerContainer.removeChild(playerContainer.lastElementChild);
  }

  // Also reset their innerText to "?"
  for (let i = 0; i < dealerContainer.children.length; i++) {
    dealerContainer.children[i].innerText = "?";
    dealerContainer.children[i].classList.remove('filled');
    dealerContainer.children[i].classList.add('empty');
  }
  for (let i = 0; i < playerContainer.children.length; i++) {
    playerContainer.children[i].innerText = "?";
    playerContainer.children[i].classList.remove('filled');
    playerContainer.children[i].classList.add('empty');
  }

  resetMiniCards();
  updateButtonColors();
  updateProbabilities();
}

function resetMiniCards() {
  // Refill the deck counts
  for (let label in cardCounts) {
    cardCounts[label] = 4;
    // Refill the mini-card containers
    const container = document.getElementById(`mini-card-${label}`);
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < 4; i++) {
        const span = document.createElement("span");
        span.classList.add("mini-card");
        container.appendChild(span);
      }
    }
  }
}

function handleCardPress(value, label) {
  if (cardCounts[label] > 0) {
    cardCounts[label]--;
    updateMiniCards(label);
    addCard(value, label);
  } else {
    alert(`No ${label}s left in the deck!`);
  }
}

function updateMiniCards(label) {
  const container = document.getElementById(`mini-card-${label}`);
  if (container) {
    while (container.children.length > cardCounts[label]) {
      container.removeChild(container.lastElementChild);
    }
  }
}