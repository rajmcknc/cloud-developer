import express from 'express';
import bodyParser from 'body-parser';
import isUrl from 'is-url-superb';
import isImageURL = require('image-url-validator');
import { filterImageFromURL, deleteLocalFiles } from './util/util';


(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */
    app.get("/filteredimage", async (req, res) => {
        //Get image_url query parameter
        const { image_url } = req.query;
        console.log("image_url: " + image_url);

        //1.a - Make sure that the image_url is set and NOT empty
        if (!image_url) {
            return res.status(400)
                .send("Image URL NOT set");
        }

        //1.b - validate to make sure that imageURL query parameter is a URL
        if (!isUrl(image_url)) {
            return res.status(400)
                .send("Invalid URL");
        }

        //1.c - Using package 'image-url-validator', Validate to make sure the URL is an image
        if (isImageURL(image_url)) {

            //2 - Call filterImageFromURL to filter the image
           const localImageUrl = filterImageFromURL(image_url);

            //This variable holds the path to the local file of the image, which will be
            //later used to delete local file(s).
            let localPath: string = '';

            //3 - From the promise,get absolute path to the filtered image locally saved, 
            //    and send it in the response.  
            localImageUrl
                .then((url) => {
                    localPath = url;
                    console.log(url);
                    // 4 - deletes the local file of the filtered image after sending the file using callback
                    return res.sendFile(url, function () {
                        console.log('Local Path: ' + localPath);
                        deleteLocalFiles([localPath]);
                    });
                })
                //Handle error if an error is thrown while processing filtering the image, sending it through response or when deleting the local image.
                .catch(error => {
                    console.log(error.message)
                    return res.status(422).send('Error filtering image from URL');
                })
        } else {
            return res.status(400).send("Invalid Image");
        }
    });
  //! END @TODO1
  
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