import Joi from 'joi';
import {RefreshToken, User} from '../../models/index.js';
import CustomErrorHandler from '../../services/CustomErrorHandler.js';
import bcrypt from 'bcrypt';
import JwtServices from '../../services/JwtServices.js';
import { REFRESH_SECRET } from '../../config/index.js';

const registerController = {
    async register(req, res, next) {
          // validate the request
          // authorise the request
          //check if user is in the database already
          // prepare model
          // store in database
          // generate jwt token
          // send response
        
          // validation
          const registerSchema = Joi.object({
               //first generate a schema
               name: Joi.string().min(3).max(30).required(), //method chaining
               email: Joi.string().email().required(),
               password: Joi.string().required(),
               repeat_password: Joi.ref('password')
          });

          console.log(req.body);
          const {error} = registerSchema.validate(req.body);

          if(error){
               return next(error);
          }

          //email already registered

          try 
          {
            const exist = await User.exists({email: req.body.email});
            if(exist){
               return next(CustomErrorHandler.alreadyExist('This email is already taken'));
            }

          }
          catch(err){
             return next(err);
          }

          //hash password
                                                      //rounds               
          const hashedPassword = await bcrypt.hash(req.body.password, 10);

          //prepare the model
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
          })

          //save into database
          let access_token;
          let refresh_token;

          try{
               const result = await user.save();

               //Token
             access_token =  JwtServices.sign({_id: result._id, role: result.role})
             refresh_token =  JwtServices.sign({_id: result._id, role: result.role},'1y',REFRESH_SECRET)

            //DATABASE whitelist
            await RefreshToken.create({token: refresh_token})


          }catch(err){
             return next(err);
          }

        res.json({access_token: access_token, refresh_token: refresh_token});
     }
}

export default registerController;