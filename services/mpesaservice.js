const axios = require('axios');

class MpesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.passkey = process.env.MPESA_PASSKEY;
        this.shortcode = process.env.MPESA_SHORTCODE;
        this.baseUrl = 'https://sandbox.safaricom.et';
    }

    async getAccessToken() {
        const auth = Buffer.from(this.consumerKey + ':' + this.consumerSecret).toString('base64');
        const response = await axios.get(
            this.baseUrl + '/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: 'Basic ' + auth } }
        );
        return response.data.access_token;
    }

    async initiatePayment(phoneNumber, amount, accountReference) {
        const accessToken = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(this.shortcode + this.passkey + timestamp).toString('base64');

        let formattedPhone = phoneNumber.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        const requestBody = {
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: this.shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: 'http://localhost:5000/api/callback/mpesa',
            AccountReference: accountReference,
            TransactionDesc: 'PichaAI Subscription'
        };

        const response = await axios.post(
            this.baseUrl + '/mpesa/stkpush/v1/processrequest',
            requestBody,
            { headers: { Authorization: 'Bearer ' + accessToken } }
        );

        return {
            success: true,
            checkoutRequestId: response.data.CheckoutRequestID,
            merchantRequestId: response.data.MerchantRequestID,
            message: 'STK push sent to customer phone'
        };
    }
}

module.exports = new MpesaService();