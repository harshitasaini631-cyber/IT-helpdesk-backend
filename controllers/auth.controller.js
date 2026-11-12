
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new employee

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            department_id,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await db.promise().query(
            "SELECT user_id FROM USER WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO USER
            (name, email, phone, department_id, role_id, password_hash)
            VALUES (?, ?, ?, ?, 1, ?)
        `;

        const [result] = await db.promise().query(sql, [
            name.trim(),
            normalizedEmail,
            phone || null,
            department_id || null,
            hashedPassword
        ]);

        return res.status(201).json({
            message: "Employee registered successfully",
            user_id: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};




const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const sql = `
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.password_hash,
                u.role_id,
                r.role_name
            FROM USER u
            JOIN ROLE r ON u.role_id = r.role_id
            WHERE u.email = ?
        `;

        const [results] = await db.promise().query(
            sql,
            [normalizedEmail]
        );

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};
