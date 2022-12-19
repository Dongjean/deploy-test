const { Client } = require('pg');

//serving the getting of comments
async function GetCommentsServicer(Data) {
    const PostID = Data.PostID
    var Comments;

    //connect to DB
    const client = new Client({
        user: 'postgres',
        database: 'blogserver',
        password: 'sdj20041229',
        port: 5432,
        host: 'localhost',
      })
    client.connect();

    try {
        const result = await client.query(`SELECT CommentID, Users.Username, Comment, DisplayName FROM Comments JOIN Users ON Comments.Username = Users.Username WHERE Comments.PostID = $1`, [PostID]) //query the DB for all Comments with corresponding CommentID, Username and DisplayName
        Comments = result.rows //put the resultant array of Comment information into Comments
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: Comments} //respond with this array with key 'res'
}

//serving the adding of comments
async function AddCommentServicer(Data) {
    var CommentID = 1;
    //connecting to DB
    const client = new Client({
        user: 'postgres',
        database: 'blogserver',
        password: 'sdj20041229',
        port: 5432,
        host: 'localhost',
      })
    client.connect();

    try {

        //getting a unique CommentID that doesnt already exist in the database
        const result = await client.query(`SELECT CommentID FROM Comments ORDER BY CommentID ASC`)
        result.rows.forEach((row) => {
            if (CommentID == row.commentid) {
                CommentID++;
            }
        })

        //get all the rest of the information on the new comment
        const PostID = Data.PostID;
        const Username = Data.Username;
        const NewComment = Data.NewComment;
    
        await client.query(`INSERT INTO Comments VALUES($1, $2, $3, $4)`, [CommentID, PostID, Username, NewComment]) //add the new comment into the DB

    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'} //respond with a successful message
}

//serving the deletion of comments
async function DeleteCommentServicer(Data) {

    //connecting to DB
    const client = new Client({
        user: 'postgres',
        database: 'blogserver',
        password: 'sdj20041229',
        port: 5432,
        host: 'localhost',
      })
    client.connect();

    try {
        await client.query(`DELETE FROM Comments WHERE CommentID=$1`, [Data.CommentID]) //Delete the Comment from DB
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'} //respond with a successful message
}

module.exports = {GetCommentsServicer, AddCommentServicer, DeleteCommentServicer};