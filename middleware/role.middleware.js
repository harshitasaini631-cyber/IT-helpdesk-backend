
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Check whether user is authenticated
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role_id)) {
            return res.status(403).json({
                message: "Access forbidden. Insufficient permissions."
            });
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};
