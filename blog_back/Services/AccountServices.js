const { Client } = require('pg');

//for adding a user
async function AddUser(Data) {

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
        //Insert the data on the new User into DB
        await client.query(`INSERT INTO Users VALUES($1, $2, $3)`, [Data.NUsername, Data.NPassword, Data.NDisplay])
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
}

//serving logins
async function LoginServicer (Data) {

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
        const result = await client.query(`SELECT * FROM Users WHERE Username=$1`, [Data.Username]) //query for the username and its corresponding password and display name of the username inputted, from the DB
        if (result.rows[0] == null){ //if the inputted username doesnt exist, username is incorrect thus respond with false
            return {res: false}
        } else if (result.rows[0].password == Data.Password) { //inputted username does exist, and if the corresponding password from the DB matches the password inputted, allow login
            return {res: true, Display: result.rows[0].displayname}
        } else { //if username is correct but password is wrong, respond with false
            return {res: false}
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
}

//serving signups
async function SignupServicer (Data) {

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
        const result = await client.query(`SELECT * FROM Users WHERE Username=$1`, [Data.NUsername]) //query for the username and its corresponding password and display name of the username inputted, from the DB
        if (result.rows[0] !== undefined){ //if the username already exists, cannot create duplicate username, thus respond with false
            return {res: false}
        } else { //if the username doesnt yet exist, username is valid
            if (Data.isPWValid) { //if the passwords inputted are valid,
                AddUser(Data) //add a user with method AddUser()
            }
            return {res: true} //respond wit true regardless, as we are only checking if the username is valid or not
        }
    } catch(err) {
        console.log(err)
    } finally {
        client.end();
    }
}

module.exports = {LoginServicer, SignupServicer};