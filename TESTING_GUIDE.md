# Quick Test Guide - InteriorConnect New Features

## Prerequisites
- Backend running on `http://localhost:4000`
- Frontend running on `http://localhost:5173`
- MongoDB connection active

## Test Scenarios

### Scenario 1: Forgot Password (Both Customers & Designers)

**Steps:**
1. Open application, click "Get started" or "Log in"
2. In login modal, click "Forgot password?" link
3. Enter a registered email address
4. ✅ Should see: "If this email exists, a reset link will be sent"
5. Demo shows token - copy it or wait for auto-fill
6. Click "Verify Token"
7. ✅ Should see: "Token verified! Enter your new password"
8. Enter new password (min 6 chars) and confirm
9. Click "Reset Password"
10. ✅ Should see: "Password reset successfully!" and redirect to login
11. ✅ Login with new password should work

**For Demo without Email Service:**
- Check browser console when requesting reset
- Token will be logged: `[ForgotPassword] Token: xxxxx`
- Use this token in the form OR it auto-fills for convenience

---

### Scenario 2: Designer Profile Edit

**Steps:**
1. Designer logs in → Sees "My Profile" dashboard
2. Update any field (display name, location, description, etc.)
3. Click "Save Profile"
4. ✅ Should see: "✓ Profile saved successfully!"
5. Changes persist when designer logs out and back in
6. Profile appears in customer search with updates

---

### Scenario 3: Designer Profile Deletion

**Steps:**
1. Designer logs in → Sees "My Profile" dashboard
2. After profile is created, "Delete Profile" button appears
3. Click "Delete Profile"
4. ✅ Confirmation dialog appears
5. Click "OK" to confirm
6. ✅ Profile deleted, form cleared
7. Designer sees fresh empty form
8. Verify: Profile no longer appears in customer search

---

### Scenario 4: Customer Book Online (Payment)

**Steps:**
1. Customer logs in
2. Browse designers, click "View profile"
3. In profile sidebar, click "Book online (UPI / Card)"
4. ✅ Booking modal opens
5. Fill in details:
   - Full Name (auto-filled from login)
   - Email (auto-filled from login)
   - Phone Number (required - must enter)
   - Project Description (optional)
   - Estimated Budget (optional)
6. Click "Proceed to Payment"
7. ✅ Should see: Payment gateway redirect message
8. ✅ Shows: "In a real app, this would open: Razorpay / Stripe / UPI payments"

---

### Scenario 5: Customer Schedule Offline Consultation

**Steps:**
1. Customer logs in
2. Browse designers, click "View profile"
3. In profile sidebar, click "Schedule offline visit"
4. ✅ Booking modal opens for offline booking
5. Fill in details:
   - Full Name (auto-filled)
   - Email (auto-filled)
   - Phone Number (required)
   - Project Description (optional)
   - Preferred Visit Date (required for offline)
   - Preferred Time (optional)
   - Estimated Budget (optional)
6. Click "Schedule Consultation"
7. ✅ Should see: Confirmation with date and phone number
8. ✅ Shows: "Designer will contact you at [phone number]"

---

### Scenario 6: Without Login (Permission Check)

**Steps:**
1. Browse designers as guest (not logged in)
2. Click "View profile" on any designer
3. Click "Book online" or "Schedule offline visit"
4. ✅ Should see: "Please log in to book a designer"
5. Login first, then try again

---

### Scenario 7: Form Validation

**Test Booking Form Validation:**
1. Fill booking form but leave Phone Number empty
2. Click "Proceed to Payment"
3. ✅ Should see: "Please enter your phone number"

**Test Offline Validation:**
1. Fill form but leave "Preferred Visit Date" empty (for offline)
2. Click "Schedule Consultation"
3. ✅ Should see: "Please select a visit date"

**Test Password Reset Validation:**
1. Try resetting with mismatched passwords
2. ✅ Should see: "Passwords do not match!"
3. Try password less than 6 characters
4. ✅ Should see: "Password must be at least 6 characters"

---

### Scenario 8: Edge Cases

**Test with Non-existent Email:**
1. Forgot password, enter email that doesn't exist
2. ✅ Should see: "If this email exists, a reset link will be sent"
3. (Security: doesn't reveal if email exists)

**Test with Expired Token:**
1. Generate reset token
2. Wait 1+ hour
3. Try to use token
4. ✅ Should see: "Invalid or expired reset token"

**Test Designer Edit Without Login:**
1. Try accessing `/api/designers/me` without token
2. ✅ Backend returns 401: "Not authenticated"

**Test Delete Without Login:**
1. Try calling DELETE on `/api/designers/me` without token
2. ✅ Backend returns 401: "Not authenticated"

---

## Expected Responses

### Successful Forgot Password
```json
{
  "message": "If this email exists, a reset link will be sent",
  "token": "abc123...", // Demo only
  "resetUrl": "http://localhost:5173/reset-password?token=abc123"
}
```

### Successful Profile Save
```json
{
  "displayName": "John Doe",
  "location": "Mumbai",
  "styles": ["Modern", "Minimal"],
  ...
}
```

### Successful Profile Delete
```json
{
  "message": "Designer profile deleted successfully"
}
```

---

## Database Changes Required

**User Model:**
```javascript
resetToken: String,
resetTokenExpiry: Date
```

These are already added in the implementation. Make sure MongoDB has these fields indexed for better performance:
```javascript
// Optional but recommended
db.users.createIndex({ "resetTokenExpiry": 1 }, { expireAfterSeconds: 0 })
```

---

## Common Issues & Fixes

**Issue:** "Token is required" error in reset password
- **Fix:** Make sure you enter the token generated in step 1

**Issue:** "Password reset successfully" but still can't login
- **Fix:** Make sure you're using the NEW password you just set

**Issue:** Booking modal won't submit
- **Fix:** Ensure phone number field is filled (it's required)

**Issue:** Designer profile not showing delete button
- **Fix:** The delete button only appears AFTER profile is saved once

**Issue:** "User not found" error
- **Fix:** Make sure the email is registered in the system

---

## Performance Notes

- Password reset tokens expire after 1 hour
- Book search filters are debounced (250ms delay)
- Profile images should be image URLs (not file uploads in this demo)
- Consider adding rate limiting to forgot-password endpoint in production

---

## Next Steps for Production

1. ✅ **Email Service**: Integrate email provider (SendGrid, AWS SES)
2. ✅ **Payment Gateway**: Connect Razorpay/Stripe
3. ✅ **Booking Storage**: Create Booking model
4. ✅ **Admin Dashboard**: View all bookings and users
5. ✅ **Notifications**: Real-time booking updates
6. ✅ **Analytics**: Track bookings and revenue
7. ✅ **Testing**: Unit and integration tests
8. ✅ **Security**: Rate limiting, CSRF protection
