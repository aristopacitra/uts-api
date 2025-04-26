const express = require('express');
const router = express.Router();
const controller = require('../controllers/schedulesController');

router.get('/', controller.getAllSchedules);
router.post('/', controller.createSchedule);
router.put('/:id', controller.updateSchedule);
router.delete('/:id', controller.deleteSchedule);

module.exports = router;