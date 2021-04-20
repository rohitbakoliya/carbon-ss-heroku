import axios from 'axios';
import qs from 'qs';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

const code = `#include<bits/stdc++.h>
  using namespace std;
  int main() {
    cout << "HELLO WORLD";
    return 0;
  }`;
const language = 'auto';

const params = {
  backgroundColor: '#E6EDF8',
  dropShadow: true,
  dropShadowBlurRadius: '68px',
  dropShadowOffsetY: '20px',
  fontFamily: 'Fira Code',
  fontSize: '14px',
  lineHeight: '133%',
  lineNumbers: false,
  paddingHorizontal: '35px',
  paddingVertical: '49px',
  squaredImage: false,
  theme: 'nord',
  widthAdjustment: true,
  language,
};

const app = express();
app.use(cors());

app.get('/', async (req: any, res: any) => {
  try {
    const resp = await axios.post(
      // `http://localhost:8000/api/carbon-ss?${qs.stringify(params)}`,
      `https://carbon-ss.herokuapp.com/api/carbon-ss?${qs.stringify(params)}`,
      {
        data: code,
      }
    );
    const buff = Buffer.from(resp.data.image, 'base64');
    console.log(buff);
    fs.writeFileSync('example.png', buff);
    const htm = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Document</title>
      </head>
      <body>
        <img src="data:image/jpeg;base64,${buff.toString('base64')}" >
      </body>
    </html>`;

    res.send(htm);
  } catch (e) {
    res.send(e);
  }
});

app.listen(5000, () => console.log('listening on 5000'));
