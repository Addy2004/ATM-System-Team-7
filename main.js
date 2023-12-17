//------imports--&--Configs----------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyB0DuUDJ1PC2doBKDtCwntP4KyU9xWGDy4",
  authDomain: "atm-system-team7.firebaseapp.com",
  projectId: "atm-system-team7",
  storageBucket: "atm-system-team7.appspot.com",
  messagingSenderId: "1042688900198",
  appId: "1:1042688900198:web:7a49a24fad2fc40faf81a7"
};


 window.onload = function(){
    const app = initializeApp(firebaseConfig);
    const db = getDatabase();
    const dbref = ref(db);

  document.getElementById('swithToReg').onclick=switchToReg;
  document.getElementById('swithToLogin').onclick=switchTologin;
  document.getElementById('login-btn').onclick = loginValidation;
  document.getElementById('register-btn').onclick = registerValidation;


//------switch to reg-----//
function switchToReg(){
  document.getElementById('register-portal').style = "display:inline-block";
  document.getElementById('login-portal').style = "display:none";
}
function switchTologin(){
  document.getElementById('register-portal').style = "display: none ";
  document.getElementById('login-portal').style = "display:inline-block";
}


//---acc no and pin pattern-----//
var accNoPat = "^[0-9]{6}$";
var accPinPat = "^[0-9]{4}$";
//----login validation------//
function loginValidation(){
  var lAccNo = document.getElementById('lAccNo').value;
  var lAccPin = document.getElementById('lAccPin').value;
  if(lAccNo.match(accNoPat) && lAccPin.match(accPinPat)){
    portal(lAccNo,lAccPin);
  }else{
      alert("Please enter valid details");
  }
}


//-----Register validation----------//
function registerValidation(){
var rAccName = document.getElementById('rAccName').value;
var rAccNo = document.getElementById('rAccNo').value;
var rAccPin = document.getElementById('rAccPin').value;
var rConAccPin = document.getElementById('rConAccPin').value;
if(rAccName!==null && rAccNo.match(accNoPat) && rAccPin.match(accPinPat) && rAccPin == rConAccPin){

   set(ref(db,"accNo "+rAccNo+"/accPin "+rAccPin+"/accDetails"),{
     name: rAccName,
     avalBal: 0
   }).then(()=>{
     alert("Registered");
   }).catch((error)=>{
     alert("Registration Failed\n"+error);
   });

   set(ref(db,"accNo "+rAccNo+"/received"),{
     receivedAmt: 0
   }).then(()=>{
     console.log("Received amount updated");
   }).catch((error)=>{
     alert("Received amount updation Failed\n"+error);
   });
}else{
  alert("Please enter valid details");
}
}


//----------------------------Portal----------------------------//
function portal(accNo,accPin){
  document.getElementById('login-portal').style = "display:none";
  document.getElementById('register-portal').style = "display:none";
  document.getElementById('portal').style = "display:inline-block";

  var name,avalBal,totalBal,receivedAmt,msg;

  //-----------getting data from firebase------------//
get(child(dbref,"accNo "+accNo+"/accPin "+accPin+"/accDetails")).then((snapshot)=>{
  if(snapshot.exists()){
     name = snapshot.val().name;
     avalBal = snapshot.val().avalBal;
     document.getElementById('userName').innerHTML = 'Hi '+name;
  }else{
    alert("No data found in the database");
  }
}).catch((error)=>{
  alert("Error while getting  data\n"+error);
});

get(child(dbref,"accNo "+accNo+"/received")).then((snapshot)=>{
  if(snapshot.exists()){
      receivedAmt = snapshot.val().receivedAmt;
      totalBal = avalBal + receivedAmt;
      msg="Welcome, "+ name;
      updateAvalBal(msg,totalBal);
      updateReceivedAmt();
  }else{
    alert("No received amount found in the database");
  }
}).catch((error)=>{
  alert("Error while getting data\n"+error);
});


//----------update values in firebase----------------//
function updateAvalBal(msg,totalBal){
   update(ref(db,"accNo "+accNo+"/accPin "+accPin+"/accDetails"),{
     avalBal: totalBal
   }).then(()=>{
     alert(msg);
     document.getElementById('totalBal').innerHTML = "Total Balance: "+totalBal;
   }).catch((error)=>{
     alert("error\n"+error);
   });
 }
   function updateReceivedAmt(){
      update(ref(db,"accNo "+accNo+"/received"),{
        receivedAmt: 0
      }).then(()=>{
        console.log("Received amount updated");
      }).catch((error)=>{
        alert("error\n"+error);
      });
}


//-------------deposit--------------------///
document.getElementById('depoist-btn').addEventListener('click',depoist);

function depoist(){
  document.getElementById('depoist-portal').style= "display:inline-block";
  document.getElementById('withdraw-portal').style= "display:none";
  document.getElementById('transfer-portal').style= "display:none";

  document.getElementById('dep-submit').addEventListener('click',function(){
    document.getElementById('depoist-btn').removeEventListener('click',depoist);
    var depoistAmt = Number(document.getElementById('depoist-amt').value);
    if(depoistAmt>=100){
      totalBal += depoistAmt;
      document.getElementById('depoist-amt').value = '';
      msg = "Rs. "+depoistAmt+" were successfully deposited";
      updateAvalBal(msg,totalBal);
    }else{
      alert('Minimum deposit amount Rs.100');
    }
  });
}


///-------------withdraw---------------///
document.getElementById('withdraw-btn').addEventListener('click',withdraw);
function withdraw(){
  document.getElementById('depoist-portal').style= "display:none ";
  document.getElementById('withdraw-portal').style= "display:inline-block";
  document.getElementById('transfer-portal').style= "display:none";

  document.getElementById('wit-submit').addEventListener('click',function(){
    document.getElementById('withdraw-btn').removeEventListener('click',depoist);
    var withdrawAmt = Number(document.getElementById('withdraw-amt').value);
    if(withdrawAmt>=100){
      totalBal -= withdrawAmt;
      document.getElementById('withdraw-amt').value = '';
      msg = "Rs. "+withdrawAmt+" were successfully withdrawn";
      updateAvalBal(msg,totalBal);
    }else{
      alert('Minimum withdraw amount Rs.100');
    }
  });
}


//-----------------transfer------------------//
document.getElementById('transfer-btn').addEventListener('click',transfer);
function transfer(){
  document.getElementById('depoist-portal').style= "display:none ";
  document.getElementById('withdraw-portal').style= "display:none";
  document.getElementById('transfer-portal').style= "display:inline-block";

  document.getElementById('trans-submit').addEventListener('click',function(){

    document.getElementById('transfer-btn').removeEventListener('click',transfer);

    var transAccNo = document.getElementById('transfer-acc-no').value;
    var transferAmt = Number(document.getElementById('transfer-amt').value);

    document.getElementById('transfer-acc-no').value = '';
    document.getElementById('transfer-amt').value = '';

    if(transAccNo.match(accNoPat) && transferAmt>=100){

      update(ref(db,"accNo "+transAccNo+"/received"),{
        receivedAmt: transferAmt
      }).then(()=>{
        totalBal -= transferAmt;
        document.getElementById('withdraw-amt').value = '';
        msg = "Rs. "+transferAmt+" were successfully transferred to "+transAccNo;
        updateAvalBal(msg,totalBal);
      }).catch((error)=>{
        alert('error\n'+error);
      });
    }else{
      alert('Minimum withdraw amount Rs.100');
    }
  });
  }
}

}
