const validate = (schema)=> async (req,res,next)=>{
    try {
        console.log('req.body => ', JSON.stringify(req.body, null, 2));
        const parseBody = await schema.parseAsync(req.body);
        req.body=parseBody;
        next();
    } catch (err) {
        const status= 422;
        const message ="Fill the input properly";
        console.log('Validation error:', err?.errors || err?.message || err);
        const extraDetail = err?.errors?.[0]?.message || err?.message || 'Validation failed';
        const error={
            status,
            message,
            extraDetail,
        }
        next(error);
    }
}
module.exports = validate;
