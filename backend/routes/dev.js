const express = require('express')
const User = require('../models/User')
const Designer = require('../models/Designer')

const router = express.Router()

// Dev-only seed endpoint to populate demo designers in MongoDB
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' })
    }

    const existing = await Designer.countDocuments()
    if (existing > 0) {
      return res.json({ message: 'Designers already exist. Skipping seed.' })
    }

    const seedUsers = [
      { name: 'Aarav Mehta', email: 'aarav@demo.com', role: 'designer' },
      { name: 'Sara Kapoor', email: 'sara@demo.com', role: 'designer' },
      { name: 'Ishaan Rao', email: 'ishaan@demo.com', role: 'designer' },
      { name: 'Nisha Verma', email: 'nisha@demo.com', role: 'designer' },
    ]

    const passwordHash = await User.hashPassword('Demo@12345')
    const createdUsers = await User.insertMany(
      seedUsers.map((u) => ({ ...u, passwordHash })),
    )

    const designers = [
      {
        user: createdUsers[0]._id,
        displayName: 'Aarav Mehta',
        location: 'Mumbai, India',
        styles: ['Modern', 'Minimal', 'Luxury'],
        spaces: ['Living room', 'Bedroom'],
        minBudget: 30000,
        maxBudget: 80000,
        startingPrice: '₹35,000',
        rating: 4.9,
        projects: 42,
        badge: 'Top Rated',
        description:
          'Clean lines, soft neutrals, and subtle luxury details ideal for urban apartments and compact homes.',
        contactEmail: 'aarav.mehta@interiorconnect.com',
        contactPhone: '+91-98765-00123',
        onlinePayments: true,
        offlineAvailable: true,
        image:
          'https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg?auto=compress&cs=tinysrgb&w=1200',
        portfolioImages: [
          'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
      },
      {
        user: createdUsers[1]._id,
        displayName: 'Sara Kapoor',
        location: 'Bengaluru, India',
        styles: ['Scandinavian', 'Boho', 'Budget Friendly'],
        spaces: ['Living room', 'Bedroom', 'Balcony'],
        minBudget: 15000,
        maxBudget: 50000,
        startingPrice: '₹18,000',
        rating: 4.7,
        projects: 28,
        badge: 'Budget Friendly',
        description:
          'Warm woods, plants, and cosy textiles that make compact spaces feel brighter and bigger on a budget.',
        contactEmail: 'sara.kapoor@interiorconnect.com',
        contactPhone: '+91-98765-00456',
        onlinePayments: true,
        offlineAvailable: false,
        image:
          'https://images.pexels.com/photos/6580219/pexels-photo-6580219.jpeg?auto=compress&cs=tinysrgb&w=1200',
        portfolioImages: [
          'https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/6585762/pexels-photo-6585762.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/6580217/pexels-photo-6580217.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
      },
      {
        user: createdUsers[2]._id,
        displayName: 'Ishaan Rao',
        location: 'Delhi, India',
        styles: ['Industrial', 'Modern'],
        spaces: ['Studio', 'Home office', 'Living room'],
        minBudget: 25000,
        maxBudget: 90000,
        startingPrice: '₹28,000',
        rating: 4.8,
        projects: 33,
        badge: 'New',
        description:
          'Statement ceilings, exposed textures, and bold lighting for young professionals and creative studios.',
        contactEmail: 'ishaan.rao@interiorconnect.com',
        contactPhone: '+91-98765-00789',
        onlinePayments: true,
        offlineAvailable: true,
        image:
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
        portfolioImages: [
          'https://images.pexels.com/photos/7061370/pexels-photo-7061370.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/8128800/pexels-photo-8128800.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
      },
      {
        user: createdUsers[3]._id,
        displayName: 'Nisha Verma',
        location: 'Pune, India',
        styles: ['Classic', 'Luxury'],
        spaces: ['Entire home', 'Living room', 'Dining'],
        minBudget: 40000,
        maxBudget: 150000,
        startingPrice: '₹45,000',
        rating: 5.0,
        projects: 55,
        badge: 'Premium',
        description:
          'Timeless, high-end interiors with bespoke furniture and curated art pieces for premium homes.',
        contactEmail: 'nisha.verma@interiorconnect.com',
        contactPhone: '+91-98765-00234',
        onlinePayments: true,
        offlineAvailable: true,
        image:
          'https://images.pexels.com/photos/6585762/pexels-photo-6585762.jpeg?auto=compress&cs=tinysrgb&w=1200',
        portfolioImages: [
          'https://images.pexels.com/photos/8136911/pexels-photo-8136911.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/6585766/pexels-photo-6585766.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'https://images.pexels.com/photos/6585765/pexels-photo-6585765.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
      },
    ]

    await Designer.insertMany(designers)
    return res.json({
      message: 'Seed complete',
      note: 'Demo designers created. Demo password for all seeded designer users is Demo@12345',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Seed failed' })
  }
})

module.exports = router

