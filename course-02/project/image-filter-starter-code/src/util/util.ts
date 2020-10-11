import fs from 'fs';
import Jimp = require('jimp');
import isUrl from 'is-url-superb';
import isImageURL = require('image-url-validator');

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

//This function does validation of the image url, makes sure its an image.
//INPUT: Image URL of type string.
//OUTPUT: boolean - True if its a valid image, else false.
export async function isValidImageUrl(imageUrl: string): Promise<boolean> {
    return new Promise(async (resolve,reject) => {
        //1.a - Make sure that the image_url is set and NOT empty
        if (!imageUrl) {
            resolve(false);
            return;
        }

        //1.b - validate to make sure that imageURL query parameter is a URL
        if (!isUrl(imageUrl)) {
            resolve(false);
            return;
        }

        //1.c - Using package 'image-url-validator', Validate to make sure the URL is an image
        isImageURL(imageUrl).
            then((isValidImage) => {
                resolve(isValidImage);
            })
            .catch((error) => {
                //Log the error message if we do reach here
                console.log(error.message);
                reject(error);
            })
    })
}