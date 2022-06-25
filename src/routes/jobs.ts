import express from 'express';

/** Controllers */
import JobController from '@src/controllers/jobs';

const router = express.Router();

router.post('/job/create', async (req, res) => {
  JobController.createJob(req, res);
});

router.get('/jobs', async (req, res) => {
  JobController.listAllJobs(req, res);
});

router.get('/job/:id', async (req, res) => {
  JobController.getJobById(req, res);
});

router.patch('/job/edit/:id', async (req, res) => {
  JobController.updateJob(req, res);
});

router.delete('/job/:id', async (req, res) => {
  JobController.deleteJob(req, res);
});

export default router;
