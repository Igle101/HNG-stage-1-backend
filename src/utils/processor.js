function ageGrouping (age){
    if (age >= 0 && age <= 12) return  ' child';
    if(age >=13 && age <= 19) return 'teenager';
    if(age >= 20 && age <= 59) return 'adult';
    if(age >= 60)return 'senior';

}
function getTopCountry(countries){
    if(!countries || countries.length === 0)return null;
    return countries.reduce((top, current)=>
    current.probability > top.probability ? current : top);

}
function processAPIData (genderData, ageData,nationData){
    if (!genderData.gender || genderData.count === 0) {
    return { error: true, api: 'Genderize' };
  }
 
 
  if (!ageData.age) {
    return { error: true, api: 'Agify' };
  }
 
  

  const topCountry = getTopCountry(nationData.country);
  if (!topCountry) {
    return { error: true, api: 'Nationalize' };
  }
 
  return {
    error: false,
    gender: genderData.gender,
    gender_probability: genderData.probability,
    sample_size: genderData.count,
    age: ageData.age,
    age_group: getAgeGroup(ageData.age),
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
  };
}
 
module.exports = { processAPIData };
