// SPDX-License-Identifier: MIT
pragma solidity 0.7.5; // was >=0.4.22 <0.9.0
// pragma abicoder v2;

contract CoinFlip {
  address payable public owner;
  uint public balance;

  event BetResulted(address indexed player, uint stake, uint payout);

  constructor() payable {
    owner = msg.sender;
    balance += msg.value;
  }

  modifier onlyOwner() {
    require(msg.sender == owner,"Only Owner");
    _;
  }

  function deposit() public payable onlyOwner {
    balance += msg.value;
  }

  function withdraw() public onlyOwner {
    if (balance > 0) {
      msg.sender.transfer(balance); // or address(this).balance
      balance = 0;
    }
  }

  function terminate() public onlyOwner {
    selfdestruct(owner);
  }

  function play() public payable {
    uint stake = msg.value;
    address payable player = msg.sender;
    require(stake > 0, "stake must be positive");
    //require(stake <= balance, "stake should be no more then contract balance");
    balance += stake;
    uint payout = 0;
    // using pseudo random number in this basic version.
    if (block.timestamp % 2 > 0) {
      // player lost
    } else {
      // player won
      payout = stake * 2;
      if (payout > balance) {
        payout = balance;
      }
      balance -= payout;
      player.transfer(payout);
    }
    // must use event as a way to return value to frontend.
    // frontend cannot get the function return value using send(),
    // can get using call() but it is for view only function.
    emit BetResulted(player, stake, payout);
  }

}
