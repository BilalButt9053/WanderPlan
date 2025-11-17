
const errorMiddleware = (err, _req, res) => {
   
    const status = err?.status || 500;
    const message = err?.message || 'Internal Backend Error';
    const extraDetail = err?.extraDetail || 'Error From Backend';

    res.status(status).json({ message, extraDetail });
};

module.exports = errorMiddleware;