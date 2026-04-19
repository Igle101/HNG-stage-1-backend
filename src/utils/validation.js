function toValidateNameBody(name) {
  // Missing or empty
  if (name === undefined || name === null || (typeof name === 'string' && name.trim() === '')) {
    return { statusCode: 400, message: 'Missing or empty name' };
  }

  // Non-string type
  if (typeof name !== 'string') {
    return { statusCode: 422, message: 'Invalid type' };
  }

  // Numeric string
  if (!isNaN(name)) {
    return { statusCode: 422, message: 'Invalid type' };
  }

  return null;
}

module.exports = { toValidateNameBody };