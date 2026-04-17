const express = require('express');
const router = express.Router();
const { v7: uuidv7 } = require('uuid');
 
const Profile = require('../models/schema');
const { fetchAllAPIs } = require('../services/externalAPI');
const { processAPIData } = require('../utils/processor');
const {  toValidateNameBody } = require('../utils/validation');
 


router.post('/', async (req, res) => {
  const { name } = req.body;
 
  
  const validationError = toValidateNameBody(name);
  if (validationError) {
    return res.status(validationError.statusCode).json({
      status: 'error',
      message: validationError.message,
    });
  }
 
  const cleanName = name.trim().toLowerCase();
 
  // Idempotency
  const existing = await Profile.findOne({ name: cleanName });
  if (existing) {
    return res.status(200).json({
      status: 'success',
      message: 'Profile already exists',
      data: existing.toJSON(),
    });
  }
 
  
  let genderData, ageData, nationData;
  try {
    const result = await fetchAllAPIs(cleanName);
    genderData = result.genderData;
    ageData = result.ageData;
    nationData = result.nationData;
  } catch (err) {
    return res.status(502).json({
      status: 'error',
      message: 'Upstream or server failure',
      
    });
  }
 
  
  const processed = processAPIData (genderData, ageData, nationData);
  if (processed.error) {
    return res.status(502).json({
      status: 'error',
      message: `${processed.api} returned an invalid response`,
    });
  }
 
  // Saving

  const profile = new Profile({
    _id: uuidv7(),
    name: cleanName,
    ...processed,
    created_at: new Date(),
  });
 
  await profile.save();
 
  return res.status(201).json({
    status: 'success',
    data: profile.toJSON(),
  });
});
 

router.get('/', async (req, res) => {
  const { gender, country_id, age_group } = req.query;
 
  // filtering
  const filter = {};
  if (gender) filter.gender = gender.toLowerCase();
  if (country_id) filter.country_id = country_id.toUpperCase();
  if (age_group) filter.age_group = age_group.toLowerCase();
 
  const profiles = await Profile.find(filter);
 
  return res.status(200).json({
    status: 'success',
    count: profiles.length,
    data: profiles.map((p) => ({
      id: p._id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      age_group: p.age_group,
      country_id: p.country_id,
    })),
  });
});
 

router.get('/:id', async (req, res) => {
  const profile = await Profile.findById(req.params.id);
 
  if (!profile) {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found',
    });
  }
 
  return res.status(200).json({
    status: 'success',
    data: profile.toJSON(),
  });
});
 


router.delete('/:id', async (req, res) => {
  const profile = await Profile.findByIdAndDelete(req.params.id);
 
  if (!profile) {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found',
    });
  }
 
  return res.status(204).send();
});
 
module.exports = router;