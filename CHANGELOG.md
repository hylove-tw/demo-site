# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2024-12-14

### Added
- **Print Report Feature**: Added print button to analysis report pages
  - Print-optimized CSS styles for clean output
  - Support for saving reports as PDF
  - Auto-hide navigation elements when printing
- **E2E Testing**: Added Playwright end-to-end tests
  - Tests for yuanshenyin (single music) analysis
  - Tests for dualmusic (dual-person music) analysis
  - Shared test helpers and fixtures
- **Tutorial Page**: Added comprehensive user guide
  - Step-by-step instructions for all features
  - FAQ section for common issues

### Changed
- **API Layer Improvements**:
  - Added `ApiError` class with status code and original error tracking
  - Added 60-second timeout for all API requests
  - Improved error messages with Chinese localization
  - Added type parameters for shared API endpoints (mindfulness, ore)
- **Analysis Methods**:
  - Added validation for multi-stage APIs (treasure, perfume)
  - Removed redundant try-catch blocks
  - Cleaner error propagation
- **Tutorial Page**: Updated with print report instructions

### Fixed
- Fixed ESLint accessibility warnings in tutorial page
- Removed unused code and interfaces

### Removed
- Deleted unused `src/services/analysisApi.ts` file

## [2.1.1] - Previous Release

### Added
- Filter modal for analysis history
- File group selector component
- Analysis detail and history pages

## [2.1.0] - Previous Release

### Added
- Multi-user support with localStorage persistence
- File upload and management
- Analysis result history
- Multiple analysis plugins (yuanshenyin, hengyunlai, mindfulness, etc.)

## [2.0.0] - Initial v2 Release

### Added
- Complete rewrite with React 19 and TypeScript
- DaisyUI/TailwindCSS styling with custom earth-tone theme
- Plugin-based analysis architecture
- Server-side password authentication
