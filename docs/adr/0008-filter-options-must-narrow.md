# Every Offered Filter Option Must Narrow the Catalog

Catalog filter options are derived from the Routes themselves (`lib/engine/catalogFilters.ts`), never from a hand-kept list of chips. An option earns its place only if it does both of the following against the current catalog:

- returns **at least one** Route — an option that returns nothing is a dead end, and the traveler reads the empty result as "there is nothing for me here" rather than "that chip was a lie";
- excludes **at least one** Route — an option that returns everything is not a filter, it is decoration that costs a tap.

The catalog previously offered a Full-Day duration matching no Route at all, and a Photo Spots Vibe carried by 8 of 9 Routes. Both were hardcoded chip lists that had drifted from the data. Deriving the options makes that drift impossible: adding a Full-Day Route brings its chip back on its own, and no chip has to be manually retired when the content changes.

## The selectivity ceiling

"Excludes at least one Route" is too weak for a Soft Constraint: a Vibe on 8 of 9 Routes technically excludes one and is still useless as a filter. A Vibe is therefore offered only if fewer than **80%** of Routes carry it (`VIBE_SELECTIVITY_CEILING`). The number is a judgement call, not a measurement — it is the point where a chip stops being a choice and starts being a description of the catalog.

The dropped Vibe stays on the Route as a descriptive attribute. It is still true of the place; it just is not a way to choose between places.

## The catalog offers no Logistics Constraint filter

The catalog once led its panel with a Logistics Constraint block — a Hard Constraint, boxed off from the Soft Constraint pills. It no longer does. Browsing is not the moment the traveler is asked about their body: every Route states its accessibility on its own card, which is enough to browse by, and a Hard Constraint that silently removes Routes from a catalog costs more than it gives.

The constraint itself is untouched. The bot conversation still asks about accessibility, and the matching engine still enforces it via `isAccessibilitySatisfied` when it recommends a Route — the place where the traveler asked for a recommendation rather than a shelf.

Every filter the catalog does offer is therefore a Soft Constraint.

## Consequences

- Filter options change with the content. A test that asserts a specific chip exists must assert it against the catalog, not against a constant.
- A Route added with an unlabelled `DurationCategory` or `VibeCategory` will fail typecheck at the label maps in `RouteCatalog` — the maps are keyed by the union, deliberately.
- The rule is about *offering* options, not about *combining* them. Two individually valid options can still combine to zero Routes; the empty-results state and its reset action carry that case.
