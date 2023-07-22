# `@agelesscoding/cli`

![Screen Shot](https://cdn.jsdelivr.net/gh/agelesscoding/cli@main/core/cli/screenshot.gif)

**Tip**: In the scaffolding's interactive interface, you can choose the built-in project template, or choose to develop a template yourself. Then, wait for the scaffolding to install the template to your project directory, and you can start development.

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

## Create your project by local template configuration file

Assuming that your template configuration file is located locally at `/Users/<username>/template/configuration/file/templates.json`, you can create a new template project using the following command:

```bash
$ agc init -ltcp /Users/<username>/template/configuration/file/templates.json
```

<iframe width="560" height="315" src="https://www.youtube.com/embed/WXIXwLpGRG8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Create your project by remote template configuration file

Assuming that your template configuration file address is: `https://cdn.jsdelivr.net/gh/agelesscoding/cli-template@main/templates.json`, you can create a new template project using the following command:

```bash
$ agc init -rtcp https://cdn.jsdelivr.net/gh/agelesscoding/cli-template@main/templates.json
```

Happy coding ;-)

## Local Develop

1. Enter the `/core/cli` directory and execute `npm link`, which will register the scaffolding globally.
2. In vscode, click debug to enter the debugging mode, and debug the execution process of the local `cli`.
