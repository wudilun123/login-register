'use strict'

import { MyAlert } from './myAlert.js'


let smsButton = document.getElementById('sms_button');
let classTop = document.querySelector('.top');
let ball = document.querySelector('#ball');
let signStatusSet = document.querySelectorAll('.signstatus');
let bottom = document.querySelector('.bottom');
let tipElem = null;
let myAlert = new MyAlert();

let usernameRegexp = /[0-9a-zA-Z]{6,11}$/;
let passwordRegexp = /[0-9a-zA-Z@#*\-+=,.]{6,16}$/;
let emailRegexp = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
let phoneRegexp = /[\d]{11}$/;
let smsNumRegexp = /[\d]{6}$/;



if (!localStorage.getItem('count')) localStorage.setItem('count', 60);
let countdown = localStorage.getItem('count');
smsButton.onclick = function () {
    //验证码获取
    if (countdown == 0) {
        smsButton.removeAttribute("disabled");
        smsButton.textContent = "免费获取验证码";
        localStorage.setItem('count', 60);
        countdown = localStorage.getItem('count');
        return;
    } else {
        smsButton.setAttribute("disabled", true);
        smsButton.textContent = "重新发送(" + countdown + ")";
        countdown--;
        localStorage.setItem('count', countdown);
    }
    setTimeout(() => smsButton.onclick(), 1000)
}
if (localStorage.getItem('count') != 60) smsButton.onclick();

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
    if (elem.id == 'signin_button') {
        //处理登录事件
        postSigninForm();
    }
    if (elem.id == 'signup_button') {
        //处理注册事件
        postSignupForm();
    }
})

document.addEventListener('selectstart', function (event) {
    //禁止选择INPUT以外的元素
    if (event.target.tagName != 'INPUT') event.preventDefault();
})

document.addEventListener('focusin', function (event) {
    //输入对应INPUT元素时弹出提示，为INPUT元素添加data-tip="xxx"特性即可使用
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
    if (right + tipElem.offsetWidth <= this.documentElement.clientWidth) {
        //左侧宽度足够放到元素左边
        tipElem.style.right = right + 'px';
        tipElem.style.top = top + 'px';
    } else {
        //左侧宽度不够就放到元素上方，宽度与其保持一致
        tipElem.style.width = getComputedStyle(elem).width;
        tipElem.style.bottom = document.documentElement.clientHeight - top + 5 + 'px';
        tipElem.style.left = elemCoords.left + 'px';
    }
})

document.addEventListener('focusout', function (event) {
    //失去焦点则提示消失
    if (tipElem) {
        tipElem.remove();
        tipElem = null;
    }
})

class ValidationError extends Error {
    constructor(message, elem) {
        //elem是验证失败的html元素
        super(message);
        this.name = "ValidationError";
        this.elem = elem;
    }
}

class HttpError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}


function checkSigninInfo({
    username,
    password,
}) {
    //正则检查登录输入是否合法并抛出对应error，参数是对应的input元素
    if (!usernameRegexp.test(username.value)) {
        if (!username.value) throw new ValidationError("用户名不能为空！", username);
        throw new ValidationError("用户名格式不正确！", username);
    }
    if (!passwordRegexp.test(password.value)) {
        if (!password.value) throw new ValidationError("密码不能为空！", password);
        throw new ValidationError("密码格式不正确！", password);
    }

}

function checkSignupInfo({
    username,
    password,
    passwordRe,
    email,
    phone,
    smsNum,
}) {
    //检查注册输入是否合法并抛出对应error，参数是对应的input元素，写法有待优化
    if (!usernameRegexp.test(username.value)) {
        if (!username.value) throw new ValidationError("用户名不能为空！", username);
        throw new ValidationError("用户名格式不正确！", username);
    }
    if (!passwordRegexp.test(password.value)) {
        if (!password.value) throw new ValidationError("密码不能为空！", password);
        throw new ValidationError("密码格式不正确！", password);
    }
    if (password.value != passwordRe.value) throw new ValidationError("两次输入的密码不一致！", passwordRe);
    if (!passwordRegexp.test(passwordRe.value)) {
        if (!passwordRe.value) throw new ValidationError("再次输入的密码不能为空！", passwordRe);
        throw new ValidationError("再次输入的密码格式不正确！", passwordRe);
    }
    if (!emailRegexp.test(email.value)) {
        if (!email.value) throw new ValidationError("邮箱不能为空！", email);
        throw new ValidationError("邮箱格式不正确！", email);
    }
    if (!phoneRegexp.test(phone.value)) {
        if (!phone.value) throw new ValidationError("手机号不能为空！", phone);
        throw new ValidationError("手机号格式不正确！", phone);
    }
    if (!smsNumRegexp.test(smsNum.value)) {
        if (!smsNum.value) throw new ValidationError("验证码不能为空！", smsNum);
        throw new ValidationError("验证码格式不正确！", smsNum);
    }
}

function handleSigninResponse(jsonResponse, signinInfo) {
    //根据后端返回的json数据进行处理，响应码200则提示登录成功，其余情况抛出对应error
    if (jsonResponse.code == 200) {
        localStorage.setItem('blogToken', jsonResponse.data.token);
        localStorage.setItem('username', jsonResponse.username);
        myAlert.showAlert("登录成功！");
    } else {
        switch (jsonResponse.code) {
            case 10200:
                throw new ValidationError("用户名不能为空！", signinInfo.username);
            case 10201:
                throw new ValidationError("密码不能为空！", signinInfo.password);
            case 10202:
                throw new ValidationError("用户名格式不正确！", signinInfo.username);
            case 10203:
                throw new ValidationError("密码格式不正确！", signinInfo.password);
            case 10210:
                throw new ValidationError("用户名不存在！", signinInfo.username);
            case 10220:
                throw new ValidationError("用户密码错误！", signinInfo.password);
        }
    }
}

function handleSignupResponse(jsonResponse, signupInfo) {
    //根据后端返回的json数据进行处理，响应码200则提示注册成功，其余情况抛出对应error
    if (jsonResponse.code == 200) {
        localStorage.setItem('blogToken', jsonResponse.data.token);
        localStorage.setItem('username', jsonResponse.username);
        myAlert.showAlert("注册成功！");
    } else {
        switch (jsonResponse.code) {
            case 10100:
                throw new ValidationError("用户名不能为空！", signupInfo.username);
            case 10101:
                throw new ValidationError("密码不能为空！", signupInfo.password);
            case 10102:
                throw new ValidationError("再次输入的密码不能为空！", signupInfo.passwordRe);
            case 10103:
                throw new ValidationError("邮箱不能为空！", signupInfo.email);
            case 10104:
                throw new ValidationError("手机号不能为空！", signupInfo.phone);
            case 10105:
                throw new ValidationError("验证码不能为空！", signupInfo.smsNum);
            case 10106:
                throw new ValidationError("用户名格式不正确！", signupInfo.username);
            case 10107:
                throw new ValidationError("密码格式不正确！", signupInfo.password);
            case 10108:
                throw new ValidationError("再次输入的密码格式不正确！", signupInfo.passwordRe);
            case 10109:
                throw new ValidationError("邮箱格式不正确！", signupInfo.email);
            case 10110:
                throw new ValidationError("手机号格式不正确！", signupInfo.phone);
            case 10111:
                throw new ValidationError("验证码格式不正确！", signupInfo.smsNum);
            case 10120:
                throw new ValidationError("两次输入的密码不一致！", signupInfo.passwordRe);
            case 10130:
                throw new ValidationError("用户名已存在！", signupInfo.username);
        }
    }
}

function handleError(error) {
    //全局error处理
    if (error instanceof ValidationError) {
        handleValidationError(error);
    } else if (error instanceof TypeError) {
        myAlert.showAlert("您的网络出了一些问题，请求未成功发送！");
    } else if (error instanceof HttpError) {
        myAlert.showAlert(`请求错误，响应码：${error.status}`)
    } else {
        myAlert.showAlert(`出现了一些未知问题！${error}`);
    }
}

function handleValidationError(error) {
    //显示错误信息并聚焦到出错的Input元素上
    myAlert.showAlert(error.message, () => error.elem.focus());
}

function postSigninForm() {
    let signinInfo = {};
    signinInfo.username = document.querySelector(".signin input[name=username]");
    signinInfo.password = document.querySelector(".signin input[name=password]");
    (async () => {
        checkSigninInfo(signinInfo);
        let response = await fetch('http://127.0.0.1:8000/v1/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(Object.fromEntries(Object.entries(signinInfo).map(item => [item[0], item[1].value]))),
        });
        if (response.status != 200) throw new HttpError("Http error", response.status);
        let jsonResponse = await response.json();
        handleSigninResponse(jsonResponse, signinInfo);
    })().catch(handleError);
}

function postSignupForm() {
    let signupInfo = {};
    signupInfo.username = document.querySelector(".signup input[name=username]");
    signupInfo.password = document.querySelector(".signup input[name=password]");
    signupInfo.passwordRe = document.querySelector(".signup input[name=password_re]");
    signupInfo.email = document.querySelector(".signup input[name=email]");
    signupInfo.phone = document.querySelector(".signup input[name=phone]");
    signupInfo.smsNum = document.querySelector(".signup input[name=sms_num]");
    (async () => {
        checkSignupInfo(signupInfo);
        let response = await fetch('http://127.0.0.1:8000/v1/users/reg/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(Object.fromEntries(Object.entries(signupInfo).map(item => [item[0], item[1].value]))),
        });
        if (response.status != 200) throw new HttpError("Http error", response.status);
        let jsonResponse = await response.json();
        handleSignupResponse(jsonResponse, signupInfo);
    })().catch(handleError);

}
