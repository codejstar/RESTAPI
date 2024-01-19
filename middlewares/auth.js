import CustomErrorHandler from "../services/CustomErrorHandler.js";
import JwtServices from "../services/JwtServices.js";

const auth = async (req,res,next) => {
    //collect all headers we are send on the request api
   let authHeader = req.headers.authorization;
   
  console.log(authHeader);
   
   if(!authHeader) {
       return next(CustomErrorHandler.unAuthorized());
   }

   const token = authHeader.split(' ')[1];
   console.log(token);

     try {
          const { _id ,role} = await JwtServices.verify(token);
          
          const user = {
             _id,
             role
          }

          req.user = user;
          next();
    
         

     }catch(err) {
            return next(CustomErrorHandler.unAuthorized());
     }
}

export default auth;

  //   req.user = {};
        //   req.user._id = _id;
        //   req.user.role = role;