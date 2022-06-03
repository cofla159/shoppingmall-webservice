import {body, validationResult} from 'express-validator';

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

