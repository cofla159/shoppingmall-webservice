import { addCommas, convertToNumber } from '../useful-functions.js'
import * as Api from '/api.js';
let items = [];
let prodId = [];

const $itemInfo = document.querySelector('.itemInfo');
const $priceInfo = document.querySelector('.priceInfo');
const $orderBtn = document.querySelector('#ordering');
const $findAddressBtn = document.querySelector("#findAddress");
const $getMyAddBtn = document.querySelector(".getMyAdd");

let $deliveryName = document.getElementById('nameInput');
let $deliveryPhone = document.getElementById('phonenumInput');
let $deliveryZipCode = document.getElementById('postalNumber');
let $deliveryAdd = document.getElementById('addInput1');
let $deliveryDeAdd = document.getElementById('addInput2');

const userEmail = sessionStorage.getItem('id');
const token = sessionStorage.getItem('token');

//세션스토리지에서 장바구니 정보를 가져와서 결제 정보를 화면에 렌더
function getItems() {
  const cartObject = Object.keys(sessionStorage).filter((e) => e.slice(0, 5) === 'order'); 
  const itemPrice = JSON.parse(sessionStorage.getItem('itemPrice'));
  const delivery = JSON.parse(sessionStorage.getItem('delivery'));

  cartObject.forEach((key, i) => {
    prodId[i] = key.slice(6);
    items[i] = JSON.parse(sessionStorage.getItem(cartObject[i]));
    const {title, quantity} = items[i]; 
    $itemInfo.insertAdjacentHTML('beforeend', `<p>${title} × ${quantity}</p>`);
  });

  if (itemPrice === null){
    alert('주문 과정에서 오류가 발생했습니다. 메인 페이지로 돌아갑니다.');
    location.href = '/';
    return;
  }
  $priceInfo.insertAdjacentHTML('beforeend', 
      `
      <p>상품 금액 ${addCommas(itemPrice)}원</p>
      <p>배송비 ${addCommas(delivery)}원</p>
      <hr class="crossLine">
      <p>총 ${addCommas(itemPrice+delivery)}원</p>
      `
    );
}

//주문 버튼을 누르면 데이터를 디비로 보내는 함수
async function sendDataToDb() {
  const deliveryName = $deliveryName.value;
  const deliveryPhone = $deliveryPhone.value;
  const deliveryZipCode = $deliveryZipCode.value;
  const deliveryAdd = $deliveryAdd.value;
  const deliveryDeAdd = $deliveryDeAdd.value;

  const deliveryAddFull = `(${deliveryZipCode}) ${deliveryAdd} ${deliveryDeAdd}`;
  const deliveryInfo = { name: deliveryName, phoneNumber: deliveryPhone, address: deliveryAddFull };
  let sendSuccess = false;

  //배송지 정보 유효성 검사
  if (deliveryName === ''){
    alert("이름을 입력해 주세요")
    return;
  } else if (deliveryPhone === '') {
    alert("전화번호를 입력해 주세요.")
    return;
  } else if (deliveryAdd === '' || deliveryDeAdd === '' || deliveryZipCode === '') {
    alert("배송지 정보를 입력해 주세요")
    return;
  }

  //상품 하나에 대해 data를 생성
  for (let i = 0; i < items.length; i++ ) {
    const {title, quantity, price} = items[i];
    const numPrice= convertToNumber(price);
    const productId = prodId[i];
    const orderId = `${Date.now()}_${userEmail}`
    const data = {"email": userEmail, "productName": title, "productCount": quantity, "priceEach": numPrice, "delivery": deliveryInfo, "productShortId": productId, "orderId": orderId };

    try {
      const res = await Api.post('/api/order/', data);
      console.log(res);
      sendSuccess = true;
    } catch (error) {
      sendSuccess = false; 
      console.log(error);
    }; 
  }

  //데이터 전송에 성공하면 장바구니 리셋
  if (sendSuccess === true){
    sessionStorage.clear();
    sessionStorage.setItem('id', userEmail);
    sessionStorage.setItem('token', token);
    location.href = '/orderComplete';
  } else {
    alert('오류 발생. 관리자에게 문의해 주세요.');
  }
}

function addressFind() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = ""; // 주소 변수
      let extraAddr = ""; // 참고항목 변수

      if (data.userSelectedType === "R") {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 사용자가 지번 주소를 선택했을 경우
        addr = data.jibunAddress;
      }
      document.getElementById("postalNumber").value = data.zonecode;
      document.getElementById("addInput1").value = addr;

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
        document.getElementById("addInput1").value += extraAddr;
      } else {
        document.getElementById("addInput1").value += "";
      }
      document.getElementById("addInput2").focus();
    },
  }).open();
}

//마이페이지의 주소 불러오기
async function getMyAdd() {
  const resUser = await Api.get(
    `/api/user/userlist/${sessionStorage.getItem("id")}`
  );
  const { fullName, phoneNumber, address } = resUser

  $deliveryName.value = fullName;
  $deliveryPhone.value = phoneNumber;
  $deliveryZipCode.value = address.postalCode;
  $deliveryAdd.value = address.address1;
  $deliveryDeAdd.value = address.address2;
}

getItems();
$orderBtn.addEventListener('click', sendDataToDb);
$findAddressBtn.addEventListener('click', addressFind);
$getMyAddBtn.addEventListener('click', getMyAdd);