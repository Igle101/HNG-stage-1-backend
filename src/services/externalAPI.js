const fetch = require('node-fetch');
 
const GENDERIZE_URL = 'https://api.genderize.io';
const AGIFY_URL = 'https://api.agify.io';
const NATIONALIZE_URL = 'https://api.nationalize.io';
 

async function fetchAllAPIs(name) {
  const encodedName = encodeURIComponent(name);
 
  const [genderRes, ageRes, nationRes] = await Promise.all([
    fetch(`${GENDERIZE_URL}?name=${encodedName}`),
    fetch(`${AGIFY_URL}?name=${encodedName}`),
    fetch(`${NATIONALIZE_URL}?name=${encodedName}`),
  ]);
 
  
  
  if (!genderRes.ok) throw new Error('Genderize');
  if (!ageRes.ok) throw new Error('Agify');
  if (!nationRes.ok) throw new Error('Nationalize');
 
  const [genderData, ageData, nationData] = await Promise.all([
    genderRes.json(),
    ageRes.json(),
    nationRes.json(),
  ]);
 
  return { genderData, ageData, nationData };
}
 
module.exports = { fetchAllAPIs };