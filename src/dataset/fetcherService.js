import axios from 'axios';
import logger from '../utils/logger.js';

class FetcherService {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'https://t4e-testserver.onrender.com/api';
    this.token = null;
    this.datasetUrl = null;
  }

  async authenticate() {
    try {
      logger.info('Authenticating with external server...');

      const res = await axios.post(`${this.baseUrl}/public/token`, {
        studentId: process.env.STUDENT_ID || 'E0123001',
        password: process.env.STUDENT_PASSWORD || '621147',
        set: process.env.STUDENT_SET || 'setB',
      });

      logger.info(`Auth response [${res.status}]`);

      if (res.data && res.data.token) {
        this.token = res.data.token;
        const dataUrl = res.data.dataUrl;
        this.datasetUrl = dataUrl.startsWith('http') ? dataUrl : `${this.baseUrl}${dataUrl}`;
        logger.info(`Token received. Dataset URL: ${this.datasetUrl}`);
        return { token: this.token, datasetUrl: this.datasetUrl };
      }

      logger.warn('No token in response');
      return { token: null, datasetUrl: null };
    } catch (error) {
      logger.error(`Authentication failed: ${error.message}`);
      return { token: null, datasetUrl: null };
    }
  }

  async fetchDataset() {
    try {
      const auth = await this.authenticate();

      if (!auth.datasetUrl) {
        logger.warn('No dataset URL. Cannot fetch.');
        return null;
      }

      logger.info(`Fetching dataset from ${auth.datasetUrl}...`);
      const res = await axios.get(auth.datasetUrl, {
        headers: { Authorization: `Bearer ${auth.token}` },
        timeout: 30000,
      });

      const raw = res.data;
      if (raw && raw.data) {
        const d = raw.data;
        const counts = {
          users: Array.isArray(d.users) ? d.users.length : 0,
          projects: Array.isArray(d.projects) ? d.projects.length : 0,
          issues: Array.isArray(d.issues) ? d.issues.length : 0,
          comments: Array.isArray(d.comments) ? d.comments.length : 0,
        };
        logger.info(`Dataset fetched: ${counts.users} users, ${counts.projects} projects, ${counts.issues} issues, ${counts.comments} comments`);
        return d;
      }

      logger.warn('Unexpected dataset structure');
      return null;
    } catch (error) {
      logger.error(`Dataset fetch failed: ${error.message}`);
      return null;
    }
  }
}

export default new FetcherService();
