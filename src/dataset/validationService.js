import logger from '../utils/logger.js';

class DatasetValidationService {
  validate(records) {
    const results = {
      total: records.length,
      valid: 0,
      invalid: 0,
      errors: [],
    };

    const seen = new Set();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordErrors = [];

      if (!record || typeof record !== 'object') {
        recordErrors.push('Record is not a valid object');
        results.errors.push({ index: i, errors: recordErrors });
        results.invalid++;
        continue;
      }

      const cleaned = this.sanitizeRecord(record);
      const dataKeys = Object.keys(cleaned).filter(k => cleaned[k] !== null && cleaned[k] !== undefined && cleaned[k] !== '');

      if (dataKeys.length === 0) {
        recordErrors.push('Record has no data fields');
      }

      const recordKey = JSON.stringify(cleaned);
      if (seen.has(recordKey)) {
        recordErrors.push('Duplicate record detected');
        results.errors.push({ index: i, errors: recordErrors });
        results.invalid++;
        continue;
      }
      seen.add(recordKey);

      if (recordErrors.length > 0) {
        results.errors.push({ index: i, errors: recordErrors });
        results.invalid++;
      } else {
        results.valid++;
      }
    }

    logger.info(`Validation complete: ${results.valid} valid, ${results.invalid} invalid`);
    return results;
  }

  sanitizeRecord(record) {
    const cleaned = { ...record };

    for (const key of Object.keys(cleaned)) {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim().replace(/\s+/g, ' ');
      }
    }

    return cleaned;
  }
}

export default new DatasetValidationService();
