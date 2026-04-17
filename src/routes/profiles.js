const express = require('express');
const router = express.Router();
const { v7: uuidv7 } = require('uuid');

const Profile = require('../models/schema');
const { fetchAllAPIs } = require('../services/externalAPI');
const { processAPIData } = require('../utils/processor');
const { toValidateNameBody } = require('../utils/validation');

// ─── POST /api/profiles ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  console.log('POST /api/profiles hit');
  console.log('Body received:', req.body);

  try {
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

    // Call all 3 external APIs
    let genderData, ageData, nationData;
    try {
      const result = await fetchAllAPIs(cleanName);
      genderData = result.genderData;
      ageData = result.ageData;
      nationData = result.nationData;
    } catch (err) {
      console.error('External API error:', err.message);
      return res.status(502).json({
        status: 'error',
        message: `${err.message} returned an invalid response`,
      });
    }

    // Process data
    const processed = processAPIData(genderData, ageData, nationData);
    if (processed.error) {
      return res.status(502).json({
        status: 'error',
        message: `${processed.api} returned an invalid response`,
      });
    }

    // Save to database
    const profile = new Profile({
      _id: uuidv7(),
      name: cleanName,
      ...processed,
      created_at: new Date(),
    });

    await profile.save();
    console.log('Profile saved:', profile._id);

    return res.status(201).json({
      status: 'success',
      data: profile.toJSON(),
    });

  } catch (err) {
    console.error('POST /api/profiles error:', err.stack || err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
});

// ─── GET /api/profiles ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  console.log('GET /api/profiles hit');

  try {
    const { gender, country_id, age_group } = req.query;

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

  } catch (err) {
    console.error('GET /api/profiles error:', err.stack || err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
});

// ─── GET /api/profiles/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  console.log('GET /api/profiles/:id hit', req.params.id);

  try {
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

  } catch (err) {
    console.error('GET /api/profiles/:id error:', err.stack || err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
});

// ─── DELETE /api/profiles/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/profiles/:id hit', req.params.id);

  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    return res.status(204).send();

  } catch (err) {
    console.error('DELETE /api/profiles/:id error:', err.stack || err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
});

module.exports = router;