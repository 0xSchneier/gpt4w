# GPT4W: GPT FOR WEB3

## Overview

GPT4W-GPT for Web3, is a decentralized AI tool where Anonymity and Accessibility converge. It protects users' privacy and security through anonymity while ensuring that everyone has equal rights to use AI without any region or identity restriction.

It is built on top of [UP4W](#https://github.com/up4w/up4w-core), which is a decentralized network comprising a group of protocols that implements the user’s complete freedom, ownership, and privacy.

## Table of content

- [Background](#background)
- [How to build](#how-to-build)
    - [Prerequisites](#prerequisites)
    - [Building Steps](#building-steps)
    - [Run Program](#run-program)
    - [Package Application](#package-application)
    - [Build distributable](#build-distributable)
  
- [Architecture](#architecture)
    - [Main Process](#main-process)
    - [Render Process](#render-process)
    - [UP4W-JS](#UP4W-JS)
    - [Chat Robot Service](#chat-robot-service)
   
- [How to use GPT4W](#how-to-use-GPT4W)

## Background

The rise of AI has brought about unprecedented change. While AI enhances humanity in different ways, the control of AI by Web2 centralized platforms poses a threat to freedom of speech, equal human rights, and data privacy. Users face restricted access to artificial intelligence due to government or nationality restrictions, face inequality of user rights between Web2 centralized AI platforms and users, as well as personal information being linked to their identity and IP address. The development of GPT4W, a decentralized AI tool, aims to break down these barriers being mentioned above that are caused by the monopolistic power of Web2 centralized platforms, tech giants, and nationality restrictions.


## How to Build

### Prerequisites

To build the project, the following prerequisites are needed:

- Node.js ≥ v16

  Confirm that Node.js is installed on your system. The latest version can be obtained from the [official Node.js website](https://nodejs.org/en).

- npm/yarn/pnpm

  We advise the use of npm or yarn as package management tools for the installation of project dependencies.

  Recommended versions are at least npm v6 and [yarn](https://yarnpkg.com/getting-started/install) v1. Alternatively, [pnpm](https://pnpm.io/installation) is also an acceptable choice if it better suits your preferences.

  - yarn

    We recommend using Yarn to install project dependencies. Yarn stands out as an efficient and reliable package manager, ensuring deterministic builds and offering superior performance compared to npm.

    `$ npm install -g yarn`

    You can install Yarn globally on your system with the following command, making it available as a command-line tool

  - npm

    In general, when you install Node.js, npm (Node Package Manager) will automatically install as well.

  - pnpm

    The fastest way to install pnpm is by using npm itself. You can install pnpm globally using the following command:
    `$ npm install -g pnpm`
    This will install pnpm globally on your system, making it available as a command-line tool.

- Git

  Git is a free and open-source distributed version control system. It's designed to handle projects of all sizes with speed and efficiency. You can download Git from the official website [here](https://git-scm.com/downloads).

- VS CodeWe recommend using VSCode as your code editor. You can install it from [here](https://code.visualstudio.com/).

### Building Steps

#### Clone The Repository

You will need to clone the repository to your local machine as the first step:

```
$ cd <your_dir>
$ git clone https://github.com/0xSchneier/gpt4w
```

#### Install Dependencies

Install dependencies locally.
```
$ cd up4w_apps
$ yarn install // or npm install
```

Now you have all the prerequisites to run GPT4W locally for development.

### Run Program 
```
$ yarn start // or npm start
```
The application will launch automatically once the compilation process concludes.

### Package Application
If you want to package this program, run package command as follows.
```
$ yarn package // or npm run package
```
The `package` command will package the program into a corresponding compressed file based on platform and architecture. You can find the generated zip file in the `out` directory.
However, to distribute this program to others, it is recommend to build a distributable following the instruction in the next section.

### Build distributable
To package all work together and distribute, it is recommended to use the make script. It will create a platform-specific distributable for you to conveniently share with others.
```
$ yarn make // npm run make
```
It takes slightly longer than packaging, you can find the generated executable program in the out/make directory which is located at the same level as the current directory.

Please note：

The scripts for packaging and building are dependent on the runtime system environment. Building a distributable for another platform is not possible. (e.g. building a Mac executable is not possible on Windows, finding to a Mac dev environment in mandatory in this case.)

## Architecture

### Main Process

Our application operates with a single main process, functioning as the entry point of the application. This main process executes within a Node.js environment, enabling it to utilize all Node.js APIs.
In the main process, we perform the following tasks:

- Some basic application initialization operations, such as creating application windows, loading UI pages, generating random accounts, creating application trays, etc.;
- Starting the [UP4W](#https://github.com/up4w/up4w-core) network application through sub-process, and connecting to the P2P network, as well as starting a WebSocket service with a random port;
- Providing various interfaces to preload script, so that UI processes can get the processing power of original application, such as reading and writing local databases.
  Code that runs in the main process is in the src/main directory.

### Render Process 

The rendering engine in Electron replicates a Chrome browser environment, in which a local web page is hosted. This page is developed using [react](https://react.dev/), an open-source tool from Facebook, and applies the matching routing solution, [react-router](https://reactrouter.com/en/main/start/tutorial), to enhance the component-based development experience.
For code highlighting in the chat window, we've also utilized [react-highlight](https://www.npmjs.com/package/react-highlight), ensuring a more elegant and user-friendly code presentation.

### UP4W-JS 

 [up4w-js](https://www.npmjs.com/package/up4w-js) is a JavaScript library we've developed for interacting with the [UP4W](#https://github.com/up4w/up4w-core) network. It is designed to function within both Node.js and regular browser environments.

The library offers a collection of functions to streamline application access to the UP4W network. These functions include actions like accessing the WebSocket service from the main process, or interacting with UP4W through WebSocket connections. It facilitates a range of operations, such as anonymous ID generation and login, contact list manipulation, sending and receiving messages, and storing offline data within the P2P network. Not all these features are used in the current version yet and we plan to extend GPT4W in the future with more features.

GPT4w communicates with a chat robot that resides on another node of the UP4W network. All communication is over the P2P network provided by UP4W. Using JS API (up4w.ms.sendText), GPT4w can submit a question to the robot and receive a response from it within a short amount of time.

Check out the complete implementation in the **src/page/chatroom** directory

### Chat Robot Service

The chat robot service is hosted on a node of the p2p network. Each message it receives is interpreted as a question. By utilizing a Node.js implemented HTTP service that is integrated with OpenAI in the background, Chat Robot is designed to provide quick and precise responses.

> Note: Robot service is not included in the open source repository.

## How to use GPT4W


1. Download the GPT4W app from [GPT4W.com](https://gpt4w.com/),
GPT4W is available in macOS, Windows, and Linux versions.

2. Install GPT4W on your device and start by asking questions. There are also a few prompts listed as examples.

