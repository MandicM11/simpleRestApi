const jwt = require ('jsonwebtoken')
const bcrypt =  require ('bcryptjs')
const asyncHandler = require ('express-async-handler')
const User = require('../models/userModel')

// @desc    Register new user
// @route   POST /api/users
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
    const { name, email,password } = req.body

//check if all of the fields are entered

    if(!name || !email || !password) {
        res.status(400)
        throw new Error ('Plaseas add all fields')
    }
//check if the user exsists

const userExsists = await User.findOne({email})

if(userExsists){
    res.status(400)
    throw new Error ('user already exsists')
}

// Hash password

const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(password, salt)

//create user
const user = await User.create({
    name,
    email,
    password: hashedPassword,
})

if(user){
    res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
    })
}
else{
   res.status(400)
   throw new Error('Invalid user data') 
}



    
})

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public

const loginUser = asyncHandler(async(req,res) => {

    const {email, password} = req.body
    const user = await User.findOne({ email })

    if(user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }
    else{
        res.status(400)
        throw new Error('Invalid credentials') 
     }
    
})
// @desc    GEt user data
// @route   GET /api/users/me
// @access  Private

const getMe = asyncHandler(async(req,res) => {
   const {_id, name, email} = await User.findById(req.user.id)

   res.status(200).json({
    id: _id,
    name,
    email,
   })
})

//generate JWT

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    } 
    )
}


module.exports = {
    registerUser,
    loginUser,
    getMe,

}