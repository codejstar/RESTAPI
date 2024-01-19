import CustomErrorHandler from "../services/CustomErrorHandler.js";
import { User } from "../models/index.js";

const admin = async (req,res,next) => {
       try{
            const user = await User.findOne({_id: req.user._id});

            if(user.role === 'admin'){
                next();
            }
            else{
                return next(CustomErrorHandler.unAuthorized());
            }
       }catch(e){
            return next(CustomErrorHandler.serverError());
       }
}
export default admin;