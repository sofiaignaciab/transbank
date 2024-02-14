const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
// const fetch = require("node-fetch");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const port = 3000;

const API_KEY_ID = 597055555532;
const API_KEY_SECRET =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

app.post("/api/initiate-payment", async (req, res) => {
  try {
    const initTransactionURL =
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions";
    const { buy_order, session_id, amount } = req.body;

    const result = await fetch(initTransactionURL, {
      method: "POST",
      body: JSON.stringify({
        buy_order: buy_order,
        session_id: session_id,
        amount: amount,
        return_url: "http://localhost:3000/api/confirm-payment", // URL de retorno para confirmar el pago
      }),
      headers: {
        "Tbk-Api-Key-Id": API_KEY_ID,
        "Tbk-Api-Key-Secret": API_KEY_SECRET,
        "Content-Type": "application/json",
      },
    });

    const data = await result.json();
    console.log(data);
    const paymentUrl = `${data.url}?token_ws=${data.token}`;
    // Retorna la URL de pago
    res.json({
      ok: true,
      url: paymentUrl,
    });
    console.log(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/confirm-payment", async (req, res) => {
  try {
    //   const transactionToken = req.query.token; // Obtén el token desde los parámetros de consulta
    let params = req.method === "GET" ? req.query : req.body;
    const transactionToken = params.token_ws; // Obtén el token desde los parámetros de consulta
    console.log(transactionToken);
    if (!transactionToken) {
      return res
        .status(400)
        .json({ error: "Se requiere un token de transacción válido" });
    }

    const confirmTransactionURL = `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${transactionToken}`;

    const response = await fetch(confirmTransactionURL, {
      method: "PUT",
      headers: {
        "Tbk-Api-Key-Id": API_KEY_ID,
        "Tbk-Api-Key-Secret": API_KEY_SECRET,
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    console.log(responseData);

    if (responseData.status == "FAILED") {
      res.redirect("http://localhost:5173/failed")
      console.log('Transaccion rechazada')
      return;
    }
    // Redirige al usuario a la URL de retorno
    res.redirect("http://localhost:5173/payment-end");
    console.log('Transaccion aprobada')
  } catch (error) {
    console.error("Error:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.get("/api/payment-status/:token", async (req, res) => {
  try {
    app.render("Hola");
    const transactionToken = req.params.token;
    if (!transactionToken) {
      console.log("Missing token");
    }

    const transactionStatusURL = `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${transactionToken}`;
    const response = await fetch(transactionStatusURL, {
      method: "PUT",
      headers: {
        "Tbk-Api-Key-Id": API_KEY_ID,
        "Tbk-Api-Key-Secret": API_KEY_SECRET,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log(`Error fetching transaction status: ${response.statusText}`);
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});