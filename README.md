# StoryCraft

A desktop app for visualizing **worldbuilding** as a network of shapes and icons on
an infinite canvas. Drop shapes and icons onto a blank area, drag them around,
connect them in any direction, and customize every color, border, and label.

## Features

- **Infinite canvas** with pan, zoom, dots grid, minimap, and fit-to-view.
- **Shapes**: rectangle, rounded, ellipse, diamond, triangle, hexagon,
  parallelogram, star, cylinder, cloud.
- **Icons**: a worldbuilding-themed icon palette (castles, dragons, maps…).
- **Free-form connections**: link any node to any other from any side, with
  arrowheads, labels, animated lines, and selectable line styles.
- **Extensive customization**: per-shape fill / border / text color, border
  width, font size, resizable nodes, and a global canvas background color.
- **Save / Open** worlds as portable `.storycraft.json` files.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Language       | TypeScript                              |
| UI             | React + Vite                            |
| Diagram engine | React Flow (`@xyflow/react`)            |
| Desktop shell  | Electron (`electron-vite`)              |
| Installer      | electron-builder (NSIS, Windows)        |

## Security

The renderer is fully sandboxed: `contextIsolation` on, `nodeIntegration` off,
`sandbox` on, a strict Content-Security-Policy, denied permission requests,
blocked external navigation, and a minimal typed `contextBridge` API. File
access happens only through user-initiated save/open dialogs in the main process.

## Development

```bash
npm install
npm run dev        # launch the app with hot reload
npm run typecheck  # type-check main, preload, and renderer
```

## Build a Windows installer

```bash
npm run build:win
```

The installer is written to `dist/StoryCraft-<version>-Setup.exe`.

## License

MIT
