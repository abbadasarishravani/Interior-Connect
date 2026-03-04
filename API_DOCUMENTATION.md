# API Documentation - New Endpoints

## Authentication Endpoints

### 1. Forgot Password Request
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If this email exists, a reset link will be sent",
  "token": "abc123def456...", // Demo only - in production, send via email
  "resetUrl": "http://localhost:5173/reset-password?token=abc123def456"
}
```

**Response (500):**
```json
{
  "message": "Failed to process forgot password request"
}
```

**Backend Logic:**
1. Find user by email (case-insensitive)
2. Generate random 32-byte hex token: `crypto.randomBytes(32).toString('hex')`
3. Set expiry to current time + 1 hour
4. Save token and expiry to user document
5. Return success (security: doesn't reveal if email exists)

---

### 2. Verify Reset Token
```
POST /api/auth/verify-reset-token
Content-Type: application/json

{
  "token": "abc123def456..."
}
```

**Response (200):**
```json
{
  "message": "Token is valid",
  "email": "user@example.com"
}
```

**Response (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

**Backend Logic:**
1. Find user with matching token
2. Check if expiry time is in future: `resetTokenExpiry > now`
3. Return success if valid, 400 if not found or expired

---

### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Response (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

**Backend Logic:**
1. Verify token validity (same as endpoint 2)
2. Hash new password using bcrypt
3. Update user's passwordHash
4. Clear resetToken and resetTokenExpiry
5. Save user
6. Return success

---

## Designer Endpoints

### 4. Delete Designer Profile
```
DELETE /api/designers/me
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Designer profile deleted successfully"
}
```

**Response (401):**
```json
{
  "message": "Not authenticated"
}
```

**Response (403):**
```json
{
  "message": "Only designers can delete profiles"
}
```

**Response (404):**
```json
{
  "message": "Profile not found"
}
```

**Backend Logic:**
1. Extract user ID from JWT token via middleware
2. Verify user role is 'designer'
3. Delete Designer document where user field matches
4. Return success or 404 if not found

---

## State Management (Frontend)

### Password Reset Flow State
```javascript
const [showForgotPassword, setShowForgotPassword] = useState(false)
const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
const [resetToken, setResetToken] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [forgotPasswordStep, setForgotPasswordStep] = useState('email') // 'email', 'token', 'reset'
const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
```

### Booking State
```javascript
const [showBookingModal, setShowBookingModal] = useState(false)
const [bookingType, setBookingType] = useState('online') // 'online' or 'offline'
const [bookingForm, setBookingForm] = useState({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  projectDescription: '',
  visitDate: '',
  visitTime: '',
  budgetRange: '',
})
const [bookingDesigner, setBookingDesigner] = useState(null)
```

---

## UI Components

### Forgot Password Modal
- **Triggers:** Click "Forgot password?" in login modal
- **Steps:**
  1. Email input → Send reset request
  2. Token input → Verify token (optional, for production)
  3. Password input → Reset password
- **Auto-advance:** After each step success, automatically moves to next
- **Error Handling:** Shows error messages in `.ic-auth-message` div

### Booking Modal
- **Type 1 - Online Booking:**
  - Customer info fields
  - Project description
  - Budget range
  - Submit → Shows payment gateway message

- **Type 2 - Offline Consultation:**
  - Customer info fields
  - Project description
  - Date picker (required)
  - Time picker
  - Budget range
  - Submit → Shows confirmation

---

## CSS Classes

### Authentication
```css
.ic-auth-backdrop         /* Full-screen overlay with blur */
.ic-auth-modal            /* Modal dialog */
.ic-auth-header           /* Header with title */
.ic-auth-form             /* Form container */
.ic-auth-form label       /* Input labels */
.ic-auth-form input       /* Input fields */
.ic-auth-form select      /* Select dropdowns */
.ic-auth-submit           /* Submit button */
.ic-auth-cancel           /* Cancel button */
.ic-forgot-password-link  /* Forgot password link */
.ic-auth-message          /* Feedback messages */
```

### Booking
```css
.ic-booking-modal         /* Larger modal for booking form */
```

---

## Error Handling

### Frontend Error Handling
```javascript
try {
  const res = await fetch(url, { method, headers, body })
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.message || 'Error occurred')
  }
  
  // Success handling
} catch (err) {
  // Display error to user
  setForgotPasswordMessage('Error: ' + err.message)
}
```

### Backend Error Handling
- **400:** Bad request (validation failed, missing fields)
- **401:** Unauthorized (no token, invalid token)
- **403:** Forbidden (user doesn't have permission)
- **404:** Not found (resource doesn't exist)
- **500:** Server error (internal error)

---

## Security Considerations

### Token Security
1. **Generation:** Uses `crypto.randomBytes(32)` (256-bit entropy)
2. **Expiry:** 1 hour from generation
3. **Single Use:** Token is cleared after password reset
4. **Storage:** Hashed in database (optional for added security)

### Password Security
1. **Hashing:** bcrypt with salt rounds 10
2. **Validation:** Min 6 characters (configurable)
3. **Confirmation:** Requires matching password twice
4. **Comparison:** Uses bcrypt.compare() for safe comparison

### User Privacy
1. **Email Discovery:** Doesn't reveal if email exists in system
2. **No Audit Trail:** Doesn't log failed attempts
3. **Rate Limiting:** Should be added in production

---

## Database Schema Changes

### User Model (Updated)
```javascript
{
  name: String,
  email: String (unique, lowercase),
  passwordHash: String,
  role: String ('customer' | 'designer'),
  resetToken: String,              // NEW
  resetTokenExpiry: Date,           // NEW
  createdAt: Date,
  updatedAt: Date
}
```

### Designer Model (No changes needed)
```javascript
{
  user: ObjectId (ref: User),
  displayName: String,
  location: String,
  description: String,
  styles: [String],
  spaces: [String],
  minBudget: Number,
  maxBudget: Number,
  startingPrice: String,
  image: String,
  portfolioImages: [String],
  contactEmail: String,
  contactPhone: String,
  onlinePayments: Boolean,
  offlineAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Hooks and Dependencies

### useEffect for Password Reset
```javascript
// Auto-advance on successful token generation
useEffect(() => {
  if (resetToken && forgotPasswordStep === 'email') {
    // Auto-fill token and advance if in demo mode
  }
}, [resetToken, forgotPasswordStep])
```

### Dependencies
- `crypto` (Node.js) - Not needed on frontend
- `bcryptjs` (Backend) - Already in use
- `express` (Backend) - Already in use
- `mongoose` (Backend) - Already in use

---

## Performance Optimizations

### Current Implementation
- Debounced designer search (250ms)
- Token generation is O(1) complexity
- Database queries use single index lookups

### Recommended Optimizations
1. **Email Service:** Async queue for sending emails
2. **Token Lookup:** Create index on resetToken field
3. **Booking Persistence:** Cache frequently accessed bookings
4. **Rate Limiting:** Implement exponential backoff

---

## Deployment Checklist

- [ ] Verify all database indexes created
- [ ] Update SMTP/Email provider configuration
- [ ] Configure payment gateway (Razorpay/Stripe)
- [ ] Update CORS settings for production domain
- [ ] Add rate limiting middleware
- [ ] Enable HTTPS/TLS
- [ ] Add security headers (HSTS, CSP)
- [ ] Configure logging/monitoring
- [ ] Test all endpoints with production credentials
- [ ] Load test for concurrent users
- [ ] Set up database backups
- [ ] Configure CDN for portfolio images
- [ ] Implement monitoring alerts

---

## Troubleshooting

### "Token not found" error
**Cause:** Reset token hasn't been generated or expired
**Fix:** Request new password reset

### "Passwords do not match" error  
**Cause:** Password and confirm password fields don't match
**Fix:** Ensure both password fields are identical

### "User not found" during password reset
**Cause:** Email not registered
**Fix:** Register new account first or use correct email

### Designer profile won't delete
**Cause:** Not authenticated or not a designer
**Fix:** Ensure user is logged in as designer

### Booking form won't submit
**Cause:** Required fields missing (phone for both, date for offline)
**Fix:** Fill all required fields

---

## Future Enhancements

1. **Email Verification:** Send confirmation emails
2. **Two-Factor Authentication:** SMS/Email OTP
3. **Social Login:** Google, Facebook integration
4. **Booking History:** Track all past bookings
5. **Payment History:** View payment records
6. **Designer Analytics:** View booking stats
7. **Review System:** Rate designers after booking
8. **Invoicing:** Generate invoices from bookings
