const express = require('express');
const { createPatient, getPatients } = require('../controller/patientController');
const router = express.Router();

router.post( '/patient', createPatient);
router.get( '/patients', getPatients);

module.exports = router;