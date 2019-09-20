WEEK 4 (9.7~9.19)
==================
### Smart Contract 코드 리뷰 (최중현 진행)
  + 나눔 서비스 Contract 코드리뷰
    + Deal Struct 구조
    + 목표 설정 함수
    + 목표 달성 후 처리 함수
  + Deal Struct 구조
   <pre><code>  struct Deal {
        uint dealId; // 딜을 구별하기 위한 용도
        address payable user; // 딜을 제안하는 유저
        address payable donationPoint; // 만약 실패시 돈이 가는 곳

        uint startMoney; // 시작 했던 금액 - 따로 둔 이유는 우리의 수수료를 받기 위함
        uint currentMoney; // 현재 금액, 은행에서 잔액을 생각하면 될 것 같다.

        // 만약 후원자가 돈을 넣는다면, 후원자의 주소는 배열에 푸쉬되고 이 주소를 이용한 매핑으로 금액까지 알 수 있다.
        address payable[] supportersList;
        mapping(address => uint) supporterToMoney;
        DealState dealState; // 현재 딜의 상태
    }
</code></pre>
  + 목표 설정 함수
    <pre><code>
    function newDeal(address payable _donationPoint, uint _money) public payable returns(uint){
        require (msg.value >= _money, "not enough money");
        Deals.push(eal(dealIndex, msg.sender, _donationPoint, _money,_money,new address payable[](0) , DealState.pending));
        return dealIndex++;
    }
    </pre></code>
  + 목표 달성 후 처리 함수
    <pre><code>
    function stateChangetoSucceed(uint _dealId) public {
        Deal memory tmpDeal = Deals[_dealId]; 

        tmpDeal.dealState = DealState.succeed;
        uint fee = (tmpDeal.currentMoney - tmpDeal.startMoney) / 10;
        owner.transfer(fee); //10프로 수수료
        tmpDeal.user.transfer(tmpDeal.currentMoney-fee);
    }
    
    function stateChangetoFailed(uint _dealId) public {
        Deals[_dealId].dealState = DealState.failed;
        //주의 솔리디티에서 mapping --> storage로 만 가능 즉 tmpDeals으로 둘경우 memory가 아닌 storage로 두었다.
        address payable addressSupporter;
        for (uint i = 0 ; i < Deals[_dealId].supportersList.length; i++){
            addressSupporter = Deals[_dealId].supportersList[i];
            addressSupporter.transfer(Deals[_dealId].supporterToMoney[addressSupporter]);
        }
        owner.transfer(Deals[_dealId].startMoney / 10); // 솔리디티에서는 정수만 가능 기부 금액의 10프로
        Deals[_dealId].donationPoint.transfer(Deals[_dealId].startMoney - Deals[_dealId].startMoney / 10);
        
    }</pre></code>
    
    + require: solidity 내장 함수로 전달되는 인자가 false일 경우 함수 실행 종료  
    <pre><code>
     //관리자만 유저의 사용이력 열람 가능하도록 만든 함수
     function findUsers(address add)public view returns(string memory company,uint connect){
        require(msg.sender==owner); //함수에 접근하는 address가 owner, 즉 관리자가 아닐경우 함수종료
        uint id = userAddressToId[add];
        return (users[id].company,users[id].ConnectCnt);
    }
    </pre></code>
### 웹 프론트 프로토타입 발표 (한혜 진행)
![웹페이지1](https://user-images.githubusercontent.com/45625434/65302769-1e939f80-dbb7-11e9-9a19-a2fe42f94a84.JPG)

* 총구성(5): 
Frame1, Frame2.1~6,
Frame3, Frame4, Alert1~6

유저 플로우 :
1. (Login 버튼) 
> Alert1 > (Submit) > Frame1 

2. 참여하기(Join 버튼) 
> Frame2.1~6 > (Submit) 
-> if 모든항목을 작성하지 않은 경우
> Alert6 > Frame2.1~6 
-> else 
> Alert3 > Frame1 

3. (나의현황 버튼) 
> Frame3 > (close) >Frame1

4. (인증하기 버튼)
> Frame4
 -> if 모든항목을 작성하지 않은 경우
> Alert6 > Frame4
-> else 
> Alert3 > Frame1

논의항목 : 
1. Frame1 최상단 색상선택, 글씨체 선택
2. 노란색 색상 선택 
3. Another 디자인 피드백 
4. 기능 피드백

프로토타입 링크: https://www.figma.com/file/KdlhYBxemMVgKV1K2EdFZf/%EB%82%98%EB%88%94?node-id=128%3A8

### WEEK 4 Homework
+ 웹 프론트 개발: 프로토타입 => react 변환
+ smart contract 개발: remix에서 컴파일 테스트 및 테스트넷 배포
+ 기획 및 디자인: 프로토타입 기능 완성
+ backend 설계: 프로젝트 취합
