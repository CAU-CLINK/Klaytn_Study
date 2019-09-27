const fs = require('fs')
const Donation = artifacts.require('./Donation.sol')

module.exports = function (deployer) {
    deployer.deploy(Donation)
    .then(()=>{
      if(Donation._json){
          fs.writeFile('deployedABI',JSON.stringify(Donation._json.abi),
            (err)=>{
                if(err) throw err;
                console.log("파일에 ABI 입력 성공");
            }
          )
          fs.writeFile('deployedAddress',Donation.address,
            (err)=>{
                if(err) throw err;
                console.log("파일에 주소 입력 성공");
            })
      }
    })
  }
  