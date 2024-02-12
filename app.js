const express = require('express')
const app = express()
app.use(express.json());
const port = 3000;

app.post('/api/initiate-payment', async(req, res) => {
    const initTransactionURL = 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions'
    const {buy_order, session_id, amount} = req.body

    const result = await fetch(initTransactionURL, {
        method: 'POST',
        body: JSON.stringify ({
            buy_order: buy_order,
            session_id: session_id,
            amount: amount,
            return_url: 'http://localhost:3000/payment-end',
        }),
        headers: {
            'Tbk-Api-Key-Id': 597055555532,
            'Tbk-Api-Key-Secret': "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
            'Content-Type': 'application/json'
        },
    });

    const data = await result.json();
    console.log(data)
    const paymentUrl = `${data.url}?token_ws=${data.token}`
//RETORNAR PAYMENT
    res.json({
        ok: true,
        url: paymentUrl
    })
console.log(req.body)
})

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
                'Content-Type': 'application/json', 
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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

//poner try catch
//instalar hellmet
