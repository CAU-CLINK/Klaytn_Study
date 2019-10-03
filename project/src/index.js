import Caver from "caver-js";
import {Spinner} from "spin.js";

const config={
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);
const DonateContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);
const App = {
  auth: {
    acessType: 'keystore',
    keystore: '',
    password: ''
  },

  start: async function () {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if(walletFromSession){
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      }catch(e){
        sessionStorage.removeItem('walletInstance');
      }
    }
    this.getGoalInfo(JSON.parse(walletFromSession).address);
  },

  handleImport: async function () {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = async(event) => {
      try{
        if(!this.checkValidKeystore(event.target.result)){
          $('#message').text('유효하지 않은 keystore 파일입니다.');
          return;
        }
        this.auth.keystore = event.target.result;
        var add = JSON.parse(this.auth.keystore).address;
        var idx = await this.callgetDealIdx(add);
        //alert(add+idx);
        if(add == (await this.callOwner()).toLowerCase())
        {
          document.getElementById("input-name").style.visibility = 'hidden';
        }
        else if(idx==0)
        {
          document.getElementById("input-name").style.visibility = 'visible';
        }
        else{
          document.getElementById("input-name").style.visibility = 'hidden';
        }
        $('#message').text('keystore 통과, 비밀번호를 입력하세요.');
        document.querySelector('#input-password').focus();
      } catch (event) {
        console.log(event);
        $('#message').text(event);
        return;
      }
    }
  },

  handlePassword: async function () {
    this.auth.password = event.target.value;
  },

  handleLogin: async function () {
    var spinner = this.showSpinner();
    if(this.auth.acessType === 'keystore'){
      try{
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore,this.auth.password).privateKey;
        await this.integrateWallet(privateKey);
      }catch(e){
        $('#message').text('비밀번호가 일치하지 않습니다.');       
      }
    }
        const walletInstance = await this.getWallet();
        var idx = await this.callgetDealIdx(walletInstance.address);
        var name = "xxx";
        if(walletInstance.address==await this.callOwner())
        {
          spinner.stop();
          alert("관리자님 반갑습니다!");
        }
        else if(idx==0)
        {
          name = $('#input-name').val();
          await DonateContract.methods.setName(name).send({
            from: walletInstance.address,
            gas: '250000',
          })
          .once('transactionHash',(txHash)=>{
            console.log(`txHash: ${txHash}`);
          })
          .once('receipt',(receipt)=>{
            console.log(`#${receipt.blockNumber}`,receipt);
            spinner.stop();
            alert(name + "님 반갑습니다!");
          })
          .once('error',(error)=>{
            alert(error.message);
          });        }
        else{
          name = await this.callgetName(walletInstance.address);         
          spinner.stop();
          alert(name + "님 반갑습니다!");
        }
        location.reload();

  },

  handleLogout: async function () {
    document.getElementById("donationPoint").style.visibility = 'hidden';
    document.getElementById("donationPoint2").style.visibility = 'hidden';
    await this.removeWallet();
    location.reload();
  },

  // generateNumbers: async function () {
  //   var num1 = Math.floor((Math.random()*50)+10);
  //   var num2 = Math.floor((Math.random()*50)+10);
  //   sessionStorage.setItem('result',num1 + num2);

  //   $('#start').hide();
  //   $('#num1').text(num1);
  //   $('#num2').text(num2);
  //   $('#question').show();
  //   document.querySelector('#answer').focus();

  //   this.showTimer();
  // },

  // submitAnswer: async function () {
  //   const result = sessionStorage.getItem('result');
  //   var answer = $('#answer').val();
  //   if(answer===result){
  //     if(confirm("대단하네요^^ 0.1 klay 받기")){
  //       if(await this.callContractBalance()>=0.1){
  //         this.receiveKlay();
  //       }else{
  //         alert("죄송합니다 컨트랙의 klay가 다 소모됐습니다.")
  //       }
  //     }
  //   }else{
  //     alert("땡! 틀렸습니다.");
  //   }
  // },

  deposit: async function () {
    var spinner = this.showSpinner();
    const walletInstance = await this.getWallet();
    if(walletInstance){
      if(await this.callOwner() !== walletInstance.address) 
      {
        return;
      }
      else{
        var amount = $('#amount').val();
        if(amount){
          DonateContract.methods.deposit().send({
            from: walletInstance.address,
            gas: '250000',
            value: cav.utils.toPeb(amount,"KLAY")
          })
          .once('transactionHash',(txHash)=>{
            console.log(`txHash: ${txHash}`);
          })
          .once('receipt',(receipt)=>{
            console.log(`#${receipt.blockNumber}`,receipt);
            spinner.stop();
            alert(amount + " KLAY를 컨트랙에 송금했습니다.");
            location.reload();
          })
          .once('error',(error)=>{
            alert(error.message);
          });
        }
        return;
      }
    }
  },

  setGoals: async function(){
    var spinner = this.showSpinner();
    const walletInstance = await this.getWallet();
    var subject = $('#subject').val();
    var goal = $('#goal').val();
    var money = $('#money').val();
    var donationPoint = $('#dp').val();
    alert("입력 완료");
     DonateContract.methods.newDeal(donationPoint,money,subject,goal).send({
      from: walletInstance.address,
      gas: '250000',
      value: cav.utils.toPeb(money,"KLAY")
    })
    .once('transactionHash',(txHash)=>{
      console.log(`txHash: ${txHash}`);
    })
    .once('receipt',(receipt)=>{
      console.log(`#${receipt.blockNumber}`,receipt);
      spinner.stop();
      alert("목표 설정 완료!");
      location.reload();
    })
    .once('error',(error)=>{
      alert(error.message);
    });
  },

  getGoalInfo: async function(userAdd){
    var userIdx = await this.callgetDealIdx(userAdd);
    var subject = await this.callgetSubject(userIdx);
    var Goal = await this.callgetGoal(userIdx);
    $('#goalInfo').append('<p>'+' '+subject+' '+Goal+'</p>');
  },

  callOwner: async function () {
    return await DonateContract.methods.getOwner().call();
  },

  callgetDealIdx: async function(add){
    return await DonateContract.methods.getDealIdx(add).call();
  },

  callgetGoal: async function(idx){
    return await DonateContract.methods.getGoal(idx).call();
  },

  callgetSubject: async function(idx){
    return await DonateContract.methods.getSubject(idx).call();
  },

  callgetGoal: async function(idx){
    return await DonateContract.methods.getGoal(idx).call();
  },
  
  callgetUserAdd: async function(idx){
    return await DonateContract.methods.getUserAdd(idx).call();
  },

  callContractBalance: async function () {
    return await DonateContract.methods.getBalance().call();
  },

  callgetDealCnt: async function(){
    return await DonateContract.methods.getDealCnt().call();
  },

  callgetName: async function(add){
    return await DonateContract.methods.getName(add).call();
  },

  callgetFirstIndex: async function(){
    return await DonateContract.methods.getFirstIndex().call(); 
  },

  checkfail: async function(idx){
    var spinner = this.showSpinner();
    const walletInstance = await this.getWallet();
    var userAdd = await this.callgetUserAdd(idx);
    DonateContract.methods.stateChangetoFailed(userAdd).send({
      from: walletInstance.address,
      gas: '250000',
    })
    .once('transactionHash',(txHash)=>{
      console.log(`txHash: ${txHash}`);
    })
    .once('receipt',(receipt)=>{
      console.log(`#${receipt.blockNumber}`,receipt);
      spinner.stop();
      alert("fail!");
      location.reload();
    })
    .once('error',(error)=>{
      alert(error.message);
    });
  },

  checksuccess: async function(idx){
    var spinner = this.showSpinner();
    const walletInstance = await this.getWallet();
    var userAdd = await this.callgetUserAdd(idx);
    DonateContract.methods.stateChangetoSucceed(userAdd).send({
      from: walletInstance.address,
      gas: '250000',
    })
    .once('transactionHash',(txHash)=>{
      console.log(`txHash: ${txHash}`);
    })
    .once('receipt',(receipt)=>{
      console.log(`#${receipt.blockNumber}`,receipt);
      spinner.stop();
      alert("success!");
      location.reload();
    })
    .once('error',(error)=>{
      alert(error.message);
    });
  },

  setUserTable: async function(){
    var cnt = await this.callgetDealCnt();
    var first = await this.callgetFirstIndex();
    for(var i=first;i<cnt;i++)
    {
      var userAdd = await this.callgetUserAdd(i);
      var name = await this.callgetName(userAdd);
      var subject = await this.callgetSubject(i);
      var goal = await this.callgetGoal(i);

      if(goal<200)
      {
        $('#UserTable > tbody:last')
        .append('<tr><td>'+name+'</td>'+
        '<td>'+subject+'</td>'+
        '<td>'+goal+'</td>'+
        '<td>'+"실패"+'</td>'+
        '<td>'+`<button type="button" class="check" onclick="App.checkfail(${i})">검수</button>`+'</td>'+
        '</td></tr>');
      }
      else
      {
        $('#UserTable > tbody:last')
        .append('<tr><td>'+name+'</td>'+
        '<td>'+subject+'</td>'+
        '<td>'+goal+'</td>'+
        '<td>'+"성공"+'</td>'+
        '<td>'+`<button type="button" class="check" onclick="App.checksuccess(${i})">검수</button>`+'</td>'+
        '</td></tr>');
      }
    }
  },

  getWallet: async function () {
    if(cav.klay.accounts.wallet.length){
      return cav.klay.accounts.wallet[0];
    }
  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;

    return isValidKeystore;
  },

  integrateWallet: function (privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    sessionStorage.setItem('walletInstance',JSON.stringify(walletInstance));
    this.changeUI(walletInstance);
  },

  reset: function () {
    this.auth={
      keystore: '',
      password: ''
    };
  },

  changeUI: async function (walletInstance) {
    $('#loginModal').modal('hide');
    $('#login').hide();
    $('#logout').show();
    if(await this.callOwner() === walletInstance.address){
      $('#owner').show();
      $('#contractBalance')
      .append('<p>'+' 잔액: '+ cav.utils.fromPeb(await this.callContractBalance(),"KLAY") + 'KLAY'+'</p>')
      document.getElementById("goalset").style.visibility = 'hidden';
      document.getElementById("donationPoint").style.visibility = 'hidden';
      document.getElementById("donationPoint2").style.visibility = 'hidden';
      document.getElementById("UserTable").style.visibility = 'visible';
      document.getElementById("goalboxs").style.visibility = 'hidden';
      await this.setUserTable();
    }
    else{
      document.getElementById("goalboxs").style.visibility = 'visible';
      document.getElementById("goalset").style.visibility = 'visible';
      document.getElementById("UserTable").style.visibility = 'hidden';
      document.getElementById("donationPoint").style.visibility = 'visible';
      document.getElementById("donationPoint2").style.visibility = 'visible';
    }
  },

  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();
  },

  setGoal: async function(){
    //목표 설정
  },

  success: async function(){
    //목표 달성시 호출
  },

  fail: async function(){
    //목표 실패시 호출
  },

  // showTimer: function () {
  //   var seconds = 3;
  //   $('#timer').text(seconds);

  //   var interval = setInterval(()=>{
  //     $('#timer').text(--seconds);
  //     if(seconds<=0){
  //       $('#timer').text(' ');
  //       $('#answer').val(' ');
  //       $('#question').hide();
  //       $('#start').show();
  //       clearInterval(interval);
  //     }
  //   }, 1000);
  // },

  showSpinner: function () {
    var target = document.getElementById("spin");
    return new Spinner(opts).spin(target);
  },

//   receiveKlay: function () {
//     var spinner = this.showSpinner();
//     const walletInstance = this.getWallet();
//     if(!walletInstance) return;
//     DonateContract.methods.transfer(cav.utils.toPeb("0.1","KLAY")).send({
//       from: walletInstance.address,
//       gas: '250000'
//     }).then(function(receipt){
//       if(receipt.status){
//         spinner.stop();
//         alert("0.1 klay가 "+walletInstance.address + " 계정으로 지급되었습니다.");
//         $('#transaction').html("");
//         $('#transaction')
//         .append(`<p><a href='https://baobab.scope.klaytn.com/tx/${receipt.transactionHash}'
//         target='_blank'>클레이튼 scope에서 트랜잭션 확인</a></p>`);
//         return DonateContract.methods.getBalance().call()
//         .then(function(balance){
//         })
//       }
//     })
//   }
 };

window.App = App;

window.addEventListener("load", function () {
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};