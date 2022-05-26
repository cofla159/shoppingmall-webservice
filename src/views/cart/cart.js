import { addCommas, convertToNumber } from '../useful-functions.js'

const $cartList = document.querySelector('.cartList');
const $payInfo = document.querySelector('.payInfo');

//장바구니, 전체 상품 리스트 불러오기
async function getList() {
  try {
    const cartListJson = await fetch('./tempData_cartList.json'); //장바구니 목록
    const itemListJson = await fetch('./tempData_itemList.json'); //전체 상품 목록

    const cartList = await cartListJson.json();
    const itemList = await itemListJson.json();
    return [cartList, itemList];
  } catch (err) {
    console.error(err);
    $cartList.innerText = `불러오기에서 무언가 잘못되었습니다! \n${err}`;
    //$cartList.innerText = `제품 정보 불러오기에서 무언가 잘못되었습니다: \n${err}`;
  }
}

getList()
  .then((res) => {
    let [incartList, initemList] = res;
    let totalItemQuantity = 0;
    // let totalItemPrice = 0;
    let totalPrice = 0;
    let total;

    if (incartList.length < 1) {
      $cartList.innerHTML = `장바구니가 비었습니다:(`;
    } else {
      //token, id값 빼고 cart값만 가져오기
      incartList = incartList 
        .slice(2)
        .map((x) => Object.values(x))
        .flat();

      //장바구니 목록을 돌면서 전체 상품 중 id 일치하는 제품 가져오기
      incartList.forEach((cart, i) => {
        const foundItem = initemList.find((item) => { 
          if (item.oid == cart.id) {
          let itemName = item.name;
          let itemPrice = item.price;
          let itemImg = item.img;
          return {itemName, itemPrice, itemImg};
          }
        });
        //상품 수량 및 가격 계산
        const totalItemPrice = convertToNumber(foundItem.price) * convertToNumber(cart.quantity); //제품 별 총 금액
        totalItemQuantity += parseInt(cart.quantity);
        totalPrice += totalItemPrice; //총 상품 금액
        total = totalPrice + 3000; //총 주문금액

        $cartList.insertAdjacentHTML('beforeend', `
          <div class="item">
            <a href="#">
              <img class="itemInfo" src="${foundItem.img}"/>
            </a>    
            <a href="#">
              <span class="itemInfo">${foundItem.name}</span>
            </a>  
            <div class="itemInfo_btn_updown itemInfo">
              <button id="QuantityDown" class="button is-danger is-light">-</button>
              <input id="QuantityInput" class="input" type="number" value="${cart.quantity}" />
              <button id="QuantityUp" class="button is-info is-light">+</button>
            </div>
            <span class="itemInfo">${foundItem.price}</span>
            <span class="itemInfo totalItemPrice">${totalItemPrice}</span>             
          </div>`
        );
      });

      $payInfo.innerHTML = `
        <div class="payInfoTitle">결제정보</div>
        <div class="totalItemQuantity">상품 수량 ${totalItemQuantity}</div>
        <div class="totalPrice">상품 금액 ${totalPrice}원</div>
        <div>배송비 3,000원</div>
        <div class="total">총 ${total}원</div>
        <button type="button">주문하기</button>
      `;
    }
    return document;
  })
  .then((document) => {

    //document 렌더링 후 수량 조절버튼 작동
    const $downButton = document.querySelectorAll('#QuantityDown');
    const $upButton = document.querySelectorAll('#QuantityUp');
    let $totalItemQuantity = document.querySelector('.totalItemQuantity'); //주문확인칸 .totalItemQuantity 태그(총 수량)
    // let $totalItemPrice = document.querySelector('.totalItemPrice'); //장바구니 목록 상품 당 총 금액
    let $totalPrice = document.querySelector('.totalPrice'); //주문확인칸 총 상품 금액
    let $total = document.querySelector('.total'); //주문확인칸 총 주문금액

    const countItem = (e) => {
      let inputValue = e.target.parentNode.childNodes[3]; //현재 수량
      let itemPrice = convertToNumber(e.target.parentNode.parentNode.childNodes[7].textContent); //제품 하나 당 가격
      let totalItemPrice = e.target.parentNode.parentNode.childNodes[9]; //장바구니 목록 .totalItemPrice 태그(제품 별 총 금액)

      if (e.target.textContent === '+' && inputValue.value <= 999) {
        inputValue.value = Number(inputValue.value) + 1;
        const plusedItemQuantity = parseInt($totalItemQuantity.textContent.substring(6)) + 1;
        $totalItemQuantity.textContent = '상품 수량 ' + plusedItemQuantity + '원'; //주문확인칸 총 수량
        totalItemPrice.textContent = parseInt(totalItemPrice.textContent) + itemPrice; //장바구니 목록 상품별 총 금액
        $totalPrice.textContent = '상품 금액 ' + (parseInt($totalPrice.textContent.substring(6)) + itemPrice) + '원';  //주문확인칸 총 상품금액

      } else if (e.target.textContent === '-' && inputValue.value >= 1) {
        inputValue.value = Number(inputValue.value) - 1;
        const minusedItemQuantity = parseInt($totalItemQuantity.textContent.substring(6)) - 1;
        $totalItemQuantity.textContent = '상품 수량 ' + minusedItemQuantity + '원';
        totalItemPrice.textContent = parseInt(totalItemPrice.textContent) - itemPrice;
        $totalPrice.textContent = '상품 금액 ' + (parseInt($totalPrice.textContent.substring(6)) - itemPrice) + '원'; 
      }

      $total.textContent = '총 ' + (parseInt($totalPrice.textContent.substring(6)) + 3000) + '원'; //주문확인칸 총 주문금액
      if (parseInt($totalPrice.textContent.substring(6)) === 0){
        $total.textContent = '총 0원';
      }
    };

    $downButton.forEach((e) => e.addEventListener('click', countItem));
    $upButton.forEach((e) => e.addEventListener('click', countItem));
  });