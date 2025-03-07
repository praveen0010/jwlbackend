const express = require('express');
const { createSchema,getPrices,getPricesfilter } = require('../controller/pricesController');
const router = express.Router();

router.post('/prices', createSchema);
router.get('/getprices',getPrices)
router.get('/getPricesfilter',getPricesfilter)


module.exports = router;
