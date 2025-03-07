const express = require('express');
const { createToken, getTokens, updateToken } = require('../controller/tokenController');
const router = express.Router();

router.post( '/new-token', createToken);
router.get( '/tokens', getTokens);
router.put( '/update/:tokenId', updateToken);

module.exports = router;