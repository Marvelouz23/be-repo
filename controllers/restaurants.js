const Restaurant = require('../models/Restaurant.js');
const Reservation = require('../models/Reservation.js');

// ...existing code from refactored hospitals.js, now for restaurants...
// This file is a direct copy of the refactored controller for restaurants.
// You may want to further customize business logic for restaurant-specific needs.

//@desc     Get all restaurants
//@route    GET /api/v1/restaurants
//@access   Public
exports.getRestaurants=async (req,res,next)=>{
    try {
        const restaurants = await Restaurant.find({}, 'name address phone openTime closeTime');
        res.status(200).json({success:true, count: restaurants.length, data: restaurants});
    } catch(err) {
        res.status(400).json({success:false});
    }
}

//@desc     Get single restaurant
//@route    GET /api/v1/restaurants/:id
//@access   Public
exports.getRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id, 'name address phone openTime closeTime');
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data: restaurant});
    } catch(err) {
        res.status(400).json({success:false});
    }
}

//@desc     Create a restaurant
//@route    POST /api/v1/restaurants
//@access   Private
exports.createRestaurant=async (req,res,next)=>{
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({success:true, data:restaurant});
}

//@desc     Update single restaurant
//@route    PUT /api/v1/restaurants/:id
//@access   Private
exports.updateRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data: restaurant});
    } catch(err) {
        res.status(400).json({success:false});
    }
}

//@desc     Delete single restaurant
//@route    DELETE /api/v1/restaurants/:id
//@access   Private
exports.deleteRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(404).json({success:false, message: `Restaurant not found with id of ${req.params.id}`});
        }
        await Reservation.deleteMany({restaurant: req.params.id});
        await Restaurant.deleteOne({_id: req.params.id});
        res.status(200).json({success:true, data: {}});
    } catch(err) {
        res.status(400).json({success:false});
    }
}
