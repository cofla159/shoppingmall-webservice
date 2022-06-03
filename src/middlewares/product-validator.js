import {body, validationResult} from 'express-validator';


// 상품 등록 및 수정시 price 타입 체크 - 숫자형 아니면 에러 반환
// 프론트와 정책 통일 

const validate = (req,res,next) => {
    
    const errors = validationResult(req);
    console.log('from validator error : ',errors);
    if(!errors.isEmpty()){
        return res.status(400).json({ reason : errors.array()[1]})};

    next();
};

export const validateProductPrice = [
    body('price')
    .isNumeric()
    .not()
    .withMessage('Set price in Number type'),

    validate

];   

