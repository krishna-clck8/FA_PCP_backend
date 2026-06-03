import logger from '../utils/logger.js';

//create a class for transformingdataset records to ensure consistentcy and sanitization of the dataset before syncing with mongoDB
class DatasetTransformationService {
  transform(records) {
    const transformed = []; //create an array for holding the transofrmed rows

    for (const record of records) {// iterate over each record and transform it using the transform record and normaloize key methods
      try {
        const item = this.transformRecord(record);
        if (item) transformed.push(item);
      } catch (error) {
        logger.warn(`Failed to transform record: ${error.message}`);
      }
    }

    logger.info(`Transformed ${transformed.length} of ${records.length} records`);
    return transformed;
  }
//create the method to transform each rec
  transformRecord(record) {
    const transformed = {};

    for (const [key, value] of Object.entries(record)) {
      const normalizedKey = this.normalizeKey(key);

      if (value === null || value === undefined) {
        transformed[normalizedKey] = null;
        continue;
      }

      if (typeof value === 'string') {
        let v = value.trim();
        v = v.replace(/\s+/g, ' ');
        if (v === '') v = null;
        transformed[normalizedKey] = v;
      } else if (Array.isArray(value)) {
        transformed[normalizedKey] = value.map(item => {
          if (typeof item === 'string') return item.trim();
          return item;
        }).filter(item => item !== null && item !== undefined);
      } else if (typeof value === 'object') {
        transformed[normalizedKey] = this.transformRecord(value);
      } else {
        transformed[normalizedKey] = value;
      }
    }

    return transformed;
  }
//create the normalized key method to check for consistency in keys
  normalizeKey(key) {
    return key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }
}

export default new DatasetTransformationService();
