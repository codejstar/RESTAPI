import mongoose from "mongoose";


const refreshTokenSchema = new mongoose.Schema(
    {
          token : {type: String, unique: true},

    },
    {
        timestamps: false
    }
);

export default  mongoose.model('refreshToken', refreshTokenSchema , 'refreshTokens');