import { Product } from "../models/index.js";
import path from "path";
import fs from 'fs'; //it is file system module
import Joi from 'joi';
import productSchema from "../validators/productValidator.js";


//there are different ways to setup the multer library , some cases are we are used multer as middleware
// but in our case we are using multer as function

import multer from "multer";
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import { request } from "http";

// multer provide us freedom to change the name and path
//in this we are store our images
const storage = multer.diskStorage({
                                       //show error  //folder name
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {

        //create unique name
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

//limits size in bytes

const handleMultipartData = multer({storage, limits: {fileSize: 1000000 * 5}}).single('image') //5mb



const productController = {
    async store(req, res, next) 
          {

        //Multipart form data for images
        //by default in express there are no service to store the multipart data so we are used library multer

         handleMultipartData(req, res, async (err) => {
              if(err) {
                return next(CustomErrorHandler.serverError(err.message));
              }
              console.log(req.file);
              const filePath = req.file.path;
              
              //validate the request
              // const productSchema = Joi.object({
              //     name : Joi.string().required(),
              //     price : Joi.number().required(),
              //     size: Joi.string().required(),
              //  });
              // we are import productValidator instead of write these lines
    
              const { error} = productSchema.validate(req.body);

              if(error) {
                  //if error so we are delteing the uploaded image

                  //fs is a node module to delete the image
                  //fs is a file sytem module

                  //appRoot variable is  declared Globaly in the server.js file
                  fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if(err){
                      return next(CustomErrorHandler.serverError(err.message))
                    }
                  })

                  return next(error)
              }

              const {name, price, size} = req.body;

              let document;

              try{
                  document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                  })
              }catch(err){
                  return next(err)
              }
              
              res.status(201).json(document)
         }) 
        },

        //update method 
        update(req,res,next) {
          handleMultipartData(req, res, async (err) => {
            if(err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
           
            //first check the file path
            let filePath;

             if(req.file){
                  filePath = req.file.path;
             }
            
             console.log(filePath);
            //validate the request
            // const productSchema = Joi.object({
            //     name : Joi.string().required(),
            //     price : Joi.number().required(),
            //     size: Joi.string().required(),
            //  });
  
            const { error} = productSchema.validate(req.body);
            // console.log(req.body);

            if(error) {
                //if error so we are delteing the uploaded image

                //fs is a node module to delete the image
                //fs is a file sytem module

                //appRoot variable is  declared Globaly in the server.js file
                //we added if condition in update . if file is present then we delete the file
               
                if(req.file){
                  fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if(err){
                      return next(CustomErrorHandler.serverError(err.message))
                    }
                  })
                }

                return next(error)
            }

            const {name, price, size} = req.body;
            // console.log(name, price, size);
            // console.log(req.body.id);

            let document;

            try{
                document = await Product.findOneAndUpdate({ _id: req.params.id },{
                  name,
                  price,
                  size,
                  ...(req.file && {image: filePath})
                }, {new: true});

                // console.log(document);
              }catch(err){
                return next(err)
              }
              res.status(201).json(document)
            
       }) 
        
    },

   async destroy(req,res,next){ 

      const document = await Product.findOneAndDelete({ _id: req.params.id});

      if(!document){
          return next(new Error('Nothing to Delete'))
      }
      else{
        //image delete

        const imagePath = document._doc.image;
        
        fs.unlink(`${appRoot}/${imagePath}`, (err) => {
          if(err){
               return next(CustomErrorHandler.serverError());
          }
        });

        res.json(document);

      }
    },

    async index(req,res,next){ 
         let documents;

         //pagination 
         //mongoose pagination: for large databases

         try{
            documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});
         }
         catch(err){
            return next(CustomErrorHandler.serverError());
         }

         return res.json(documents);
    }, 
     
    async show(req,res,next){
          let document;
          try{
             document = await Product.findOne({_id: req.params.id}).select('-updatedAt -__v ');
          }catch(err){
            return next(CustomErrorHandler.serverError());
          }

          res.json(document);
    }


}

export default productController;
