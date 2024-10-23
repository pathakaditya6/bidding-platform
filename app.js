const loginSection = document.getElementById('login-section');
const sellerSection = document.getElementById('seller-section');
const bidderSection = document.getElementById('bidder-section');
const sellerAuctionsDiv = document.getElementById('seller-auctions');
const activeAuctionsDiv = document.getElementById('active-auctions');
const bidHistoryDiv = document.getElementById('bid-history');

let auctions = [];
let bidTimeouts = {};

function loginAs(role) {
  loginSection.classList.add('hidden');
  if (role === 'seller') {
    sellerSection.classList.remove('hidden');
  } else if (role === 'bidder') {
    bidderSection.classList.remove('hidden');
    loadActiveAuctions();
  }
}

// Seller: Create new auction
document.getElementById('auction-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const itemName = document.getElementById('item-name').value;
  const itemDescription = document.getElementById('item-description').value;
  const itemPrice = document.getElementById('item-price').value;

  const auction = {
    id: auctions.length + 1,
    itemName,
    itemDescription,
    startingPrice: itemPrice,
    currentBid: itemPrice,
    status: 'active',
    bids: []
  };

  auctions.push(auction);
  renderSellerAuctions();
});

function renderSellerAuctions() {
  sellerAuctionsDiv.innerHTML = '';
  auctions.forEach(auction => {
    const auctionDiv = document.createElement('div');
    auctionDiv.innerHTML = `
      <p><strong>${auction.itemName}</strong> - ${auction.itemDescription} ($${auction.startingPrice})</p>
      <button onclick="finalizeAuction(${auction.id})">Finalize</button>
      <button onclick="cancelAuction(${auction.id})">Cancel</button>
    `;
    sellerAuctionsDiv.appendChild(auctionDiv);
  });
}

function finalizeAuction(id) {
  const auction = auctions.find(a => a.id === id);
  auction.status = 'finalized';
  renderSellerAuctions();
}

function cancelAuction(id) {
  auctions = auctions.filter(a => a.id !== id);
  renderSellerAuctions();
}

// Bidder: Load Active Auctions
function loadActiveAuctions() {
  activeAuctionsDiv.innerHTML = '';
  auctions.filter(a => a.status === 'active').forEach(auction => {
    const auctionDiv = document.createElement('div');
    auctionDiv.innerHTML = `
      <p><strong>${auction.itemName}</strong> - ${auction.itemDescription} ($${auction.currentBid})</p>
      <button onclick="placeBid(${auction.id})">Place Bid</button>
    `;
    activeAuctionsDiv.appendChild(auctionDiv);
  });
}

// Bidder: Place Bid
function placeBid(auctionId) {
  const auction = auctions.find(a => a.id === auctionId);
  const bidder = prompt("Enter your name:");
  const bidAmount = prompt("Enter your bid (current: $" + auction.currentBid + "):");

  if (parseFloat(bidAmount) > auction.currentBid) {
    auction.currentBid = bidAmount;
    auction.bids.push({ bidder, amount: bidAmount, timestamp: new Date().toLocaleString() });
    bidHistoryDiv.innerHTML += `<p>${bidder} bid $${bidAmount} on ${auction.itemName}</p>`;
    loadActiveAuctions();

    // Bidder lockout for 5 minutes
    disableBidForAuction(auctionId);
  } else {
    alert("Bid must be higher than the current bid.");
  }
}

function disableBidForAuction(auctionId) {
  const buttons = activeAuctionsDiv.querySelectorAll(`button[onclick="placeBid(${auctionId})"]`);
  buttons.forEach(button => {
    button.disabled = true;
    setTimeout(() => {
      button.disabled = false;
    }, 300000); // 5 minutes
  });
}