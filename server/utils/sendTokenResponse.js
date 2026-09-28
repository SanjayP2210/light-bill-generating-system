// Signs a JWT for the user, sets it as an httpOnly cookie, and responds
// with the safe (password-free) user object. Shared by register/login so
// cookie settings stay in exactly one place.
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.getSignedJwtToken();

    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 5;

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(statusCode).json({
        isError: false,
        message,
        data: user.toSafeObject(),
    });
};

export default sendTokenResponse;
