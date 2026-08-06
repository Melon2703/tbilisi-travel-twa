# Curated Travel Route Service

Curated walking routes and interactive timeline guide for Tbilisi travelers delivered via Telegram Bot and Telegram Web App (TWA).

## Language

**Route**:
A curated sequence of geographic stops with timing, logistics notes, and tips.
_Avoid_: Tour, itinerary, path, trip.

**Route Family**:
A group of Routes drawn from one shared pool of Stops, offered at different lengths, paces, or Logistics Constraints. Membership is stated on the Route card so siblings are never compared as if they were independent choices.
_Avoid_: Route group, series, collection, related routes.

**Full Version**:
The Route within a Route Family that contains the family's entire Stop pool.
_Avoid_: Parent route, master route, main route.

**Variant**:
A Route within a Route Family that contains a subset of the Full Version's Stops.
_Avoid_: Child route, sub-route, short route, derived route.

**Place Identity**:
The pair of Google `place_id` and coordinates that identifies a real-world place, independent of any Route. Map Links and Google Rating are properties of Place Identity; order, timing, Olya's Tips, and photos are properties of the Stop that references it. One place may appear as a Stop in several Routes.
_Avoid_: Location, place record, POI, venue id.

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
A story slide element presenting either Route overview (Route Intro Card) or Stop details (Stop Card).
_Avoid_: Step, item, node, detail view.

**Route Intro Card**:
The initial landing slide (Slide 0) presenting high-level route summary, visual overview of the entire route path, terrain highlights, and entry CTA.
_Avoid_: Cover page, landing screen, route header.


**Stop Card**:
A slide (Slide 1..N) presenting details, tips, and navigation deep-links for a single Stop on a Route.
_Avoid_: Location card, detail view.

**Visited State**:
A persistent record of stops the traveler *deliberately marked* as completed along a Route, preserved across sessions. Sparse by nature — a traveler may finish a Route without marking anything.
_Avoid_: Completion flag, checked status, history item, progress.

**Progress Position**:
The furthest Card the traveler has reached on a Route, recorded automatically by any navigation including swipe. Distinct from Visited State: Progress Position answers "where was I", Visited State answers "what did I complete".
_Avoid_: Progress, last seen, bookmark, resume point.

**Stop**:
A designated geographic point of interest along a Route with coordinates, visual assets, timing, and recommendations.
_Avoid_: Location, place, waypoint, station, node.

**Venue Stop**:
A specialized Stop representing a food or beverage establishment (Cafe, Restaurant, Bar) containing cuisine type, vegetarian options, recommended dishes, and booking advice.
_Avoid_: Venue node, establishment, dining spot.

**Pitstop**:
An optional Venue Stop along a Route designated for resting, dining, or refreshments, visually distinguished from landmark Attraction Stops.
_Avoid_: Rest stop, break point, optional location.

**Attraction Stop**:
A Stop representing a landmark, monument, viewpoint, or transit point without dining features.
_Avoid_: General location node, sight.



**Map Provider**:
An external navigation mapping service (Google Maps or Yandex Maps) launched via universal link. There is no provider chooser and no stored provider preference — each Stop offers both, one tap each.
_Avoid_: Navigation app, external map, preferred provider.

**Google Rating**:
The place rating score and review count sourced exclusively from Google Places API.
_Avoid_: Aggregated rating, place score, star rating, multi-provider rating.

**Map Link**:
Minimalist action deep-link buttons pointing to Map Providers (Google Maps, Yandex Maps) placed below the Google Rating. Built from Place Identity, never from a display name: the Google link is anchored on coordinates and carries `place_id` as an enhancement, so an absent or unresolvable identity degrades to a correct pin; the Yandex link uses coordinates only.
_Avoid_: Direction button, map button, navigation link, external map CTA.

**Olya's Tips**:
Personal, warm, conversational narration attached to a Stop or Route. Story Layer content — it colours the place but does not tell the traveler to do anything.
_Avoid_: Audio guide, commentary, description, instruction.

**Stop Directive**:
An instruction from Olya that changes what the traveler physically does at a Stop — which door, which staircase, buy the ticket before queueing, sit on the terrace not inside. Act Layer content. Distinct from a Logistics Warning, which describes an obstacle on the leg *between* Stops rather than an action at the last ten metres.
_Avoid_: Tip, note, advice, hint.

**Act Layer**:
Stop Card content that answers "what do I do here, now" — it passes the five-minute test: it changes what the traveler does in the next five minutes, standing on this spot. Includes Google Rating, Map Links, working hours, transit steps, photo spot, recommended dishes, booking advice, Logistics Warning, and Stop Directive. Occupies a fixed zone directly beneath the Stop title.
_Avoid_: Primary content, above the fold, summary.

**Act Block**:
The fixed zone on the Stop Card that holds the Act Layer — directly beneath the Stop title and neighborhood metadata, above the divider that opens the Story Layer. Absent items are omitted outright rather than left as gaps, so a Stop carrying nothing but Map Links collapses to a single row.
_Avoid_: Action bar, header block, hero section.

**Story Layer**:
Stop Card content that rewards attention but does not direct action — historical summary, fun fact, and Olya's Tips. Read on site, standing in front of the place; it is the reason a traveler chooses a curated Route over a map, and is therefore never hidden behind a tap.
_Avoid_: Secondary content, extra info, details, filler.

**Olya's Recommendation**:
The curated route proposal generated by the route matching engine based on the traveler's duration, accessibility, and vibe preferences, accompanied by Olya's personalized explanation note.
_Avoid_: Matched route, filter result, search output.

**Logistics Warning**:
A highlighted advisory on physical obstacles such as steep hills, broken pavement, or summer heat.
_Avoid_: Alert, hazard, difficulty note.

**Telegram WebApp SDK**:
The JavaScript bridge (`window.Telegram.WebApp`) embedded by Telegram to sync theme colors, control native buttons, and manage webview lifecycle.
_Avoid_: Telegram API, webview plugin.

**Callback Payload**:
A structured, encoded string in Telegram inline button data carrying transient filter state without server database storage.
_Avoid_: Session data, state parameter, URL query.
