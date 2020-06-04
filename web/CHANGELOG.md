# Changelog
All notable changes to this project will be documented in this file.

The format is inspired from [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and the versioning aim to respect [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Here is a template for new release sections

```
## [_._._] - 20XX-MM-DD

### Added
-
### Changed
-
### Removed
-
```

## [Unreleased]

### Added
- Linting with prettier JS (#67, #68, #69)
- Template for `request-event-evaluation` (label "Event Prediction") (#62)
- Template for sidebar (#62)
- Added GA (#70)
- Page titles (#72)
- Added active page links (#74)
- [line graph] x-ticks dates (#75)
- [line graph] hover (cross-hair) (#75)
- [line graph] stroke width 2 (#75)
- [line graph] contrast colors (#75)
- map bubble links to line plots (#75)
- [line graph] x and y labels (#79)
- [line graph] axis reactive with window size (#79)

- when clicking on submit in "Request Model" it shows a result and possibility to send data to formspree (#52)
- Creation of a contact form page with Formspree (#84)
- Favicon (#86)
- Update of `selectButton` dropdown via jQuery (#88)
- Containment measures for a given country on the `model` template (#88)
- footer (#95)
- Event request result view (#95)
- `containment_measures` endpoint (#108)


### Changed
- Template for `model` (label "Request model") (#62, #52)
- Version of jQuery (also add it as static file) (#88)
- Model for calculating event risk (#11)
- Template for `request-event-evaluation` (#11)
- Description text below the graph on `model` view (#138)
- Fontawesome fix buggy cdn (#196)
- Formspree link so that they all belong to same account (#198)

### Removed
- Template for `selections` as well as view (duplicate of `request-event-calculation`) (#52)
- Update of `selectButton` dropdown via d3 (#88)

