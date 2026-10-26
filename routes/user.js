const express = require('express');
const {handleUSerSignUp,handleUSerLogin} = require('../controllers/user');

const router = express.Router();

router.post('/',handleUSerSignUp);
router.post('/login',handleUSerLogin);

module.exports = router;
