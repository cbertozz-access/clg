# Changelog

All notable changes to the CLG project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Technical specification updated with full architecture documentation
- Datadog RUM integration for frontend observability
- Amplitude analytics integration
- Iterable email marketing integration
- Security layer: Rate limiting with Upstash Redis
- Security layer: CSRF protection (double-submit cookie)
- Security layer: Input validation with Zod + DOMPurify
- Security headers middleware
- CI/CD workflows for 3-environment pipeline
- Architecture Decision Records (ADRs)
- C4 architecture diagrams

### Changed
- Updated Node.js requirement to v22 for isolated-vm compatibility
- Rate limiter now lazy-initializes to handle missing env vars during build
- Validation uses regex-based sanitization for SSR compatibility

### Fixed
- Build errors from undefined BUILDER_API_KEY during static generation
- TypeScript errors in rate-limit headers typing
- Deprecated instrumentationHook removed from next.config.ts

---

## [0.1.0] - 2026-01-30

### Added
- Initial CLG project setup with Next.js 16
- Builder.io integration for headless CMS
- Multi-brand theming system
- Firebase visitor identification system
- Equipment enquiry cart functionality
- Contact form with NS Adapter integration
- Algolia search integration
- GTM data layer integration

---

<!-- Links -->
[Unreleased]: https://github.com/cbertozz-access/clg/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/cbertozz-access/clg/releases/tag/v0.1.0
