const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");

describe("Purse Manager contract", function () {
  const provider = waffle.provider;
  let purseManager;
  let  token;
  const TEST_ADDRESS = '0x000000000000000000000000000000000000dEaD';

  const [wallet1, wallet2, wallet3] = provider.getWallets();


  beforeEach( async () => {

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
    console.log("Token address => ", token.address);

    const PurseManager = await hre.ethers.getContractFactory("PurseManager");
    purseManager = await PurseManager.deploy(token.address);
    console.log("PurseManager contract address => ", purseManager.address);

    await token.mint(wallet1.address, 1000000 );

    await token.mint(wallet2.address, 2000000 );

  });

  it("updateToken : does not allow non-owners to update token address", async function () {
    await expect( purseManager.connect(wallet2).updateToken(TEST_ADDRESS))
      .to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("deposit: 0 balance not approved : does not allow ERC20 deposit", async function () {
    await expect( purseManager.connect(wallet3).depositToken(1))
      .to.be.revertedWith("Your don't have enough balance to deposit");
  });

    it("deposit: 1000000 balance, not approved : does not allow ERC20 deposit", async function () {
      await expect( purseManager.connect(wallet1).depositToken(1))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

  it("deposit: 0 balance, approved : does not allow ERC20 deposit", async function () {

    await token.connect(wallet3).approve(purseManager.address, 1000000);

    await expect( purseManager.connect(wallet3).depositToken(1))
      .to.be.revertedWith("Your don't have enough balance to deposit");
  });

  it("deposit: unautorized : does not allow ERC20 deposit", async function () {
    await expect( purseManager.connect(wallet1).depositToken(1000000))
      .to.be.reverted;
  });

  it("deposit: success 1000000", async function () {

    await token.connect(wallet1).approve(purseManager.address, 1000000);

    await purseManager.connect(wallet1).depositToken(1000000);
    const total = await purseManager.connect(wallet1).balanceOfToken(wallet1.address);
    await expect( total.toNumber())
      .to.be.eq(1000000);
  });

  it("deposit: success 2000000", async function () {

    await token.connect(wallet2).approve(purseManager.address, 2000000);

    await purseManager.connect(wallet2).depositToken(1000000);

    await purseManager.connect(wallet2).depositToken(1000000);

    const total = await purseManager.balanceOfToken(wallet2.address);
    await expect(total )
      .to.be.eq(2000000);
  });


  it("withdrawToken: balance == 0", async function () {

    await expect( purseManager.connect(wallet3).withdrawToken())
      .to.be.revertedWith("User doesnt has tokens on this Purse");

  });


  it("withdrawToken: amount = 2000000 ", async function () {
    await token.connect(wallet2).approve(purseManager.address, 2000000);
    await purseManager.connect(wallet2).depositToken(1000000);
    await purseManager.connect(wallet2).depositToken(1000000);
    await purseManager.connect(wallet2).withdrawToken();
    const total = await purseManager.balanceOfToken(wallet2.address);

    await expect(total )
      .to.be.eq(0);
  });


  it("withdrawToken: amount = 500000 ", async function () {
    await token.connect(wallet1).approve(purseManager.address, 2000000);
    await purseManager.connect(wallet1).depositToken(1000000);
    await purseManager.connect(wallet1).withdrawToken();
    await purseManager.connect(wallet1).depositToken(500000);
    const total = await purseManager.balanceOfToken(wallet1.address);

    await expect( total )
      .to.be.eq(500000);
  });

});
