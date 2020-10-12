import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import { config}  from '../../../../config/config' 
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url);
        }
    });
    res.send(items);
});

router.get('/getFilteredimage',
    requireAuth,
    async (req: Request, res: Response) => {
        const { image_url } = req.query;
        console.log('Image_Url: ' + image_url);
        console.log('Image Filter Instance:' + config.dev.eb_image_filter_instance);
        res.redirect(config.dev.eb_image_filter_instance + '/filteredimage?image_url=' + image_url);
    });


//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    if (!id) {
        return res.status(400)
            .send("PK is required");
    }
    const item = await FeedItem.findByPk(id);

    if (!item) {
        return res.status(400).send("Item NOT found for the PK")
    }

    res.send(item);
});

// update a specific resource
router.patch('/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        let { id } = req.params;

        if (!id) {
            return res.status(400)
                .send("PK is required");
        }

        const caption = req.body.caption;
        if (!caption || caption.length == 0) {
            return res.status(400)
                .send("Caption can't be empty");
        }

        const item = await FeedItem.findByPk(id);

        if (!item) {
            return res.status(400).send("Item NOT found for the PK")
        }
        item.caption = caption;
        const itemUpdate = await item.save();


        res.send(200).send(itemUpdate)
    });


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
    async (req: Request, res: Response) => {
        let { fileName } = req.params;
        const url = AWS.getPutSignedUrl(fileName);
        res.status(201).send({ url: url });
    });

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
        const caption = req.body.caption;
        const fileName = req.body.url;

        console.log("Caption: " + caption);
        console.log("fileName: " + fileName);

        // check Caption is valid
        if (!caption) {
            return res.status(400).send({ message: 'Caption is required or malformed' });
        }

        // check Filename is valid
        if (!fileName) {
            return res.status(400).send({ message: 'File url is required' });
        }

        const item = await new FeedItem({
            caption: caption,
            url: fileName
        });

        const saved_item = await item.save();

        saved_item.url = AWS.getGetSignedUrl(saved_item.url);
        res.status(201).send(saved_item);
    });


export const FeedRouter: Router = router;