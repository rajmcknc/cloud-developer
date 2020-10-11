import express from 'express';
import bodyParser from 'body-parser';
import { isValidImageUrl,filterImageFromURL, deleteLocalFiles } from './util/util';


(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  //  
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file 

    /**************************************************************************** */
    app.get("/filteredimage", async (req, res) => {
        //Get image_url query parameter
        const { image_url } = req.query;
        console.log("image_url parameter received: " + image_url);

        //1 - Validate to make sure the URL is an image
        isValidImageUrl(image_url)
            //If its a valid image URL, go ahead with filter image from the URL
            .then((isValidImage) => {
                if (isValidImage) {
                    //2 - Call filterImageFromURL to filter the image
                    filterImageFromURL(image_url)
                        //3 - From the promise,get absolute path to the filtered image locally saved, 
                        //    and send it in the response.  
                        .then((localFilteredImgAbsPath) => {
                            //Send filtered image and then call delete local file using callback
                            return res.sendFile(localFilteredImgAbsPath, function () {
                                console.log('Local Image Path: ' + localFilteredImgAbsPath);
                                // 4 - deletes the local file of the filtered image after sending the file using callback
                                deleteLocalFiles([localFilteredImgAbsPath]);
                            });
                        })
                }
                //Invalid image URL, so return with a message
                else {
                    return res.status(400).send('Please correct the image url to point to a valid image');
                }
            })
            //Handle error if an error is thrown while processing filtering the image, sending it through response or when deleting the local image.
            .catch(error => {
                console.log(error.message)
                return res.status(422).send('Error filtering image from URL');
            });
    });

  
  // Root Endpoint
  // Displays a simple message to the user
    app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();