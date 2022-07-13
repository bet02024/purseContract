
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PurseManager is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    mapping(address => uint256) private _balance;
    mapping(address => uint256) private _tokenBalance;

    event DepositEth(address from, uint256 amount);
    event DepositERC20(address from, uint256 amount);
    event WithdrawEth(address from, uint256 amount);
    event WithdrawERC20(address from, uint256 amount);

    address tokenAddress;

    constructor(address _tokenAddress  )  {
       tokenAddress = _tokenAddress;
    }

   function updateToken(address _tokenAddress) external onlyOwner {
     tokenAddress = _tokenAddress;
   }

   function deposit() payable external {
       uint256 amountToDeposit = msg.value;
       _balance[msg.sender] += amountToDeposit;
       emit DepositEth(msg.sender, amountToDeposit);
   }

   function depositToken( uint256 amount) external  {
        require(IERC20(tokenAddress).balanceOf(msg.sender) >= amount, "Your don't have enough balance to deposit");
        require(IERC20(tokenAddress).approve(address(this), amount));
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount));
        _tokenBalance[msg.sender] += amount;
        emit DepositERC20(msg.sender, amount);
    }

   function withdraw() nonReentrant external {
       require( _balance[msg.sender] > 0, "ser doesnt has eth on this Purse");
       uint256 amount = _balance[msg.sender];
       _balance[msg.sender] = 0;
       payable(msg.sender).transfer(amount);
       emit WithdrawEth(msg.sender, amount);
   }

   function withdrawToken() nonReentrant external {
        require(_tokenBalance[msg.sender] > 0, "User doesnt has tokens on this Purse");
        uint256 amount = _tokenBalance[msg.sender];
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
        _tokenBalance[msg.sender] = 0;
        emit WithdrawERC20(msg.sender, amount);
    }

    function balanceOfETH(address owner) public view returns (uint256 balance){
        return _balance[owner];
    }

    function balanceOfToken(address owner) public view returns (uint256 balance){
        return _tokenBalance[owner];
    }

}
