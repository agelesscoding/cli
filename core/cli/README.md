# `@agelesscoding/cli`

![NPM Version](https://img.shields.io/npm/v/@agelesscoding/cli.svg)
![NPM License](https://img.shields.io/npm/l/%40agelesscoding%2Fcli)
![npm Downloads](https://img.shields.io/npm/dm/%40agelesscoding%2Fcli)

![Screen Shot](https://cdn.jsdelivr.net/gh/agelesscoding/cli@main/screenshots/quickstart.gif)

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

## Create your project by remote template configuration file

Assuming that your template configuration file address is: `https://cdn.jsdelivr.net/gh/agelesscoding/cli-template@main/templates.json`, you can create a new template project using the following command:

```bash
$ agc init -rtcp https://cdn.jsdelivr.net/gh/agelesscoding/cli-template@main/templates.json
```

## Config the `templates.json` file

The `templates.json` file is the configuration file of the project/component library, which is used to configure the template information of the project/component library, including the template name, template description, template address, etc. The following is an explanation of the fields in the configuration file:

- `name.en`: The English name of the template, required, used to display in the command line.
- `name.zh_CN`: The Chinese name of the template, required, used to display in the command line.
- `npmName`: The npm package name of the template, required. When you select the template to create, the scaffolding will download the template from the npm repository.
- `version`: The version number of the template, optional.
- `type`: The type of the template, required. The optional value is: `normal`, `custom`. The default value is: `normal`. `normal` means that the template is a standard template, and `custom` means that the template is a custom template.
- `installCommand`: The installation command of the template, optional. When this field value is provided, the scaffolding will execute this command to install the template dependency after downloading the template.
- `startCommand`: The start command of the template, optional. When this field value is provided, the scaffolding will execute this command to start the template after installing the template dependency.
- `tag`: The tag of the template, required. The optional value is: `['project']`, `['component']`. The default value is: `['project']`. `['project']` means that the template is a project template, and `['component']` means that the template is a component library template.
- `ignore`: The ignore files of the template, optional. This field is special. When your template has third-party ejs template files, you must configure this field to ignore those third-party ejs template files. Because those ejs template files will conflict with the ejs template files in the scaffolding, causing the scaffolding to fail to run normally. The value of this field is an array, and each item in the array is a regular expression used to match the files that need to be ignored. For example: `["**/public/**"]`.

Here is a built-in template repository, you can refer to the configuration file of this repository: [@agelesscoding/cli-template](https://github.com/agelesscoding/cli-template/blob/main/templates.json)

## How to develop your own template?

1. Create a folder named `demo` in some directory, and enter the `demo` directory.
   ```bash
   $ mkdir demo && cd demo
   ```
2. Initialize the project.
   ```bash
   $ npm init -y
   ```
3. Create a folder named `template` in the `demo` directory, and create a configuration file named `templates.json` in the `demo` directory. The content of the `templates.json` file like this: [@agelesscoding/cli-template](https://github.com/agelesscoding/cli-template/blob/main/templates.json).
4. Now, you can develop your own template in the `template` directory. When you finish the development, you can publish your template to the npm repository.
   ```bash
   $ npm publish
   ```
5. Finally, you can use the `agelesscoding` or `agc` command to create a project using your own template.
   ```bash
   $ mkdir test-project && cd test-project
   $ agc init -ltcp /demo/template/path/templates.json
   ```

## Local Develop

1. Enter the `/core/cli` directory and execute `npm link`, which will register the scaffolding globally.
2. In vscode, click debug to enter the debugging mode, and debug the execution process of the local `cli`.

_Happy coding ;-)_
