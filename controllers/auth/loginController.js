import {RefreshToken, User} from '../../models/index.js';
import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler.js';
import JwtServices from '../../services/JwtServices.js';
import bcrypt from 'bcrypt';
import { REFRESH_SECRET } from '../../config/index.js';

const loginController = {
      async login(req,res,next){

        //validate the request
        const loginSchema = Joi.object({ 
            email: Joi.string().email().required(),
            password: Joi.string()
        })

        const {error} = loginSchema.validate(req.body);

        if(error){
          return next(error);
        }

        //Email is present or not
        try{
           const user = await User.findOne({email: req.body.email});

           if(!user){
              return next(CustomErrorHandler.wrongCredentials());
           }
           
           //compare the password            //api body passwork   //mongodb password
           const match = await bcrypt.compare(req.body.password, user.password);

           if(!match){
              return next(CustomErrorHandler.wrongCredentials());
           }

           //Generate the token
           const access_token = JwtServices.sign({_id: user._id, role: user.role})
           const refresh_token = JwtServices.sign({id: user._id, role: user.role}, '1y', REFRESH_SECRET);

           await RefreshToken.create({token: refresh_token}); 

           res.json({access_token , refresh_token});

        }catch(err){
           return next(err);
        }

      },

      async logout(req,res,next){

         //validate
         const refreshSchema = Joi.object({
            refresh_token : Joi.string().required(),
           });

          const { error} = refreshSchema.validate(req.body);

          if(error){
             return next(error);
          }

            try{
                await RefreshToken.deleteOne({token: req.body.refresh_token})
            }catch(error){
               return next(new Error('Something wrong in database: ' + error.message));
            }
         
            res.json({status: 1});
      }
}

export default loginController;