const http = require('https');

const cookies = [
  {"domain":"gitmind.com","expirationDate":1793605371.051146,"hostOnly":true,"httpOnly":false,"name":"_bl_uid","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"60mamo74tv1rOX2k0hp3m3b379n7"},
  {"domain":".gitmind.com","expirationDate":1787627364,"hostOnly":false,"httpOnly":false,"name":"_gcl_au","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"1.1.1028195565.1779851364"},
  {"domain":".gitmind.com","expirationDate":1814411465.674269,"hostOnly":false,"httpOnly":false,"name":"_ga","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GA1.1.1795038888.1778053376"},
  {"domain":".gitmind.com","expirationDate":1814411364.280225,"hostOnly":false,"httpOnly":false,"name":"_gid","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"GA1.1.1795038888.1778053376"},
  {"domain":".gitmind.com","expirationDate":1780110564,"hostOnly":false,"httpOnly":false,"name":"apptype","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"saas-index"},
  {"domain":".gitmind.com","expirationDate":1779937764,"hostOnly":false,"httpOnly":false,"name":"_uetsid","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"76d65a50597911f1bc111754fb2ae4b2"},
  {"domain":".gitmind.com","expirationDate":1813547364,"hostOnly":false,"httpOnly":false,"name":"_uetvid","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"2e813410491f11f18d665bfdbc22125f"},
  {"domain":".gitmind.com","expirationDate":1811387465,"hostOnly":false,"httpOnly":false,"name":"Hm_lvt_960ef17df44dacb2a038ecfdc57c6bf5","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"1778053371,1779851365"},
  {"domain":".gitmind.com","hostOnly":false,"httpOnly":false,"name":"HMACCOUNT","path":"/","sameSite":"unspecified","secure":false,"session":true,"storeId":"0","value":"27DD4362E010AC5D"},
  {"domain":".gitmind.com","expirationDate":1814411465.661143,"hostOnly":false,"httpOnly":false,"name":"_ga_V607FGN3LY","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GS2.1.s1779851364$o1$g1$t1779851465$j53$l0$h0"},
  {"domain":".gitmind.com","expirationDate":1814411465.681335,"hostOnly":false,"httpOnly":false,"name":"_ga_Q7D4BH6P0F","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GS2.1.s1779851364$o1$g1$t1779851465$j53$l0$h0"},
  {"domain":".gitmind.com","hostOnly":false,"httpOnly":false,"name":"Hm_lpvt_960ef17df44dacb2a038ecfdc57c6bf5","path":"/","sameSite":"unspecified","secure":false,"session":true,"storeId":"0","value":"1779851466"}
];

const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

const options = {
  hostname: 'gitmind.com',
  path: '/app/docs/mxaotj65',
  method: 'GET',
  headers: {
    'Cookie': cookieHeader,
    'User-Agent': 'Mozilla/5.5 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body length:', data.length);
    console.log('Body excerpt:', data.substring(0, 2000));
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
