const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const TUMA_BASE_URL = process.env.TUMA_BASE_URL || "https://api.tuma.co.ke/v1";
const API_KEY = process.env.TUMA_API_KEY || "tuma_f8646d10d6be22579";
const DEFAULT_PHONE = process.env.MPESA_NUMBER || "254111387705";
const TUMA_PORT = 5000;

app.get("/", (req, res) => {
  res.send("Tuma Server Running");
});

app.get("/pay", async (req, res) => {
  try {
    const phone = req.query.phone || DEFAULT_PHONE;
    const amount = Number(req.query.amount) || 1;
    const reference = req.query.reference || "PICHA AI";

    const response = await axios.post(
      `${TUMA_BASE_URL}/collection/stk`,
      {
        phone,
        amount,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: error.response?.data || error.message || "Request failed" });
  }
});

app.listen(TUMA_PORT, () => {
  console.log(`Tuma Server Running on http://localhost:${TUMA_PORT}`);
});