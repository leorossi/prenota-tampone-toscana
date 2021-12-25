// import fs from 'fs'
// import { promisify } from 'util'
// const readFile = promisify(fs.readFile);

import dotenv from 'dotenv'
import axios from 'axios';

import sgMail  from '@sendgrid/mail'
import minimist  from 'minimist'

const argv = minimist(process.argv.slice(2))

async function main() {
  dotenv.config()
  const data = await get();
  const output = parser(data);
  console.log('Finished at ' + new Date())
  console.log('Presidi con disponibilità: ' + output.length )
  output.forEach((line) => console.log(line))
  if (output.length > 0 && argv.email) {
    await sendMail(output);
  }
}

function parser(data) {
  const output = [];
  data.forEach((el) => {
    const prov = el.provincia;
    el.enterprises.forEach((ent) => {
      const enterpriseName = ent.titleEnterprise;
      ent.services.forEach((service) => {
        if (service.disponibilita > 0) {
          console.log(service)
          output.push(`${prov} - ${enterpriseName} - ${service.name} : ${service.disponibilita}`)
        }
        
      })
    });
  })
  return output;
}


async function get() {
  // const data = await readFile('./payload.json', 'utf-8')

  const cookie = 'JSESSIONID=YOUR_SESSION_ID'
  try {
    const data = await axios.get('https://prenotatampone.sanita.toscana.it/api/enterprises', {
      headers: {
        'Cookie': cookie
      }
    })
    return data.data;
  } catch (err) {
    console.log(err.response.data)
  }
  
}

async function sendMail(data) {
  let html = `<h2>Disponibilità tamponi</h2>
    <ul>
  `

  data.forEach((d) => {
    html += `<li>${d}</li>`
  })

  html += `</ul>`

  const msg = {
    to: 'leonardo.rossi@gmail.com',
    from: 'leonardo.rossi@gmail.com',
    subject: 'Tamponi disponibili!',
    text: 'See html.',
    html
  }
  
  await _sendMail(msg);

}

function sendErrorMail(message) {

}
async function _sendMail(mailData) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const response = await sgMail.send(mailData) 
  } catch (err) {
    console.log(err.response.body);
  }
}
main();