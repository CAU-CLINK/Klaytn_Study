WEEK 3 (9.1~9.6)
==================

### 과제 점검
  + 웹 프론트 개발: react 학습(인프런 강의 수강)
  + smart contract 개발: solidity 학습(크립토 좀비)
  + 기획 및 디자인: 기획서 수정
  + backend 설계: 환경세팅 완료
### klaytn dapp 코드 리뷰
  + 클레이튼과 진행했던 poc 코드리뷰
    + 스마트 컨트랙트 파일
    + 자바스크립트 파일
    + 컨트랙트, 프론트 연동부분
  + struct, mapping 사용법
    + struct: contract내 데이터 저장 및 관리에 활용
    <pre><code>struct User{
         string company;//회사명
         mapping (string => uint)LookCnt; //유저 조회 횟수
         mapping (string => uint)DownloadCnt; //유저 다운로드 횟수
         uint ConnectCnt; //유저 접속 횟수
    }
    
    User[] public users; //유저 저장 배열
    
    function createUser(string memory company) public {
        User memory userInfo; 
        userInfo.company = company;
        uint id = users.push(userInfo)-1; //User struct array에 값 추가 후 id값 부여
        userAddressToId[msg.sender] = id; //id값에 유저 address mapping
    }</code></pre>
    + mapping: 인덱스 별 데이터 관리에 사용
    <pre><code>mapping(address => uint) public userAddressToId; //유저의 address로 유저 배열에 저장되는 인덱스인 id를 mapping
    
    function getCompany(address add)public view returns (string memory){
        return users[userAddressToId[add]].company; //user의 account address를 받아 id를 추출하고 users 배열내 데이터 조회
    }
    </pre></code>
  + constructor, require문 활용 관리자 설정
    + constructor: contract가 처음 배포될때만 실행되는 생성자
    <pre><code>
    constructor() public {
        owner = msg.sender; //state 변수인 owner에 contract 배포자 주소 저장
        login("manager"); //contract 배포자가 곧 서비스 관리자
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
### WEEK 4 Homework
+ 웹 프론트 개발: js코드 react로 변환
+ smart contract 개발: contract 초안 완성
+ 기획 및 디자인: userflow 작성
+ backend 설계: 연동 준비
