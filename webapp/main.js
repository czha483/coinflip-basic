var web3 = new Web3(Web3.givenProvider);
// the CoinFlip contract instance in Ganache.
var contractIns;
var contractOwnerAddr;
var contractAddr = "0x54cfdF5e860232d0613923a9b280d1A78E699278";
// player account
var playerAddr;

$(document).ready(function() {
    window.ethereum.enable().then(function (accounts) {
      console.log("MetaMask accounts:", accounts);

      playerAddr = accounts[0];
      contractIns = new web3.eth.Contract(abi, contractAddr, {from: playerAddr});
      console.log("CoinFlip contract instance:", contractIns);

      contractIns.methods.owner().call(function(error, result) {
        contractOwnerAddr = result;
        console.log("get contract owner:", contractOwnerAddr);
        $("#contract_owner").text(contractOwnerAddr);
      });

      fetchData();
    });

  	window.ethereum.on('accountsChanged', function () {
  		web3.eth.getAccounts(function (error, accounts) {
  			console.log('MetaMask accounts changed', accounts);
        playerAddr = accounts[0];
  		});
  	});

    $("#stake_input").val(0.01);

    $("#play_button").click(play);
    $("#get_data_button").click(fetchData);
});

function play () {
  var stake = $("#stake_input").val();
  //
  contractIns.methods.play().send({value: toWei(stake)})

  .on("error", function (error) {
    console.log("play() on error", error);
  })

  .on("transactionHash", function (hash) {
    console.log("play() on transaction hash", hash);
  })

  .on("confirmation", function (confNumber, receipt, latestBlockHash) {
    console.log("play() on confirmation #", confNumber);
    if (confNumber > 12) {
      // e.g notify user
    }
  })

  .on("receipt", function (receipt) {
    console.log("play() on receipt:", receipt);
    // got the BetResulted event directly in receipt.
    let bet = receipt.events.BetResulted.returnValues;
    let payout = parseInt(bet.payout);
    let stake = parseInt(bet.stake);
    if (payout > 0) {
      alert('You have WON '+toEther(payout - stake, 4)+' ether!!')
    } else {
      alert('You have LOST.');
    }
    console.log("bet payout in ether:", toEther(payout));
    //
    fetchData();

  })

  // it seems the promise function result is exactly same as the 'receipt'.
  // .then(function (result) {
  //   console.log("play() result:", result);
  //   fetchData();
  // })
  ;

}

function fetchData() {
  web3.eth.getBalance(playerAddr).then(function (balance) {
    $("#player_balance").text(toEther(balance, 4));
  });
  web3.eth.getBalance(contractAddr).then(function (balance) {
    $("#contract_balance").text(toEther(balance, 4));
  });
}

function toEther(wei, precision) {
  if (0 < precision && precision < 18) {
    let a = Math.round(wei / (10 ** (18 - precision)));
    return a / (10 ** precision);
  } else {
    return wei / (10 ** 18);
  }
}

function toWei(ether) {
  return Math.round(ether * (10 ** 18));
}
