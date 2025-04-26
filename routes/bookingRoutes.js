const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');

router.get('/', controller.getAllBookings);
router.get('/filter', controller.getBookingByFilter);
router.post('/', controller.createBooking);
router.put('/:id', controller.updateBooking);
router.delete('/:id', controller.deleteBooking);

module.exports = router;