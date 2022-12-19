const { Client } = require('pg');

//serving the getting of all categories
async function GetAllCatsServicer() {
    var Cats;

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
        const result = await client.query(`SELECT * FROM Categories ORDER BY CategoryID ASC`) //Queries the DB for all Categories
        Cats = result.rows

    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: Cats}
}

//serving the getting of categories
async function GetCategoriesServicer(Data) {
    var Cats;

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
        const result = await client.query(`SELECT X.CategoryID, X.Category FROM Categories X JOIN PostCategories Y ON X.CategoryID=Y.CategoryID WHERE Y.PostID=$1`, [Data.PostID])
        Cats = result.rows
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: Cats}
}

//serving the adding of categories
async function AddCategoryServicer(Data) {
    const CategoryName = Data.CategoryName
    var CategoryID = 1; //CategoryID starts from 1 since 0 is All

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
        const result = await client.query(`SELECT CategoryID FROM Categories ORDER BY CategoryID ASC`)
        result.rows.forEach((row) => {
            if (CategoryID == row.categoryid) {
                CategoryID++;
            }
        })

        await client.query(`INSERT INTO Categories VALUES($1, $2)`, [CategoryID, CategoryName]) //Queries the DB for all Categories
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
    return {res: 'success!'}
}

module.exports = {GetAllCatsServicer, GetCategoriesServicer, AddCategoryServicer};