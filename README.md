# Attendance Guard

A mobile-first React Native (Expo) app that helps university students track attendance and avoid falling below the minimum requirement.

## Problem

Students often lose track of how many classes they have attended in each course. They only find out they are below the attendance limit when it is too late to recover, and the student portal shows a percentage without telling them what to do about it.

## Solution

Attendance Guard lets students record attendance per course and gives instant, actionable feedback:

- If a course is **safe** (75% or above), it shows how many more classes can be missed.
- If a course is **at risk** (below 75%), it shows how many classes in a row must be attended to recover.

The 75% threshold is a single constant (`THRESHOLD`) in `App.js`, so it is easy to change.

## Major Features

- **Course list** generated from an array of objects using `.map()` and a reusable `CourseCard` component
- **Present / Absent buttons** that update attendance and recalculate percentages live
- **Add course form** with validation (empty name, non-numeric values, total of zero, attended greater than total) and clear error messages
- **Delete course** support
- **Filtering:** All or At risk courses
- **Sorting:** lowest attendance first
- **Dynamic warnings:** a banner showing how many courses are below the threshold, and a red border on at-risk cards
- **Empty states** for no courses and for no at-risk courses
- **Dashboard** built with `react-native-chart-kit`:
  - Bar chart of attendance percentage per course
  - Progress chart of attendance per course
  - Overall attendance summary
- **View switching** between Courses and Dashboard using state and conditional rendering (no navigation library, no side or bottom bars)

## Concepts Demonstrated

- **React:** components, props, `useState`, event handlers, conditional rendering, data-driven lists
- **JavaScript:** arrays and objects, `map`, `filter`, `sort`, `reduce`, calculations, input parsing and validation
- **Reusable components:** `Button`, `Chip`, `CourseCard`, `EmptyState`, `AddCourseForm`

## Project Structure

Everything is in `App.js`:

| Part | Purpose |
| --- | --- |
| `THRESHOLD`, `INITIAL_COURSES` | Constants and static data |
| `percent`, `isAtRisk`, `advice` | Helper functions for calculations |
| `Button`, `Chip`, `CourseCard`, `EmptyState`, `AddCourseForm` | Reusable components |
| `CoursesView`, `DashboardView` | The two switchable views |
| `App` | Root component holding `courses` and `view` state |

## Setup and Run Instructions

### Option 1: Expo Snack

1. Open the project in [snack.expo.dev](https://snack.expo.dev).
2. Make sure `react-native-chart-kit` and `react-native-svg` are listed as dependencies (use **Add dependency** if prompted).
3. View the app in the Web preview, or scan the QR code with Expo Go on your phone.

### Option 2: Local Expo project

```bash
npx create-expo-app attendance-guard
cd attendance-guard
npm install react-native-chart-kit react-native-svg
```

Replace the generated `App.js` with the one from this project, then run:

```bash
npx expo start
```

Scan the QR code with the Expo Go app, or press `w` to open it in the browser.

## AI Usage

AI was used to help generate the initial code structure and to debug dependency and linting issues. All code was reviewed and tested manually, including form validation, filtering, sorting, empty states, and the dashboard charts.