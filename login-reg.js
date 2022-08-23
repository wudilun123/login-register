'use strict'

let countdown = 60;
let smsButton = document.getElementById('sms_button');
let classTop = document.querySelector('.top');
let ball = document.querySelector('#ball');
let signStatusSet = document.querySelectorAll('.signstatus');
let bottom = document.querySelector('.bottom');
let tipElem = null;

document.addEventListener('click', function (event) {
    let elem = event.target;
    if (elem.closest('.top') == classTop && elem != classTop) {
        // 添加翻转
        ball.classList.toggle('ballon');
        for (let signStatus of signStatusSet) signStatus.classList.toggle('highlight');
        ball.classList.contains('ballon') ? bottom.style.transform = "rotateY(180deg)" : bottom.style.transform = "rotateY(0deg)";
    }
    if (elem.matches('.clear')) {
        //清除对应input元素的内容
        elem.previousElementSibling.value = '';
    }
})

document.addEventListener('selectstart', function (event) {
    if (event.target.tagName != 'INPUT') event.preventDefault();
})

document.addEventListener('focusin', function (event) {
    let elem = event.target;
    let tipText = elem.dataset.tip;
    if (!tipText) return;
    tipElem = document.createElement('div');
    tipElem.className = 'tip'
    tipElem.textContent = tipText;
    document.body.append(tipElem);
    let elemCoords = elem.getBoundingClientRect();
    let right = document.documentElement.clientWidth - elemCoords.left + 5;
    let top = elemCoords.top;
    tipElem.style.right = right + 'px';
    tipElem.style.top = top + 'px';

})

document.addEventListener('focusout', function (event) {
    if (tipElem) {
        tipElem.remove();
        tipElem = null;
    }

})

smsButton.onclick = function () {
    if (countdown == 0) {
        smsButton.removeAttribute("disabled");
        smsButton.textContent = "免费获取验证码";
        countdown = 60;
        return;
    } else {
        smsButton.setAttribute("disabled", true);
        smsButton.textContent = "重新发送(" + countdown + ")";
        countdown--;
    }
    setTimeout(() => smsButton.onclick(), 1000)
}

