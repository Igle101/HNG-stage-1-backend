function toValidateNameBody(name){
   
        

    if(!name || name.trim() === '' || name === undefined){
        return res.status(400).json({
            status: ' error',
            message: 'Missing or empty name',
        })
    };
    if(!isNaN ( name)){
        return {
            statusCode: 422,
            message: 'Entity: Invalid type',
        }
    };
    if(typeof name !== 'string'){
        return res.status(422).json({
            status: 'error',
            message:'Entity: Invalid type',


        })
    };
    return null;


}

module.exports = {toValidateNameBody};