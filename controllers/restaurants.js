const Restaurant = require('../models/Restaurant.js');
const Reservation = require('../models/Reservation.js');
const User = require('../models/User.js');

//@desc     Get all restaurants
//@route    GET /api/v1/restaurants
//@access   Public
exports.getRestaurants=async (req,res,next)=>{
    try {
        const restaurants = await Restaurant.find({}, 'name address phone openTime closeTime owner');
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
        const restaurant = await Restaurant.findById(req.params.id, 'name address phone openTime closeTime owner');
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
//@access   Private (admin, owner)
exports.createRestaurant=async (req,res,next)=>{
    try{
        // An owner can only create/manage one restaurant
        if(req.user.role === 'owner'){
            if(req.user.ownedRestaurant){
                return res.status(400).json({
                    success: false,
                    message: 'Owner can only manage one restaurant. You already have a restaurant assigned.'
                });
            }
        }

        const restaurant = await Restaurant.create(req.body);

        // Link the new restaurant to the owner user bidirectionally
        if(req.user.role === 'owner'){
            await User.findByIdAndUpdate(req.user.id, { ownedRestaurant: restaurant._id });
            await Restaurant.findByIdAndUpdate(restaurant._id, { owner: req.user.id });
            restaurant.owner = req.user.id;
        }

        res.status(201).json({success:true, data:restaurant});
    } catch(err){
        res.status(400).json({success:false, message: err.message});
    }
}

//@desc     Update single restaurant
//@route    PUT /api/v1/restaurants/:id
//@access   Private (admin, owner of this restaurant)
exports.updateRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(404).json({success:false, message:`Restaurant not found with id of ${req.params.id}`});
        }

        // Owner can only update their own restaurant
        if(req.user.role === 'owner'){
            if(!restaurant.owner || restaurant.owner.toString() !== req.user.id){
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to update this restaurant'
                });
            }
        }

        const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({success:true, data: updated});
    } catch(err) {
        res.status(400).json({success:false, message: err.message});
    }
}

//@desc     Delete single restaurant
//@route    DELETE /api/v1/restaurants/:id
//@access   Private (admin, owner of this restaurant)
exports.deleteRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(404).json({success:false, message: `Restaurant not found with id of ${req.params.id}`});
        }

        // Owner can only delete their own restaurant
        if(req.user.role === 'owner'){
            if(!restaurant.owner || restaurant.owner.toString() !== req.user.id){
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to delete this restaurant'
                });
            }
        }

        await Reservation.deleteMany({restaurant: req.params.id});
        await Restaurant.deleteOne({_id: req.params.id});

        // Clear the ownedRestaurant reference on the owner user
        if(restaurant.owner){
            await User.findByIdAndUpdate(restaurant.owner, { ownedRestaurant: null });
        }

        res.status(200).json({success:true, data: {}});
    } catch(err) {
        res.status(400).json({success:false, message: err.message});
    }
}
