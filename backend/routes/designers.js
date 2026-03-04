const express = require('express')
const Designer = require('../models/Designer')
const auth = require('../middleware/auth')

const router = express.Router()

// Get current designer's own profile
router.get('/me', auth(true), async (req, res) => {
  try {
    const { id, role } = req.user
    if (!id) {
      return res.status(401).json({ message: 'User ID missing from token' })
    }
    if (role !== 'designer') {
      return res.status(403).json({ message: 'Only designers can access this' })
    }
    const mongoose = require('mongoose')
    const userId = mongoose.Types.ObjectId.isValid(id) ? id : new mongoose.Types.ObjectId(id)
    const profile = await Designer.findOne({ user: userId }).lean()
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Create one first.' })
    }
    res.json(profile)
  } catch (err) {
    console.error('Error loading designer profile:', err)
    res.status(500).json({ message: 'Failed to load profile' })
  }
})

// Create or update designer profile for logged-in designer
router.post('/me', auth(true), async (req, res) => {
  try {
    const { id, role } = req.user
    if (!id) {
      return res.status(401).json({ message: 'User ID missing from token' })
    }
    if (role !== 'designer') {
      return res.status(403).json({ message: 'Only designers can edit profiles' })
    }

    const data = req.body
    // Ensure required fields are present
    if (!data.displayName || !data.location) {
      return res.status(400).json({ message: 'Display name and location are required' })
    }

    const mongoose = require('mongoose')
    const userId = mongoose.Types.ObjectId.isValid(id) ? id : new mongoose.Types.ObjectId(id)
    
    const existing = await Designer.findOne({ user: userId })

    if (existing) {
      Object.assign(existing, data)
      await existing.save()
      return res.json(existing)
    }

    const created = await Designer.create({ ...data, user: userId })
    return res.status(201).json(created)
  } catch (err) {
    console.error('Error saving designer profile:', err)
    res.status(500).json({ 
      message: 'Failed to save designer profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// Delete designer profile
router.delete('/me', auth(true), async (req, res) => {
  try {
    const { id, role } = req.user
    if (!id) {
      return res.status(401).json({ message: 'User ID missing from token' })
    }
    if (role !== 'designer') {
      return res.status(403).json({ message: 'Only designers can delete profiles' })
    }

    const mongoose = require('mongoose')
    const userId = mongoose.Types.ObjectId.isValid(id) ? id : new mongoose.Types.ObjectId(id)
    
    const result = await Designer.deleteOne({ user: userId })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.json({ message: 'Designer profile deleted successfully' })
  } catch (err) {
    console.error('Error deleting designer profile:', err)
    res.status(500).json({ 
      message: 'Failed to delete designer profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// Public search / list
router.get('/', async (req, res) => {
  try {
    const { style, space, q, minBudget, maxBudget } = req.query
    const filter = {}

    if (style && style !== 'All') {
      filter.styles = style
    }
    if (space && space !== 'Any space') {
      filter.spaces = space
    }
    if (minBudget || maxBudget) {
      filter.$and = []
      if (minBudget) {
        filter.$and.push({ maxBudget: { $gte: Number(minBudget) } })
      }
      if (maxBudget) {
        filter.$and.push({ minBudget: { $lte: Number(maxBudget) } })
      }
    }
    if (q) {
      const term = q.toLowerCase()
      filter.$or = [
        { displayName: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { styles: { $elemMatch: { $regex: term, $options: 'i' } } },
      ]
    }

    const designers = await Designer.find(filter).lean()
    res.json(designers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load designers' })
  }
})

// Public single designer
router.get('/:id', async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id).lean()
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' })
    }
    res.json(designer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load designer' })
  }
})

module.exports = router

