# UrboSuites — Assets & Content Management Guide

This guide explains how to easily manage and customize photos, property details, amenities, and guest reviews for the UrboSuites website.

---

## 1. How to Change the Hero Photo of Any Suite

Photos inside each suite folder are automatically sorted in **alphabetical/numerical order**.  
The **first photo** (alphabetically) is automatically selected as the **Hero Picture** (the main cover photo on the homepage cards, carousels, and detail pages).

### Folder Locations:
- **Hillcrest (Suite 201)**: `src/assets/suites/hillcrest/`
- **Gulmohar (Suite 101)**: `src/assets/suites/gulmohar/`

### How to set or change the hero photo:
1. Open the suite folder (e.g., `src/assets/suites/gulmohar/`).
2. Add `01-` to the beginning of the filename you want as the hero picture:
   - Example: Rename `Bed_Table.jpg` ➔ `01-Bed_Table.jpg`.
3. If another photo already has `01-`, change it to `02-` or remove the `01-` prefix.
4. **Done!** On the next build/refresh, that photo will be the main hero cover photo.

> **Tip**: You can control the exact display sequence of the entire photo slider by prefixing files with `01-`, `02-`, `03-`, `04-`, etc.

---

## 2. Where to Change Suite Names, Numbers, Rates & Copy

All suite information lives in simple, human-readable Markdown files:
- **Hillcrest**: `src/content/properties/hillcrest.md`
- **Gulmohar**: `src/content/properties/gulmohar.md`

### Frontmatter Fields (Top of the File):
```yaml
---
title: "Hillcrest — Suite 201"       # Displays on navigation, cards, and page header
suiteNumber: "201"                   # Unit number
tagline: "Forest & valley view"      # Short sub-heading
pricePerNight: 3499                  # Nightly rate in INR (numbers only, no commas)
maxGuests: 4                         # Maximum guests allowed
bedType: "1 Super King"              # Bed configuration
sqft: 500                            # Total area in square feet
floor: 14                            # Floor level
roomType: "Studio"                   # Studio / 1BHK / 2BHK
rating: 4.9                          # Average rating
reviewCount: 61                      # Number of verified reviews
checkIn: "01:00 PM"                  # Check-in time
checkOut: "11:00 AM"                 # Check-out time
minNights: 1                         # Minimum nights required
order: 1                             # Order on homepage (1 = first, 2 = second)
isActive: true                       # Set to false to temporarily hide
---
```

### Changing Description & Body Text:
Below the `---` line in the markdown file, you can write regular text. Paragraphs are automatically formatted with spacious, luxury typography.
- To highlight practical information (like parking or airport travel), start a paragraph with **bold text**:
  ```markdown
  **Good to know:** Hillcrest has hosted back-to-back business travellers for months...
  ```
  This will automatically render in an elegant callout box with an Urbo gold accent border.

---

## 3. Amenities & Facilities Pictures Guide

All shared building amenity photos live in:
📁 `src/assets/amenities/`

### Will changes to picture names reflect correctly on site?
**Yes!** The website has an intelligent naming engine that:
1. **Automatically creates clean titles**: Converts filenames into human-readable titles on hover:
   - `GrandEntrance.jpg` ➔ **Grand Entrance**
   - `CrossTrainer-Gym.jpg` ➔ **Cross Trainer Gym**
   - `Cafeteria-1stFloor.jpg` ➔ **Cafeteria 1st Floor**
   - `Laundromat-Basement.jpg` ➔ **Laundromat Basement**
2. **Automatically sorts into categories**: The website inspects the filename and assigns it to the matching category:

| Category | Keywords to include in filename | Example Filenames |
| :--- | :--- | :--- |
| **1. Building Exterior & Entrance** | `exterior`, `grandentrance`, `outdoors`, `entrance` | `GrandEntrance.jpg`, `Exterior-Lawn.jpg` |
| **2. Gym & Fitness** | `gym`, `weights`, `bench`, `cross`, `elliptical` | `Gym-Treadmill.jpg`, `Weights-Gym.jpg` |
| **3. Cafeteria & Spaces** | `cafeteria`, `meeting`, `playarea`, `laundromat` | `Cafeteria-1stFloor.jpg`, `MeetingRoom-1stFloor.jpg` |
| **4. Rooftop Terraces** | `terrace`, `terrage` | `Terrace-SunsetView.jpg`, `Terrace-Gazebo.jpg` |

> **Best Practice for New Photos**:
> Simply prefix your file with the category and a descriptive name using hyphens:
> - `Gym-RowingMachine.jpg` ➔ Displays under **Gym & Fitness** as **"Gym Rowing Machine"**.
> - `Exterior-Driveway.jpg` ➔ Displays under **Building Exterior** as **"Exterior Driveway"**.
> - `Cafe-BreakfastCounter.jpg` ➔ Displays under **Café & Spaces** as **"Cafe Breakfast Counter"**.

---

## 4. How to Edit or Add Testimonials (Reviews)

Guest reviews are managed in a single, dedicated file:
📁 **`src/data/testimonials.ts`**

### To add a new review:
Open `src/data/testimonials.ts` and add an entry to the `testimonials` list:

```typescript
{
  name: 'Priya Sharma',
  city: 'Mumbai',
  rating: 5,
  date: 'September 2026',
  suite: 'Hillcrest',             // 'Hillcrest' | 'Gulmohar' (or omit for both)
  platform: 'airbnb',             // 'airbnb' | 'google' | 'direct'
  verified: true,
  text: 'The view from the balcony in the morning was breathtaking. Fast Wi-Fi and spotless interiors.',
},
```

---

## 5. How to Preview Changes Locally

Whenever you add or rename photos, or edit content files:

1. Open your terminal in the project folder:
   ```bash
   cd c:\01-Agentic-Projects\Urbo
   ```
2. Build and preview:
   ```bash
   npm run build
   npx serve .vercel/output/static --listen 4321
   ```
   *(Or for instant live-reloading during editing: `npm run dev`)*
3. View in your browser at:
   👉 **http://localhost:4321**
