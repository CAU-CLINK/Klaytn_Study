pragma solidity ^0.5.0;

contract Donation{

    address payable owner; // 우리의 주소

    enum DealState {
        pending,
        succeed,
        failed
    }
    //현재 딜의 상태를 나타낸다. 만약 다른 상태를 생성하고 싶다면 해당 란에서만 수정하면 된다.

    struct Deal {
        uint dealId; // 딜을 구별하기 위한 용도
        address payable user; // 딜을 제안하는 유저
        address payable donationPoint; // 만약 실패시 돈이 가는 곳
        uint userMoney; // 유저가 딜한 금액
        string subject;
        uint goalpoint;
        DealState dealState; // 현재 딜의 상태
    }

    Deal[] Deals; //딜 배열
    uint dealIndex=1; //딜 인덱스
    uint firstIndex=1;
    mapping(address=>uint) public myDeal;
    mapping(address=>string) public userAddToName;
    
    uint unit = 0.001 ether; //돈의 단위

    function deposit() public payable {  
        require(msg.sender == owner);
    }

    function setName(string memory _name) public {
        userAddToName[msg.sender]=_name;
    } 

    function getName(address add) public view returns(string memory){
        return userAddToName[add];
    } 

    function newDeal(address payable _donationPoint, uint _money,string memory _subject,uint _goalpoint) public payable {
        require (msg.value >= _money * unit, "not enough money");
        require(myDeal[msg.sender]==0);
        //딜 배열에 딜을 추가한다.
        Deals.push(Deal(dealIndex, msg.sender, _donationPoint, _money,_subject,_goalpoint, DealState.pending));
        myDeal[msg.sender]=dealIndex;
        //잔돈을 반환한다.
        msg.sender.transfer(msg.value - _money * unit);
        dealIndex++;
    }

    function getDealCnt() public view returns(uint){
        return dealIndex;
    }

    function getOwner() public returns(address){
        return owner;
    }
    
    function getDealIdx(address add)public view returns(uint){
        return myDeal[add];
    }
    
    function getSubject(uint _dealIdx) public view returns(string memory) {
      require(_dealIdx<=dealIndex);
      return Deals[_dealIdx-1].subject;  
    }
    
    function getGoal(uint _dealIdx) public view returns(uint) {
      require(_dealIdx<=dealIndex);
      return Deals[_dealIdx-1].goalpoint;  
    }

    function getUserAdd(uint _dealIdx) public view returns(address) {
      require(_dealIdx<=dealIndex);
      return Deals[_dealIdx-1].user;  
    }

    function getFirstIndex() public view returns(uint){
        return firstIndex;
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
   
    //성공시 owner 상태를 바꿀 수 있다.
    function stateChangetoSucceed(address _user) public onlyOwner payable{
        uint id = myDeal[_user];
        require(id!=0);
        id--;
        Deal memory tmpDeal = Deals[id]; 
        //pending 상태여야만 상태를 바꿀 수 있다.
        require(tmpDeal.dealState == DealState.pending, "invalid Deal state");
        //기업 자금이 약속한 금액보다 많아야 한다.
        require(getBalance() >= tmpDeal.userMoney, "not enough Money");
        tmpDeal.dealState = DealState.succeed;
        //유저의 돈을 환급한다
        tmpDeal.user.transfer(tmpDeal.userMoney * unit);
        myDeal[_user]=0;
        firstIndex++;
    }
    
    //실패시 owner 상태를 바꿀 수 있다.
    function stateChangetoFailed(address _user) public onlyOwner payable{
        uint id = myDeal[_user];
        require(id!=0);
        id--;
        require(Deals[id].dealState == DealState.pending);
        Deals[id].dealState = DealState.failed;
        //실패시 유저의 돈을 기부주소로 보낸다.
        Deals[id].donationPoint.transfer(Deals[id].userMoney * unit);
        myDeal[_user]=0;
        firstIndex++;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner,"not owner");
        _;
    }

    constructor() public payable{
        owner = msg.sender;
    }

    function() external payable{
    }
}