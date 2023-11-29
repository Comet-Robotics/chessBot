# Welcome to chessBots!

## Setup

To run the website on your local machine:

1. Run either the VS Code **Install dependencies** task or `yarn install` to download necessary packages.
2. Run either the VS Code **Development server** task or `yarn dev` to launch the dev server. This will launch an express server which will automatically build and serve the client to port 3000.
3. Open [localhost:3000](http:/localhost:3000) in your browser.

Note vite will automatically watch both the server and the client code for changes and push updates to the browser automatically - no reloading required.

## Tests

To run tests:

1. Install the VS Code jest testing extension. Make sure to install the pre-release version, as the current version doesn't properly display test output.

2. Use the Testing pane in VS Code to trigger tests.

Jest may also be run in watch mode, which will automatically re-run tests in response to file changes.
