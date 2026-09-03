import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 8, select: false },
        phone: { type: String, trim: true },
        avatar: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isActive: { type: Boolean, default: true },
        isEmailVerified: { type: Boolean, default: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpire: { type: Date, select: false },
        passwordChangedAt: { type: Date, select: false },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function hashPassword(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Back-dated by 1s so a token issued in this same request is never
    // treated as "issued before the password change".
    if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
    next();
});

// True if the given JWT "iat" (seconds) predates the last password change —
// used to invalidate tokens issued before a password change/reset.
UserSchema.methods.wasPasswordChangedAfter = function wasPasswordChangedAfter(jwtIat) {
    if (!this.passwordChangedAt) return false;
    const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtIat < changedAtSeconds;
};

UserSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.getSignedJwtToken = function getSignedJwtToken() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE || '5d',
    });
};

UserSchema.methods.getResetPasswordToken = function getResetPasswordToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    return resetToken;
};

UserSchema.methods.toSafeObject = function toSafeObject() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        avatar: this.avatar,
        role: this.role,
        isActive: this.isActive,
        isEmailVerified: this.isEmailVerified,
        createdAt: this.createdAt,
    };
};

const User = mongoose.model('User', UserSchema);
export default User;
