# EMS Synth 100

A browser-based modular synthesizer inspired by the classic EMS Synthi 100.

## Prerequisites

- Node.js 18 or later
- Yarn package manager

## Installation

Install the dependencies:

```bash
yarn install
```

## Development server

Start the Vite dev server:

```bash
yarn dev
```

The application will be available at `http://localhost:5173` by default.

## Building

Create an optimized production build:

```bash
yarn build
```

The build output is placed in the `public/` directory. You can preview the built
app locally with:

```bash
yarn preview
```

## Application overview

This project emulates a simplified Synthi 100 workflow. Modules such as
oscillators, filters, envelopes and a master output can be spawned onto the
workspace. Connections between module inputs and outputs are made through the
patch matrix.

### Using the UI

1. Click a module name in the sidebar to spawn it.
2. Drag modules around the workspace to arrange them.
3. Click cells in the patch matrix to connect or disconnect module outputs to
   inputs.
4. Use the **Save Patch**, **Load Patch** and **Clear All** buttons in the top
   right to manage your patch.
5. The **Master** module provides volume control and an oscilloscope display.
