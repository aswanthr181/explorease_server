const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const auth2client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

const googleverify = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (token) {

            const ticket = await auth2client.verifyIdToken({
                idToken: token,
                audience: '463512901423-km9g9fvt6rncfgjd0fcc6mtnm1ktanh1.apps.googleusercontent.com'
            })
            req.user = ticket
            next()
        }
        else {
            res.json({ success: false })

        }
    }
    catch (err) {
        res.json({ success: false })
    }
}

const verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");

    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });

        if (token.startsWith("Bearer ")) {

            token = token.slice(7, token.length).trimLeft();

        }
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verified;

        next();
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Authentication failed: invalid token." });

    }
}

const verifyAdminToken = async (req, res, next) => {
    try {
        // Use the verifyToken function to verify the token first
        await verifyToken(req, res, async () => {
            // Check if the user role is 'admin'
            if (req.user && req.user.role === 'admin') {
                next(); // If admin, proceed to the next middleware
            } else {
                res.status(403).json({ message: 'Access denied: Not an admin.' });
            }
        });
    } catch (error) {
        console.log(error);
        return res
            .status(404)
            .json({ message: 'Authentication failed: invalid token.' });
    }
};


const generateAuthToken = (user) => {

    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, role: 'user' }, process.env.JWT_SECRET_KEY)
    return token;
}

const generateAgencyToken = (agency) => {

    const token = jwt.sign({ _id: agency._id, name: agency.name, email: agency.email, role: 'agency' }, process.env.JWT_SECRET_KEY)
    return token;
}

const generateAdminToken = (admin) => {

    const token = jwt.sign({ _id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET_KEY)
    return token;
}

module.exports = {
    verifyToken,
    generateAuthToken,
    generateAgencyToken,
    googleverify,
    generateAdminToken,


    verifyAdminToken
}