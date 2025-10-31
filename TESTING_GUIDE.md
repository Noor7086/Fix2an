# Testing Guide - Customer Flow

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:4000`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 📝 Test Credentials

**Customer Account:**
- Email: `customer@test.com`
- Password: `password123`

**Workshop Accounts:**
- Email: `workshop@test.com` or `workshop2@test.com`
- Password: `password123`

## 🧪 Testing the Complete Customer Flow

### Step 1: Upload Inspection Report
1. Go to `http://localhost:3000/en/auth/signin`
2. Login with `customer@test.com` / `password123`
3. Navigate to `/en/upload`
4. Upload a test file (JPG, PNG, or PDF - max 10MB)
5. Fill in vehicle information:
   - Make: Volvo
   - Model: XC60
   - Year: 2020
6. Optionally add a description
7. Click "Submit"

**Expected Result:**
- Files are uploaded to backend
- Vehicle is created
- Inspection report is created
- Request is created with status `IN_BIDDING`
- Redirected to `/en/my-cases`

### Step 2: View My Cases
1. Go to `/en/my-cases`
2. You should see your new request with status "Waiting for offers"
3. You should also see the pre-seeded request with offers ready

**Expected Result:**
- See all your requests
- Request status shows correctly
- "See details" button available for requests in bidding

### Step 3: View Offers
1. Click "See details" on a request
2. You'll be redirected to `/en/offers?requestId=<request-id>`

**Expected Result:**
- See offers list with filters
- Can sort by Price, Distance, or Rating
- Can filter by Price range, Distance, Rating
- Each offer shows:
  - Workshop name
  - Price (incl. VAT)
  - Distance
  - Rating
  - Estimated duration
  - Warranty info (if available)

**Note:** The pre-seeded request `cmhf7lwpc000a13zk5q54zphk` already has 2 offers you can view!

### Step 4: View Offer Details & Book
1. Click "View details & book" on any offer
2. You'll see the offer detail page with:
   - Full offer information
   - Workshop contact details
   - Available time slots
   - Booking form
3. Select a time slot from the dropdown
4. Click "Confirm Booking"

**Expected Result:**
- Booking is created
- Request status updates to `BOOKED`
- Offer status updates to `ACCEPTED`
- Redirected back to `/en/my-cases`
- Success message shown

### Step 5: Verify Booking in My Cases
1. Go back to `/en/my-cases`
2. The booked request should show status "Booked"
3. You should see booking details including scheduled time

## 🔍 Testing Scenarios

### Test Upload Flow
- ✅ Upload single file
- ✅ Upload multiple files (1-5 files)
- ✅ Test file validation (wrong format, too large)
- ✅ Test vehicle form validation
- ✅ Check file storage location

### Test Offers Page
- ✅ View offers with filters
- ✅ Sort by Price (ascending)
- ✅ Sort by Distance (ascending)
- ✅ Sort by Rating (descending)
- ✅ Filter by Price range
- ✅ Filter by Distance
- ✅ Filter by Rating
- ✅ Combined filters

### Test Booking Flow
- ✅ Select time slot
- ✅ Create booking
- ✅ Verify booking in database
- ✅ Check status updates
- ✅ Test error handling

### Test Navigation
- ✅ Upload → My Cases
- ✅ My Cases → Offers
- ✅ Offers → Offer Detail
- ✅ Offer Detail → Booking → My Cases

## 🐛 Common Issues & Solutions

### Issue: No offers showing
**Solution:** Make sure you're using the pre-seeded request ID: `cmhf7lwpc000a13zk5q54zphk`

### Issue: Upload fails
**Solution:** 
- Check backend is running on port 4000
- Verify `NEXT_PUBLIC_API_URL=http://localhost:4000` in frontend `.env.local`
- Check `uploads/` directory exists in backend folder

### Issue: Offers page shows error
**Solution:**
- Verify request exists in database
- Check request has status `IN_BIDDING` or `BIDDING_CLOSED`
- Ensure workshops are verified (`isVerified: true`)

### Issue: Booking creation fails
**Solution:**
- Check that a time slot is selected
- Verify offer has available dates
- Check backend logs for errors

## 🔄 Re-seed Test Data

If you need to reset test data:

```bash
cd backend
npm run seed
```

This will:
- Create/update test customer
- Create/update test workshops
- Create test vehicle
- Create test inspection report
- Create test requests with offers

## 📊 Database Inspection

View the database in Prisma Studio:

```bash
cd backend
npm run db:studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all tables
- Inspect data
- Make manual changes for testing

## ✅ Checklist

Before considering the flow complete, verify:

- [ ] Upload page works and creates request
- [ ] My Cases page shows all requests correctly
- [ ] Offers page loads and shows offers
- [ ] Filters and sorting work correctly
- [ ] Offer detail page shows all information
- [ ] Booking creation works
- [ ] Status updates correctly after booking
- [ ] Navigation flow works end-to-end
- [ ] All pages are localized (English/Swedish)
- [ ] Error handling works (network errors, validation errors)

## 🎯 Test Request IDs (from seed)

- Request with offers (IN_BIDDING): `cmhf7lwpc000a13zk5q54zphk`
- Request with offers (BIDDING_CLOSED): `cmhf7lwpz000g13zkhzs28t7m`

Use these IDs directly in URLs:
- `/en/offers?requestId=cmhf7lwpc000a13zk5q54zphk`


