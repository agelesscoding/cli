# `@agelesscoding/cli`

![Screen Shot](https://cdn.jsdelivr.net/gh/agelesscoding/cli@main/core/cli/screenshot.gif)

## Quick Start

First, you need to install the scaffolding globally:

```bash
$ npm install -g @agelesscoding/cli
```

Then, you can use the `agelesscoding` or `agc` command to create a project:

```bash
$ mkdir demo && cd demo
$ agc init # or agc init [projectName]
```

**Tip**: In the scaffolding's interactive interface, you can choose the built-in project template, or choose to develop a template yourself. Then, wait for the scaffolding to install the template to your project directory, and you can start development.

Happy coding ;-)

## Local Develop

1. Enter the `/core/cli` directory and execute `npm link`, which will register the scaffolding globally.
2. In vscode, click debug to enter the debugging mode, and debug the execution process of the local `cli`.
