const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

// Test endpoint to verify auth is working
router.get('/test', auth(true), (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Authentication is working!',
  })
})

module.exports = router
