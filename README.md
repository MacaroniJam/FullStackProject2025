# Setup Instructions
_**NOTE BRIEFLY: This works on Android ONLY**_

1. Download and install [Node.js](https://www.geeksforgeeks.org/installation-guide/install-node-js-on-windows/)
2. Download and set up both [Android Studio](https://reactnative.dev/docs/set-up-your-environment) and [adb](https://developer-docs.magicleap.cloud/docs/guides/developer-tools/android-debug-bridge/adb-setup/)
3. Install the relevant SDK (Android 15 or up) on Android Studio
4. Navigate to the **Root folder** within your desired terminal and run: _**docker-compose up --build**_. The **Root folder** is the folder that holds both **mobile** and **backend** folders. If installed from GitHub this would be **FullStackProject2025**.
5. Navigate to the **mobile folder** and run within your desired terminal and run the following:
   - _**adb reverse tcp:8000 tcp:8000**_
   - _**npm install**_

## Using a Physical Device
1. Enable USB Debugging on your Android device. The process may vary slightly for different models; therefore, it is best to research how your model can enable it.
2. Connect your phone to your personal computer using a USB.
3. Within the same **mobile folder**, in the terminal run _**npx react-native run-android**_

## Using a Virtual Device 
1. Open Android Studio, select **More Tools** and choose **Virtual Device Manager**
2. Select the play button to run the virtual device.
3. Once the device is booted up, within the same **mobile folder**, in the terminal run _**npx react-native run-android**_
