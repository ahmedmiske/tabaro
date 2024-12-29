# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 617
ETag: W/"269-XwlPwkeNCchrBK8wSRQheio6+9Q"
Date: Sun, 29 Dec 2024 16:53:24 GMT
Connection: close

{
  "message": "User validation failed: phone: Path `phone` is required., email: Path `email` is required.",
  "stack": "ValidationError: User validation failed: phone: Path `phone` is required., email: Path `email` is required.\n    at Document.invalidate (C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3331:32)\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3092:17\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\schemaType.js:1407:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)"
}

HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 549
ETag: W/"225-VFOiIYVz7EB3BQiyfENFr2e5Zl4"
Date: Sun, 29 Dec 2024 16:57:23 GMT
Connection: close

{
  "message": "User validation failed: phone: Path `phone` is required.",
  "stack": "ValidationError: User validation failed: phone: Path `phone` is required.\n    at Document.invalidate (C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3331:32)\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3092:17\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\schemaType.js:1407:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)"
}

HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 22
ETag: W/"16-c0B7i8fEAxKJO3fmRZ68aw5PmCA"
Date: Sun, 29 Dec 2024 17:04:28 GMT
Connection: close

{
  "message": "OTP sent"
}



HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 609
ETag: W/"261-EU8v4MuqjlLnbMCFVSwi9cjtGmM"
Date: Sun, 29 Dec 2024 17:14:26 GMT
Connection: close

{
  "message": "User validation failed: status: `verifid` is not a valid enum value for path `status`.",
  "stack": "ValidationError: User validation failed: status: `verifid` is not a valid enum value for path `status`.\n    at Document.invalidate (C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3331:32)\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\document.js:3092:17\n    at C:\\Front-end\\Project-tabaro\\tabaro\\node_modules\\mongoose\\lib\\schemaType.js:1407:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)"
}