import Joi from "joi";
import { RefreshToken } from "../../models/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import { REFRESH_SECRET } from "../../config/index.js";
import JwtServices from "../../services/JwtServices.js";
import { User } from "../../models/index.js";

const refreshController = {
     async refresh(req, res, next) {

        //validate the request
        const refreshSchema = Joi.object({
             refresh_token : Joi.string().required(),
        });

        const { error} = refreshSchema.validate(req.body);

        if(error){
            return next(error);
        }

        //database 
        let refreshtoken
        try {
           refreshtoken =   await RefreshToken.findOne({token: req.body.refresh_token});
           
           if(!refreshtoken){
              return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
           }

           let userId;
           try{
                const {_id} = await JwtServices.verify(refreshtoken.token, REFRESH_SECRET);
                userId = _id;

           }catch(err){
               return next(CustomErrorHandler.unAuthorized('Invalid refresh token 1'));
           }

            //check in database
           const user = await User.findOne({_id: userId});
          
           if(!user){
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token 2'));
           }

                 //tokens
                  //Generate the token
                  const access_token = JwtServices.sign({_id: user._id, role: user.role})
                  const refresh_token = JwtServices.sign({id: user._id, role: user.role}, '1y', REFRESH_SECRET);
       
                  await RefreshToken.create({token: refresh_token}); 
       
                  res.json({access_token , refresh_token});

        }
        catch (err){
                return next(new Error('Something went wrong' + err.message));
        }
     }
}

export default refreshController;