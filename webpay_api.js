const express = require('express')

const API_KEY_ID = 597055555532;
const API_KEY_SECRET = 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions';

app.get('/payment-status/:token', async (req, res) => {
    try{
        const transactionToken = req.params.token
        if(!transactionToken){
            console.log('Missing token')
        }

        const transactionStatusURL = `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${transactionToken}`;
        const response = await fetch(transactionStatusURL, {
            method: 'PUT',
            headers: {
                'Tbk-Api-Key-Id': API_KEY_ID,
                'Tbk-Api-Key-Secret': API_KEY_SECRET,
                'Content-Type': 'application/json', // Assuming you're expecting JSON response
            }
        })

        if(!response.ok){
            console.log(`Error fetching transaction status: ${response.statusText}`)
        }

        const result = await response.json()
        res.json(result)
    }
    catch(error){
        console.error('Error:', error)
        res.status(error.statusCode || 500).json({ message: error.message })
    }
})

