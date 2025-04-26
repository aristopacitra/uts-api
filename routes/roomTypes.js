const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomTypesController');

router.get('/', controller.getAllRoomTypes);
router.get('/:id', controller.getRoomTypeById);
router.post('/', controller.createRoomType);
router.put('/:id', controller.updateRoomType);
router.delete('/:id', controller.deleteRoomType);

module.exports = router;