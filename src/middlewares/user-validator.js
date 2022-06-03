import {body, validationResult} from 'express-validator';
import 'module-alias/register';
import { userModel } from '@db';


//유효성 에러 검사 함수
const validate = (req,res,next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({messasge : errors.array()[0]})};

    return next();
};

// 프론트에서 걸러진 로그인 정보 백단에서 유효성 재검사
export const validateLogin = [
    body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Invalid email'),
       
     validate
];

// 회원가입시 이메일, 비밀번호 최대길이 유효성 검사 
// 참고)프론트에서 비밀번호 최소 길이 유효성 검사
export const validateSignup = [
    
    body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Invalid email')
    .custom(value => {
        return userModel
                .findByEmail(value)
                .then( user => {
                    if(user) {
                        return Promise.reject("Email already in use")
                    }
                })
    }),

    body('password')
    .isLength({max:10, min:4})
    .withMessage('Password is too long. Make its length less than 10'),

    validate
    
]
 

