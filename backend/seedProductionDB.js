require('dotenv').config();
const mongoose = require('mongoose');

// Use production MongoDB URI from environment variable
const PRODUCTION_MONGO_URI = process.env.PRODUCTION_MONGO_URI || process.env.MONGO_URI;

// Sample parking slots data
const sampleSlots = [
    {
        slotNumber: 'A1',
        city: 'Hyderabad',
        area: 'Hitech City',
        address: 'Phoenix Marketcity Parking (Shopping Mall)',
        placeType: 'Shopping Mall',
        isAvailable: true,
        latitude: 17.4483,
        longitude: 78.3915
    },
    {
        slotNumber: 'A2',
        city: 'Hyderabad',
        area: 'Hitech City',
        address: 'Phoenix Marketcity Parking (Shopping Mall)',
        placeType: 'Shopping Mall',
        isAvailable: true,
        latitude: 17.4485,
        longitude: 78.3917
    },
    {
        slotNumber: 'A3',
        city: 'Hyderabad',
        area: 'Hitech City',
        address: 'Phoenix Marketcity Parking (Shopping Mall)',
        placeType: 'Shopping Mall',
        isAvailable: true,
        latitude: 17.4487,
        longitude: 78.3919
    },
    {
        slotNumber: 'A4',
        city: 'Hyderabad',
        area: 'Hitech City',
        address: 'Phoenix Marketcity Parking (Shopping Mall)',
        placeType: 'Shopping Mall',
        isAvailable: true,
        latitude: 17.4489,
        longitude: 78.3921
    },
    {
        slotNumber: 'B1',
        city: 'Hyderabad',
        area: 'Gachibowli',
        address: 'Palika Bazaar Parking (Market)',
        placeType: 'Market',
        isAvailable: true,
        latitude: 17.4401,
        longitude: 78.3489
    },
    {
        slotNumber: 'B2',
        city: 'Hyderabad',
        area: 'Gachibowli',
        address: 'Palika Bazaar Parking (Market)',
        placeType: 'Market',
        isAvailable: true,
        latitude: 17.4403,
        longitude: 78.3491
    },
    {
        slotNumber: 'B3',
        city: 'Hyderabad',
        area: 'Gachibowli',
        address: 'Palika Bazaar Parking (Market)',
        placeType: 'Market',
        isAvailable: true,
        latitude: 17.4405,
        longitude: 78.3493
    },
    {
        slotNumber: 'C1',
        city: 'Hyderabad',
        area: 'Madhapur',
        address: 'Express Avenue Mall Parking (Shopping Mall)',
        placeType: 'Shopping Mall',
        isAvailable: true,
        latitude: 17.4483,
        longitude: 78.3915
    }
];

// Slot Schema (same as in your models)
const slotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    placeType: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number }
}, { timestamps: true });

const Slot = mongoose.model('Slot', slotSchema);

async function seedDatabase() {
    try {
        console.log('🔗 Connecting to production database...');
        await mongoose.connect(PRODUCTION_MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if slots already exist
        const existingSlots = await Slot.countDocuments();
        if (existingSlots > 0) {
            console.log(`⚠️  Database already has ${existingSlots} slots.`);
            console.log('Do you want to:');
            console.log('1. Skip seeding (keep existing slots)');
            console.log('2. Clear and reseed (delete all and add new)');
            console.log('\nTo clear and reseed, run: node seedProductionDB.js --force');

            if (!process.argv.includes('--force')) {
                await mongoose.connection.close();
                return;
            }

            console.log('🗑️  Clearing existing slots...');
            await Slot.deleteMany({});
        }

        console.log('🌱 Seeding database with sample slots...');
        const result = await Slot.insertMany(sampleSlots);

        console.log(`✅ Successfully created ${result.length} parking slots!`);
        console.log('\n📊 Slots created:');
        result.forEach(slot => {
            console.log(`   - ${slot.slotNumber}: ${slot.address}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database seeding complete! Your production site is ready for users.');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
