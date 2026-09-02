# `universe.html` Implementation Plan

## Goal

Create a full-screen, draggable universe map made from multiple independently placed map images. The world begins focused on the first map, supports expansion in every direction, has no user zoom controls, and opens a modal when a marker is selected.

## Core layout

```text
Browser viewport
└── map_container (100vw × 100vh, clips overflow)
    └── world_canvas (free-expanding coordinate plane)
        ├── map-1 image
        │   └── markers belonging to map-1
        ├── map-2 image
        │   └── markers belonging to map-2
        └── additional maps and their markers
└── modal layer (fixed above the map)
```

- `map_container` is the visible viewport.
- It disables page-style scrolling and clips anything outside its edges.
- `world_canvas` is a free-expanding canvas, moved through drag interaction.
- Maps are positioned absolutely in world coordinates—not by CSS Grid or DOM order.
- The modal sits outside the canvas so it remains fixed on screen.

## Map data model

Each map has an ID, source image, native image dimensions, and an explicit location in the shared world coordinate system.

```text
map:
  id: "map-1"
  image: "assets/maps/map-1.png"
  worldX: 0
  worldY: 0
  width: 1920
  height: 1080
```

- `map-1` is the starting map and establishes the origin at `(0, 0)`.
- Map IDs are stable identifiers only; they do not determine placement.
- Future maps may use positive or negative coordinates.

Example horizontal expansion:

```text
map-3        map-2        map-1        map-4
x: -3840     x: -1920     x: 0         x: 1920
```

## Marker model

Markers belong to one map and use coordinates relative to that map’s native image size.

```text
marker:
  id: "city-alpha"
  mapId: "map-1"
  x: 960
  y: 540
  title: "City Alpha"
  description: "..."
```

Marker world position is derived rather than stored separately:

```text
worldX = map.worldX + marker.x
worldY = map.worldY + marker.y
```

This keeps markers correct if maps are moved, added, or replaced.

## Initial camera position

On first load:

1. Find `map-1`.
2. Calculate its center from its world position and native dimensions.
3. Position the camera so `map-1`’s center aligns with the viewport center.
4. Apply the current responsive zoom level.

This makes the first map the default focus without making it structurally special after initialization.

## Responsive initial zoom

Use one zoom value for the entire world canvas. Do not scale maps individually.

| Viewport | Initial zoom |
|---|---:|
| Mobile | `0.45–0.60` |
| Tablet | `0.65–0.75` |
| Desktop | `0.80–0.90` |
| Large desktop | `0.90–1.00` |

- Zoom is fixed for the user: no pinch, wheel, or button zoom.
- The chosen zoom must be included in map rendering, initial centering, marker placement, and pan clamping.
- On resize, preferably preserve the world point currently at the viewport center to prevent a disorienting jump.

## Drag interaction

- Drag with mouse or touch to move the camera across the world.
- Use Pointer Events for consistent mouse and touch support.
- Set `touch-action: none` inside the map viewport to prevent browser gesture scrolling.
- Use `grab` and `grabbing` cursor states on desktop.
- Begin a marker click only if pointer movement stays below a small drag threshold, such as 5 pixels.
- No inertia, bounce, or zooming in the first version.

## Pan clamping

Determine the total world bounds from all map images:

```text
left   = smallest map.worldX
top    = smallest map.worldY
right  = largest map.worldX + map.width
bottom = largest map.worldY + map.height
```

Then apply the current zoom to those dimensions when calculating camera limits.

Rules per axis:

- If the scaled world is larger than the viewport, clamp dragging so no blank space appears beyond the world boundary.
- If the scaled world is smaller than the viewport, center it on that axis and disable dragging on that axis.
- Recalculate bounds whenever maps are added, removed, resized, or repositioned.

## Marker interaction and modal

- Markers render above their respective map image.
- Selecting a marker opens one reusable fixed modal.
- The modal receives content from marker data: title, description, image, links, actions, and so on.
- Clicking the modal must not move the map.
- Provide normal close behavior: close button, backdrop click, and Escape key.

## Visual direction

- Keep the map imagery as the primary visual focus.
- Use a deliberately designed background behind the canvas for situations where the scaled world is smaller than the viewport—dark space, faint stars, texture, or vignette.
- Start with restrained markers: small icons/pins with hover or tap labels.
- Use a clear visual distinction between passive map imagery and interactive marker locations.

## Future extensions

- Map adjacency metadata for validating or guiding placements.
- A mini-map or map selector.
- Animated camera movement when navigating to a selected marker.
- Unlockable regions, if fog-of-war returns later.
- Map-specific overlays, quests, routes, labels, or faction boundaries.
- Persisted camera position and selected marker.
