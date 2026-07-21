# Curated Travel Route Service

Curated walking routes and interactive timeline guide for Tbilisi travelers delivered via Telegram Bot and Telegram Web App (TWA).

## Language

**Route**:
A curated sequence of geographic stops with timing, logistics notes, and tips.
_Avoid_: Tour, itinerary, path, trip.

**Logistics Constraint**:
Physical terrain and mobility parameters (e.g. stroller/elderly accessibility vs steep incline/cobblestones).
_Avoid_: Difficulty, access level, filter tag.

**Hard Constraint**:
A non-negotiable filter requirement (such as Logistics Constraint) that cannot be relaxed during matching.
_Avoid_: Strict filter, fixed rule.

**Soft Constraint**:
A flexible filter requirement (such as Vibe or Duration) that can be relaxed during matching if an exact match is unavailable.
_Avoid_: Optional filter, preference.

**Vibe**:
Atmospheric character or thematic mood of a route (e.g., photo spots, courtyard hidden gems, polyphonic dance dining).
_Avoid_: Category, tag, mood, topic.

**Card**:
A timeline element presenting details, tips, and navigation deep-links for a single Stop on a Route.
_Avoid_: Step, item, node, detail view.

**Stop**:
A designated geographic point of interest along a Route with coordinates, visual assets, timing, and recommendations.
_Avoid_: Location, place, waypoint, station.

**Map Provider**:
An external navigation mapping service (Google Maps, Apple Maps, or Yandex Maps) launched via universal link.
_Avoid_: Navigation app, external map.

**Olya's Tips**:
Personal, warm, conversational text recommendations attached to a Stop or Route.
_Avoid_: Audio guide, commentary, description.

**Logistics Warning**:
A highlighted advisory on physical obstacles such as steep hills, broken pavement, or summer heat.
_Avoid_: Alert, hazard, difficulty note.

**Telegram WebApp SDK**:
The JavaScript bridge (`window.Telegram.WebApp`) embedded by Telegram to sync theme colors, control native buttons, and manage webview lifecycle.
_Avoid_: Telegram API, webview plugin.

**Callback Payload**:
A structured, encoded string in Telegram inline button data carrying transient filter state without server database storage.
_Avoid_: Session data, state parameter, URL query.




