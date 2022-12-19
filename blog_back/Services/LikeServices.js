const { Client } = require('pg');

//serving the getting of the likes counts of blogs
async function GetLikesCountServicer(Data) {
    var LikesCount;

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
        const result = await client.query(`SELECT COUNT(Username) AS LikesCount FROM Likes WHERE PostID=$1 GROUP BY PostID`, [Data.PostID]) //querythe DB to get the number of likes for a post
        if(result.rows.length == 0) {
            LikesCount = 0;
        } else {
            LikesCount = result.rows[0].likescount
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: LikesCount}
}

//serving the getting of the liked state for a user viewing a blog
async function GetLikedStateServicer(Data) {
    var isLiked = false;

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
        const result = await client.query(`SELECT Username FROM Likes WHERE PostID=$1`, [Data.PostID]) //query the DB to get the number of likes for a post
        for (var i=0; i<result.rows.length; i++) { //iterates through the resultant response from the query
            if (result.rows[i].username == Data.CurrUser) {
                isLiked = true //makes isLiked true only if the current user's Username exists in this response AKA User already Liked the Post
                break
            }
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: isLiked}
}

//serving the adding of likes
async function AddLikeServicer(Data) {

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
        const result = await client.query(`INSERT INTO Likes VALUES($1, $2)`, [Data.PostID, Data.CurrUser]) //Adds the like record into the DB
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'}
}

//serving the removal of likes
async function RemoveLikeServicer(Data) {

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
        const result = await client.query(`DELETE FROM Likes WHERE PostID=$1 AND Username=$2`, [Data.PostID, Data.CurrUser]) //Removes the like record from the DB
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'}
}

module.exports = {GetLikesCountServicer, GetLikedStateServicer, AddLikeServicer, RemoveLikeServicer};