const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');


const certPath = path.resolve(__dirname, '../../certs/efi-cert.p12');


const agent = new https.Agent({
pfx: fs.readFileSync(certPath),
passphrase: ''
});


const baseURL = process.env.EFI_ENV === 'homolog'
? 'https://api-homologacao.efipay.com.br'
: 'https://api.efipay.com.br';


async function getAccessToken() {
const response = await axios.post(
`${baseURL}/oauth/token`,
'grant_type=client_credentials',
{
httpsAgent: agent,
auth: {
username: process.env.EFI_CLIENT_ID,
password: process.env.EFI_CLIENT_SECRET
},
headers: {
'Content-Type': 'application/x-www-form-urlencoded'
}
}
);


return response.data.access_token;
}


async function createPixCharge(amount, description) {
const token = await getAccessToken();


const charge = await axios.post(
`${baseURL}/v2/cob`,
{
calendario: { expiracao: 3600 },
valor: { original: Number(amount).toFixed(2) },
solicitacaoPagador: description
},
{
httpsAgent: agent,
headers: {
Authorization: `Bearer ${token}`,
'Content-Type': 'application/json'
}
}
);


const locId = charge.data.loc.id;


const qrCode = await axios.get(
`${baseURL}/v2/loc/${locId}/qrcode`,
{
httpsAgent: agent,
headers: {
Authorization: `Bearer ${token}`
}
}
);
module.exports = { createPixCharge };
