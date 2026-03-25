const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

// ...existing code from refactored appointments.js, now for reservations...
// You may want to further customize business logic for restaurant-specific needs.

//@desc Get all reservations
//@route GET /api/v1/reservations
//@access Private
exports.getReservations=async (req,res,next)=>{
    let query;
    if(req.user.role === 'admin'){
        if(req.params.restaurantId) {
            query = Reservation.find({restaurant:req.params.restaurantId}).populate({
                path: 'restaurant',
                select: 'name address phone'
            }).populate({ path: 'user', select: 'name email telephone role' });
        } else {
            query = Reservation.find().populate({
                path: 'restaurant',
                select: 'name address phone'
            }).populate({ path: 'user', select: 'name email telephone role' });
        }
    } else if(req.user.role === 'owner'){
        // Owner sees only reservations for their own restaurant
        const ownedRestaurantId = req.user.ownedRestaurant;
        if(!ownedRestaurantId){
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        query = Reservation.find({restaurant: ownedRestaurantId}).populate({
            path: 'restaurant',
            select: 'name address phone'
        }).populate({ path: 'user', select: 'name email telephone role' });
    } else {
        query = Reservation.find({user:req.user.id}).populate({
            path: 'restaurant',
            select: 'name address phone'
        }).populate({ path: 'user', select: 'name email telephone role' });
    }
    try{
        const reservations = await query;
        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
}

//@desc Get single reservation
//@route GET /api/v1/reservations/:id
//@access Public
exports.getReservation=async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address phone'
        }).populate({ path: 'user', select: 'name email telephone role' });
        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Cannot find Reservation'
        });
    }
}

//@desc Add single reservation
//@route POST /api/v1/restaurants/:restaurantId/reservations/
//@access Private
exports.addReservation=async (req,res,next)=>{
    try{
        req.body.restaurant = req.params.restaurantId;
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if(!restaurant){
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }
        req.body.user = req.user.id;

        if (req.body.reservationDate) {
            req.body.reservationDate = new Date(req.body.reservationDate.replace('00000Z', '00.000Z'));
        }

        const existedReservations = await Reservation.find({user:req.user.id});
        if(existedReservations.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`});
        }
        const reservation = await Reservation.create(req.body);
        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch(err){
        console.log('=== RESERVATION ERROR ===');
        console.log(err.message);      // บอกว่า error อะไร
        console.log(err.stack);        // บอก line ที่ error
        console.log('req.body:', req.body);  // ดูว่า frontend ส่งอะไรมา
        return res.status(500).json({
            success: false,
            message: 'Cannot create reservation',
            msg: err.stack
        });
    }
}

//@desc Update reservation
//@route PUT /api/v1/reservations/:id
//@access Private
exports.updateReservation=async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with the id ${req.params.id}`
            });
        }
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
        }

        if (req.body.reservationDate) {
            req.body.reservationDate = new Date(req.body.reservationDate.replace('00000Z', '00.000Z'));
        }
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err){
        console.log('=== RESERVATION ERROR ===');
        console.log(err.message);      // บอกว่า error อะไร
        console.log(err.stack);        // บอก line ที่ error
        console.log('req.body:', req.body);  // ดูว่า frontend ส่งอะไรมา
        return res.status(500).json({
            success: false,
            message: 'Cannot update reservation',
            msg: err.stack
        });
    }
}

//@desc Delete reservation
//@route DELETE /api/v1/reservations/:id
//@access Private
exports.deleteReservation=async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this reservation`});
        }
        await reservation.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Cannot delete Reservation'
        });
    }
}
