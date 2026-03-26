# Local Server Image Upload — Design Spec

## Goal

Replace Cloudinary dependency with local server-based image upload using multer + Express static files, so the app works without any external service configuration.

## Architecture

**Current flow:** Client → Cloudinary widget → Cloudinary CDN → URL stored in MongoDB
**New flow:** Client → `POST /api/upload` → Server saves to `uploads/` dir → URL stored in MongoDB

The `imageSrc` field remains a string URL throughout the system. Only the upload mechanism and URL format changes.

## Server Changes

### New: Upload Route (`packages/server/src/routes/upload.route.ts`)

- `POST /api/upload` — accepts `multipart/form-data` with a single file field named `image`
- Requires `isAuth` middleware (any authenticated user can upload)
- Uses `multer` with:
  - Storage: disk storage to `packages/server/uploads/`
  - Filename: `{uuid}{extension}` (e.g., `a1b2c3d4.jpg`)
  - File filter: JPEG, PNG, WebP only
  - Size limit: 5MB
- Returns `{ url: "/uploads/{filename}" }` on success
- Returns 400 for invalid file type or missing file
- Returns 413 for files exceeding 5MB

### Modified: `packages/server/src/app.ts`

- Add `express.static` middleware to serve `uploads/` directory at `/uploads` path
- Mount upload route at `/api/upload`
- Ensure `uploads/` directory exists on startup (create if missing)

### New dependency

- `multer` + `@types/multer`

## Client Changes

### Modified: `packages/client/src/components/Inputs/ImageUpload.tsx`

- Remove all Cloudinary widget code (`window.cloudinary`, `createUploadWidget`, etc.)
- Replace with:
  - Hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`
  - Click handler opens file picker
  - On file select: create `FormData`, `POST /api/upload`, get URL from response
  - Show loading spinner during upload
  - Show preview on success (same as current behavior)
  - Show error toast on failure

### Modified: `packages/client/index.html`

- Remove `<script src="https://upload-widget.cloudinary.com/...">` tag

### Modified: `packages/client/src/utils/Image.tsx`

- Update `optimizedImageUrl()` to return URL unchanged for non-Cloudinary URLs
- Existing Cloudinary URLs in DB continue to work (backward compatible)

## File Storage

- Location: `packages/server/uploads/`
- Add `uploads/` to `.gitignore`
- Filenames: UUID-based to prevent collisions and path traversal
- No subdirectories needed at this scale

## Constraints

- Max file size: 5MB
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`
- Single file per request
- Authentication required

## Backward Compatibility

- Existing listings with Cloudinary URLs continue to display correctly
- `optimizedImageUrl()` only transforms Cloudinary URLs, passes others through unchanged
- No database migration needed — `imageSrc` remains a string field

## What Does NOT Change

- Database schema (imageSrc is still a string)
- Listing creation API (still receives imageSrc as URL string)
- ListingCard, ListingHead display logic
- RentModal form flow (still has IMAGES step)
- API types (`ListingRequestBody.imageSrc` stays string)
