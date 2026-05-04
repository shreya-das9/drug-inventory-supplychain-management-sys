# Admin Authentication: Environment → Database Migration

## Changes Made

### 1. **New Model: AdminAllowedEmailModel.js**
- Created a new MongoDB model to store authorized admin emails
- Stores: email, status (ACTIVE/INACTIVE), addedBy, reason, timestamps
- Replaces the `.env` based whitelist

### 2. **Backend Route Updates: auth.routes.js**
- Replaced `parseAllowedAdminEmails()` with async `isAdminAllowedEmail(email)` function
- Now queries `AdminAllowedEmail` collection instead of `.env`
- Updated both `/signup` and `/login` endpoints to use async checks

### 3. **UserModel Updates**
- Removed pre-validate hook that checked `ADMIN_ALLOWED_EMAILS` environment variable
- Admin authorization now handled entirely in auth routes using database

### 4. **Admin Management Routes: admin.routes.js**
- Added 4 new endpoints under `/api/admin/admin-emails`:
  - `GET /admin-emails` - List all authorized admin emails
  - `POST /admin-emails` - Add new authorized email
  - `DELETE /admin-emails/:email` - Remove authorized email
  - `PATCH /admin-emails/:email` - Update email status (ACTIVE/INACTIVE)

### 5. **Updated Creation Script: create-admin.js**
- Now adds email to `AdminAllowedEmail` collection
- Creates user account in `User` collection
- Both operations are atomic and documented

### 6. **Frontend Updates: Signup.jsx**
- Removed hardcoded `ADMIN_ALLOWED_EMAILS` constant
- Removed `isAdminEmailAllowed()` and `isAdminSelectionBlocked` checks
- Backend now handles all admin email validation on signup
- Error messages from backend are displayed to user

### 7. **Environment Variable Cleanup**
- Removed `ADMIN_ALLOWED_EMAILS` from `.env` (no longer needed)
- Admin emails are now persisted in database

## Benefits

✅ **Portable**: Admin credentials work across all systems using same database
✅ **No Downtime**: Add/remove admin emails without server restart
✅ **Scalable**: Manage multiple admin emails easily through API
✅ **Audit Trail**: Track who added admin emails and when
✅ **Environment Agnostic**: Dev/staging/production use same codebase

## How to Use

### Add a new admin email:
```bash
POST http://localhost:5000/api/admin/admin-emails
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "reason": "Onboarding new admin"
}
```

### List all authorized admin emails:
```bash
GET http://localhost:5000/api/admin/admin-emails
Authorization: Bearer <admin-token>
```

### Remove an admin email:
```bash
DELETE http://localhost:5000/api/admin/admin-emails/email@example.com
Authorization: Bearer <admin-token>
```

### Deactivate an admin email (without deleting):
```bash
PATCH http://localhost:5000/api/admin/admin-emails/email@example.com
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "INACTIVE"
}
```

## Testing

Now when you try to login with `drug.inventory.management.system@gmail.com / calpol650`, it will:
1. Query the database for the email in `AdminAllowedEmail` collection
2. If found and status is ACTIVE, allow admin role
3. Works across any system using the same database
