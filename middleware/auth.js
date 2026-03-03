const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Protect routes
exports.protect=async (req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token || token === 'null'){
        return res.status(401).json({success: false, message: 'Not authorize to access this route'});
    }

    // 1. ลองปริ้นต์ token ดูก่อนว่าได้อะไรมา
    // console.log("Token ที่เซิร์ฟเวอร์ได้รับคือ:", token); 
    // 2. ลองปริ้นต์ Secret ดูด้วยว่าโหลดมาถูกไหม (ระวังอย่าให้ใครเห็น Secret จริงๆ นะครับ)
    // console.log("JWT Secret คือ:", process.env.JWT_SECRET ? "มีค่า" : "UNDEFINED!");

    try{
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch(err){
        console.log(err.stack);
        return res.status(401).json({success: false, message: 'Not authorize to access this route'});
    }
}

exports.authorize=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({success: false, message: `User role ${req.user.role} is not authorized to access this route`});
        }

        next();
    } 
}