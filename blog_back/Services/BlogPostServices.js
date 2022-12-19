const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

//for adding a Blog Post
async function AddPost(Title, PostText, ImageName, ImageDir, AuthorUsername, PostCategories) {
    var PostID = 1;
    //connecting to DB
    const client = new Client({
        user: 'dongjin',
        database: 'blogserver',
        password: 'iGmHMDcTQxdlLNPAA3EDSQJVpG22XmcC',
        port: 5432,
        host: 'dpg-ceg87q4gqg4b3hd2g620-a',
    })
    client.connect();

    try {

        //getting a unique PostID that doesnt already exist in the database
        const result = await client.query(`SELECT PostID FROM BlogPost ORDER BY PostID ASC`)
        result.rows.forEach((row) => {
            if (PostID == row.postid) {
                PostID++;
            }
        })

        //add this post to BlogPost table
        await client.query(`INSERT INTO BlogPost VALUES($1, $2, $3, $4, $5, $6)`, [PostID, Title, PostText, ImageName, ImageDir, AuthorUsername])

        //add this post to PostCategories table
        for (var i=0; i<PostCategories.length; i++) {
            const PostCategory = PostCategories[i]
            await client.query(`INSERT INTO PostCategories VALUES($1, $2)`, [PostCategory, PostID])
        }

        //add this post to PostCategories table for All
        await client.query(`INSERT INTO PostCategories VALUES(0, $1)`, [PostID])
    } catch(err) {
        console.log(err)
    } finally {
        client.end();   
    }
}

//serving the posting of blogs
async function PostBlogServicer (Data, Image) {

    //get extension of the image file
    var extension;
    for (var i = Image.name.length - 1; i >= 0; i--) {
        if (Image.name[i] == '.') {
            extension = Image.name.slice(i)
            break
        }
    }

    //get directory of folder where image is to be stored
    const FileDir = path.join(__dirname, '../Images')

    //get a unique file name and store the image as that name in server
    var ImageDir;
    try {
        const files = await fs.promises.readdir(FileDir) //read all file names in the Images blog_post/blog_back/Images directory
        var name = 1; //image names start with 1
        files.forEach(function (file) { //iterate through the file names
            var filename;
            var fileextension;

            //separate the file name and extensions and store them in filename and fileextension respectively
            for (var i=file.length-1; i>=0; i--) { 
                if (file[i] == '.') {
                    fileextension = file.slice(i)
                    filename = parseInt(file.slice(0, i)) //store the fiename as an integer because it makes it easier to get unique file names for our new Image later
                }
            }

            // side node: made the comparison into uppercase because .png=.PNG, etc...
            if(extension.toUpperCase() == fileextension.toUpperCase()) { //if the current file's extension is the same as that of the image we want to add, we must make sure their names are different
                
                //assigns name to be an integer that is 1 larger than the largest integer with the same extension
                //thus, name + extension is now unique in the directory
                if (name <= filename) {
                    name = filename + 1;
                }
            }
        });
    
        //the unique Image file name
        const newIMGname = name + extension
    
        //save the Image in the directory
        Image.mv(`./Images/${newIMGname}`)
    
        //get directory of the file to be saved in DB for future use
        ImageDir = path.join(__dirname, `../Images/${newIMGname}`)
    } catch(err) {
        console.log(err)
    }
    console.log(ImageDir)
    //getting details about the blog post
    const Title = Data.Title
    const PostText = Data.PostText
    const AuthorUsername = Data.AuthorUsername;
    const ImageName = Image.name
    const PostCategories = Data.Categories.split(',');

    AddPost(Title, PostText, ImageName, ImageDir, AuthorUsername, PostCategories); //add the post using the method AddPost()
    
    return {res: 'success!'} //respond with a successful message
}

//serving the getting of blogs
async function GetBlogs(Data) {

    //getting the received Categories data into an array of integers
    var Cats = Data.Cats;
    Cats = Cats.split(',')
    for (var i=0; i<Cats.length; i++) {
        Cats[i] = parseInt(Cats[i])
    }

    //connect to DB
    const client = new Client({
        user: 'dongjin',
        database: 'blogserver',
        password: 'iGmHMDcTQxdlLNPAA3EDSQJVpG22XmcC',
        port: 5432,
        host: 'dpg-ceg87q4gqg4b3hd2g620-a',
    })
    client.connect();

    var Posts = [];
    try {
        const result = await client.query(`SELECT DISTINCT X.PostID, X.Title, X.PostText, X.ImgName, X.ImgDir, X.Username, X.DisplayName FROM (SELECT BlogPost.PostID, BlogPost.Title, BlogPost.PostText, BlogPost.ImgName, BlogPost.ImgDir, Users.Username, Users.DisplayName FROM BlogPost JOIN Users ON BlogPost.Username = Users.Username) X JOIN PostCategories Y ON X.PostID=Y.PostID WHERE Y.CategoryID = ANY($1::int[])`, [Cats]) //select the blog posts from DB
        if (result.rows.length == 0) { //if no posts exists in DB, end connection to DB and respond with a null
            client.end();
            return {res: null}
        }

        //if post(s) exists,
        //iterate through the results to add information about post to array Posts
        for (var i=0; i<result.rows.length; i++) {
            row = result.rows[i]
            ImageBuffer = await fs.promises.readFile(row.imgdir) //get Buffer data of the image using the directory stored in the DB

            Posts[i] = {PostID: row.postid, Title: row.title, PostText: row.posttext, ImageName: row.imgname, Image: ImageBuffer.toString('base64') /* convert the Image Buffer Data into a base64 string such that it can be easily displayed on front end */, Username: row.username, DisplayName: row.displayname} //add to array Posts
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: Posts} //respond with the data of the Posts
}

//serving the deletion of blogs
async function DeleteBlogServicer(Data) {

    //connect to DB
    const client = new Client({
        user: 'dongjin',
        database: 'blogserver',
        password: 'iGmHMDcTQxdlLNPAA3EDSQJVpG22XmcC',
        port: 5432,
        host: 'dpg-ceg87q4gqg4b3hd2g620-a',
    })
    client.connect();

    //get PostID to Delete
    const PostID = await Data.PostID;

    try {
        const result = await client.query(`SELECT ImgDir FROM BlogPost WHERE PostID = $1`, [PostID]) //query the DB for the directory of the image to delete from server
        const ImgDir = result.rows[0].imgdir
        fs.promises.unlink(ImgDir) //delete the image file at the directory ImgDir
        await client.query(`DELETE FROM Comments WHERE PostID=$1`, [PostID]) //Delete all Comments related to this Post
        await client.query(`DELETE FROM PostCategories WHERE POSTID=$1`, [PostID]) //Delete all the entries in PostCategories
        await client.query(`DELETE FROM Likes WHERE PostID=$1`, [PostID]) //Delete all the entries in Likes
        await client.query(`DELETE FROM BlogPost WHERE PostID=$1`, [PostID]) //Delete the Post with PostID given in Data from the DB
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'} //respond with a successful message
}

//serving the updating of blogs
async function UpdateBlogServicer(Data, Image) {
    //get data from Data
    const PostID = Data.PostID
    const Title = Data.Title
    const PostText = Data.PostText
    const ImgName = Image.name
    const Categories = JSON.parse(Data.Categories) //Categories was sent as a string so convert back to array

    //connecting to DB
    const client = new Client({
        user: 'dongjin',
        database: 'blogserver',
        password: 'iGmHMDcTQxdlLNPAA3EDSQJVpG22XmcC',
        port: 5432,
        host: 'dpg-ceg87q4gqg4b3hd2g620-a',
    })
    client.connect();

    //get extension of the image file
    var extension;
    for (var i = Image.name.length - 1; i >= 0; i--) {
        if (Image.name[i] == '.') {
            extension = Image.name.slice(i)
            break
        }
    }

    //get directory of folder where image is to be stored
    const FileDir = path.join(__dirname, '../Images')

    //get a unique file name and store the image as that name in server
    var ImageDir;
    try {
        const files = await fs.promises.readdir(FileDir) //read all file names in the Images blog_post/blog_back/Images directory
        var name = 1; //image names start with 1
        files.forEach(function (file) { //iterate through the file names
            var filename;
            var fileextension;

            //separate the file name and extensions and store them in filename and fileextension respectively
            for (var i=file.length-1; i>=0; i--) { 
                if (file[i] == '.') {
                    fileextension = file.slice(i)
                    filename = parseInt(file.slice(0, i)) //store the fiename as an integer because it makes it easier to get unique file names for our new Image later
                }
            }

            // side node: made the comparison into uppercase because .png=.PNG, etc...
            if(extension.toUpperCase() == fileextension.toUpperCase()) { //if the current file's extension is the same as that of the image we want to add, we must make sure their names are different
                
                //assigns name to be an integer that is 1 larger than the largest integer with the same extension
                //thus, name + extension is now unique in the directory
                if (name <= filename) {
                    name = filename + 1;
                }
            }
        });
        //the unique Image file name
        const newIMGname = name + extension
        
        //save the Image in the directory
        Image.mv(`./Images/${newIMGname}`)
        
        //get directory of the file to be saved in DB for future use
        ImageDir = path.join(__dirname, `../Images/${newIMGname}`)

    } catch(err) {
        console.log(err)
    }

    try {
        const result = await client.query(`SELECT ImgDir FROM BlogPost WHERE PostID = $1`, [PostID]) //query the DB for the directory of the image to delete from server
        const OGImageDir = result.rows[0].imgdir //get the directory of the old image file

        //delete the old image file from the directory
        fs.promises.unlink(OGImageDir)

        await client.query(`UPDATE BlogPost SET Title=$1, PostText=$2, ImgName=$3, ImgDir=$4 WHERE PostID=$5`, [Title, PostText, ImgName, ImageDir, PostID]) //Update the DB for BlogPost table

        //Update the PostCategories table
        await client.query(`DELETE FROM PostCategories WHERE PostID=$1 AND CategoryID!=$2`, [PostID, 0]) //Delete the original categories from PostCategories
        for (var i=0; i<Categories.length; i++) {
            const Category = Categories[i]
            await client.query(`INSERT INTO PostCategories VALUES($1, $2)`, [Category.categoryid, PostID]) //iterate through Categories to add everything in
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'}
}

module.exports = {PostBlogServicer, GetBlogs, DeleteBlogServicer, UpdateBlogServicer};