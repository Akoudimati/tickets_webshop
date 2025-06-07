const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/user_images');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId_timestamp.extension
        const userId = req.body.userId || 'user';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `profile_${userId}_${timestamp}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                missing: {
                    email: !email,
                    password: !password,
                    name: !name
                }
            });
        }
        
        // Default role is 3 (standard user)
        const roleId = 3;
        
        // Check if user already exists
        const existingUsers = await req.db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Set default profile image if not provided
        const profile_img = null; // Default to null 
        
        // Insert new user
        const result = await req.db.execute(
            'INSERT INTO users (email, password, name, role_id, profile_img) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, roleId, profile_img]
        );
        
        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                missing: {
                    email: !email,
                    password: !password
                }
            });
        }
        
        // Find user
        const users = await req.db.execute(
            'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
            [email]
        );
        
        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check password using bcrypt
        let passwordMatch = false;
        
        if (user.password.startsWith('$2b$')) {
            // Password is hashed, use bcrypt compare
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plain text password (shouldn't happen after migration)
            passwordMatch = (password === user.password);
            if (process.env.NODE_ENV === 'development') {
                console.log('Warning: Plain text password found for user:', user.email);
            }
        }
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create user session data (in production, use JWT or sessions)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role_name,
            role_id: user.role_id,
            profile_img: user.profile_img
        };
        
        res.json({
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Upload profile image with error handling
router.post('/upload-profile-image', (req, res) => {
    upload.single('profileImage')(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
                }
                return res.status(400).json({ error: 'File upload error: ' + err.message });
            }
            return res.status(400).json({ error: 'Upload error: ' + err.message });
        }
        
        // Continue with upload processing
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Generate the image path that will be stored in database
        const imagePath = `/images/user_images/${req.file.filename}`;
        
        // Update user's profile_img in database
        const updateResult = await req.db.execute(
            'UPDATE users SET profile_img = ? WHERE id = ?',
            [imagePath, userId]
        );
        
        res.json({ 
            message: 'Profile image uploaded successfully',
            imagePath: imagePath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Server error during image upload: ' + error.message });
    }
    });
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password, profile_img } = req.body;
        
        let updateQuery;
        let updateParams;
        
        if (password && password.trim() !== '') {
            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            updateQuery = 'UPDATE users SET name = ?, email = ?, password = ?, profile_img = ? WHERE id = ?';
            updateParams = [name, email, hashedPassword, profile_img, userId];
        } else {
            // Don't update password if not provided
            updateQuery = 'UPDATE users SET name = ?, email = ?, profile_img = ? WHERE id = ?';
            updateParams = [name, email, profile_img, userId];
        }
        
        // Update user
        await req.db.execute(updateQuery, updateParams);
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 