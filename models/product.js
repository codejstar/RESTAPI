import mongoose from "mongoose";
import { APP_URL } from "../config/index.js";

const productSchema = new mongoose.Schema(
    {
          name: {type: String, required: true},
          price: {type: Number, required: true},
          size: {type: String, required: true},
          image: {type: String, required: true, get: (image) => {
            //uploads\\1705148400561-624351791.jpg to http://loacalhost:5000/uploads\\1705148400561-624351791.jpg
                return `${APP_URL}/${image}`;
          }
        }
    },
    {
        timestamps: true , toJSON: {getters: true} , id: false
    }
);

export default  mongoose.model('Product', productSchema , 'Products');