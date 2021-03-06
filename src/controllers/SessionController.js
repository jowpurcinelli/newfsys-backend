const connection = require('../database/connection');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
require('dotenv-safe').config({
    allowEmptyValues: true,
    path: '../.env'
});

module.exports = {

    /**
     * function to create session
     * @param { email: string } request.body
     * @param { password: string } request.body
     * @param { auth, token || error } response.json
     */
    async create (request, response)
    {
        try
        {
            const { email, password } = request.body;
            
            let auth = false;
            const userData = await connection('fsys_users')
                .where({
                    email
                })
                .select('id','password AS passEncrypted')
                .first();

            // verifica se o usuário foi encontrado
            if  (!userData)
            {
                // 507 to insuficient storage
                return response.status(401).json({ 
                    auth, 
                    msg: "usuário não localizado, por favor faça seu cadastro"
                });
            } 
            else {
                const passDecrypted = cryptoJS.AES.decrypt(
                    userData.passEncrypted, 
                    process.env.USER_SECRET
                    ).toString(cryptoJS.enc.Utf8);

                    if (passDecrypted !== password) {
                        return response.status(401).json({ 
                            auth, 
                            msg: "usuário ou senha está/estão incorreto(s)"
                        });
                    }
            }

            auth = true;
            const { id } = userData;
            const token = jwt.sign({ id }, process.env.SECRET, {
                expiresIn: 3600 * 24 // expires in 1 day
            })
            
            return response.status(200).json({ auth, token });
        }
        catch (error)
        {
            console.log(error);
            return response.status(500).json(error);
        }
    },

    /**
     * function to deatroy session
     * @param {*} request 
     * @param {*} response 
     */
    async destroy (request, response)
    {
        try
        {
            let auth = false;
            const token = false;
            return response.status(200).json({auth, token});
        }
        catch (error)
        {
            return response.status(500).json(error);
        }
    }
}