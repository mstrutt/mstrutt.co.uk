import express from 'express';

import redirects from '../redirects.json';

const router = new express.Router();

Object.entries(redirects).forEach(([route, redirect]) => {
  router.get(route, (req, res) => {
    res
      .status(301)
      .redirect(redirect);
  });
});

export default router;
